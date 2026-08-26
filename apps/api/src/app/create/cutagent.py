"""PerfOS adapter for teamgroove/cutagent (MIT) — storyboard-first video ads.

CutAgent turns a product URL into a 4-scene storyboard (hook / solution /
proof / CTA), routes each scene to the fal.ai video model that fits its role,
and renders in-browser. PerfOS owns the storyboard layer: this module compiles
a winner brief into a cutagent-compatible storyboard + importable project
JSON, with role-based model routing, duration-aware voiceover word budgets and
cost estimation — all pure and deterministic. Rendering happens inside
cutagent (fal.ai key supplied by the operator); PerfOS makes no external AI
calls. Mock-safe: ``settings.MOCK_MODE`` returns a deterministic offline job.
"""

from __future__ import annotations

import hashlib
import json

from pydantic import BaseModel, Field

from app.core.config import settings

# --- CutAgent model catalog (types/index.ts, cost per generated second, USD) ---

MODEL_CATALOG: dict[str, float] = {
    "hunyuan-video": 0.075,
    "wan-2.5": 0.05,
    "minimax-live": 0.10,
    "kling-2.5-turbo": 0.07,
    "luma-ray-2": 0.10,
    "seedance-1.5": 0.08,
    "veo-2": 0.25,
    "veo-3": 0.40,
}

# Role -> default model, per cutagent's routing diagram
# (Hook=Kling motion, Solution=Veo realism, Proof=MiniMax authenticity, CTA=Seedance audio).
SCENE_MODEL_ROUTING: dict[str, str] = {
    "hook": "kling-2.5-turbo",
    "solution": "veo-2",
    "proof": "minimax-live",
    "cta": "seedance-1.5",
}

SCENE_ROLES = tuple(SCENE_MODEL_ROUTING)

TEMPLATES = ("ugc-ad", "product-showcase", "explainer", "before-after", "social-proof")
NARRATIVE_ANGLES = ("convenience", "quality", "social-proof", "value", "unboxing")
HOOK_STYLES = (
    "question",
    "bold-claim",
    "problem-agitate",
    "curiosity",
    "before-after",
    "stat",
    "story",
    "direct",
)

# Voiceover fit: cutagent hard-budgets ~11 words per 5-second scene.
WORDS_PER_SECOND = 2.2
SCENE_DURATIONS: dict[str, int] = {"hook": 3, "solution": 5, "proof": 5, "cta": 5}

ANTI_HALLUCINATION_RULE = "Do not invent text, logos, or labels on the product."


class StoryboardScene(BaseModel):
    index: int
    role: str
    model: str
    duration_sec: int
    prompt: str
    voiceover_script: str
    word_budget: int


class Storyboard(BaseModel):
    template: str
    narrative_angle: str
    aspect_ratio: str = "9:16"
    style_brief: str = ""
    product_name: str
    scenes: list[StoryboardScene]

    @property
    def total_duration_sec(self) -> int:
        return sum(s.duration_sec for s in self.scenes)


class GenerationResult(BaseModel):
    job_id: str
    status: str  # queued | completed | failed
    rendered: bool = False
    estimated_cost_usd: float = 0.0
    storyboard: Storyboard | None = None
    cutagent_project: dict = Field(default_factory=dict)


def _get(src: object, *names: str, default: str = "") -> str:
    """Read the first present field off a dict or duck-typed brief object."""
    for name in names:
        if isinstance(src, dict):
            val = src.get(name)
        else:
            val = getattr(src, name, None)
        if isinstance(val, str) and val.strip():
            return val.strip()
    return default


def _fit_words(text: str, budget: int) -> str:
    words = text.split()
    return " ".join(words[:budget]) if len(words) > budget else text


class StoryboardRequest(BaseModel):
    """Winner-brief input; every field optional except product_name."""

    product_name: str = Field(min_length=1)
    product_url: str = ""
    hook: str = ""
    headline: str = ""
    body: str = ""
    proof: str = ""
    cta: str = ""
    template: str = ""
    narrative_angle: str = ""
    aspect_ratio: str = "9:16"
    seed: int = 0


def _scene_prompt(req: StoryboardRequest, role: str, template: str, angle: str) -> str:
    """Role-based visual prompt (cutagent prompt-engine roles, no LLM)."""
    name = req.product_name
    prompts = {
        "hook": f"{HOOK_STYLES[req.seed % len(HOOK_STYLES)]} opening shot introducing {name}, "
        f"fast dynamic camera, pattern-interrupt energy ({angle} angle, {template} format)",
        "solution": f"Clean product reveal of {name}, hero framing on white surface, "
        "soft studio lighting, slow push-in",
        "proof": f"Authentic person reacting positively while using {name}, "
        "handheld testimonial feel, natural light",
        "cta": f"Cinematic end-frame of {name} centered, space reserved for text overlay, "
        "confident closing energy",
    }
    return f"{prompts[role]}. {ANTI_HALLUCINATION_RULE}"


