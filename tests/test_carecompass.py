import sys
import os

# Configure utf-8 stdout for Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from models import MedicalDocument, SimplifyRequest, TeachBackEvaluateRequest, QARequest
from samples import SAMPLE_DOCUMENTS
from extractor import DocumentExtractor
from simplifier import PlanSimplifier
from teachback import TeachBackEngine
from qa_assistant import MedicalQAAssistant

def test_samples_and_schema():
    print("Testing sample documents schema...")
    assert len(SAMPLE_DOCUMENTS) >= 4
    for s in SAMPLE_DOCUMENTS:
        doc = s["data"]
        assert isinstance(doc, MedicalDocument)
        assert len(doc.medications) > 0
        for med in doc.medications:
            assert med.name
            assert med.dose
            assert len(med.timing) > 0
        assert doc.follow_up is not None
        assert len(doc.warning_symptoms) > 0
    print("✓ All sample documents pass strict schema verification.")

def test_simplification_and_translation():
    print("Testing simplification and multilingual translation...")
    sample_doc = SAMPLE_DOCUMENTS[0]["data"]
    
    for lang in ["en", "hi", "kn", "ta", "te", "bn", "es"]:
        plan = PlanSimplifier.simplify(sample_doc, target_lang=lang)
        assert plan.language == lang
        assert len(plan.medications) == len(sample_doc.medications)
        assert len(plan.audio_sentences) > 0
        assert "morning" in plan.daily_schedule
        assert "afternoon" in plan.daily_schedule
        assert "night" in plan.daily_schedule
        print(f"  ✓ {lang} simplification generated {len(plan.audio_sentences)} spoken sentences.")
    print("✓ Multilingual simplification tests passed.")

def test_teachback_evaluation():
    print("Testing teach-back verification loop...")
    sample_doc = SAMPLE_DOCUMENTS[0]["data"]
    questions = TeachBackEngine.generate_questions(sample_doc, lang="en")
    assert len(questions) > 0
    q1 = questions[0]
    
    # Test correct answer
    res_correct = TeachBackEngine.evaluate_response(
        questions=questions,
        question_id=q1.id,
        selected_option_index=q1.correct_option_index,
        lang="en"
    )
    assert res_correct.is_correct is True
    assert res_correct.celebrate is True
    print(f"  ✓ Correct answer evaluation: {res_correct.feedback_headline}")

    # Test incorrect answer
    res_wrong = TeachBackEngine.evaluate_response(
        questions=questions,
        question_id=q1.id,
        selected_option_index=1,
        lang="en"
    )
    assert res_wrong.is_correct is False
    assert res_wrong.celebrate is False
    print(f"  ✓ Gentle re-explanation: {res_wrong.feedback_headline}")

    # Test spoken keyword matching
    res_spoken = TeachBackEngine.evaluate_response(
        questions=questions,
        question_id=q1.id,
        spoken_answer="I will take it with morning breakfast and night dinner",
        lang="en"
    )
    assert res_spoken.is_correct is True
    print(f"  ✓ Spoken audio keyword match passed: {res_spoken.feedback_headline}")
    print("✓ Teach-back engine tests passed.")

def test_guardrailed_qa():
    print("Testing guardrailed medical Q&A...")
    sample_doc = SAMPLE_DOCUMENTS[0]["data"]
    
    # Test missed dose question
    qa_missed = MedicalQAAssistant.answer_question("What if I forgot to take a tablet?", doc=sample_doc, lang="en")
    assert "missed" in qa_missed.answer.lower() or "remember" in qa_missed.answer.lower()
    
    # Test follow up question
    qa_followup = MedicalQAAssistant.answer_question("When is my next appointment?", doc=sample_doc, lang="en")
    assert sample_doc.follow_up.date in qa_followup.answer
    
    print("✓ Medical Q&A tests passed.")

if __name__ == "__main__":
    test_samples_and_schema()
    test_simplification_and_translation()
    test_teachback_evaluation()
    test_guardrailed_qa()
    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY!")
