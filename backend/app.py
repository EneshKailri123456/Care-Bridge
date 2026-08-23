import os
import sys
import re
import base64

# Ensure backend directory is in sys.path for direct execution and uvicorn module loading
_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from models import (
    MedicalDocument,
    SimplifyRequest,
    SimplifiedPlan,
    TeachBackItem,
    TeachBackEvaluateRequest,
    TeachBackEvaluationResult,
    QARequest,
    QAResponse,
)
from samples import SAMPLE_DOCUMENTS, get_sample_by_id
from extractor import DocumentExtractor
from simplifier import PlanSimplifier, LANGUAGE_CONFIG
from teachback import TeachBackEngine
from qa_assistant import MedicalQAAssistant

app = FastAPI(
    title="CareBridge API",
    description="Multilingual medical paperwork assistant for elderly and low-literacy patients",
    version="1.0.0"
)

# Enable CORS for local development and web accessibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/languages")
def get_languages():
    """Return all available UI & TTS languages"""
    return [
        {"code": k, "name": v["name"], "native": v["native"], "locale": v["locale"]}
        for k, v in LANGUAGE_CONFIG.items()
    ]

@app.get("/api/samples")
def get_samples():
    """Return summary list of preloaded medical document samples for quick 1-click demos"""
    return [
        {
            "id": s["id"],
            "title": s["title"],
            "subtitle": s["subtitle"],
            "badge": s["badge"],
            "patient_name": s["patient_name"],
            "hospital": s.get("hospital", "Hospital"),
            "med_count": len(s["data"].medications)
        }
        for s in SAMPLE_DOCUMENTS
    ]

@app.get("/api/samples/{sample_id}")
def get_sample_detail(sample_id: str, lang: str = "en"):
    """Fetch sample document data and pre-generate simplified plan"""
    sample = get_sample_by_id(sample_id)
    doc = sample["data"]
    simplified = PlanSimplifier.simplify(doc, target_lang=lang)
    teachback_questions = TeachBackEngine.generate_questions(doc, lang=lang)

    return {
        "id": sample["id"],
        "title": sample["title"],
        "subtitle": sample["subtitle"],
        "badge": sample["badge"],
        "hospital": sample.get("hospital", "Hospital"),
        "raw_ocr_text": sample["raw_ocr_text"],
        "document": doc,
        "simplified": simplified,
        "teachback_questions": teachback_questions
    }

