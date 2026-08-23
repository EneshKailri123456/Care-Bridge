"""
CareCompass — Multilingual Neural Voice Synthesis Engine
Powered by High-Definition Neural Regional Voices (Hindi, Kannada, Tamil, Telugu, Bengali, English, Spanish)
with support for AI4Bharat Indic-Parler-TTS Space endpoints and edge-tts.
"""

import os
import asyncio
import io
import json
import urllib.request
import urllib.error
from typing import Optional, Dict
from config import HF_TOKEN, HF_SPACE_URL

# Best-in-Class Neural Regional Voices for Indian & Global Languages
REGIONAL_VOICE_MAP: Dict[str, str] = {
    "hi": "hi-IN-SwaraNeural",       # Warm, clear natural Hindi (Female)
    "kn": "kn-IN-GaganNeural",       # Clear native Kannada (Male) / kn-IN-SapnaNeural
    "ta": "ta-IN-PallaviNeural",     # Expressive natural Tamil (Female)
    "te": "te-IN-ShrutiNeural",      # Clear soothing Telugu (Female)
    "bn": "bn-IN-TanishaaNeural",    # Warm expressive Bengali (Female)
    "en": "en-IN-NeerjaNeural",      # Friendly warm Indian English (Female)
    "es": "es-ES-ElviraNeural"       # Clear Spanish (Female)
}

class NeuralTTSEngine:
    """
    High-Definition Neural Speech Generation Engine
    """

    @classmethod
    async def synthesize_speech_async(
        cls, 
        text: str, 
        lang: str = "en", 
        rate: float = 1.0,
        hf_space_url: Optional[str] = None
    ) -> Optional[bytes]:
        """
        Synthesizes text into high-definition natural human audio (MP3).
        """
        # 1. If a custom Hugging Face Space URL is provided, try that first
        space_url = hf_space_url or HF_SPACE_URL
        if space_url:
            try:
                payload = {"data": [text, lang]}
                req = urllib.request.Request(
                    f"{space_url.rstrip('/')}/api/predict",
                    headers={"Content-Type": "application/json"},
                    data=json.dumps(payload).encode("utf-8")
                )
                with urllib.request.urlopen(req, timeout=15) as resp:
                    res_json = json.loads(resp.read().decode("utf-8"))
                    if "data" in res_json and res_json["data"]:
                        audio_url = res_json["data"][0]
                        with urllib.request.urlopen(audio_url) as a_resp:
                            return a_resp.read()
            except Exception as e:
                print(f"HF Space audio call error: {e}")

        # 2. Use High-Definition Neural Speech Generation (edge-tts)
        try:
            import edge_tts
            voice = REGIONAL_VOICE_MAP.get(lang, REGIONAL_VOICE_MAP["en"])

            # Calculate rate string (e.g. +0%, -15%, +15%)
            rate_percent = int((rate - 1.0) * 100)
            rate_str = f"{rate_percent:+d}%" if rate_percent != 0 else "+0%"

            comm = edge_tts.Communicate(text=text, voice=voice, rate=rate_str)
            audio_buffer = bytearray()
            async for chunk in comm.stream():
                if chunk["type"] == "audio":
                    audio_buffer.extend(chunk["data"])

            if len(audio_buffer) > 0:
                return bytes(audio_buffer)
        except Exception as e:
            print(f"Neural TTS generation error: {e}")

        return None

    @classmethod
    def synthesize_speech_sync(cls, text: str, lang: str = "en", rate: float = 1.0) -> Optional[bytes]:
        try:
            return asyncio.run(cls.synthesize_speech_async(text, lang, rate))
        except Exception as e:
            print(f"Sync wrapper error: {e}")
            return None
