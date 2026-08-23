import json
import urllib.request
import urllib.error
import re
from typing import Dict, Any, Optional, List
from config import (
    OPENROUTER_API_KEY, 
    OPENROUTER_BASE_URL, 
    NEMOTRON_MODELS, 
    VISION_HANDWRITING_MODELS, 
    DEFAULT_NEMOTRON_MODEL
)

class NemotronClient:
    """
    Client for NVIDIA Nemotron 3 Ultra & Multimodal Vision Models via OpenRouter
    for clinical OCR, handwriting deciphering, extraction, simplification, and reasoning.
    """

    @classmethod
    def call_llm(
        cls, 
        system_prompt: str, 
        user_prompt: str, 
        image_base64: Optional[str] = None,
        temperature: float = 0.1,
        max_tokens: int = 1500
    ) -> Optional[str]:
        if not OPENROUTER_API_KEY:
            return None

        # Format messages
        messages = [{"role": "system", "content": system_prompt}]

        if image_base64:
            # Multimodal vision message
            messages.append({
                "role": "user",
                "content": [
                    {"type": "text", "text": user_prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}"
                        }
                    }
                ]
            })
            model_pool = VISION_HANDWRITING_MODELS
        else:
            messages.append({"role": "user", "content": user_prompt})
            model_pool = NEMOTRON_MODELS

        # Try models in priority order
        for model in model_pool:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }

            req = urllib.request.Request(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://127.0.0.1:8000",
                    "X-Title": "CareBridge Medical Assistant"
                },
                data=json.dumps(payload).encode("utf-8")
            )

            try:
                with urllib.request.urlopen(req, timeout=20) as resp:
                    res_json = json.loads(resp.read().decode("utf-8"))
                    content = res_json["choices"][0]["message"]["content"]
                    if content and len(content.strip()) > 0:
                        return content
            except Exception:
                continue

        return None

    # Backward compatibility alias
    call_nemotron = call_llm

    @classmethod
    def extract_structured_document(
        cls, 
        raw_text: str, 
        image_base64: Optional[str] = None,
        target_lang: str = "en"
    ) -> Optional[Dict[str, Any]]:
        """
        Extracts structured JSON matching the CareCompass §5 schema using Multimodal Vision & NVIDIA Nemotron 3 Ultra,
        specifically optimized for deciphering messy, cursive, and handwritten doctor prescriptions.
        """
        system_prompt = """You are an elite Clinical Pharmacist and Medical AI specializing in transcribing and deciphering messy, cursive, and handwritten doctor prescriptions (Rx), clinical notes, and discharge orders.

HANDWRITING & DOCTOR SHORTHAND DECIPHERING RULES:
1. Carefully transcribe all handwritten lines, drug names, strengths/dosages (mg, mcg, ml, puffs), frequencies, and timings.
2. Translate doctor shorthand into standard schedule arrays:
   - "1-0-1" or "BD" / "BID" / "b.i.d" -> timing: ["morning", "night"], frequency: "Twice daily after meals"
   - "1-0-0" or "OD" / "o.d" -> timing: ["morning"], frequency: "Once daily in the morning"
   - "1-1-1" or "TDS" / "TID" / "t.i.d" -> timing: ["morning", "afternoon", "night"], frequency: "Three times daily"
   - "0-0-1" or "HS" / "Bedtime" / "h.s" -> timing: ["night"], frequency: "Once daily at bedtime"
   - "0-1-0" -> timing: ["afternoon"], frequency: "Once daily in the afternoon"
   - "ac" / "a.c" -> special_instructions: "Take before food"
   - "pc" / "p.c" -> special_instructions: "Take after food"
   - "SOS" / "prn" -> special_instructions: "Take as needed for symptoms"
3. Identify common handwritten Indian and international prescription medications:
   - Dolo 650 / PCM / Paracetamol / Calpol -> Paracetamol (Pain & Fever)
   - Augmentin / Amoxyclav / Aug 625 -> Augmentin 625 mg (Antibiotic)
   - Pan 40 / Pantocid / Pantoprazole -> Pantoprazole 40 mg (Stomach acid protection)
   - Glycomet / Metformin 500 -> Metformin 500 mg (Blood sugar control)
   - Telma 40 / Telmikind / Telmisartan -> Telmisartan 40 mg (Blood pressure)
   - Atorva 10 / Storvas / Atorvastatin -> Atorvastatin 10 mg (Cholesterol)
   - Rosuvas / Rosuvastatin -> Rosuvastatin (Cholesterol)
   - Ecosprin 75 / Aspirin -> Ecosprin 75 mg (Blood thinner)
   - Clopilet / Clopidogrel -> Clopidogrel 75 mg (Blood thinner)
   - Azithral / Azee / Azithromycin -> Azithromycin (Antibiotic)
   - Cifran / Ciprofloxacin -> Ciprofloxacin (Antibiotic)
   - Montair LC / Montek LC -> Montelukast + Levocetirizine (Allergy & Cough)
   - Ascoril / Benadryl -> Cough syrup (Throat relief)
   - Foracort / Budecort / Asthalin -> Inhaler (Breathing relief)
   - Thyronorm -> Thyroxine (Thyroid hormone)
   - Shelcal 500 -> Calcium + Vitamin D3 (Bone strength)

Strict schema to return as valid JSON ONLY:
{
  "document_type": "prescription | discharge_summary | lab_report | hospital_form",
  "patient_name": "string (or 'Patient' if not handwritten)",
  "patient_language": "en",
  "medications": [
    {
      "name": "string",
      "dose": "string (e.g. 500 mg, 1 tablet, 10 ml, 2 puffs)",
      "frequency": "string (e.g. Twice daily with meals)",
      "timing": ["morning", "afternoon", "night"],
      "duration_days": 7,
      "special_instructions": "string (e.g. After food with water)",
      "purpose": "string (e.g. Antibiotic for chest infection)",
      "pill_color_type": "white_tablet | yellow_tablet | blue_tablet | red_tablet | inhaler | blue_liquid"
    }
  ],
  "follow_up": {
    "date": "string or null",
    "location": "string or null",
    "department": "string or null",
    "address": "string or null",
    "wayfinding_steps": ["Step 1...", "Step 2..."]
  },
  "warning_symptoms": ["string warning 1", "string warning 2"],
  "confidence_notes": "⚡ Extracted & Deciphered via NVIDIA Vision + Clinical Handwriting Engine"
}

RULES:
1. Return ONLY pure valid JSON. No markdown backticks, no conversation.
2. If any medication is handwritten, decipher the drug name, dosage, and frequency accurately."""

        user_prompt = f"Decipher this handwritten doctor prescription / clinical document into structured JSON:\n\n{raw_text}"
        response_text = cls.call_llm(system_prompt, user_prompt, image_base64=image_base64)

        if not response_text:
            return None

        # Clean JSON from response
        try:
            cleaned = response_text.strip()
            # Extract JSON substring if surrounded by markdown or explanatory text
            json_match = re.search(r"(\{[\s\S]*\})", cleaned)
            if json_match:
                cleaned = json_match.group(1)
            
            data = json.loads(cleaned)
            return data
        except Exception as e:
            return None
