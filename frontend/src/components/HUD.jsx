import React from 'react'

const levelLabels = [
  '', 'Rookie', 'Novice', 'Apprentice', 'Learner',
  'Competent', 'Skilled', 'Advanced', 'Expert', 'Master', 'Unbeatable',
]

function StatBox({ label, value, accent }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      minWidth: 90,
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700,
        color: accent || 'var(--text)',
        textShadow: accent ? `0 0 12px ${accent}` : 'none',
        lineHeight: 1,
      }}>
        {value}
      </span>
    </div>
  )
}

export default function HUD({ streak, bestStreak, aiLosses, aiLevel, message }) {
  const levelFraction = aiLevel / 10
  const barColor = aiLevel <= 3 ? 'var(--accent)' : aiLevel <= 6 ? 'var(--amber)' : 'var(--accent2)'

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        <StatBox label="Streak" value={streak} accent="var(--accent)" />
        <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
        <StatBox label="Best" value={bestStreak} />
        <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
        <StatBox label="AI Pts" value={aiLosses} accent="var(--accent2)" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 420 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', letterSpacing: 1 }}>
          AI LVL {aiLevel}
        </span>
        <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${levelFraction * 100}%`,
            background: barColor,
            boxShadow: `0 0 8px ${barColor}`,
            transition: 'width 0.5s ease, background 0.5s ease',
            borderRadius: 2,
          }} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: barColor, whiteSpace: 'nowrap', minWidth: 70, textAlign: 'right' }}>
          {levelLabels[Math.min(aiLevel, 10)]}
        </span>
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 12,
        color: 'var(--muted)', letterSpacing: 1, minHeight: 18, textAlign: 'center',
      }}>
        {message}
      </div>
    </div>
  )
}
