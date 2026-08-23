from typing import Dict, List, Any
from models import MedicalDocument, SimplifiedPlan, SimplifiedMedication

LANGUAGE_CONFIG = {
    "en": {"name": "English", "native": "English", "locale": "en-US"},
    "hi": {"name": "Hindi", "native": "हिंदी", "locale": "hi-IN"},
    "kn": {"name": "Kannada", "native": "ಕನ್ನಡ", "locale": "kn-IN"},
    "ta": {"name": "Tamil", "native": "தமிழ்", "locale": "ta-IN"},
    "te": {"name": "Telugu", "native": "తెలుగు", "locale": "te-IN"},
    "bn": {"name": "Bengali", "native": "বাংলা", "locale": "bn-IN"},
    "es": {"name": "Spanish", "native": "Español", "locale": "es-ES"},
}

# Plain-language dictionary mappings for high-quality, clinical-grade multilingual simplification
# Plain-language dictionary mappings for high-quality, clinical-grade multilingual simplification
TRANSLATION_MAP = {
    "hi": {
        "greeting": "नमस्ते! यहाँ आपकी दवाइयों और सेहत की बहुत ही आसान योजना है।",
        "summary_template": "डॉक्टर ने आपको कुल {count} दवाइयां लिखी हैं। इन्हें समय पर लेना बहुत जरूरी है।",
        "morning": "सुबह (नाश्ते के साथ)",
        "afternoon": "दोपहर (दोपहर के खाने के साथ)",
        "night": "रात (रात के खाने के बाद/सोते समय)",
        "with_food": "इसे खाना खाने के बाद या खाने के साथ एक गिलास सादे पानी से लें।",
        "empty_stomach": "इसे सुबह खाली पेट, नाश्ते से 30 मिनट पहले पानी के साथ लें।",
        "bedtime": "इसे रात को सोने से ठीक पहले लें।",
        "inhaler_instruction": "मुँह से 2 बार सांस खींचकर लें, फिर सादे पानी से कुल्ला जरूर करें।",
        "syrup_instruction": "ढक्कन से 2 चम्मच (10 ml) नापकर खाने के बाद पिएं।",
        "as_needed": "दर्द या आवश्यकता होने पर ही लें।",
        "water_instruction": "भरपूर सादे पानी के साथ भोजन के बाद लें।",
        "days_suffix": "{days} दिन",
        "ongoing": "नियमित (Ongoing)",
        "follow_up_prefix": "अगली डॉक्टर मुलाक़ात:",
        "warning_title": "अगर यह लक्षण दिखें तो तुरंत अस्पताल जाएं या डॉक्टर को बताएं:",
        "finish_course": "दवा का पूरा कोर्स खत्म करें, बीच में न रोकें।",
        "emergency_call": "किसी भी आपातकालीन स्थिति में तुरंत 108 पर कॉल करें।"
    },
    "kn": {
        "greeting": "ನಮಸ್ಕಾರ! ನಿಮ್ಮ ವೈದ್ಯರ ಔಷಧ ಮತ್ತು ಆರೈಕೆ ಯೋಜನೆಯ ಸರಳ ವಿವರ ಇಲ್ಲಿದೆ.",
        "summary_template": "ವೈದ್ಯರು ನಿಮಗೆ ಒಟ್ಟು {count} ಔಷಧಿಗಳನ್ನು ನೀಡಿದ್ದಾರೆ. ಇವುಗಳನ್ನು ಸರಿಯಾದ ಸಮಯಕ್ಕೆ ತೆಗೆದುಕೊಳ್ಳಿ.",
        "morning": "ಬೆಳಿಗ್ಗೆ (ಉಪಾಹಾರದ ನಂತರ)",
        "afternoon": "ಮಧ್ಯಾಹ್ನ (ಊಟದ ನಂತರ)",
        "night": "ರಾತ್ರಿ (ರಾತ್ರಿಯ ಊಟದ ನಂತರ/ಮಲಗುವ ಮುನ್ನ)",
        "with_food": "ಇದನ್ನು ಆಹಾರ ಸೇವಿಸಿದ ನಂತರ ಒಂದು ಲೋಟ ನೀರಿನೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಿ.",
        "empty_stomach": "ಬೆಳಿಗ್ಗೆ ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ ತಿಂಡಿಗೆ 30 ನಿಮಿಷ ಮುಂಚೆ ನೀರಿನೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಿ.",
        "bedtime": "ರಾತ್ರಿ ಮಲಗುವ ಮುನ್ನ ತೆಗೆದುಕೊಳ್ಳಿ.",
        "inhaler_instruction": "ಇನ್‌ಹೇಲರ್ ಮೂಲಕ ಉಸಿರೆಳೆದು ತೆಗೆದುಕೊಳ್ಳಿ, ನಂತರ ನೀರಿನಿಂದ ಬಾಯಿ ಮುಕ್ಕಳಿಸಿ.",
        "syrup_instruction": "೨ ಚಮಚ (10 ml) ಅಳತೆ ಮಾಡಿ ಊಟದ ನಂತರ ಕುಡಿಯಿರಿ.",
        "as_needed": "ನೋವು ಅಥವಾ ತೊಂದರೆ ಇದ್ದಾಗ ಮಾತ್ರ ತೆಗೆದುಕೊಳ್ಳಿ.",
        "water_instruction": "ಸಾಕಷ್ಟು ನೀರಿನೊಂದಿಗೆ ಊಟದ ನಂತರ ತೆಗೆದುಕೊಳ್ಳಿ.",
        "days_suffix": "{days} ದಿನಗಳು",
        "ongoing": "ಮುಂದುವರಿಸಿ (Ongoing)",
        "follow_up_prefix": "ಮುಂದಿನ ಭೇಟಿ ದಿನಾಂಕ:",
        "warning_title": "ಈ ಕೆಳಗಿನ ಯಾವುದೇ ತೊಂದರೆ ಕಂಡುಬಂದರೆ ತಕ್ಷಣ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ:",
        "finish_course": "ಔಷಧಿಯ ಪೂರ್ಣ ಕೋರ್ಸ್ ಮುಗಿಸಿ, ನಡುವೆ ನಿಲ್ಲಿಸಬೇಡಿ.",
        "emergency_call": "ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ತಕ್ಷಣ 108 ಕ್ಕೆ ಕರೆ ಮಾಡಿ."
    },
    "ta": {
        "greeting": "வணக்கம்! உங்கள் மருத்துவர் பரிந்துரைத்த எளிய மருந்து திட்டம் இதோ.",
        "summary_template": "மருத்துவர் உங்களுக்கு மொத்தம் {count} மருந்துகளை கொடுத்துள்ளார். சரியான நேரத்தில் சாப்பிடுங்கள்.",
        "morning": "காலை (காலை உணவுக்குப் பின்)",
        "afternoon": "மதியம் (மதிய உணவுக்குப் பின்)",
        "night": "இரவு (இரவு உணவுக்குப் பின்/தூங்கும் முன்)",
        "with_food": "இதை உணவு சாப்பிட்ட பிறகு ஒரு டம்ளர் தண்ணீருடன் எடுத்துக்கொள்ளவும்.",
        "empty_stomach": "காலை வெறும் வயிற்றில் காலை உணவுக்கு 30 நிமிடம் முன் தண்ணீருடன் சாப்பிடவும்.",
        "bedtime": "இரவு தூங்கும் முன் எடுத்துக்கொள்ளவும்.",
        "inhaler_instruction": "இன்ஹேலர் மூலம் 2 முறை உள்ளிழுத்து, பின் வாயை நன்னீரில் கொப்பளிக்கவும்.",
        "syrup_instruction": "மூடியில் 2 தேக்கரண்டி (10 ml) அளவு எடுத்து உணவுக்குப் பின் குடிக்கவும்.",
        "as_needed": "வலி அல்லது தேவைப்படும் போது மட்டும் உட்கொள்ளவும்.",
        "water_instruction": "நிறைய தண்ணீருடன் உணவுக்குப் பின் உட்கொள்ளவும்.",
        "days_suffix": "{days} நாட்கள்",
        "ongoing": "தொடர்ந்து (Ongoing)",
        "follow_up_prefix": "அடுத்த மருத்துவ சந்திப்பு:",
        "warning_title": "இந்த அறிகுறிகள் தோன்றினால் உடனடியாக மருத்துவரை அணுகவும்:",
        "finish_course": "மருந்துகளை முழுமையாக உட்கொள்ளவும், இடையில் நிறுத்த வேண்டாம்.",
        "emergency_call": "அவசர காலங்களில் உடனடியாக 108 ஐ அழைக்கவும்."
    },
    "te": {
        "greeting": "నమస్కారం! మీ డాక్టర్ ఇచ్చిన మందుల సులభమైన వివరణ ఇక్కడ ఉంది.",
        "summary_template": "డాక్టర్ గారు మీకు మొత్తం {count} మందులను సూచించారు. వీటిని సమయానికి వేసుకోవడం చాలా ముఖ్యం.",
        "morning": "ఉదయం (అల్పాహారం తర్వాత)",
        "afternoon": "మధ్యాహ్నం (భోజనం తర్వాత)",
        "night": "రాత్రి (రాత్రి భోజనం తర్వాత/పడుకునే ముందు)",
        "with_food": "దీనిని ఆహారం తిన్న తర్వాత ఒక గ్లాసు నీటితో వేసుకోవాలి.",
        "empty_stomach": "ఉదయం పరిగడుపున, టిఫిన్‌కు 30 నిమిషాల ముందు వేసుకోవాలి.",
        "bedtime": "రాత్రి పడుకునే ముందు వేసుకోవాలి.",
        "inhaler_instruction": "ఇన్హేలర్ ద్వారా పీల్చుకున్న తర్వాత నోటిని నీటితో శుభ్రం చేసుకోండి.",
        "syrup_instruction": "2 చెంచాల (10 ml) మందును భోజనం తర్వాత తాగండి.",
        "as_needed": "నొప్పి లేదా అవసరమైనప్పుడు మాత్రమే వేసుకోండి.",
        "water_instruction": "తగినంత నీటితో భోజనం తర్వాత వేసుకోవాలి.",
        "days_suffix": "{days} రోజులు",
        "ongoing": "కొనసాగించండి (Ongoing)",
        "follow_up_prefix": "తదుపరి డాక్టర్ సంప్రదింపు:",
        "warning_title": "ఈ క్రింది లక్షణాలు కనిపిస్తే వెంటనే వైద్యుడిని సంప్రదించండి:",
        "finish_course": "మందుల కోర్సును పూర్తిగా వాడండి, మధ్యలో ఆపకండి.",
        "emergency_call": "అత్యవసర సమయంలో వెంటనే 108 కు కాల్ చేయండి."
    },
    "bn": {
        "greeting": "নমস্কার! আপনার ডাক্তারের ওষুধের একটি সহজ নির্দেশিকা এখানে রয়েছে।",
        "summary_template": "ডাক্তার আপনাকে মোট {count}টি ওষুধ দিয়েছেন। সঠিক সময়ে ওষুধ খাওয়া অত্যন্ত জরুরি।",
        "morning": "সকাল (প্রাতঃরাশের পর)",
        "afternoon": "দুপুর (দুপুরের খাবারের পর)",
        "night": "রাত (রাতের খাবারের পর/ঘুমানোর আগে)",
        "with_food": "খাবার খাওয়ার পর এক গ্লাস সাধারণ জল দিয়ে খান।",
        "empty_stomach": "সকালে খালি পেটে প্রাতঃরাশের ৩০ মিনিট আগে জল দিয়ে খান।",
        "bedtime": "রাতে ঘুমাতে যাওয়ার আগে খান।",
        "inhaler_instruction": "ইনহেলার ব্যবহার করার পর ভালো করে জল দিয়ে কুলকুচি করুন।",
        "syrup_instruction": "খাবারের পর ২ চামচ (10 ml) মেপে ওষুধটি খান।",
        "as_needed": "ব্যথা বা প্রয়োজনের সময় শুধুমাত্র খান।",
        "water_instruction": "প্রচুর জল দিয়ে খাবার পর খান।",
        "days_suffix": "{days} দিন",
        "ongoing": "নিয়মিত (Ongoing)",
        "follow_up_prefix": "পরবর্তী ডাক্তারের সাথে সাক্ষাৎ:",
        "warning_title": "এই ধরনের কোনো লক্ষণ দেখা দিলে অবিলম্বে হাসপাতালে যোগাযোগ করুন:",
        "finish_course": "ওষুধের পুরো কোর্স শেষ করুন, মাঝপথে বন্ধ করবেন না।",
        "emergency_call": "যেকোনো জরুরি পরিস্থিতিতে অবিলম্বে 108 নম্বরে যোগাযোগ করুন।"
    },
    "es": {
        "greeting": "¡Hola! Aquí tiene su plan de medicamentos explicado de manera muy sencilla y clara.",
        "summary_template": "Su médico le ha recetado {count} medicamentos en total. Es muy importante tomarlos a la hora correcta.",
        "morning": "Por la mañana (con el desayuno)",
        "afternoon": "Por la tarde (con el almuerzo)",
        "night": "Por la noche (con la cena o antes de dormir)",
        "with_food": "Tómelo con alimentos o inmediatamente después de comer con un vaso de agua.",
        "empty_stomach": "Tómelo en ayunas, 30 minutos antes del desayuno con un vaso de agua.",
        "bedtime": "Tómelo justo antes de acostarse a dormir.",
        "inhaler_instruction": "Inhale profundamente y enjuáguese la boca con agua después de usarlo.",
        "syrup_instruction": "Tome 2 cucharaditas (10 ml) después de comer.",
        "as_needed": "Tomar solo si hay dolor o según sea necesario.",
        "water_instruction": "Tomar con abundante agua después de las comidas.",
        "days_suffix": "{days} días",
        "ongoing": "Continuo (Ongoing)",
        "follow_up_prefix": "Próxima cita médica:",
        "warning_title": "Si siente alguno de estos síntomas de alarma, busque atención médica de inmediato:",
        "finish_course": "Complete todo el tratamiento, no lo suspenda antes.",
        "emergency_call": "En caso de emergencia médica, llame al servicio de urgencias de inmediato."
    },
    "en": {
        "greeting": "Hello! Here is your clear, simple daily care plan from your doctor.",
        "summary_template": "Your doctor has prescribed {count} medications to keep you healthy and recovering smoothly.",
        "morning": "Morning (around 8:00 AM with breakfast)",
        "afternoon": "Afternoon (around 1:00 PM with lunch)",
        "night": "Night (around 8:00 PM with dinner or bedtime)",
        "with_food": "Take this right after eating or with your meal with a full glass of water.",
        "empty_stomach": "Take on an empty stomach in the morning, 30 minutes before your breakfast.",
        "bedtime": "Take right before going to bed at night.",
        "inhaler_instruction": "Breathe in 2 gentle puffs, then rinse your mouth with clean water.",
        "syrup_instruction": "Take 2 teaspoons (10 ml) after your meal.",
        "as_needed": "Take only when needed for pain relief.",
        "water_instruction": "Take with a full glass of plain water after meals.",
        "days_suffix": "{days} days",
        "ongoing": "Ongoing",
        "follow_up_prefix": "Next Doctor Visit:",
        "warning_title": "Red Flag Signs — Contact your clinic or emergency if you experience:",
        "finish_course": "Complete the full duration of your prescription. Do not stop early.",
        "emergency_call": "In any urgent emergency, call 108 or your local hospital helpline."
    }
}

