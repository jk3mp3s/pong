from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import math
import random

app = FastAPI(title="Pong AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://pong-murex-beta.vercel.app",
        "https://pong-git-main-jk3mp3s-projects.vercel.app",
        "https://pong-rcualk3wl-jk3mp3s-projects.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ────────────────────────────────────────────────────────────────────

class AIStateRequest(BaseModel):
    ai_y: float
    ball_x: float
    ball_y: float
    ball_vx: float
    ball_vy: float
    canvas_height: float
    pad_height: float
    ai_level: int


class AIStateResponse(BaseModel):
    new_ai_y: float
    speed: float
    reaction: float
    level_label: str


class RoundResult(BaseModel):
    winner: str           # "player" or "ai"
    ai_level: int
    player_streak: int    # number of full games won so far
    best_streak: int
    ai_losses: int


class RoundResultResponse(BaseModel):
    new_ai_level: int
    new_player_streak: int
    new_best_streak: int
    new_ai_losses: int
    game_over: bool
    message: str


# ── AI difficulty parameters ──────────────────────────────────────────────────

def compute_ai_params(level: int) -> dict:
    """
    Level 1  → slow paddle, very noisy ball tracking (easy)
    Level 10 → fast paddle, near-perfect tracking (hard)
    """
    speed         = round(1.8 + (level - 1) * 0.65, 2)
    reaction_noise = round(max(0.015, 0.48 - (level - 1) * 0.051), 3)
    labels = [
        "", "Rookie", "Novice", "Apprentice", "Learner",
        "Competent", "Skilled", "Advanced", "Expert", "Master", "Unbeatable",
    ]
    return {
        "speed": speed,
        "reaction": reaction_noise,
        "label": labels[min(level, 10)],
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "Pong AI backend running"}


@app.get("/ai/params/{level}")
def get_ai_params(level: int):
    level = max(1, min(10, level))
    params = compute_ai_params(level)
    return {
        "level": level,
        "speed": params["speed"],
        "reaction_noise": params["reaction"],
        "label": params["label"],
    }


@app.post("/ai/move", response_model=AIStateResponse)
def compute_ai_move(req: AIStateRequest):
    """
    Compute the AI paddle's next Y position.
    Noise shrinks as level increases, making the AI progressively more accurate.
    """
    level  = max(1, min(10, req.ai_level))
    params = compute_ai_params(level)

    noise_range = req.canvas_height * params["reaction"] * 2
    noise       = (random.random() - 0.5) * noise_range

    target_y = req.ball_y + noise - req.pad_height / 2
    diff     = target_y - req.ai_y
    move     = math.copysign(min(abs(diff), params["speed"]), diff)
    new_y    = max(0.0, min(req.canvas_height - req.pad_height, req.ai_y + move))

    return AIStateResponse(
        new_ai_y=round(new_y, 2),
        speed=params["speed"],
        reaction=params["reaction"],
        level_label=params["label"],
    )


@app.post("/round/result", response_model=RoundResultResponse)
def process_round_result(result: RoundResult):
    """
    Called after each full game (first to score wins the game).

    - Player wins  → streak +1, AI levels up, continue
    - AI wins      → game over, streak resets
    """
    if result.winner == "player":
        new_streak   = result.player_streak + 1
        new_ai_level = min(10, result.ai_level + 1)
        new_ai_losses = result.ai_losses + 1
        new_best     = max(result.best_streak, new_streak)
        game_over    = False
        message      = f"You won game {new_streak}! AI levels up to {new_ai_level}."
    else:
        # AI scored — game over
        new_streak   = 0
        new_ai_level = result.ai_level
        new_ai_losses = result.ai_losses
        new_best     = max(result.best_streak, result.player_streak)
        game_over    = True
        message      = (
            f"Game over! You won {result.player_streak} game(s) in a row. "
            f"AI was at level {result.ai_level}."
        )

    return RoundResultResponse(
        new_ai_level=new_ai_level,
        new_player_streak=new_streak,
        new_best_streak=new_best,
        new_ai_losses=new_ai_losses,
        game_over=game_over,
        message=message,
    )