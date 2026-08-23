# CareCompass — Build Prompt

Paste this into your coding assistant (Claude Code, Cursor, v0, Bolt, Replit Agent, etc.) as the project brief.

---

## 1. Project Summary

Build **CareCompass**, a mobile-first web app that helps elderly, low-literacy, and non-English-speaking patients understand and act on their medical paperwork. The user photographs a prescription, discharge summary, or hospital form. The app extracts the key information, explains it in plain language and the user's native language (text + voice), sets reminders for medicines and appointments, and helps the user navigate to their next hospital visit.
Simplify — an LLM rewrites the extracted data in plain language ("Explain Like I'm 70" mode) in the user's chosen language.
**Non-goals (say this explicitly to the model you're building with, and to judges):** this app does not diagnose conditions, does not recommend medication changes, and does not replace a clinician. It only understands, simplifies, and reminds — based on what a clinician already wrote.

---

## 2. Core User Flow (build in this order)

1. **Scan** — user takes/uploads a photo of a document.
2. **Extract** — OCR + vision-language model pulls out: medicine name, dose, frequency, duration, special instructions, follow-up date/location, warning symptoms.
3. **Simplify** — an LLM rewrites the extracted data in plain language ("Explain Like I'm 70" mode) in the user's chosen language.
4. **Speak** — text-to-speech reads the simplified plan aloud.
5. **Remind** — structured data becomes on-device reminders/calendar entries for each medicine time and the follow-up appointment.
6. **Navigate** (stretch) — if a hospital/department is mentioned, show directions or simple step-by-step wayfinding text.
7. **Teach-back** (stretch, but high demo value) — after explaining, the app asks the user to say back when/how they'll take the medicine, and gently re-explains if they get it wrong.

Build steps 1–5 first. They are the whole demo. 6–7 are what make it stand out if time allows.

---

## 3. MVP Feature Checklist

**Must-have (hackathon core):**
- [ ] Camera/file upload for a document photo
- [ ] OCR + structured extraction into JSON (medicine, dose, timing, duration, instructions, follow-up)
- [ ] Plain-language rewrite of the extracted plan
- [ ] Translation into at least one non-English language (pick one you can demo confidently, e.g. Hindi or Kannada)
- [ ] Text-to-speech playback of the plan
- [ ] A simple daily timeline UI showing medicines by time of day
- [ ] Local reminders/notifications for medicine times and the follow-up date

**Stretch:**
- [ ] Voice input ("ask a question about this medicine")
- [ ] Teach-back confirmation loop
- [ ] Directions/wayfinding to the follow-up hospital
- [ ] Multi-document view (more than one upload at once)

---

## 4. Suggested Tech Stack (hackathon-friendly)

- **Frontend:** React (Next.js) or plain HTML/JS if time is short. Mobile-first layout, large text, minimal navigation depth (this is for low-literacy users — every extra screen is a cost).
- **Backend:** FastAPI (Python) — easiest to wire up Hugging Face models and OCR quickly.
- **OCR / document understanding:** a vision-language model rather than plain OCR, since prescriptions are messy and semi-structured. Options to pull from Hugging Face: a small VLM (e.g. Qwen2-VL, or a hosted multimodal LLM if you have API access) for extraction; fall back to Tesseract + LLM cleanup if a VLM is too heavy for your time budget.
- **Simplification / translation LLM:** any instruction-tuned LLM you can call cheaply. For Indian regional languages specifically, AI4Bharat's **IndicTrans2** is a strong open option; otherwise use your general LLM's own translation ability with a tight prompt (see §6).
- **Text-to-speech:** Meta's **MMS-TTS** (many Indian languages) or Coqui TTS for a quick multilingual demo.
- **Speech-to-text (if doing voice input):** Whisper (small/medium multilingual checkpoint).
- **Reminders:** browser Notifications API for the demo; don't build real push infra unless you have time to spare.
- **Storage:** just keep it in-memory or a lightweight SQLite table for the hackathon — you don't need a real database to win this.

---

## 5. Data Model

```json
{
  "document_type": "prescription | discharge_summary | lab_report | hospital_form",
  "patient_language": "en | hi | kn | ta | ...",
  "medications": [
    {
      "name": "string",
      "dose": "string",
      "frequency": "string",
      "timing": ["morning", "afternoon", "night"],
      "duration_days": "number | null",
      "special_instructions": "string | null"
    }
  ],
  "follow_up": {
    "date": "string | null",
    "location": "string | null",
    "department": "string | null"
  },
  "warning_symptoms": ["string"],
  "raw_ocr_text": "string"
}
```

Every downstream feature (timeline, TTS script, reminders, navigation) should read from this one structured object — build the extraction step to reliably produce it, and everything else gets much easier.

---

## 6. Prompts to Embed in the App

**Extraction prompt (feed OCR text or image to your VLM/LLM):**
> You are extracting structured data from a medical document photo. Read the text and return ONLY valid JSON matching this schema: [paste schema from §5]. If a field is not present, use null. Do not infer or guess a dosage, medicine, or instruction that is not explicitly written. If handwriting is unclear, mark that field as null rather than guessing.

**Simplification prompt ("Explain Like I'm 70"):**
> Rewrite the following medical instructions in very simple, warm, plain language for an elderly patient with no medical background. Use short sentences. Avoid medical jargon. Do not add any information that isn't in the original text. Do not suggest changing any dose or timing. Input: [structured JSON]

**Translation prompt:**
> Translate the following simplified medical instructions into [target language], using everyday words a person would use at home, not formal/clinical vocabulary. Keep numbers, times, and medicine names unchanged. Input: [simplified text]

**Teach-back prompt (stretch):**
> You just explained a medicine's dosage and timing to a patient. Ask them one short question to confirm they understood (e.g. "When will you take this medicine?"). Compare their spoken answer to the correct instruction. If it matches, confirm warmly. If it doesn't, gently re-explain using simpler wording, without making the person feel bad.

Build a guardrail around all of these: the app should never output a dose, drug name, or instruction that didn't come from the extracted document. If the model isn't confident, it should say "I couldn't read this clearly — please check with your pharmacist" rather than guess.

---

## 7. UI Notes

- Large tap targets, high contrast, minimal text per screen — the user base is explicitly low-literacy and elderly.
- Default to icons + voice over dense text blocks (pill icons, clock icons, hospital icons).
- One primary action per screen: "Take a photo" → "Here's your plan" → "Play it for me" / "Remind me".
- A visible language picker on the very first screen.

---

## 8. Demo Script to Build Toward

1. Live photograph a real (or realistic mock) discharge paper.
2. Within a few seconds, show the extracted structured plan on screen.
3. Tap "Explain it simply" — show the plain-language rewrite in the chosen local language.
4. Tap play — the app reads it aloud.
5. Show a reminder firing for the next medicine time.
6. (If built) Ask the teach-back question live and get an answer.

This sequence alone demonstrates OCR/vision, LLM reasoning, translation, TTS, and accessibility design in under a minute — which is the strongest version of your "why is this different" pitch.
