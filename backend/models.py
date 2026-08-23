from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class MedicationItem(BaseModel):
    name: str = Field(..., description="Name of the medicine")
    dose: str = Field(..., description="Dosage amount e.g. 500mg, 1 tablet, 5ml")
    frequency: str = Field(..., description="e.g. Twice daily, Once daily at bedtime")
    timing: List[Literal["morning", "afternoon", "night"]] = Field(
        default_factory=list, 
        description="Time slots when medicine should be taken"
    )
    duration_days: Optional[int] = Field(None, description="Number of days to continue")
    special_instructions: Optional[str] = Field(
        None, 
        description="Crucial dietary or administration instructions e.g. With food, Before meals"
    )
    purpose: Optional[str] = Field(
        None,
        description="Simple everyday purpose e.g. For blood sugar, For pain"
    )
    pill_color_type: Optional[str] = Field(
        "white_tablet", 
        description="Visual indicator: white_tablet, red_capsule, yellow_tablet, blue_liquid, inhaler, cream"
    )

class FollowUp(BaseModel):
    date: Optional[str] = Field(None, description="Follow up date in YYYY-MM-DD or readable string")
    location: Optional[str] = Field(None, description="Hospital or clinic name")
    department: Optional[str] = Field(None, description="Specific department or clinic room")
    address: Optional[str] = Field(None, description="Hospital address for maps")
    wayfinding_steps: Optional[List[str]] = Field(
        default_factory=list,
        description="Step-by-step easy directions inside the hospital"
    )

class MedicalDocument(BaseModel):
    document_type: Literal["prescription", "discharge_summary", "lab_report", "hospital_form"] = "prescription"
    patient_name: Optional[str] = "Patient"
    patient_language: str = "en"
    medications: List[MedicationItem] = Field(default_factory=list)
    follow_up: FollowUp = Field(default_factory=FollowUp)
    warning_symptoms: List[str] = Field(
        default_factory=list, 
        description="Red flag symptoms that require contacting doctor immediately"
    )
    raw_ocr_text: str = ""
    confidence_notes: Optional[str] = "High confidence extraction"

class SimplifyRequest(BaseModel):
    document: MedicalDocument
    target_language: str = "en" # en, hi, kn, ta, te, bn, es

class SimplifiedMedication(BaseModel):
    name: str
    dose: str
    timing_text: str
    timing_slots: List[str]
    plain_instructions: str
    icon_type: str

class SimplifiedPlan(BaseModel):
    language: str
    language_label: str
    greeting: str
    overall_summary: str
    medications: List[SimplifiedMedication]
    daily_schedule: dict # morning, afternoon, night arrays
    follow_up_summary: str
    warning_alerts: List[str]
    read_aloud_script: str
    audio_sentences: List[str]

class TeachBackItem(BaseModel):
    id: str
    question: str
    medicine_name: str
    correct_concept: str
    options: List[str]
    correct_option_index: int
    spoken_keywords: List[str]
    gentle_explanation: str
    encouraging_praise: str

class TeachBackEvaluateRequest(BaseModel):
    question_id: str
    selected_option_index: Optional[int] = None
    spoken_answer: Optional[str] = None
    target_language: str = "en"
    document: Optional[MedicalDocument] = None

class TeachBackEvaluationResult(BaseModel):
    is_correct: bool
    feedback_headline: str
    feedback_message: str
    spoken_feedback: str
    celebrate: bool

class QARequest(BaseModel):
    question: str
    document: Optional[MedicalDocument] = None
    language: str = "en"

class QAResponse(BaseModel):
    answer: str
    spoken_answer: str
    safety_disclaimer: str = "Always confirm with your pharmacist or doctor if you feel unwell."
