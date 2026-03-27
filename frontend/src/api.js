const BASE = import.meta.env.VITE_API_URL || '/api'
 
export async function fetchAIMove(payload) {
  const res = await fetch(`${BASE}/ai/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('AI move request failed')
  return res.json()
}
 
export async function fetchAIParams(level) {
  const res = await fetch(`${BASE}/ai/params/${level}`)
  if (!res.ok) throw new Error('AI params request failed')
  return res.json()
}
 
export async function postRoundResult(payload) {
  const res = await fetch(`${BASE}/round/result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Round result request failed')
  return res.json()
}