@app.post("/api/extract", response_model=MedicalDocument)
async def extract_document(
    request: Request,
    text: Optional[str] = Form(None),
    sample_id: Optional[str] = Form(None),
    image_base64: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Extract structured clinical JSON from raw text, sample ID, uploaded image, or pasted clipboard image.
    """
    import base64

    # Check if client sent application/json
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            if isinstance(body, dict):
                sample_id = sample_id or body.get("sample_id")
                text = text or body.get("text")
                image_base64 = image_base64 or body.get("image_base64")
        except Exception:
            pass

    if sample_id:
        return DocumentExtractor.extract_from_sample(sample_id)

    if image_base64:
        # Strip data URL prefix if present
        clean_b64 = re.sub(r"^data:[^;]+;base64,", "", image_base64.strip())
        return DocumentExtractor.extract_from_text(
            text="Prescription Image extracted via OCR & NVIDIA Nemotron 3 Ultra",
            image_base64=clean_b64
        )

    if file:
        content = await file.read()
        b64_content = base64.b64encode(content).decode("utf-8")
        return DocumentExtractor.extract_from_text(
            text=f"Uploaded Medical Document: {file.filename}",
            image_base64=b64_content
        )

    if text:
        return DocumentExtractor.extract_from_text(text)

    # Default fallback to first sample
    return SAMPLE_DOCUMENTS[0]["data"]

@app.post("/api/simplify", response_model=SimplifiedPlan)
def simplify_document(req: SimplifyRequest):
    """
    Rewrite structured medical JSON into simple, warm plain language ('Explain Like I'm 70')
    in the chosen language.
    """
    return PlanSimplifier.simplify(req.document, target_lang=req.target_language)

from tts_engine import NeuralTTSEngine
from fastapi.responses import Response

@app.post("/api/tts")
async def generate_speech(
    text: str = Form(...),
    lang: str = Form("en"),
    rate: float = Form(1.0)
):
    """
    Generate high-definition natural human neural speech in Hindi, Kannada, Tamil, Telugu, Bengali, English, Spanish.
    """
    audio_bytes = await NeuralTTSEngine.synthesize_speech_async(text, lang=lang, rate=rate)
    if audio_bytes:
        return Response(content=audio_bytes, media_type="audio/mpeg")
    
    return JSONResponse(
        status_code=200,
        content={"status": "fallback", "message": "Using browser neural speech synthesizer"}
    )

@app.post("/api/teachback/questions", response_model=List[TeachBackItem])
def get_teachback_questions(
    document: MedicalDocument = Body(...),
    lang: str = "en"
):
    """Generate verification questions for the patient"""
    return TeachBackEngine.generate_questions(document, lang=lang)

@app.post("/api/teachback/evaluate", response_model=TeachBackEvaluationResult)
def evaluate_teachback(req: TeachBackEvaluateRequest):
    """Evaluate patient's spoken or tapped answer and return supportive feedback"""
    doc = req.document or SAMPLE_DOCUMENTS[0]["data"]
    questions = TeachBackEngine.generate_questions(doc, lang=req.target_language)
    return TeachBackEngine.evaluate_response(
        questions=questions,
        question_id=req.question_id,
        selected_option_index=req.selected_option_index,
        spoken_answer=req.spoken_answer,
        lang=req.target_language
    )

@app.post("/api/ask", response_model=QAResponse)
def ask_question(req: QARequest):
    """Guardrailed medical paperwork question answering assistant"""
    return MedicalQAAssistant.answer_question(
        question=req.question,
        doc=req.document,
        lang=req.language
    )

@app.post("/api/stt")
async def speech_to_text(
    audio: UploadFile = File(...),
    lang: str = Form("en")
):
    """
    Transcribes recorded microphone WAV audio into text using speech recognition.
    """
    import io
    import speech_recognition as sr

    try:
        content = await audio.read()
        if not content:
            return {"transcript": "", "success": False, "error": "Empty audio recording"}

        r = sr.Recognizer()
        lang_map = {
            "en": "en-IN",
            "hi": "hi-IN",
            "kn": "kn-IN",
            "ta": "ta-IN",
            "te": "te-IN",
            "bn": "bn-IN",
            "es": "es-ES"
        }
        lang_code = lang_map.get(lang, "en-IN")

        audio_stream = io.BytesIO(content)
        with sr.AudioFile(audio_stream) as source:
            audio_data = r.record(source)
            try:
                transcript = r.recognize_google(audio_data, language=lang_code)
                return {"transcript": transcript, "success": True}
            except Exception:
                # Try english fallback
                transcript = r.recognize_google(audio_data, language="en-IN")
                return {"transcript": transcript, "success": True}

    except ImportError:
        return {"transcript": "", "success": False, "error": "Speech recognition engine not available."}
    except Exception as e:
        error_msg = str(e)
        if "UnknownValueError" in error_msg or "not understand" in error_msg.lower():
            return {"transcript": "", "success": False, "error": "No clear speech detected. Please speak closer to your microphone."}
        return {"transcript": "", "success": False, "error": error_msg}

# Static Frontend mounting (docs folder is primary for GitHub Pages & Web Deployment)
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs"))
if not os.path.exists(frontend_dir):
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

@app.get("/sw.js")
def serve_sw():
    sw_file = os.path.join(frontend_dir, "sw.js")
    if os.path.exists(sw_file):
        return FileResponse(sw_file, media_type="application/javascript")
    return JSONResponse(status_code=404, content={"error": "sw.js not found"})

@app.get("/manifest.json")
def serve_manifest():
    manifest_file = os.path.join(frontend_dir, "manifest.json")
    if os.path.exists(manifest_file):
        return FileResponse(manifest_file, media_type="application/json")
    return JSONResponse(status_code=404, content={"error": "manifest.json not found"})

@app.get("/")
def serve_index():
    index_file = os.path.join(frontend_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "CareBridge API is running. Frontend static directory not initialized yet."}

@app.get("/{filename:path}")
def serve_root_file(filename: str):
    if not filename or filename.startswith("api/"):
        raise HTTPException(status_code=404, detail="Endpoint not found")
    file_path = os.path.join(frontend_dir, filename)
    if os.path.isfile(file_path):
        media_type = None
        if filename.endswith(".js"):
            media_type = "application/javascript"
        elif filename.endswith(".css"):
            media_type = "text/css"
        elif filename.endswith(".json"):
            media_type = "application/json"
        elif filename.endswith(".jpg") or filename.endswith(".jpeg"):
            media_type = "image/jpeg"
        elif filename.endswith(".png"):
            media_type = "image/png"
        elif filename.endswith(".svg"):
            media_type = "image/svg+xml"
        return FileResponse(file_path, media_type=media_type)
    raise HTTPException(status_code=404, detail=f"File {filename} not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
