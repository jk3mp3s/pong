import React, { useRef, useState, useCallback } from 'react'
import HUD from './components/HUD'
import StartScreen from './components/StartScreen'
import GameOverScreen from './components/GameOverScreen'
import { useGameLoop } from './hooks/useGameLoop'
import { W, H } from './constants'

const initialGameState = {
  phase: 'idle',
  aiLevel: 1,
  aiLosses: 0,
  playerStreak: 0,
  bestStreak: 0,
  message: 'Beat the AI to start your streak. One loss ends the game.',
}

export default function App() {
  const canvasRef = useRef(null)
  const [gs, setGs] = useState(initialGameState)

  // AI scored — game over
  const onGameOver = useCallback((result) => {
    setGs(prev => ({
      ...prev,
      phase: 'gameover',
      playerStreak: result.new_player_streak,
      bestStreak: result.new_best_streak,
      aiLevel: result.new_ai_level,
      aiLosses: result.new_ai_losses,
      message: result.message,
    }))
  }, [])

  // Player won a game — increment streak, level up AI, continue
  const onRoundWon = useCallback((result) => {
    setGs(prev => ({
      ...prev,
      aiLevel: result.new_ai_level,
      playerStreak: result.new_player_streak,
      bestStreak: result.new_best_streak,
      aiLosses: result.new_ai_losses,
      message: `Game ${result.new_player_streak} won! AI is now level ${result.new_ai_level} — get ready...`,
    }))
  }, [])

  const { startLoop, handleMouseMove } = useGameLoop(
    canvasRef, gs, setGs, onGameOver, onRoundWon
  )

  const handleStart = useCallback(() => {
    const fresh = {
      ...initialGameState,
      phase: 'playing',
      bestStreak: gs.bestStreak,
      message: 'First to score wins each game. One AI point = game over!',
    }
    setGs(fresh)
    setTimeout(() => startLoop(fresh), 50)
  }, [gs.bestStreak, startLoop])

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      background: 'var(--bg)',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
        letterSpacing: 8, color: 'var(--muted)', textTransform: 'uppercase',
      }}>
        Pong — AI Challenger
      </div>

      <HUD
        streak={gs.playerStreak}
        bestStreak={gs.bestStreak}
        aiLosses={gs.aiLosses}
        aiLevel={gs.aiLevel}
        message={gs.message}
      />

      <div style={{
        position: 'relative',
        border: '1px solid var(--border)',
        borderRadius: 6,
        overflow: 'hidden',
        boxShadow: '0 0 40px rgba(0,255,204,0.06)',
      }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onMouseMove={handleMouseMove}
          style={{ display: 'block', cursor: 'none' }}
        />

        {gs.phase === 'idle' && <StartScreen onStart={handleStart} />}
        {gs.phase === 'gameover' && (
          <GameOverScreen
            streak={gs.playerStreak}
            bestStreak={gs.bestStreak}
            aiLevel={gs.aiLevel}
            onRestart={handleStart}
          />
        )}
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)',
        letterSpacing: 2,
      }}>
        AI DIFFICULTY IS COMPUTED SERVERSIDE VIA FASTAPI
      </div>
    </div>
  )
}
