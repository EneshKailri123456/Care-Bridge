import os

# OpenRouter & NVIDIA Nemotron Configuration
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")

# Hugging Face Configuration
HF_TOKEN = os.environ.get("HF_TOKEN", "")
HF_SPACE_URL = os.environ.get("HF_SPACE_URL", "") # Custom HF Space URL if deployed

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Multimodal Vision Models for Handwriting OCR & Doctor Prescription Transcriptions
VISION_HANDWRITING_MODELS = [
    "openai/gpt-4o-mini",
    "qwen/qwen-2.5-vl-72b-instruct",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "openrouter/free"
]

# Primary & Fallback Nemotron / Clinical Reasoning Models
NEMOTRON_MODELS = [
    "openai/gpt-4o-mini",
    "nvidia/nemotron-3-ultra-550b-a55b",
    "nvidia/nemotron-3.5-lightning"
]

DEFAULT_NEMOTRON_MODEL = NEMOTRON_MODELS[0]
