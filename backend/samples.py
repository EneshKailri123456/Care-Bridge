from typing import List, Dict
from models import MedicalDocument, MedicationItem, FollowUp

SAMPLE_DOCUMENTS: List[Dict] = [
    {
        "id": "sample_post_op_discharge",
        "title": "🏥 Post-Surgery Discharge Summary (Orthopedics)",
        "subtitle": "Apollo Speciality Hospital — Total Knee Replacement Recovery",
        "badge": "Discharge Summary",
        "document_type": "discharge_summary",
        "patient_name": "Ramesh Chandra (Age 68)",
        "patient_language": "en",
        "hospital": "Apollo Speciality Hospital, Bannerghatta Road, Bengaluru",
        "raw_ocr_text": """APOLLO SPECIALITY HOSPITAL
DEPARTMENT OF ORTHOPEDICS & JOINT RECONSTRUCTION
PATIENT DISCHARGE SUMMARY

Patient: Ramesh Chandra | Age: 68 M | IP No: AP-884210
Date of Admission: 18-Feb-2026 | Date of Discharge: 22-Feb-2026
Diagnosis: Right Total Knee Arthroplasty (Post-Op Day 4)

DISCHARGE MEDICATIONS:
1. Tab. Cefuroxime Axetil 500 mg - 1 tab PO Twice Daily (Morning & Night) after food x 5 days.
2. Tab. Pantoprazole 40 mg - 1 tab PO Once Daily in the Morning 30 mins before breakfast x 7 days.
3. Tab. Paracetamol 650 mg - 1 tab PO Thrice Daily (Morning, Afternoon, Night) after food for pain x 7 days.
4. Tab. Rivaroxaban 10 mg - 1 tab PO Once Daily at Night with dinner for DVT prevention x 14 days.

SPECIAL POST-OP INSTRUCTIONS:
- Keep surgical dressing dry and clean.
- Perform ankle pump exercises 10 times every hour while awake.
- Use walker for all ambulation. Do not walk unassisted.

FOLLOW-UP APPOINTMENT:
Date: 02-Mar-2026 at 10:30 AM
Location: Apollo Hospital Main Wing, 2nd Floor, Room 204 - Ortho OPD, Dr. Arvind Kumar.

RED FLAG WARNING SYMPTOMS:
- Sudden calf pain, swelling, or redness in lower leg.
- Persistent high fever (> 101°F) or chills.
- Yellow or foul-smelling discharge or excessive bleeding from surgical site.
- Sudden shortness of breath or chest pain (Call 108 / Emergency immediately).""",
        "data": MedicalDocument(
            document_type="discharge_summary",
            patient_name="Ramesh Chandra",
            patient_language="en",
            medications=[
                MedicationItem(
                    name="Cefuroxime Axetil",
                    dose="500 mg (1 tablet)",
                    frequency="Twice daily after food",
                    timing=["morning", "night"],
                    duration_days=5,
                    special_instructions="Take right after your morning and night meals. Finish the full 5-day antibiotic course.",
                    purpose="Antibiotic to prevent surgical infection",
                    pill_color_type="blue_tablet"
                ),
                MedicationItem(
                    name="Pantoprazole",
                    dose="40 mg (1 tablet)",
                    frequency="Once daily in the morning",
                    timing=["morning"],
                    duration_days=7,
                    special_instructions="Take 30 minutes before your breakfast with a full glass of water.",
                    purpose="Stomach protection against acidity and ulcers",
                    pill_color_type="yellow_tablet"
                ),
                MedicationItem(
                    name="Paracetamol",
                    dose="650 mg (1 tablet)",
                    frequency="Three times daily after food",
                    timing=["morning", "afternoon", "night"],
                    duration_days=7,
                    special_instructions="Take with water after eating. Helps relieve post-surgery knee soreness.",
                    purpose="Pain and swelling relief",
                    pill_color_type="white_tablet"
                ),
                MedicationItem(
                    name="Rivaroxaban",
                    dose="10 mg (1 tablet)",
                    frequency="Once daily at night with dinner",
                    timing=["night"],
                    duration_days=14,
                    special_instructions="Take every evening with your dinner. Do not skip.",
                    purpose="Blood thinner to prevent blood clots in legs",
                    pill_color_type="red_tablet"
                )
            ],
            follow_up=FollowUp(
                date="2026-03-02",
                location="Apollo Speciality Hospital",
                department="Orthopedic OPD, Room 204 (Dr. Arvind Kumar)",
                address="Bannerghatta Main Road, Krishnaraju Layout, Bengaluru, Karnataka 560076",
                wayfinding_steps=[
                    "Enter through Main Entrance Gate 2.",
                    "Take Elevator B to the 2nd Floor.",
                    "Turn right from the elevator lobby towards Orthopedics OPD.",
                    "Check in at Reception Desk 2 and take a token for Room 204."
                ]
            ),
            warning_symptoms=[
                "Sudden sharp calf pain, swelling, or redness in your operated leg.",
                "Fever higher than 101°F (38.3°C) or shivering.",
                "Foul-smelling pus or active bleeding from the knee dressing.",
                "Sudden shortness of breath or chest pain (Call 108 immediately)."
            ],
            raw_ocr_text="Discharge Summary - Apollo Speciality Hospital - Total Knee Arthroplasty",
            confidence_notes="High confidence clinical extraction (100% match on all medications and follow-up)"
        )
    },
    {
        "id": "sample_diabetes_hypertension",
        "title": "💊 Chronic Care Prescription (Diabetes & BP)",
        "subtitle": "Fortis Healthcare — Senior Internal Medicine Consultation",
        "badge": "Prescription",
        "document_type": "prescription",
        "patient_name": "Savitri Devi (Age 72)",
        "patient_language": "hi",
        "hospital": "Fortis Hospital, Cunningham Road, Bengaluru",
        "raw_ocr_text": """FORTIS HEALTHCARE CLINIC
DEPARTMENT OF GENERAL MEDICINE
Dr. S. Meenakshi, MD (Senior Physician)

Rx for: Mrs. Savitri Devi | Age: 72 Y / Female
Date: 21-Feb-2026 | BP: 146/92 mmHg | Fasting Sugar: 168 mg/dL

PRESCRIPTION:
1. Tab. Metformin Hydrochloride 500 mg - 1 tab Twice a day (Morning & Night) along with meals x 30 days.
2. Tab. Telmisartan 40 mg - 1 tab Once a day (Morning) with breakfast x 30 days.
3. Tab. Atorvastatin 10 mg - 1 tab Once a day at Bedtime (Night) after food x 30 days.

DIETARY & LIFESTYLE ADVICE:
- Restrict salt intake (< 1 teaspoon per day).
- 20 minutes slow walking morning and evening.
- Check fasting blood sugar every Sunday.

NEXT REVIEW:
Date: 23-Mar-2026 at 11:00 AM (with fresh FBS and Lipid profile report).
Clinic: Fortis Cunningham Road, Ground Floor Consultation Suite 4.

WARNING SIGNS:
- Sudden dizziness, cold sweats, or shakiness (Sign of low blood sugar - take glucose/sweet immediately).
- Severe morning headache or blurred vision (High BP spike).""",
        "data": MedicalDocument(
            document_type="prescription",
            patient_name="Savitri Devi",
            patient_language="hi",
            medications=[
                MedicationItem(
                    name="Metformin Hydrochloride",
                    dose="500 mg (1 white tablet)",
                    frequency="Twice a day with breakfast and dinner",
                    timing=["morning", "night"],
                    duration_days=30,
                    special_instructions="Always swallow with your first bite of food to avoid stomach upset.",
                    purpose="Controls blood sugar levels",
                    pill_color_type="white_tablet"
                ),
                MedicationItem(
                    name="Telmisartan",
                    dose="40 mg (1 tablet)",
                    frequency="Once a day in the morning",
                    timing=["morning"],
                    duration_days=30,
                    special_instructions="Take every morning around 8 AM with water after breakfast.",
                    purpose="Lowers blood pressure and protects your heart & kidneys",
                    pill_color_type="yellow_tablet"
                ),
                MedicationItem(
                    name="Atorvastatin",
                    dose="10 mg (1 tablet)",
                    frequency="Once daily at bedtime",
                    timing=["night"],
                    duration_days=30,
                    special_instructions="Take right before going to sleep at night.",
                    purpose="Manages cholesterol and keeps blood vessels clear",
                    pill_color_type="blue_tablet"
                )
            ],
            follow_up=FollowUp(
                date="2026-03-23",
                location="Fortis Hospital",
                department="General Medicine, Suite 4 (Dr. S. Meenakshi)",
                address="14, Cunningham Road, Vasanth Nagar, Bengaluru, Karnataka 560052",
                wayfinding_steps=[
                    "Enter through Main Entrance.",
                    "Proceed straight past the pharmacy on the ground floor.",
                    "Consultation Suite 4 is on the left corridor."
                ]
            ),
            warning_symptoms=[
                "Extreme dizziness, sudden cold sweating, or trembling hands (low sugar — eat 2 spoons of sugar or fruit juice immediately).",
                "Severe throbbing headache, blurred vision, or chest tightness (blood pressure spike)."
            ],
            raw_ocr_text="Fortis Healthcare - Diabetes & Hypertension Management Plan",
            confidence_notes="High confidence extraction. Timing clearly isolated."
        )
    },
    {
        "id": "sample_respiratory_care",
        "title": "🫁 Bronchitis & Respiratory Care Plan",
        "subtitle": "Max Super Speciality Hospital — Pulmonology Clinic",
        "badge": "Prescription",
        "document_type": "prescription",
        "patient_name": "Gopalakrishnan N. (Age 75)",
        "patient_language": "kn",
        "hospital": "Max Super Speciality Hospital, Saket",
        "raw_ocr_text": """MAX SUPER SPECIALITY HOSPITAL
PULMONOLOGY & RESPIRATORY CARE OPD
Dr. Rajiv Narang, MD (Chest Specialist)

Patient: Gopalakrishnan N. | Age: 75 M
Date: 20-Feb-2026 | Diagnosis: Acute Bronchitis with Mild Wheeze

MEDICATIONS PRESCRIBED:
1. Tab. Augmentin (Amoxicillin + Clavulanic Acid) 625 mg - 1 tab Twice daily (Morning & Night) after food x 6 days.
2. Inhaler Foracort 200 (Budesonide + Formoterol) - 2 puffs Twice daily (Morning & Night) using Spacer x 14 days.
3. Tab. Levocetirizine 5 mg - 1 tab Once daily at Night x 5 days.
4. Syrup Ascoril-D (Cough Relief) - 10 ml Thrice daily (Morning, Afternoon, Night) after food x 5 days.

HOME CARE:
- Steam inhalation twice daily for 10 minutes.
- Drink lukewarm water throughout the day.
- Rinse mouth with water after using the inhaler puffs.

FOLLOW-UP:
Date: 28-Feb-2026 at 04:00 PM
Location: Max Hospital, 1st Floor Pulmonology Suite 102.

WARNING ALERTS:
- Increasing breathlessness or unable to complete sentences without gasping.
- Blueness around lips or fingertips.
- High fever (> 102°F) with green phlegm.""",
        "data": MedicalDocument(
            document_type="prescription",
            patient_name="Gopalakrishnan N.",
            patient_language="kn",
            medications=[
                MedicationItem(
                    name="Augmentin (Amoxicillin 625 mg)",
                    dose="625 mg (1 tablet)",
                    frequency="Twice daily after food",
                    timing=["morning", "night"],
                    duration_days=6,
                    special_instructions="Take right after food. Complete all 6 days even if cough feels better.",
                    purpose="Antibiotic for chest infection",
                    pill_color_type="white_tablet"
                ),
                MedicationItem(
                    name="Foracort 200 Inhaler",
                    dose="2 puffs",
                    frequency="Twice daily using spacer",
                    timing=["morning", "night"],
                    duration_days=14,
                    special_instructions="Inhale deeply through the spacer device. Rinse mouth thoroughly with water after use.",
                    purpose="Opens airways and eases breathing",
                    pill_color_type="inhaler"
                ),
                MedicationItem(
                    name="Ascoril-D Cough Syrup",
                    dose="10 ml (2 teaspoons)",
                    frequency="Three times daily after food",
                    timing=["morning", "afternoon", "night"],
                    duration_days=5,
                    special_instructions="Measure using the bottle cap. Drink after meals.",
                    purpose="Soothes throat irritation and cough",
                    pill_color_type="blue_liquid"
                ),
                MedicationItem(
                    name="Levocetirizine",
                    dose="5 mg (1 tablet)",
                    frequency="Once daily at night",
                    timing=["night"],
                    duration_days=5,
                    special_instructions="Take before sleeping. May cause mild drowsiness.",
                    purpose="Allergy and runny nose relief",
                    pill_color_type="yellow_tablet"
                )
            ],
            follow_up=FollowUp(
                date="2026-02-28",
                location="Max Super Speciality Hospital",
                department="Pulmonology Suite 102 (Dr. Rajiv Narang)",
                address="1, 2, Press Enclave Marg, Saket Institutional Area, New Delhi 110017",
                wayfinding_steps=[
                    "Enter through Tower 1 Main Lobby.",
                    "Take Escalator or Lift to 1st Floor.",
                    "Follow Blue Floor Line directly to Pulmonology Suite 102."
                ]
            ),
            warning_symptoms=[
                "Severe difficulty breathing or wheezing that does not improve after inhaler.",
                "Bluish color on lips, nailbeds, or tongue (Go to Emergency immediately).",
                "High fever above 102°F or coughing up rust-colored blood."
            ],
            raw_ocr_text="Max Hospital - Pulmonology Prescription for Acute Bronchitis",
            confidence_notes="High confidence extraction. Inhaler dosage & mouth rinse notes captured."
        )
    },
    {
        "id": "sample_cardiac_care",
        "title": "❤️ Cardiac Care & Blood Thinner Plan",
        "subtitle": "Narayana Institute of Cardiac Sciences — Post-Angioplasty Care",
        "badge": "Discharge Summary",
        "document_type": "discharge_summary",
        "patient_name": "Devadas Pillai (Age 65)",
        "patient_language": "ta",
        "hospital": "Narayana Health City, Bommasandra, Bengaluru",
        "raw_ocr_text": """NARAYANA INSTITUTE OF CARDIAC SCIENCES
POST-CORONARY ANGIOPLASTY DISCHARGE ORDER

Patient: Devadas Pillai | Age: 65 M | Reg: NH-77912
Discharge Date: 22-Feb-2026 | Stent Placed: LAD Coronary Stent

MEDICATIONS:
1. Tab. Ecosprin 75 mg (Aspirin) - 1 tab Once daily (Morning) with breakfast x Lifelong.
2. Tab. Clopidogrel 75 mg - 1 tab Once daily (Morning) with breakfast x 1 year.
3. Tab. Metoprolol Succinate 25 mg - 1 tab Once daily (Morning) x 30 days.
4. Tab. Rosuvastatin 20 mg - 1 tab Once daily at Bedtime (Night) x 30 days.

STRICT CARDIAC WARNINGS:
- DO NOT STOP Ecosprin or Clopidogrel without cardiologist permission. Stopping can cause stent blockage.
- Avoid heavy lifting (> 5 kg) for 2 weeks.

FOLLOW UP:
Date: 05-Mar-2026 at 09:30 AM
Location: Narayana Health Cardiac Outpatient Wing, Counter 8, Dr. K. Shetty.""",
        "data": MedicalDocument(
            document_type="discharge_summary",
            patient_name="Devadas Pillai",
            patient_language="ta",
            medications=[
                MedicationItem(
                    name="Ecosprin (Aspirin 75 mg)",
                    dose="75 mg (1 tablet)",
                    frequency="Once daily in the morning with food",
                    timing=["morning"],
                    duration_days=90,
                    special_instructions="Take immediately after morning breakfast. Never skip this tablet.",
                    purpose="Prevents blood clots inside the heart stent",
                    pill_color_type="red_tablet"
                ),
                MedicationItem(
                    name="Clopidogrel",
                    dose="75 mg (1 tablet)",
                    frequency="Once daily in the morning with food",
                    timing=["morning"],
                    duration_days=90,
                    special_instructions="Take together with Ecosprin after breakfast.",
                    purpose="Second blood thinner protecting your heart stent",
                    pill_color_type="white_tablet"
                ),
                MedicationItem(
                    name="Metoprolol Succinate",
                    dose="25 mg (1 tablet)",
                    frequency="Once daily in the morning",
                    timing=["morning"],
                    duration_days=30,
                    special_instructions="Take in the morning with water. Helps maintain steady heart rate.",
                    purpose="Heart rate & blood pressure regulator",
                    pill_color_type="yellow_tablet"
                ),
                MedicationItem(
                    name="Rosuvastatin",
                    dose="20 mg (1 tablet)",
                    frequency="Once daily at night",
                    timing=["night"],
                    duration_days=30,
                    special_instructions="Take right before going to bed.",
                    purpose="Keeps heart arteries clean and smooth",
                    pill_color_type="blue_tablet"
                )
            ],
            follow_up=FollowUp(
                date="2026-03-05",
                location="Narayana Health City",
                department="Cardiac Outpatient Wing, Counter 8 (Dr. K. Shetty)",
                address="258/A, Bommasandra Industrial Area, Anekal Taluk, Bengaluru, Karnataka 560099",
                wayfinding_steps=[
                    "Enter through Gate 1 (Cardiac Block).",
                    "Head to Ground Floor Outpatient Hall.",
                    "Present token at Counter 8 for ECG and Doctor Consultation."
                ]
            ),
            warning_symptoms=[
                "Heavy chest pressure, squeezing pain, or pain spreading to left arm/jaw.",
                "Sudden unusual black stools or unexplained heavy bruising (signs of excessive bleeding).",
                "Severe shortness of breath when lying flat."
            ],
            raw_ocr_text="Narayana Health - Post Angioplasty Cardiac Care Plan",
            confidence_notes="Critical stent medication instructions isolated with high priority tags."
        )
    }
]

def get_sample_by_id(sample_id: str) -> Dict:
    for s in SAMPLE_DOCUMENTS:
        if s["id"] == sample_id:
            return s
    return SAMPLE_DOCUMENTS[0]
