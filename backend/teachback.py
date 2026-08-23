from typing import List, Dict, Optional
from models import MedicalDocument, TeachBackItem, TeachBackEvaluationResult

TEACHBACK_TRANSLATIONS = {
    "en": {
        "praise_title": "🌟 Brilliant! That's exactly right.",
        "gentle_title": "💛 That's close! Let's remember together:",
        "correct_praise": "You understood the instructions perfectly. Taking it this way keeps your body safe and speeds up healing.",
        "gentle_prefix": "Don't worry, medical instructions can be tricky! Remember:"
    },
    "hi": {
        "praise_title": "🌟 बहुत बढ़िया! आपने बिल्कुल सही समझा।",
        "gentle_title": "💛 कोई बात नहीं! आइए एक बार फिर याद कर लेते हैं:",
        "correct_praise": "आपने दवा लेने का समय और तरीका बिल्कुल सही बताया है। शाबाश!",
        "gentle_prefix": "चिंता मत कीजिए, दवाइयों के नियम याद रखना कभी-कभी कठिन होता है। याद रखें:"
    },
    "kn": {
        "praise_title": "🌟 ಅದ್ಭುತ! ನೀವು ಸರಿಯಾಗಿ ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೀರಿ.",
        "gentle_title": "💛 ಪರವಾಗಿಲ್ಲ! ಮತ್ತೊಮ್ಮೆ ನೆನಪಿಸಿಕೊಳ್ಳೋಣ:",
        "correct_praise": "ಔಷಧಿಯನ್ನು ಯಾವಾಗ ಮತ್ತು ಹೇಗೆ ತೆಗೆದುಕೊಳ್ಳಬೇಕೆಂದು ನೀವು ನಿಖರವಾಗಿ ಹೇಳಿದ್ದೀರಿ.",
        "gentle_prefix": "ಚಿಂತೆ ಬೇಡ! ನೆನಪಿಡಿ:"
    },
    "ta": {
        "praise_title": "🌟 அற்புதம்! நீங்கள் மிகச்சரியாக புரிந்து கொண்டீர்கள்.",
        "gentle_title": "💛 பரவாயில்லை! நாம் மீண்டும் நினைவில் கொள்வோம்:",
        "correct_praise": "மருந்தை எப்பொழுது எப்படி சாப்பிட வேண்டும் என்பதை சரியாக கூறிவிட்டீர்கள்.",
        "gentle_prefix": "கவலைப்பட வேண்டாம்! நினைவில் வையுங்கள்:"
    },
    "te": {
        "praise_title": "🌟 అద్భుతం! మీరు సరిగ్గా అర్థం చేసుకున్నారు.",
        "gentle_title": "💛 పర్వాలేదు! మరొక్కసారి గుర్తుచేసుకుందాం:",
        "correct_praise": "మందును ఎప్పుడు ఎలా తీసుకోవాలో మీరు సరిగ్గా చెప్పారు.",
        "gentle_prefix": "కంగారు పడకండి! గుర్తుంచుకోండి:"
    },
    "bn": {
        "praise_title": "🌟 দারুণ! আপনি একদম সঠিকভাবে বুঝেছেন।",
        "gentle_title": "💛 চিন্তা করবেন না! চলুন আরও একবার মনে করে নিই:",
        "correct_praise": "ওষুধটি কখন এবং কীভাবে খেতে হবে আপনি একদম ঠিক বলেছেন।",
        "gentle_prefix": "কোনো অসুবিধা নেই! মনে রাখবেন:"
    },
    "es": {
        "praise_title": "🌟 ¡Excelente! Lo ha entendido a la perfección.",
        "gentle_title": "💛 ¡Casi! Recordemos juntos la instrucción:",
        "correct_praise": "Ha respondido exactamente cómo y cuándo debe tomar su medicamento. ¡Muy bien!",
        "gentle_prefix": "No se preocupe, es normal confundirse. Recuerde:"
    }
}