def localize_med_purpose(raw_purpose: str, med_name: str, lang: str) -> str:
    combined = f"{raw_purpose or ''} {med_name or ''}".lower()
    
    purposes = {
        "antibiotic": {
            "en": "Infection recovery & bacterial clearance",
            "hi": "संक्रमण (Infection) ठीक करने के लिए",
            "kn": "ಸೋಂಕು ನಿವಾರಣೆಗೆ (Infection relief)",
            "ta": "தொற்று குணமாக (Infection relief)",
            "te": "ఇన్‌ఫెక్షన్ నివారణకు (Infection relief)",
            "bn": "সংক্রমণ নিরাময়ের জন্য",
            "es": "Para aliviar la infección bacteriana"
        },
        "antacid": {
            "en": "Acid reflux relief & stomach protection",
            "hi": "पेट में गैस और एसिडिटी से बचाव के लिए",
            "kn": "ಹೊಟ್ಟೆಯ ಗ್ಯಾಸ್ ಮತ್ತು ಆಸಿಡಿಟಿ ತಡೆಯಲು",
            "ta": "அசிடிட்டி மற்றும் வயிற்று எரிச்சல் குறைய",
            "te": "గ్యాస్ మరియు ఎసిడిటీ నివారణకు",
            "bn": "গ্যাস ও অ্যাসিডিটি প্রতিরোধের জন্য",
            "es": "Para proteger el estómago de la acidez"
        },
        "pain": {
            "en": "Pain relief & swelling reduction",
            "hi": "दर्द और सूजन कम करने के लिए",
            "kn": "ನೋವು ಮತ್ತು ಊತ ಕಡಿಮೆ ಮಾಡಲು",
            "ta": "வலி மற்றும் வீக்கம் குறைய",
            "te": "నొప్పి మరియు వాపు తగ్గడానికి",
            "bn": "ব্যথা ও ফোলা কমানোর জন্য",
            "es": "Para aliviar el dolor y la inflamación"
        },
        "bp": {
            "en": "Blood pressure control & heart health",
            "hi": "ब्लड प्रेशर (BP) नियंत्रित रखने के लिए",
            "kn": "ರಕ್ತದೊತ್ತಡ (BP) ನಿಯಂತ್ರಣದಲ್ಲಿಡಲು",
            "ta": "இரத்த அழுத்தத்தை (BP) கட்டுப்படுத்த",
            "te": "రక్తపోటు (BP) నియంత్రణకు",
            "bn": "ব্লাড প্রেশার (BP) নিয়ন্ত্রণে রাখতে",
            "es": "Para controlar la presión arterial (BP)"
        },
        "diabetes": {
            "en": "Blood sugar control",
            "hi": "ब्लड शुगर (Sugar) सामान्य रखने के लिए",
            "kn": "ರಕ್ತದಲ್ಲಿನ ಸಕ್ಕರೆ ಅಂಶ (Sugar) ನಿಯಂತ್ರಿಸಲು",
            "ta": "இரத்த சர்க்கரை அளவை (Sugar) கட்டுப்படுத்த",
            "te": "షుగర్ లెవల్స్ నియంత్రణకు",
            "bn": "ব্লাড সুগার (Sugar) নিয়ন্ত্রণে রাখতে",
            "es": "Para controlar los niveles de azúcar en sangre"
        },
        "breathing": {
            "en": "Airway opening & breathing ease",
            "hi": "सांस लेने में आसानी और फेफड़ों की राहत के लिए",
            "kn": "ಉಸಿರಾಟದ ಸುಲಭತೆ ಮತ್ತು ಶ್ವಾಸಕೋಶದ ರಕ್ಷಣೆಗಾಗಿ",
            "ta": "சுவாசத்தை எளிதாக்க",
            "te": "శ్వాస సులభంగా తీసుకోవడానికి",
            "bn": "শ্বাসকষ্ট কমানোর জন্য",
            "es": "Para abrir las vías respiratorias y facilitar la respiración"
        },
        "default": {
            "en": "Health recovery & smooth healing",
            "hi": "स्वास्थ्य सुधार और तंदुरुस्ती के लिए",
            "kn": "ಆರೋಗ್ಯ ಚೇತರಿಕೆಗಾಗಿ",
            "ta": "உடல் நலம் தேற",
            "te": "ఆరోగ్య పునరుద్ధరణకు",
            "bn": "সুস্থতা ও দ্রুত আরোগ্যের জন্য",
            "es": "Para la recuperación y salud general"
        }
    }
    
    if any(k in combined for k in ["cefuroxime", "amoxicillin", "antibiotic", "infection", "bacterial", "cipro", "azithro", "augmentin"]):
        category = "antibiotic"
    elif any(k in combined for k in ["pantoprazole", "omeprazole", "antacid", "gastric", "acid", "reflux", "rabeprazole", "gelusil"]):
        category = "antacid"
    elif any(k in combined for k in ["paracetamol", "aceclofenac", "ibuprofen", "pain", "swelling", "analgesic", "tramadol"]):
        category = "pain"
    elif any(k in combined for k in ["amlodipine", "telmisartan", "blood pressure", "hypertension", "atenolol", "losartan", "bp"]):
        category = "bp"
    elif any(k in combined for k in ["metformin", "glimepiride", "diabetes", "sugar", "insulin", "vildagliptin"]):
        category = "diabetes"
    elif any(k in combined for k in ["inhaler", "budecort", "foracort", "asthma", "breathing", "respiratory", "salbutamol", "puff"]):
        category = "breathing"
    else:
        category = "default"
        
    return purposes[category].get(lang, purposes[category]["en"])

