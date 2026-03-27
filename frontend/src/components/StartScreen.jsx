import React from 'react'

export default function StartScreen({ onStart }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(5,5,8,0.92)',
      gap: 16,
    }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 80, fontWeight: 700,
        color: 'var(--accent)', letterSpacing: 12,
        textShadow: '0 0 40px var(--accent), 0 0 80px var(--accent-dim)',
        lineHeight: 1,
      }}>
        PONG
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)',
        letterSpacing: 4, marginBottom: 8,
      }}>
        AI CHALLENGER — ADAPTIVE DIFFICULTY
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 6,
        fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)',
        textAlign: 'center', lineHeight: 1.8,
      }}>
        <span>Move your mouse to control your paddle</span>
        <span>Score against the AI to increase your streak</span>
        <span style={{ color: 'var(--accent2)' }}>The AI gets smarter every time you score</span>
        <span>One point to the AI — game over</span>
      </div>

      <button
        onClick={onStart}
        style={{
          marginTop: 20,
          padding: '14px 48px',
          fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
          letterSpacing: 5, color: 'var(--bg)',
          background: 'var(--accent)',
          border: 'none', borderRadius: 4,
          cursor: 'pointer',
          boxShadow: '0 0 24px var(--accent)',
        }}
      >
        START
      </button>
    </div>
  )
}