class TeachBackEngine:
    """
    Generates high-value teach-back verification challenges for EVERY prescribed
    medication in the patient's plan and evaluates spoken or tapped answers.
    """

    @classmethod
    def generate_questions(cls, doc: MedicalDocument, lang: str = "en") -> List[TeachBackItem]:
        questions: List[TeachBackItem] = []
        if not doc.medications:
            return questions

        for idx, med in enumerate(doc.medications, 1):
            med_name = med.name
            dose = med.dose or "as prescribed"
            timings = ", ".join(med.timing) if med.timing else "scheduled time"
            instructions = med.special_instructions or "take with water"
            name_lower = med_name.lower()

            q_id = f"q_med_{idx}"

            # 1. Antacid / PPI (Pantoprazole, Omeprazole, Rabeprazole, Pan 40)
            if any(k in name_lower for k in ["pantoprazole", "omeprazole", "rabeprazole", "esomeprazole", "pan 40", "pantocid", "ppi"]):
                if lang == "hi":
                    q = TeachBackItem(
                        id=q_id,
                        medicine_name=med_name,
                        question=f"'{med_name}' ({dose}) को नाश्ते से कितने समय पहले लेना चाहिए?",
                        correct_concept="30 मिनट पहले खाली पेट पानी के साथ",
                        options=[
                            "नाश्ते से 30 मिनट पहले पानी के साथ (खाली पेट)",
                            "रात को भारी खाने के बाद",
                            "सिर्फ जब पेट में तेज दर्द हो"
                        ],
                        correct_option_index=0,
                        spoken_keywords=["30", "पहले", "खाली पेट", "सुबह", "before", "empty", "breakfast"],
                        gentle_explanation=f"{med_name} पेट में गैस और एसिडिटी से रक्षा करता है। इसे नाश्ते से 30 मिनट पहले खाली पेट पानी के साथ लें।",
                        encouraging_praise=f"बिल्कुल सही! {med_name} को खाली पेट लेने से यह दिनभर एसिडिटी से आपकी रक्षा करता है।"
                    )
                else:
                    q = TeachBackItem(
                        id=q_id,
                        medicine_name=med_name,
                        question=f"How and when should you take your '{med_name}' ({dose}) in the morning?",
                        correct_concept="30 minutes before morning breakfast with water on an empty stomach",
                        options=[
                            "30 minutes before breakfast with a glass of water (Empty stomach)",
                            "Right after a heavy oily lunch",
                            "Only if you feel sudden stomach discomfort at night"
                        ],
                        correct_option_index=0,
                        spoken_keywords=["30", "before", "empty", "stomach", "breakfast", "water"],
                        gentle_explanation=f"{med_name} coats and shields your stomach against acid irritation. Taking it 30 minutes before breakfast gives it time to activate.",
                        encouraging_praise=f"Spot on! Taking {med_name} 30 minutes before morning food ensures all-day stomach protection."
                    )

            # 2. Antibiotic (Augmentin, Amoxicillin, Azithromycin, Ciprofloxacin, Cefixime, Doxycycline)
            elif any(k in name_lower for k in ["augmentin", "amoxicillin", "azithromycin", "ciprofloxacin", "cefixime", "doxycycline", "antibiotic", "amoxyclav", "ofloxacin"]):
                if lang == "hi":
                    q = TeachBackItem(
                        id=q_id,
                        medicine_name=med_name,
                        question=f"'{med_name}' ({dose}) का कोर्स पूरा करना क्यों बहुत जरूरी है?",
                        correct_concept="डॉक्टर द्वारा बताए गए सभी दिन पूरे करें, भले ही आप ठीक महसूस करें",
                        options=[
                            "डॉक्टर द्वारा बताए गए सभी दिन पूरे करें, भले ही आप ठीक महसूस करें",
                            "बुखार कम होते ही तुरंत दवा बंद कर दें",
                            "सभी गोलियां एक साथ खा लें"
                        ],
                        correct_option_index=0,
                        spoken_keywords=["पूरा", "कोर्स", "सभी दिन", "complete", "course", "days", "finish"],
                        gentle_explanation=f"एंटीबायोटिक बीच में छोड़ने से बैक्टीरिया दोबारा हमला कर सकते हैं। {med_name} का पूरा कोर्स खत्म करें।",
                        encouraging_praise=f"शाबाश! {med_name} का पूरा कोर्स खत्म करने से इन्फेक्शन जड़ से खत्म होता है।"
                    )
                else:
                    q = TeachBackItem(
                        id=q_id,
                        medicine_name=med_name,
                        question=f"What is the most critical instruction for taking your '{med_name}' ({dose}) course?",
                        correct_concept="Complete all prescribed days fully even if you feel completely better",
                        options=[
                            "Complete the entire prescribed days even if you feel completely better",
                            "Stop taking it immediately once your fever or pain subsides",
                            "Take all remaining pills together at once if you miss a day"
                        ],
                        correct_option_index=0,
                        spoken_keywords=["complete", "course", "finish", "all days", "prescribed", "entire"],
                        gentle_explanation=f"Stopping antibiotics early allows bacteria to survive and become drug-resistant. Always finish every single dose of {med_name}.",
                        encouraging_praise=f"Brilliant! Completing your full course of {med_name} guarantees the infection is wiped out safely."
                    )

            # 3. Blood Thinner / Anticoagulant (Ecosprin, Aspirin, Clopidogrel, Rivaroxaban, Warfarin, Apixaban)
            elif any(k in name_lower for k in ["aspirin", "ecosprin", "clopidogrel", "rivaroxaban", "warfarin", "apixaban", "blood thinner", "plavix", "xarelto"]):
                if lang == "hi":
                    q = TeachBackItem(
                        id=q_id,
                        medicine_name=med_name,
                        question=f"खून पतला करने वाली दवा '{med_name}' ({dose}) लेते समय सबसे जरूरी नियम क्या है?",
                        correct_concept="रोजाना एक ही समय पर खाने के साथ लें और कोई खुराक न छोड़ें",
                        options=[
                            "रोजाना तय समय पर खाने के साथ लें और खुराक न छोड़ें",
                            "सिर्फ जब सीने में भारीपन लगे तब लें",
                            "हल्की खरोंच आने पर दवा की दोगुनी खुराक लें"
                        ],
                        correct_option_index=0,
                        spoken_keywords=["रोजाना", "समय", "खाना", "साथ", "daily", "same time", "food"],
                        gentle_explanation=f"{med_name} खून को जमने से रोकती है। इसे रोजाना खाने के बाद सही समय पर लें।",
                        encouraging_praise=f"बिल्कुल सही! {med_name} को नियमित रूप से लेना आपके दिल और नसों को सुरक्षित रखता है।"
                    )
                else:
                    q = TeachBackItem(
                        id=q_id,
                        medicine_name=med_name,
                        question=f"What is the primary safety rule when taking '{med_name}' ({dose})?",
                        correct_concept="Take it at the same scheduled time every day with food and never skip doses",
                        options=[
                            "Take it at the same scheduled time every day with food and never skip doses",
                            "Take extra pills whenever you notice minor skin bruises",
                            "Take it only on days when you feel chest tightness"
                        ],
                        correct_option_index=0,
                        spoken_keywords=["same time", "daily", "food", "regular", "meal", "consistent"],
                        gentle_explanation=f"{med_name} prevents dangerous blood clots and protects your heart stents. Always take it with food at the same time daily.",
                        encouraging_praise=f"Exactly right! Consistent daily timing of {med_name} keeps your heart and vascular system protected."
                    )

            # 4. Blood Sugar / Diabetes (Metformin, Glycomet, Glimepiride, Sitagliptin, Dapagliflozin, Insulin)
            elif any(k in name_lower for k in ["metformin", "glycomet", "glimepiride", "sitagliptin", "dapagliflozin", "insulin", "sugar", "diabetes", "januvia"]):
                if lang == "hi":
                    q = TeachBackItem(
                        id=q_id,
                        medicine_name=med_name,
                        question=f"शुगर की दवा '{med_name}' ({dose}) लेने का सबसे सुरक्षित समय कौन सा है?",
                        correct_concept="खाना खाने के साथ या तुरंत बाद",
                        options=[
                            "खाना खाने के साथ या तुरंत बाद (शुगर सामान्य रखने के लिए)",
                            "सुबह खाली पेट बिना कुछ खाए व्यायाम से पहले",
                            "सिर्फ मीठा खाने के बाद"
                        ],
                        correct_option_index=0,
                        spoken_keywords=["खाना", "साथ", "तुरंत बाद", "meal", "food", "after"],
                        gentle_explanation=f"{med_name} को खाने के साथ या बाद में लेने से पेट में परेशानी नहीं होती और शुगर नियंत्रित रहती है।",
                        encouraging_praise=f"उत्तम! {med_name} को भोजन के साथ लेने से आपकी शुगर नियंत्रित और सुरक्षित रहेगी।"
                    )
                else:
                    q = TeachBackItem(
                        id=q_id,
                        medicine_name=med_name,
                        question=f"When is the safest time to take your '{med_name}' ({dose}) tablet?",
                        correct_concept="With or immediately after your meals to keep blood sugar stable",
                        options=[
                            "With or immediately after your meals to keep blood sugar stable",
                            "On an empty stomach before intense morning exercise",
                            "Only after eating sweets or sugary desserts"
                        ],
                        correct_option_index=0,
                        spoken_keywords=["with food", "after meal", "meals", "food", "breakfast", "dinner"],
                        gentle_explanation=f"Taking {med_name} with or right after food prevents sudden low blood sugar drops and avoids stomach cramping.",
                        encouraging_praise=f"Perfect! Taking {med_name} with your meals keeps your blood sugar smooth and prevents dizziness."
                    )

            # 5. Blood Pressure / Hypertension (Telmisartan, Telma, Amlodipine, Losartan, Enalapril, Metoprolol)
            elif any(k in name_lower for k in ["telmisartan", "telma", "amlodipine", "losartan", "enalapril", "metoprolol", "atenolol", "bp", "blood pressure"]):
                if lang == "hi":
                    q = TeachBackItem(
                        id=q_id,
                        medicine_name=med_name,
                        question=f"यदि आपका बीपी सामान्य लग रहा हो, तो '{med_name}' ({dose}) का क्या करना चाहिए?",
                        correct_concept="दवा रोजाना निर्धारित समय पर लेते रहें",
                        options=[
                            "दवा रोजाना निर्धारित समय पर नियमित रूप से लेते रहें",
                            "बीपी सामान्य होते ही दवा तुरंत बंद कर दें",
                            "तनाव होने पर दोगुनी खुराक लें"
                        ],
                        correct_option_index=0,
                        spoken_keywords=["नियमित", "रोजाना", "चालू", "daily", "regular", "continue"],
                        gentle_explanation=f"बीपी की दवा {med_name} को कभी अचानक बंद न करें। यह आपके दिल और दिमाग को सुरक्षित रखती है।",
                        encouraging_praise=f"बहुत बढ़िया! {med_name} को रोजाना लेते रहने से बीपी हमेशा नियंत्रण में रहता है।"
                    )
                else:
                    q = TeachBackItem(
                        id=q_id,
                        medicine_name=med_name,
                        question=f"How should you take '{med_name}' ({dose}) if you feel completely fine?",
                        correct_concept="Continue taking it regularly every day as prescribed by your doctor",
                        options=[
                            "Continue taking it regularly every day as prescribed by your doctor",
                            "Stop taking it completely once your blood pressure reading is normal",
                            "Take double doses whenever you have a stressful afternoon"
                        ],
                        correct_option_index=0,
                        spoken_keywords=["continue", "regularly", "daily", "every day", "prescribed"],
                        gentle_explanation=f"High blood pressure has no warning symptoms. {med_name} protects your kidneys, heart, and brain silently every single day.",
                        encouraging_praise=f"Wonderful understanding! Regular daily {med_name} prevents heart strain and keeps you protected."
                    )

            # 6. Cholesterol / Statin (Atorvastatin, Atorva, Rosuvastatin, Simvastatin)
            elif any(k in name_lower for k in ["atorvastatin", "atorva", "rosuvastatin", "simvastatin", "cholesterol", "statin"]):
                if lang == "hi":
                    q = TeachBackItem(
                        id=q_id,
                        medicine_name=med_name,
                        question=f"कोलेस्ट्रॉल की दवा '{med_name}' ({dose}) को रात को सोने से पहले लेना क्यों बेहतर है?",
                        correct_concept="क्योंकि रात में सोते समय लीवर सबसे ज्यादा कोलेस्ट्रॉल बनाता है",
                        options=[
                            "क्योंकि रात में सोते समय शरीर सबसे ज्यादा कोलेस्ट्रॉल बनाता है",
                            "क्योंकि यह तुरंत नींद लाती है",
                            "क्योंकि यह सिर्फ दोपहर में काम करती है"
                        ],
                        correct_option_index=0,
                        spoken_keywords=["रात", "सोने", "लीवर", "night", "bedtime", "sleep"],
                        gentle_explanation=f"{med_name} रात को सोने से पहले लेने पर सबसे ज्यादा असर करती है क्योंकि रात में कोलेस्ट्रॉल अधिक बनता है।",
                        encouraging_praise=f"बिल्कुल सही! {med_name} को रात में लेने से कोलेस्ट्रॉल तेजी से नियंत्रण में आता है।"
                    )
                else:
                    q = TeachBackItem(
                        id=q_id,
                        medicine_name=med_name,
                        question=f"Why is '{med_name}' ({dose}) recommended to be taken at bedtime (night)?",
                        correct_concept="Because your liver naturally produces the most cholesterol during nighttime sleep",
                        options=[
                            "Because your liver naturally produces the most cholesterol during nighttime sleep",
                            "Because it is a sleeping pill that makes you drowsy immediately",
                            "Because it only activates in the direct afternoon sunlight"
                        ],
                        correct_option_index=0,
                        spoken_keywords=["night", "bedtime", "sleep", "liver", "cholesterol", "evening"],
                        gentle_explanation=f"Taking {med_name} at bedtime matches your body's peak cholesterol synthesis cycle for maximum artery protection.",
                        encouraging_praise=f"Spot on! Bedtime dosing of {med_name} gives you the highest clinical effectiveness."
                    )

            # 7. Respiratory / Inhaler (Budecort, Foracort, Asthalin, Montair, Levocetirizine)
            elif any(k in name_lower for k in ["inhaler", "budecort", "foracort", "asthalin", "montelukast", "levocetirizine", "montek", "puff"]):
                if "inhaler" in name_lower or "puff" in name_lower or "budecort" in name_lower or "foracort" in name_lower:
                    q = TeachBackItem(
                        id=q_id,
                        medicine_name=med_name,
                        question=f"What is the single most important step right after using '{med_name}' puffs?",
                        correct_concept="Rinse and gargle mouth thoroughly with clean water",
                        options=[
                            "Rinse and gargle mouth thoroughly with clean water to prevent throat irritation",
                            "Immediately lie down flat without drinking anything",
                            "Drink scalding hot soup immediately"
                        ],
                        correct_option_index=0,
                        spoken_keywords=["rinse", "gargle", "water", "mouth", "wash"],
                        gentle_explanation=f"Rinsing your mouth after using {med_name} washes away residual powder, preventing hoarseness and oral irritation.",
                        encouraging_praise=f"Wonderful! Rinsing your mouth after {med_name} keeps your throat clean, comfortable, and fresh."
                    )
                else:
                    q = TeachBackItem(
                        id=q_id,
                        medicine_name=med_name,
                        question=f"When is the most beneficial time to take your '{med_name}' ({dose}) tablet?",
                        correct_concept="In the evening or at bedtime to help relieve nighttime allergy symptoms",
                        options=[
                            "In the evening or at bedtime to prevent nighttime coughing and allergy flare-ups",
                            "Only first thing in the morning on an empty stomach",
                            "Only right after strenuous heavy exercise"
                        ],
                        correct_option_index=0,
                        spoken_keywords=["evening", "bedtime", "night", "allergy", "sleep"],
                        gentle_explanation=f"{med_name} helps calm airway inflammation and histamine reactions so you can breathe easily and sleep through the night.",
                        encouraging_praise=f"Exactly right! Evening dosing of {med_name} keeps your breathing relaxed all night long."
                    )

            # 8. General / Pain & Fever / Multivitamin / Other
            else:
                if lang == "hi":
                    q = TeachBackItem(
                        id=q_id,
                        medicine_name=med_name,
                        question=f"आप '{med_name}' ({dose}) दिन में कब और कैसे लेंगे?",
                        correct_concept=f"{timings} में खाना खाने के बाद",
                        options=[
                            f"{timings} में खाना खाने के बाद पानी के साथ (सही समय)",
                            "खाली पेट बिना कुछ खाए एक साथ कई गोलियां",
                            "सिर्फ हफ्ते में एक बार आधी रात को"
                        ],
                        correct_option_index=0,
                        spoken_keywords=["खाना", "बाद", "पानी", "समय", "food", "after", "water"],
                        gentle_explanation=f"{med_name} को {instructions or 'खाना खाने के बाद'} ही लें ताकि पेट में कोई जलन न हो।",
                        encouraging_praise=f"आपने बिल्कुल सही समय चुना है! {med_name} को भोजन के बाद लेना सुरक्षित है।"
                    )
                else:
                    q = TeachBackItem(
                        id=q_id,
                        medicine_name=med_name,
                        question=f"When and how should you take your '{med_name}' ({dose})?",
                        correct_concept=f"In the {timings} with/after meals as prescribed",
                        options=[
                            f"In the {timings} with/after meals with a glass of water (Correct schedule)",
                            "All at once on an empty stomach without water",
                            "Only once a week in the middle of the night"
                        ],
                        correct_option_index=0,
                        spoken_keywords=["meal", "food", "water", "after", "morning", "night", "afternoon", "scheduled"],
                        gentle_explanation=f"Always take {med_name} with or after food as scheduled. Having food in your stomach prevents acidity and promotes healing.",
                        encouraging_praise=f"Spot on! Taking {med_name} according to your scheduled times keeps your recovery on track."
                    )

            questions.append(q)

        return questions

    @classmethod
    def evaluate_response(
        cls, 
        questions: List[TeachBackItem], 
        question_id: str, 
        selected_option_index: Optional[int] = None, 
        spoken_answer: Optional[str] = None,
        lang: str = "en"
    ) -> TeachBackEvaluationResult:
        t = TEACHBACK_TRANSLATIONS.get(lang, TEACHBACK_TRANSLATIONS["en"])

        matched_q = None
        for q in questions:
            if q.id == question_id:
                matched_q = q
                break
        
        if not matched_q:
            if questions:
                matched_q = questions[0]
            else:
                return TeachBackEvaluationResult(
                    is_correct=True,
                    feedback_headline=t["praise_title"],
                    feedback_message=t["correct_praise"],
                    spoken_feedback=t["correct_praise"],
                    celebrate=True
                )

        is_correct = False
        if selected_option_index is not None:
            is_correct = (selected_option_index == matched_q.correct_option_index)
        elif spoken_answer:
            spoken_lower = spoken_answer.lower()
            match_count = sum(1 for kw in matched_q.spoken_keywords if kw in spoken_lower)
            is_correct = (match_count >= 1)

        if is_correct:
            return TeachBackEvaluationResult(
                is_correct=True,
                feedback_headline=t["praise_title"],
                feedback_message=matched_q.encouraging_praise,
                spoken_feedback=matched_q.encouraging_praise,
                celebrate=True
            )
        else:
            return TeachBackEvaluationResult(
                is_correct=False,
                feedback_headline=t["gentle_title"],
                feedback_message=f"{t['gentle_prefix']} {matched_q.gentle_explanation}",
                spoken_feedback=f"{t['gentle_prefix']} {matched_q.gentle_explanation}",
                celebrate=False
            )