def localize_med_instruction(raw_inst: str, med_name: str, dose: str, t: dict) -> str:
    raw = (raw_inst or "").lower()
    name_lower = (med_name or "").lower()
    dose_lower = (dose or "").lower()
    
    if "empty stomach" in raw or "before breakfast" in raw or "before food" in raw or "before meal" in raw:
        return t["empty_stomach"]
    elif "bedtime" in raw or "sleep" in raw or "at night" in raw or ("night" in raw and ("bed" in raw or "sleep" in raw)):
        return t["bedtime"]
    elif "inhaler" in name_lower or "puffs" in dose_lower or "puff" in raw:
        return t["inhaler_instruction"]
    elif "syrup" in name_lower or "ml" in dose_lower or "suspension" in name_lower or "liquid" in name_lower:
        return t["syrup_instruction"]
    elif "as needed" in raw or "sos" in raw or "pain" in raw:
        return t.get("as_needed", t["with_food"])
    elif "water" in raw:
        return t.get("water_instruction", t["with_food"])
    else:
        return t["with_food"]

class PlanSimplifier:
    """
    Transforms clinical JSON into a 3rd-grade reading level 'Explain Like I'm 70' summary,
    in English and Indian regional languages, producing structured daily schedules,
    TTS-ready read aloud scripts, and sentence-level audio highlights.
    """

    @classmethod
    def simplify(cls, doc: MedicalDocument, target_lang: str = "en") -> SimplifiedPlan:
        lang = target_lang if target_lang in TRANSLATION_MAP else "en"
        t = TRANSLATION_MAP[lang]
        lang_meta = LANGUAGE_CONFIG.get(lang, LANGUAGE_CONFIG["en"])

        med_count = len(doc.medications)
        greeting = t["greeting"]
        overall_summary = t["summary_template"].format(count=med_count)

        simplified_meds: List[SimplifiedMedication] = []
        daily_schedule = {
            "morning": [],
            "afternoon": [],
            "night": []
        }

        audio_sentences: List[str] = []
        audio_sentences.append(greeting)
        audio_sentences.append(overall_summary)

        for idx, med in enumerate(doc.medications, 1):
            timing_labels = []
            timing_slots = []
            for tm in med.timing:
                slot = tm.lower()
                if slot in ["morning", "afternoon", "night"]:
                    timing_slots.append(slot)
                    timing_labels.append(t.get(slot, slot.capitalize()))

            timing_text = ", ".join(timing_labels) if timing_labels else t["morning"]

            # Craft plain language instructions based on special instructions
            plain_inst = localize_med_instruction(med.special_instructions, med.name, med.dose, t)
            localized_purpose = localize_med_purpose(med.purpose, med.name, lang)
            
            if med.duration_days:
                localized_duration = t.get("days_suffix", "{days} days").format(days=med.duration_days)
            else:
                localized_duration = t.get("ongoing", "Ongoing")

            sim_med = SimplifiedMedication(
                name=med.name,
                dose=med.dose,
                timing_text=timing_text,
                timing_slots=timing_slots,
                plain_instructions=plain_inst,
                icon_type=med.pill_color_type or "white_tablet"
            )
            simplified_meds.append(sim_med)

            # Add to daily slots with unique slot-specific dose IDs
            for slot in timing_slots:
                if slot in daily_schedule:
                    slot_med_entry = {
                        "id": f"med_{idx}_{slot}",
                        "med_base_id": f"med_{idx}",
                        "slot": slot,
                        "name": med.name,
                        "dose": med.dose,
                        "instructions": plain_inst,
                        "purpose": localized_purpose,
                        "icon": med.pill_color_type or "white_tablet",
                        "duration": localized_duration
                    }
                    daily_schedule[slot].append(slot_med_entry)

            # Build sentence for TTS
            if lang == "hi":
                med_sentence = f"दवा नंबर {idx}: {med.name} {med.dose}, इसे {timing_text} लेना है। {plain_inst}"
            elif lang == "kn":
                med_sentence = f"ಔಷಧ {idx}: {med.name} {med.dose}, ಇದನ್ನು {timing_text} ತೆಗೆದುಕೊಳ್ಳಿ. {plain_inst}"
            elif lang == "ta":
                med_sentence = f"மருந்து {idx}: {med.name} {med.dose}, இதை {timing_text} எடுத்துக்கொள்ளவும். {plain_inst}"
            elif lang == "te":
                med_sentence = f"మందు {idx}: {med.name} {med.dose}, దీనిని {timing_text} వేసుకోవాలి. {plain_inst}"
            elif lang == "bn":
                med_sentence = f"ওষুধ {idx}: {med.name} {med.dose}, এটি {timing_text} খাবেন। {plain_inst}"
            elif lang == "es":
                med_sentence = f"Medicamento {idx}: {med.name} {med.dose}, tomar {timing_text}. {plain_inst}"
            else:
                med_sentence = f"Medicine {idx}: {med.name}, {med.dose}. Take this in the {timing_text}. {plain_inst}"

            audio_sentences.append(med_sentence)

        # Follow up section
        follow_up_str = ""
        if doc.follow_up and doc.follow_up.date:
            loc = doc.follow_up.location or "Clinic"
            dept = doc.follow_up.department or "Doctor Office"
            if lang == "hi":
                follow_up_str = f"{t['follow_up_prefix']} {doc.follow_up.date} को {loc} ({dept}) में अपनी जांच के लिए जाएं।"
            elif lang == "kn":
                follow_up_str = f"{t['follow_up_prefix']} {doc.follow_up.date} ರಂದು {loc} ({dept}) ಗೆ ಭೇಟಿ ನೀಡಿ."
            elif lang == "ta":
                follow_up_str = f"{t['follow_up_prefix']} {doc.follow_up.date} அன்று {loc} ({dept}) இல் மருத்துவரை சந்திக்கவும்."
            elif lang == "te":
                follow_up_str = f"{t['follow_up_prefix']} {doc.follow_up.date} న {loc} ({dept}) లో డాక్టర్‌ను కలవండి."
            elif lang == "bn":
                follow_up_str = f"{t['follow_up_prefix']} {doc.follow_up.date} তারিখে {loc} ({dept}) এ ডাক্তারের সাথে দেখা করুন।"
            elif lang == "es":
                follow_up_str = f"{t['follow_up_prefix']} El {doc.follow_up.date} en {loc} ({dept})."
            else:
                follow_up_str = f"{t['follow_up_prefix']} on {doc.follow_up.date} at {loc}, {dept}."
            
            audio_sentences.append(follow_up_str)

        # Warning alerts
        warning_alerts = []
        for w in doc.warning_symptoms:
            warning_alerts.append(w)

        if warning_alerts:
            audio_sentences.append(t["warning_title"])
            for idx, w in enumerate(warning_alerts[:2], 1):
                audio_sentences.append(f"• {w}")

        audio_sentences.append(t["emergency_call"])
        read_aloud_script = " ".join(audio_sentences)

        return SimplifiedPlan(
            language=lang,
            language_label=f"{lang_meta['native']} ({lang_meta['name']})",
            greeting=greeting,
            overall_summary=overall_summary,
            medications=simplified_meds,
            daily_schedule=daily_schedule,
            follow_up_summary=follow_up_str,
            warning_alerts=warning_alerts,
            read_aloud_script=read_aloud_script,
            audio_sentences=audio_sentences
        )
