import { useRef, useEffect, useCallback } from 'react'
import { fetchAIMove, postRoundResult } from '../api'
import {
  W, H, PAD_W, PAD_H, BALL_R,
  PLAYER_X, AI_X, BALL_SPEED_BASE, AI_POLL_MS,
} from '../constants'
 
function clampPad(y) { return Math.max(0, Math.min(H - PAD_H, y)) }
function ballSpeed(level) { return BALL_SPEED_BASE + level * 0.3 }
 
function initBall(level = 1) {
  // always serve toward the player first
  const angle = (Math.random() * 0.5 - 0.25)
  const spd = ballSpeed(level)
  const dir = Math.random() > 0.5 ? 1 : -1
  return {
    x: W / 2,
    y: H / 2,
    vx: dir * spd * Math.cos(angle),
    vy: spd * Math.sin(angle),
  }
}
 
export function useGameLoop(canvasRef, gameState, setGameState, onGameOver, onRoundWon) {
  const stateRef   = useRef(null)
  const rafRef     = useRef(null)
  const lastPollRef = useRef(0)
  const mouseYRef  = useRef(H / 2)
  const pendingAI  = useRef(false)
  const scoring    = useRef(false)
 
  useEffect(() => { stateRef.current = gameState }, [gameState])
 
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    mouseYRef.current = e.clientY - rect.top - PAD_H / 2
  }, [canvasRef])
 
  const startLoop = useCallback((initialState) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    scoring.current = false
    pendingAI.current = false
 
    let playerY  = H / 2 - PAD_H / 2
    let aiY      = H / 2 - PAD_H / 2
    let ball     = initBall(initialState.aiLevel)
    let countdown = 90  // brief pause before ball moves at start of each game
 
    // ── AI position poll (async, throttled) ─────────────────────────────────
    async function pollAI(gs) {
      if (pendingAI.current) return
      pendingAI.current = true
      try {
        const res = await fetchAIMove({
          ai_y: aiY,
          ball_x: ball.x,
          ball_y: ball.y,
          ball_vx: ball.vx,
          ball_vy: ball.vy,
          canvas_height: H,
          pad_height: PAD_H,
          ai_level: gs.aiLevel,
        })
        aiY = res.new_ai_y
      } catch (_) { /* keep old position on network error */ }
      finally { pendingAI.current = false }
    }
 
    // ── Called when ball exits left or right ────────────────────────────────
    async function endGame(winner) {
      if (scoring.current) return
      scoring.current = true
 
      // freeze the ball off-screen so it stops triggering
      ball.vx = 0; ball.vy = 0; ball.x = -100
 
      const gs = stateRef.current
      try {
        const res = await postRoundResult({
          winner,
          ai_level: gs.aiLevel,
          player_streak: gs.playerStreak,
          best_streak: gs.bestStreak,
          ai_losses: gs.aiLosses,
        })
 
        if (winner === 'ai') {
          // Player lost the game — game over
          cancelAnimationFrame(rafRef.current)
          onGameOver(res)
        } else {
          // Player won this game — start next round with harder AI
          onRoundWon(res)
          // Reset positions and serve again after short delay
          setTimeout(() => {
            playerY  = H / 2 - PAD_H / 2
            aiY      = H / 2 - PAD_H / 2
            ball     = initBall(res.new_ai_level)
            countdown = 90
            scoring.current = false
          }, 1800)
        }
      } catch (_) {
        scoring.current = false
      }
    }
 
    // ── Main render / physics loop ───────────────────────────────────────────
    function tick(ts) {
      rafRef.current = requestAnimationFrame(tick)
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const gs  = stateRef.current
      if (!gs || gs.phase !== 'playing') return
 
      // Throttled AI poll
      if (ts - lastPollRef.current > AI_POLL_MS) {
        lastPollRef.current = ts
        pollAI(gs)
      }
 
      playerY = clampPad(mouseYRef.current)
 
      // Countdown pause at start of each game
      if (countdown > 0) {
        countdown--
        draw(ctx, playerY, aiY, ball, gs, countdown)
        return
      }
 
      // ── Physics ────────────────────────────────────────────────────────────
      ball.x += ball.vx
      ball.y += ball.vy
 
      // Wall bounce
      if (ball.y - BALL_R < 0) { ball.y = BALL_R; ball.vy = Math.abs(ball.vy) }
      if (ball.y + BALL_R > H) { ball.y = H - BALL_R; ball.vy = -Math.abs(ball.vy) }
 
      // Player paddle hit
      if (
        ball.vx < 0 &&
        ball.x - BALL_R <= PLAYER_X + PAD_W &&
        ball.x - BALL_R >= PLAYER_X - 2 &&
        ball.y + BALL_R >= playerY && ball.y - BALL_R <= playerY + PAD_H
      ) {
        ball.vx = Math.abs(ball.vx) * 1.05
        const rel = (ball.y - (playerY + PAD_H / 2)) / (PAD_H / 2)
        ball.vy = rel * ballSpeed(gs.aiLevel) * 1.3
        ball.x = PLAYER_X + PAD_W + BALL_R + 1
      }
 
      // AI paddle hit
      if (
        ball.vx > 0 &&
        ball.x + BALL_R >= AI_X - 2 &&
        ball.x + BALL_R <= AI_X + PAD_W &&
        ball.y + BALL_R >= aiY && ball.y - BALL_R <= aiY + PAD_H
      ) {
        ball.vx = -Math.abs(ball.vx) * 1.03
        const rel = (ball.y - (aiY + PAD_H / 2)) / (PAD_H / 2)
        ball.vy = rel * ballSpeed(gs.aiLevel) * 1.2
        ball.x = AI_X - BALL_R - 1
      }
 
      // ── Score detection ────────────────────────────────────────────────────
      if (!scoring.current) {
        if (ball.x + BALL_R < 0)  endGame('ai')      // ball passed player's side → AI scored, game over
        if (ball.x - BALL_R > W)  endGame('player')  // ball passed AI's side → player scored
      }
 
      draw(ctx, playerY, aiY, ball, gs, countdown)
    }
 
    rafRef.current = requestAnimationFrame(tick)
  }, [canvasRef, onGameOver, onRoundWon])
 
  // ── Draw ──────────────────────────────────────────────────────────────────
  function draw(ctx, playerY, aiY, ball, gs, countdown) {
    ctx.fillStyle = '#050508'
    ctx.fillRect(0, 0, W, H)
 
    // Center dashes
    ctx.setLineDash([8, 12])
    ctx.strokeStyle = '#1e1e2e'
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke()
    ctx.setLineDash([])
 
    // Countdown overlay
    if (countdown > 0) {
      const secs = Math.ceil(countdown / 30)
      ctx.fillStyle = '#ffffff18'
      ctx.font = `bold 72px 'Rajdhani', sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(secs > 0 ? secs : 'GO', W / 2, H / 2 + 24)
      ctx.textAlign = 'left'
    }
 
    // Player paddle
    ctx.shadowColor = '#00ffcc'
    ctx.shadowBlur = 10
    ctx.fillStyle = '#00ffcc'
    roundRect(ctx, PLAYER_X, playerY, PAD_W, PAD_H, 4); ctx.fill()
 
    // AI paddle — colour shifts red as level rises
    const aiColor = gs.aiLevel <= 3 ? '#00ffcc' : gs.aiLevel <= 6 ? '#ffb830' : '#ff4d6d'
    ctx.shadowColor = aiColor
    ctx.shadowBlur = 12
    ctx.fillStyle = aiColor
    roundRect(ctx, AI_X, aiY, PAD_W, PAD_H, 4); ctx.fill()
 
    // Ball
    ctx.shadowColor = '#ffffff'
    ctx.shadowBlur = 14
    ctx.fillStyle = '#ffffff'
    ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2); ctx.fill()
 
    ctx.shadowBlur = 0
  }
 
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  }
 
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])
 
  return { startLoop, handleMouseMove }
}
