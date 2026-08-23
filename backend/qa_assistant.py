import re
from typing import Optional
from models import MedicalDocument, QAResponse
from llm_client import NemotronClient

class MedicalQAAssistant:
    """
    Plain-language medical paperwork question answering assistant
    powered by NVIDIA Nemotron 3 Ultra with clinical safety guardrails.
    """

    @classmethod
    def answer_question(
        cls, 
        question: str, 
        doc: Optional[MedicalDocument] = None, 
        lang: str = "en"
    ) -> QAResponse:
        q_lower = question.lower()

        # 1. Follow up / Hospital Visit Query
        if any(k in q_lower for k in ["follow up", "appointment", "doctor visit", "when to go", "date", "hospital", "कहा जाना", "कब जाना", "भೇಟಿ", "சந்திப்பு", "సందర్శన", "ভিজিট", "cita"]):
            if doc and doc.follow_up and doc.follow_up.date:
                date = doc.follow_up.date
                loc = doc.follow_up.location or "Clinic"
                dept = doc.follow_up.department or "Consultant Office"
                
                translations = {
                    "hi": f"आपकी अगली डॉक्टर मुलाक़ात {date} को {loc} ({dept}) में तय है।",
                    "kn": f"ನಿಮ್ಮ ಮುಂದಿನ ವೈದ್ಯರ ಭೇಟಿ {date} ರಂದು {loc} ({dept}) ನಲ್ಲಿದೆ.",
                    "ta": f"உங்கள் அடுத்த மருத்துவ சந்திப்பு {date} அன்று {loc} ({dept}) இல் திட்டமிடப்பட்டுள்ளது.",
                    "te": f"మీ తదుపరి డాక్టర్ సందర్శన {date} తేదీన {loc} ({dept}) లో ఉంటుంది.",
                    "bn": f"আপনার পরবর্তী ডাক্তার অ্যাপয়েন্টমেন্ট {date} তারিখে {loc} ({dept}) এ নির্ধারিত রয়েছে।",
                    "es": f"Su próxima cita médica de seguimiento es el {date} en {loc}, {dept}.",
                    "en": f"Your next follow-up appointment is on {date} at {loc}, {dept}."
                }
                ans = translations.get(lang, translations["en"])
                return QAResponse(
                    answer=ans,
                    spoken_answer=ans,
                    safety_disclaimer="Be sure to bring all your discharge papers and previous test reports with you."
                )

        # 2. Missed Dose Query
        if any(k in q_lower for k in ["miss", "forgot", "skip", "भूल", "छूट", "ತಪ್ಪಿದರೆ", "மறந்து", "మర్చిపోతే", "ভুলে", "olvido", "olvid"]):
            translations = {
                "hi": "यदि आप कोई खुराक भूल गए हैं, तो याद आते ही ले लें। लेकिन अगर अगली खुराक का समय हो चुका है, तो छूटी हुई खुराक छोड़ दें। एक साथ दो दवाइयां कभी न लें।",
                "kn": "ನೀವು ಔಷಧಿಯ ಡೋಸ್ ಮರೆತರೆ, ನೆನಪಾದ ತಕ್ಷಣ ತೆಗೆದುಕೊಳ್ಳಿ. ಮುಂದಿನ ಸಮಯ ಹತ್ತಿರವಿದ್ದರೆ ತಪ್ಪಿದ ಡೋಸ್ ಬಿಟ್ಟುಬಿಡಿ. ಒಟ್ಟಿಗೆ ಎರಡು ಡೋಸ್ ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ.",
                "ta": "ஒரு வேளை மருந்து எடுக்க மறந்துவிட்டால், நினைவுக்கு வந்தவுடன் எடுத்துக்கொள்ளவும். அடுத்த மருந்துக்கான நேரம் நெருங்கிவிட்டால், தவறவிட்டதை விட்டுவிட்டு அடுத்ததை மட்டும் எடுக்கவும். இரண்டு மருந்துகளை ஒன்றாக எடுக்க வேண்டாம்.",
                "te": "మీరు డోస్ మర్చిపోతే, గుర్తుకు రాగానే వేసుకోండి. అయితే తదుపరి డోస్ సమయం దగ్గరపడితే, తప్పిన డోస్‌ను వదిలేయండి. ఒకేసారి రెండు డోస్‌లు ఎప్పుడూ వేసుకోకండి.",
                "bn": "ওষুধ খেতে ভুলে গেলে মনে পড়ার সাথে সাথে খেয়ে নিন। তবে পরবর্তী ডোজের সময় কাছাকাছি হলে ভুলে যাওয়া ডোজটি বাদ দিন। কখনো একসাথে দুটি ডোজ খাবেন না।",
                "es": "Si olvidó una dosis, tómela tan pronto como lo recuerde. Sin embargo, si ya casi es hora de la siguiente, omita la dosis olvidada. Nunca tome dos dosis al mismo tiempo.",
                "en": "If you missed a dose, take it as soon as you remember. However, if it is almost time for your next scheduled dose, skip the missed one. Never take two doses at the same time."
            }
            ans = translations.get(lang, translations["en"])
            return QAResponse(
                answer=ans,
                spoken_answer=ans,
                safety_disclaimer="Never double up on doses to make up for a missed one."
            )

        # 3. Milk / Tea / Water Query
        if any(k in q_lower for k in ["milk", "tea", "coffee", "दूध", "चाय", "ಹಾಲು", "ಚಹಾ", "பால்", "டீ", "పాలు", "టీ", "দুধ", "চা", "leche", "té"]):
            translations = {
                "hi": "सभी दवाइयां सादे पानी के पूरे गिलास के साथ लेना सबसे अच्छा है। जब तक डॉक्टर न कहें, एंटीबायोटिक या दर्द निवारक दवाओं को गर्म चाय, कॉफी या दूध के साथ न लें।",
                "kn": "ಎಲ್ಲಾ ಮಾತ್ರೆಗಳನ್ನು ಒಂದು ಲೋಟ ಶುದ್ಧ ನೀರಿನೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳುವುದು ಉತ್ತಮ. ವೈದ್ಯರು ಹೇಳದ ಹೊರತು ಬಿಸಿ ಚಹಾ ಅಥವಾ ಹಾಲಿನೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ.",
                "ta": "அனைத்து மாத்திரைகளையும் ஒரு டம்ளர் சுத்தமான தண்ணீருடன் உட்கொள்வது சிறந்தது. மருத்துவர் பரிந்துரைக்காத வரை டீ, காபி அல்லது பாலுடன் எடுக்க வேண்டாம்.",
                "te": "అన్ని మాత్రలను ఒక గ్లాసు సాధారణ నీటితో వేసుకోవడం ఉత్తమం. డాక్టర్ చెబితే తప్ప టీ, కాఫీ లేదా పాలతో మందులు వేసుకోకండి.",
                "bn": "সব ওষুধ এক গ্লাস সাধারণ জল দিয়ে খাওয়া সবচেয়ে ভালো। ডাক্তারের পরামর্শ ছাড়া গরম চা, কফি বা দুধের সাথে ওষুধ খাবেন না।",
                "es": "Es mejor tomar todos los medicamentos con un vaso lleno de agua pura. Evite tomarlos con té caliente, café o leche a menos que su médico lo indique.",
                "en": "It is best to take all tablets with a full glass of plain water. Avoid taking antibiotics or pain medicines with hot tea, coffee, or milk unless specifically advised by your doctor."
            }
            ans = translations.get(lang, translations["en"])
            return QAResponse(
                answer=ans,
                spoken_answer=ans,
                safety_disclaimer="Plain water is the safest liquid for swallowing oral medications."
            )

        # 4. Crush / Break Tablets Query
        if any(k in q_lower for k in ["crush", "break", "chew", "तोड़", "पीस", "ಪುಡಿ", "உடை", "నలగగొట్టి", "ভাঙ", "triturar", "partir"]):
            translations = {
                "hi": "गोलियों को पानी के साथ पूरी तरह निगलें। जब तक डॉक्टर या फार्मासिस्ट न कहें, गोलियों को तोड़ें, चबाएं या पीसें नहीं।",
                "kn": "ಮಾತ್ರೆಗಳನ್ನು ನೀರಿನೊಂದಿಗೆ ನುಂಗಿ. ವೈದ್ಯರು ಸೂಚಿಸದ ಹೊರತು ಮಾತ್ರೆಗಳನ್ನು ಪುಡಿಮಾಡಬೇಡಿ ಅಥವಾ ಜಗಿಯಬೇಡಿ.",
                "ta": "மாத்திரைகளை தண்ணீருடன் முழுமையாக விழுங்கவும். மருத்துவர் அறிவுறுத்தாத வரை மாத்திரைகளை உடைக்கவோ அல்லது பொடி செய்யவோ வேண்டாம்.",
                "te": "మాత్రలను నీటితో మింగండి. డాక్టర్ సూచించకపోతే మాత్రలను నలగగొట్టడం లేదా నమలడం చేయవద్దు.",
                "bn": "ট্যাবলেটগুলি জল দিয়ে গিলে ফেলুন। ডাক্তার না বললে ট্যাবলেট ভাঙবেন বা গুঁড়ো করবেন না।",
                "es": "Trague las tabletas enteras con agua. No las triture, rompa ni mastique a menos que su médico o farmacéutico se lo haya indicado.",
                "en": "Swallow tablets whole with water. Do not crush, break, or chew sustained-release or coated tablets unless your doctor or pharmacist explicitly instructed you to do so."
            }
            ans = translations.get(lang, translations["en"])
            return QAResponse(
                answer=ans,
                spoken_answer=ans,
                safety_disclaimer="Crushing special tablets can alter medicine release speed and safety."
            )

        # 5. Food / Diet Query
        if any(k in q_lower for k in ["food", "diet", "eat", "खाने", "परहेज", "ಆಹಾರ", "பத்தியம்", "ఆహార", "খাবার", "comida", "dieta"]):
            translations = {
                "hi": "अपनी दवाइयां भोजन के बाद पर्याप्त पानी के साथ लें। जब तक दवाइयां चल रही हों, शराब, अधिक तीखा भोजन या अधिक चाय-कॉफी से परहेज करें।",
                "kn": "ನಿಮ್ಮ ಔಷಧಿಗಳನ್ನು ಊಟದ ನಂತರ ಸಾಕಷ್ಟು ನೀರಿನೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಿ. ಮದ್ಯಪಾನ ಮತ್ತು ಅತಿಯಾದ ಖಾರದ ಆಹಾರದಿಂದ ದೂರವಿರಿ.",
                "ta": "உணவுக்குப் பிறகு போதுமான தண்ணீருடன் மருந்துகளை உட்கொள்ளவும். காரமான உணவுகள் மற்றும் ஆல்கஹாலைத் தவிர்க்கவும்.",
                "te": "భోజనం తర్వాత తగినంత నీటితో మందులు వేసుకోండి. ఆల్కహాల్ మరియు కారంగా ఉండే ఆహారాలకు దూరంగా ఉండండి.",
                "bn": "খাবারের পর পর্যাপ্ত জল দিয়ে ওষুধ খান। ওষুধ চলাকালীন অ্যালকোহল ও অতিরিক্ত ঝাল খাবার এড়িয়ে চলুন।",
                "es": "Tome sus medicamentos después de comer con abundante agua. Evite el alcohol y comidas muy picantes mientras esté en tratamiento.",
                "en": "Take your medicines after balanced meals with plenty of water. Avoid alcohol, spicy foods, or excessive caffeine while taking prescribed antibiotics and pain medications."
            }
            ans = translations.get(lang, translations["en"])
            return QAResponse(
                answer=ans,
                spoken_answer=ans,
                safety_disclaimer="Always take stomach-protecting medicines before meals if specified on your label."
            )

        # 6. Dizzy / Nausea Query
        if any(k in q_lower for k in ["dizzy", "nausea", "vomit", "sick", "चक्कर", "उल्टी", "ತಲೆತಿರುಗುವಿಕೆ", "மயக்கம்", "కళ్ళు", "মাথা", "mareo"]):
            translations = {
                "hi": "यदि आपको चक्कर या कमजोरी महसूस हो, तो तुरंत बैठ जाएं और पानी पिएं। यदि तेज बुखार, सीने में दर्द या अधिक उल्टी हो, तो तुरंत डॉक्टर से संपर्क करें या आपातकालीन बटन दबाएं।",
                "kn": "ತಲೆತಿರುಗುವಿಕೆ ಉಂಟಾದರೆ ತಕ್ಷಣ ಕುಳಿತುಕೊಳ್ಳಿ ಮತ್ತು ನೀರು ಕುಡಿಯಿರಿ. ತೀವ್ರವಾದ ಜ್ವರ ಅಥವಾ ಎದೆನೋವು ಕಾಣಿಸಿಕೊಂಡರೆ ತಕ್ಷಣ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ ಅಥವಾ ತುರ್ತು SOS ಬಳಸಿ.",
                "ta": "மயக்கம் ஏற்பட்டால் உடனே அமர்ந்து தண்ணீர் குடிக்கவும். கடுமையான காய்ச்சல் அல்லது நெஞ்சு வலி இருந்தால் உடனே மருத்துவரை அணுகவும் அல்லது அவசர SOS பொத்தானை அழுத்தவும்.",
                "te": "కళ్ళు తిరిగినట్లు అనిపిస్తే వెంటనే కూర్చుని నీరు త్రాగండి. తీవ్రమైన జ్వరం లేదా ఛాతీ నొప్పి ఉంటే వెంటనే డాక్టర్‌ను సంప్రదించండి లేదా అత్యవసర SOS ఉపయోగించండి.",
                "bn": "মাথা ঘুরলে সাথে সাথে বসে পড়ুন এবং জল পান করুন। তীব্র জ্বর বা বুকে ব্যথা হলে অবিলম্বে ডাক্তারের সাথে যোগাযোগ করুন বা জরুরি SOS ব্যবহার করুন।",
                "es": "Si siente mareos, siéntese de inmediato y tome agua. Si experimenta fiebre alta, náuseas severas o dolor en el pecho, contacte a su médico o use el botón de Emergencia SOS.",
                "en": "If you feel dizzy or lightheaded, sit down immediately and drink water. If severe nausea, fever, or chest pain occurs, contact your doctor or use the Emergency SOS button."
            }
            ans = translations.get(lang, translations["en"])
            return QAResponse(
                answer=ans,
                spoken_answer=ans,
                safety_disclaimer="Dizziness can lead to falls. Always rest before standing up."
            )

        # Attempt dynamic Nemotron 3 Ultra response with safety prompt
        doc_context = ""
        if doc and doc.medications:
            med_list = "; ".join([f"{m.name} {m.dose} ({', '.join(m.timing)}): {m.special_instructions}" for m in doc.medications])
            doc_context = f"Patient's Prescribed Medications: {med_list}. Follow-up: {doc.follow_up.date} at {doc.follow_up.location}."

        system_prompt = f"""You are NVIDIA Nemotron 3 Ultra acting as CareBridge, a warm, reassuring medical paperwork assistant for an elderly patient.
Context from patient document: {doc_context}

RULES:
1. Explain simply in plain language (Target language code: {lang}).
2. Use warm, short sentences.
3. NEVER diagnose or recommend changing dosages or taking new medicines.
4. If asked about taking with water, recommend a full glass of plain water.
5. Emphasize safety: consult doctor/pharmacist for any adverse feeling."""

        nemotron_ans = NemotronClient.call_nemotron(system_prompt, f"Patient asks: {question}", temperature=0.2, max_tokens=250)

        if nemotron_ans and len(nemotron_ans.strip()) > 10:
            clean_ans = nemotron_ans.strip()
            return QAResponse(
                answer=clean_ans,
                spoken_answer=clean_ans,
                safety_disclaimer="Answered with NVIDIA Nemotron 3 Ultra. Always verify with your clinician."
            )

        # Fallback contextual response
        if doc and doc.medications:
            med_names = ", ".join([f"{m.name} ({m.dose})" for m in doc.medications[:3]])
            translations = {
                "hi": f"आपके पर्चे में {len(doc.medications)} दवाइयां दर्ज हैं: {med_names}। कृपया इन्हें अपने दैनिक शेड्यूल के अनुसार समय पर लें।",
                "kn": f"ನಿಮ್ಮ ಆರೈಕೆ ಯೋಜನೆಯಲ್ಲಿ {len(doc.medications)} ಔಷಧಿಗಳಿವೆ: {med_names}. ದೈನಂದಿನ ಸಮಯಪಟ್ಟಿಯ ಪ್ರಕಾರ ತೆಗೆದುಕೊಳ್ಳಿ.",
                "ta": f"உங்கள் மருந்து சீட்டில் {len(doc.medications)} மருந்துகள் உள்ளன: {med_names}. தினசரி அட்டவணைப்படி உட்கொள்ளவும்.",
                "te": f"మీ ప్రిస్క్రిప్షన్‌లో {len(doc.medications)} మందులు ఉన్నాయి: {med_names}. సమయానికి వేసుకోండి.",
                "bn": f"আপনার প্রেসক্রিপশনে {len(doc.medications)} টি ওষুধ রয়েছে: {med_names}। সঠিক সময়ে খান।",
                "es": f"Su plan incluye {len(doc.medications)} medicamentos: {med_names}. Tómelos según su horario diario.",
                "en": f"Your care plan lists {len(doc.medications)} medications: {med_names}. Take them strictly according to your daily timeline with water."
            }
            ans = translations.get(lang, translations["en"])
            return QAResponse(
                answer=ans,
                spoken_answer=ans,
                safety_disclaimer="CareBridge explains your written prescription. Always consult your physician for clinical advice."
            )

        return QAResponse(
            answer="Please take your prescribed medicines with water after meals as outlined in your care plan.",
            spoken_answer="Please take your prescribed medicines with water after meals as outlined in your care plan.",
            safety_disclaimer="Always consult your doctor or pharmacist with specific health questions."
        )