def build_storyboard(
    req: StoryboardRequest | dict | object,
) -> Storyboard:
    """Compile a winner brief into a cutagent 4-scene storyboard (pure).

    Accepts a :class:`StoryboardRequest`, plain dict, or any duck-typed brief
    object exposing the usual fields (A29 ``create/brief.py`` output).
    """
    if not isinstance(req, StoryboardRequest):
        req = StoryboardRequest(
            product_name=_get(req, "product_name", "product", "subject") or "Product",
            product_url=_get(req, "product_url", "url"),
            hook=_get(req, "hook"),
            headline=_get(req, "headline", "title"),
            body=_get(req, "body", "description", "script"),
            proof=_get(req, "proof", "testimonial", "rating"),
            cta=_get(req, "cta", "call_to_action"),
            template=_get(req, "template"),
            narrative_angle=_get(req, "narrative_angle", "angle"),
            aspect_ratio=_get(req, "aspect_ratio") or "9:16",
            seed=int(getattr(req, "seed", 0) or 0),
        )

    template = req.template or TEMPLATES[req.seed % len(TEMPLATES)]
    angle = req.narrative_angle or NARRATIVE_ANGLES[req.seed % len(NARRATIVE_ANGLES)]
    # Seed also picks the hook style inside the scene prompt, matching cutagent's
    # batch-variations behaviour deterministically.
    req = req.model_copy(update={"template": template, "narrative_angle": angle})

    copy_by_role = {
        "hook": req.hook or req.headline or f"You need {req.product_name}.",
        "solution": req.body or f"{req.product_name} solves it in seconds.",
        "proof": req.proof or f"People love {req.product_name}.",
        "cta": req.cta or f"Get {req.product_name} today.",
    }

    scenes = []
    for i, role in enumerate(SCENE_ROLES):
        duration = SCENE_DURATIONS[role]
        budget = int(duration * WORDS_PER_SECOND)
        scenes.append(
            StoryboardScene(
                index=i,
                role=role,
                model=SCENE_MODEL_ROUTING[role],
                duration_sec=duration,
                prompt=_scene_prompt(req, role, template, angle),
                voiceover_script=_fit_words(copy_by_role[role], budget),
                word_budget=budget,
            )
        )

    style_brief = (
        f"{req.product_name}: consistent lighting and color palette across all four scenes. "
        f"{ANTI_HALLUCINATION_RULE}"
    )
    sb = Storyboard(
        template=template,
        narrative_angle=angle,
        aspect_ratio=req.aspect_ratio,
        style_brief=style_brief,
        product_name=req.product_name,
        scenes=scenes,
    )
    return sb


def estimate_cost(storyboard: Storyboard) -> float:
    """fal.ai spend estimate: scene duration x model cost/sec (pure)."""
    return round(
        sum(s.duration_sec * MODEL_CATALOG.get(s.model, 0.0) for s in storyboard.scenes), 2
    )


def to_cutagent_project(storyboard: Storyboard) -> dict:
    """Emit JSON importable into the cutagent editor (Project save/load shape)."""
    return {
        "version": 1,
        "source": "perfos-create-cutagent",
        "product": {"name": storyboard.product_name},
        "style": {
            "brief": storyboard.style_brief,
            "aspectRatio": storyboard.aspect_ratio,
        },
        "meta": {
            "template": storyboard.template,
            "narrativeAngle": storyboard.narrative_angle,
        },
        "scenes": [
            {
                "index": s.index,
                "role": s.role,
                "model": s.model,
                "durationSec": s.duration_sec,
                "prompt": s.prompt,
                "voiceoverScript": s.voiceover_script,
                "wordBudget": s.word_budget,
            }
            for s in storyboard.scenes
        ],
    }


def _mock_generate(sb: Storyboard) -> GenerationResult:
    """Deterministic offline job keyed by storyboard content."""
    digest = hashlib.sha256(
        json.dumps(to_cutagent_project(sb), sort_keys=True).encode()
    ).hexdigest()
    job_id = f"mock-cutagent-{digest[:12]}"
    return GenerationResult(
        job_id=job_id,
        status="completed",
        rendered=False,
        estimated_cost_usd=estimate_cost(sb),
        storyboard=sb,
        cutagent_project=to_cutagent_project(sb),
    )


class CutagentAdapter:
    """Storyboard-first clip generation via teamgroove/cutagent (MIT).

    Mock-safe by default: ``MOCK_MODE=true`` returns a deterministic offline
    job and nothing leaves the process. In live mode this module still makes
    no external calls — hand :meth:`generate`'s ``cutagent_project`` JSON to
    the cutagent editor (or its fal.ai pipeline) for actual rendering; PerfOS
    deliberately keeps generative-AI egress out of the create lane.
    """

    def __init__(self) -> None:
        self.mock_mode = settings.MOCK_MODE

    def build_storyboard(self, req: StoryboardRequest | dict | object) -> Storyboard:
        return build_storyboard(req)

    def generate(self, req: StoryboardRequest | dict | object) -> GenerationResult:
        sb = build_storyboard(req)
        if self.mock_mode:
            return _mock_generate(sb)
        raise RuntimeError(
            "cutagent live rendering runs outside PerfOS: import "
            "GenerationResult.cutagent_project into the cutagent editor with an "
            "operator-supplied fal.ai key."
        )
