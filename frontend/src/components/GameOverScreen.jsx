import React from 'react'

export default function GameOverScreen({ streak, bestStreak, aiLevel, onRestart }) {
  const isNewBest = streak > 0 && streak === bestStreak

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(5,5,8,0.88)',
      gap: 20,
    }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 700,
        color: 'var(--accent2)', letterSpacing: 6,
        textShadow: '0 0 30px var(--accent2)',
        lineHeight: 1,
      }}>
        GAME OVER
      </div>

      <div style={{ display: 'flex', gap: 40, marginTop: 8 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: 2 }}>FINAL STREAK</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 48, color: 'var(--accent)', textShadow: '0 0 16px var(--accent)' }}>{streak}</div>
        </div>
        <div style={{ width: 1, background: 'var(--border)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: 2 }}>AI REACHED LVL</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 48, color: 'var(--amber)', textShadow: '0 0 16px var(--amber)' }}>{aiLevel}</div>
        </div>
      </div>

      {isNewBest && (
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--amber)',
          letterSpacing: 3, textShadow: '0 0 10px var(--amber)',
        }}>
          ★ NEW BEST STREAK ★
        </div>
      )}

      <button
        onClick={onRestart}
        style={{
          marginTop: 16,
          padding: '12px 40px',
          fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
          letterSpacing: 4, color: 'var(--bg)',
          background: 'var(--accent)',
          border: 'none', borderRadius: 4,
          cursor: 'pointer',
          boxShadow: '0 0 20px var(--accent)',
          transition: 'transform 0.1s',
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        PLAY AGAIN
      </button>
    </div>
  )
}
