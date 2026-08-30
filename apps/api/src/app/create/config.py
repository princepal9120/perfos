"""Configuration for creative generation providers."""

from dataclasses import dataclass

# Enabled creative providers (clip/asset assembly backends).
PROVIDERS = {
    "cutagent": True,
    "mpt": True,
    "commercial_creator": True,
}


@dataclass
class CreativeBrief:
    """Base input describing a creative generation request."""

    id: str
    title: str
    prompt: str
