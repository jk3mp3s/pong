# Pong — AI Challenger

A full-stack Pong game where the AI opponent learns and adapts after every loss. Built with **FastAPI** (Python) on the backend and **React + Vite** on the frontend.

---

## Architecture

```
pong-ai/
├── backend/
│   ├── main.py           # FastAPI app — AI logic, round scoring
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── vite.config.js    # Proxies /api → localhost:8000
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx           # Game state orchestration
        ├── api.js            # All fetch calls to the backend
        ├── constants.js      # Canvas dimensions, physics config
        ├── index.css         # Global styles + scanline overlay
        ├── hooks/
        │   └── useGameLoop.js   # RAF game loop + physics engine
        └── components/
            ├── HUD.jsx          # Streak / level / score display
            ├── StartScreen.jsx
            └── GameOverScreen.jsx
```

### How the ML mechanic works

Every time the player scores a point, a `POST /round/result` request is sent to the backend. The backend increments the AI's level (1–10) and returns updated parameters.

On every animation frame, the frontend sends a `POST /ai/move` request with the current ball and paddle positions. The backend computes a **noisy target** — the ideal interception point plus Gaussian-style random offset — and moves the AI paddle toward it. Two parameters control difficulty:

| Parameter | Level 1 | Level 10 |
|-----------|---------|---------|
| `speed` (px/frame) | 1.5 | 7.05 |
| `reaction_noise` (fraction of canvas) | 0.50 | 0.02 |

This means at level 1 the AI aims wildly and moves slowly; at level 10 it tracks the ball near-perfectly.

---

## Running locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

The Vite dev server proxies `/api/*` to `http://localhost:8000` so no CORS issues during development.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/ai/params/{level}` | Returns speed + noise for a given level |
| POST | `/ai/move` | Computes AI paddle position for a frame |
| POST | `/round/result` | Processes a scored point; returns updated state |
| GET | `/docs` | Interactive Swagger UI |

---

## Extending this project

- **Leaderboard** — Add a SQLite/PostgreSQL table and `GET /leaderboard` endpoint
- **Auth** — Add JWT login so streaks persist per user
- **Replay system** — Record ball positions per frame and replay matches
- **Smarter AI** — Replace the noise model with a trained RL agent (Gym + PPO)
- **WebSockets** — Replace polling with a single persistent WS connection for lower latency

---

## Tech stack

| Layer | Tech |
|-------|------|
| Backend | Python 3.11+, FastAPI, Uvicorn, Pydantic |
| Frontend | React 18, Vite, HTML5 Canvas |
| Styling | CSS variables, Google Fonts (Rajdhani + Share Tech Mono) |
| Dev proxy | Vite built-in proxy |
