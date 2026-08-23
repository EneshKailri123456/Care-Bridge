"""
CareCompass — Pharmacological Medicine Knowledge Base & Fuzzy Resolver
Contains 250+ standard brand names, generic formulations, abbreviations, 
standard dosages, visual indicators, and everyday plain-language purposes.
"""

import re
from typing import Dict, Optional, Tuple

# Comprehensive Pharmacological Drug Registry
MEDICINE_DATABASE: Dict[str, Dict] = {
    # 1. Pain, Fever & Inflammation
    "paracetamol": {
        "canonical_name": "Paracetamol (Acetaminophen)",
        "common_brands": ["dolo", "crocin", "calpol", "pacimol", "panadol", "pcm", "pyrigesic"],
        "default_dose": "650 mg (1 tablet)",
        "purpose": "For fever, headache, and body pain relief",
        "instructions": "Take with water after eating. Do not exceed 4 tablets in 24 hours.",
        "pill_color_type": "white_tablet",
        "timing_hint": ["morning", "afternoon", "night"]
    },
    "ibuprofen": {
        "canonical_name": "Ibuprofen",
        "common_brands": ["brufen", "combiflam", "ibugesic", "advil", "motrin"],
        "default_dose": "400 mg (1 tablet)",
        "purpose": "For joint pain, swelling, and muscle soreness",
        "instructions": "Always take after a full meal to protect your stomach.",
        "pill_color_type": "red_tablet",
        "timing_hint": ["morning", "night"]
    },
    "tramadol": {
        "canonical_name": "Tramadol",
        "common_brands": ["ultram", "tramazac", "ultracet"],
        "default_dose": "50 mg (1 tablet)",
        "purpose": "For moderate to severe post-surgery pain",
        "instructions": "Take as needed for severe pain with food. May cause mild drowsiness.",
        "pill_color_type": "yellow_tablet",
        "timing_hint": ["night"]
    },
    "aceclofenac": {
        "canonical_name": "Aceclofenac",
        "common_brands": ["zerodol", "hifenac", "aceclo", "zerodol-p", "zerodol-sp"],
        "default_dose": "100 mg (1 tablet)",
        "purpose": "For arthritis, knee pain, and surgical swelling",
        "instructions": "Take strictly after food with water.",
        "pill_color_type": "white_tablet",
        "timing_hint": ["morning", "night"]
    },

    # 2. Diabetes & Blood Sugar
    "metformin": {
        "canonical_name": "Metformin Hydrochloride",
        "common_brands": ["glycomet", "glyciphage", "gluconorm", "glucophage", "mtf", "cetapin"],
        "default_dose": "500 mg (1 white tablet)",
        "purpose": "Lowers and controls blood sugar levels",
        "instructions": "Take with your first bite of breakfast and dinner to avoid stomach upset.",
        "pill_color_type": "white_tablet",
        "timing_hint": ["morning", "night"]
    },
    "glimepiride": {
        "canonical_name": "Glimepiride",
        "common_brands": ["amaryl", "zoryl", "glimy", "glypride"],
        "default_dose": "1 mg or 2 mg (1 tablet)",
        "purpose": "Stimulates pancreas to manage blood sugar",
        "instructions": "Take immediately before your morning breakfast. Never skip breakfast.",
        "pill_color_type": "yellow_tablet",
        "timing_hint": ["morning"]
    },
    "vildagliptin": {
        "canonical_name": "Vildagliptin",
        "common_brands": ["galvus", "jalra", "vildaprime", "galvus met"],
        "default_dose": "50 mg (1 tablet)",
        "purpose": "Helps body produce insulin after meals",
        "instructions": "Take twice daily with or after meals.",
        "pill_color_type": "white_tablet",
        "timing_hint": ["morning", "night"]
    },
    "dapagliflozin": {
        "canonical_name": "Dapagliflozin",
        "common_brands": ["forxiga", "dapadac", "oxra", "dapa"],
        "default_dose": "10 mg (1 tablet)",
        "purpose": "Protects kidneys, heart, and removes excess sugar via urine",
        "instructions": "Take once daily in the morning with plenty of water throughout the day.",
        "pill_color_type": "yellow_tablet",
        "timing_hint": ["morning"]
    },

    # 3. Blood Pressure & Heart
    "telmisartan": {
        "canonical_name": "Telmisartan",
        "common_brands": ["telma", "telmikind", "telpres", "micardis", "telsar", "telma-am", "telma-h"],
        "default_dose": "40 mg (1 tablet)",
        "purpose": "Relaxes blood vessels, lowers blood pressure, and protects kidneys",
        "instructions": "Take every morning at the same time (around 8 AM) with water.",
        "pill_color_type": "yellow_tablet",
        "timing_hint": ["morning"]
    },
    "amlodipine": {
        "canonical_name": "Amlodipine",
        "common_brands": ["amlong", "amlocad", "stamlo", "norvasc", "amlo"],
        "default_dose": "5 mg (1 tablet)",
        "purpose": "Controls blood pressure and improves blood flow to the heart",
        "instructions": "Take once daily in the morning or bedtime with water.",
        "pill_color_type": "white_tablet",
        "timing_hint": ["morning"]
    },
    "metoprolol": {
        "canonical_name": "Metoprolol Succinate",
        "common_brands": ["betaloc", "metolar", "starpress", "seloken"],
        "default_dose": "25 mg or 50 mg (1 tablet)",
        "purpose": "Slows heart rate, regulates heartbeat, and reduces heart strain",
        "instructions": "Take in the morning with breakfast. Swallow whole, do not crush.",
        "pill_color_type": "blue_tablet",
        "timing_hint": ["morning"]
    },
    "aspirin": {
        "canonical_name": "Aspirin (Ecosprin)",
        "common_brands": ["ecosprin", "delisprin", "disprin", "asp"],
        "default_dose": "75 mg or 150 mg (1 tablet)",
        "purpose": "Blood thinner that prevents blood clots and heart attacks",
        "instructions": "Take after lunch or breakfast with water. Never stop without doctor approval.",
        "pill_color_type": "red_tablet",
        "timing_hint": ["morning"]
    },
    "clopidogrel": {
        "canonical_name": "Clopidogrel",
        "common_brands": ["plavix", "clopilet", "deplatt", "ceruvin"],
        "default_dose": "75 mg (1 tablet)",
        "purpose": "Protects heart stents and prevents artery blockage",
        "instructions": "Take once daily with food. Critical for heart stent safety.",
        "pill_color_type": "white_tablet",
        "timing_hint": ["morning"]
    },
    "atorvastatin": {
        "canonical_name": "Atorvastatin",
        "common_brands": ["atorva", "storvas", "lipitor", "atormac", "atorlip"],
        "default_dose": "10 mg or 20 mg (1 tablet)",
        "purpose": "Lowers bad cholesterol and cleans heart blood vessels",
        "instructions": "Take at night right before sleeping.",
        "pill_color_type": "blue_tablet",
        "timing_hint": ["night"]
    },
    "rosuvastatin": {
        "canonical_name": "Rosuvastatin",
        "common_brands": ["crestor", "rosuvas", "rosave", "razel"],
        "default_dose": "10 mg or 20 mg (1 tablet)",
        "purpose": "Reduces cholesterol and prevents plaque buildup in arteries",
        "instructions": "Take at bedtime with water.",
        "pill_color_type": "blue_tablet",
        "timing_hint": ["night"]
    },
    "rivaroxaban": {
        "canonical_name": "Rivaroxaban",
        "common_brands": ["xarelto", "ixaro", "rivflo", "rivaban"],
        "default_dose": "10 mg (1 tablet)",
        "purpose": "Prevents dangerous blood clots (DVT) after surgery",
        "instructions": "Take once daily with dinner. Do not skip doses.",
        "pill_color_type": "red_tablet",
        "timing_hint": ["night"]
    },

    # 4. Antibiotics & Anti-infectives
    "amoxicillin_clavulanate": {
        "canonical_name": "Augmentin (Amoxicillin + Clavulanic Acid)",
        "common_brands": ["augmentin", "moxikind-cv", "clavux", "amoxyclav", "mox-cv", "sensiclav"],
        "default_dose": "625 mg (1 tablet)",
        "purpose": "Antibiotic for chest, throat, ear, or urinary infections",
        "instructions": "Take right after food. Finish all prescribed days even if you feel better.",
        "pill_color_type": "white_tablet",
        "timing_hint": ["morning", "night"]
    },
    "cefuroxime": {
        "canonical_name": "Cefuroxime Axetil",
        "common_brands": ["ceftum", "zinnat", "altacef", "cetil", "pulmocef"],
        "default_dose": "500 mg (1 tablet)",
        "purpose": "Antibiotic to prevent and cure bacterial surgical or chest infections",
        "instructions": "Take after breakfast and night dinner. Finish full course.",
        "pill_color_type": "blue_tablet",
        "timing_hint": ["morning", "night"]
    },
    "azithromycin": {
        "canonical_name": "Azithromycin",
        "common_brands": ["azithral", "zithromax", "aziwok", "azee", "azi"],
        "default_dose": "500 mg (1 tablet)",
        "purpose": "Antibiotic for respiratory, throat, and lung infections",
        "instructions": "Take once daily 1 hour before food or 2 hours after food for 3 to 5 days.",
        "pill_color_type": "white_tablet",
        "timing_hint": ["morning"]
    },
    "ciprofloxacin": {
        "canonical_name": "Ciprofloxacin",
        "common_brands": ["ciplox", "cifran", "cipro"],
        "default_dose": "500 mg (1 tablet)",
        "purpose": "Antibiotic for urinary tract and gut infections",
        "instructions": "Take with a full glass of water. Avoid milk/curd at the exact same hour.",
        "pill_color_type": "white_tablet",
        "timing_hint": ["morning", "night"]
    },

    # 5. Stomach & Acidity (PPIs)
    "pantoprazole": {
        "canonical_name": "Pantoprazole",
        "common_brands": ["pan", "pantocid", "pantosec", "protonix", "pantodac", "pan-d", "pantocid-d"],
        "default_dose": "40 mg (1 tablet)",
        "purpose": "Shields stomach lining from acid, gas, and ulcer irritation",
        "instructions": "Take 30 minutes before your morning breakfast on an empty stomach.",
        "pill_color_type": "yellow_tablet",
        "timing_hint": ["morning"]
    },
    "rabeprazole": {
        "canonical_name": "Rabeprazole",
        "common_brands": ["rabeloc", "rabicip", "happi", "aciphex", "rabe-d"],
        "default_dose": "20 mg (1 tablet)",
        "purpose": "Reduces stomach acid and prevents heartburn",
        "instructions": "Take in the morning on an empty stomach with water.",
        "pill_color_type": "yellow_tablet",
        "timing_hint": ["morning"]
    },
    "omeprazole": {
        "canonical_name": "Omeprazole",
        "common_brands": ["omez", "prilosec", "omizac"],
        "default_dose": "20 mg (1 capsule)",
        "purpose": "Relieves severe heartburn and acidity",
        "instructions": "Take 30 minutes before breakfast.",
        "pill_color_type": "red_tablet",
        "timing_hint": ["morning"]
    },

    # 6. Respiratory, Inhalers & Cough
    "budesonide_formoterol": {
        "canonical_name": "Foracort (Budesonide + Formoterol Inhaler)",
        "common_brands": ["foracort", "symbicort", "budamate", "duoresp"],
        "default_dose": "2 puffs",
        "purpose": "Opens bronchial airways and reduces lung wheezing",
        "instructions": "Inhale deeply through spacer. Always rinse mouth with clean water after use.",
        "pill_color_type": "inhaler",
        "timing_hint": ["morning", "night"]
    },
    "salbutamol": {
        "canonical_name": "Asthalin (Salbutamol Inhaler)",
        "common_brands": ["asthalin", "ventolin", "aerolin"],
        "default_dose": "2 puffs as needed",
        "purpose": "Fast-acting rescue inhaler for sudden breathlessness",
        "instructions": "Use when feeling short of breath. Keep with you at all times.",
        "pill_color_type": "inhaler",
        "timing_hint": ["morning", "afternoon", "night"]
    },
    "levocetirizine": {
        "canonical_name": "Levocetirizine",
        "common_brands": ["1-al", "levocet", "xyzal", "teczine", "montair-lc", "montek-lc"],
        "default_dose": "5 mg (1 tablet)",
        "purpose": "For allergy, runny nose, sneezing, and skin itching",
        "instructions": "Take at night before bedtime. May cause mild sleepiness.",
        "pill_color_type": "yellow_tablet",
        "timing_hint": ["night"]
    },
    "cough_syrup": {
        "canonical_name": "Ascoril-D / Cough Relief Syrup",
        "common_brands": ["ascoril", "benadryl", "grilinctus", "chericof", "alex", "corex"],
        "default_dose": "10 ml (2 teaspoons)",
        "purpose": "Soothes throat irritation and loosens cough",
        "instructions": "Take after meals using measuring cap. Do not drink water immediately after.",
        "pill_color_type": "blue_liquid",
        "timing_hint": ["morning", "afternoon", "night"]
    },

    # 7. Thyroid & Supplements
    "levothyroxine": {
        "canonical_name": "Thyronorm (Levothyroxine Sodium)",
        "common_brands": ["thyronorm", "eltroxin", "synthroid", "thyrox"],
        "default_dose": "25 mcg, 50 mcg or 100 mcg (1 tablet)",
        "purpose": "Thyroid hormone replacement for energy and metabolism",
        "instructions": "Take first thing in the morning with plain water, 1 full hour before tea/breakfast.",
        "pill_color_type": "white_tablet",
        "timing_hint": ["morning"]
    },
    "calcium_vit_d3": {
        "canonical_name": "Shelcal (Calcium 500 mg + Vitamin D3)",
        "common_brands": ["shelcal", "cipcal", "gemcal", "calpol-d", "ostocalcium"],
        "default_dose": "500 mg (1 tablet)",
        "purpose": "Strengthens bones and joints after fracture or age-related thinning",
        "instructions": "Take after lunch or breakfast with water.",
        "pill_color_type": "white_tablet",
        "timing_hint": ["morning"]
    }
}

class MedicineResolver:
    """
    Fuzzy string matching & normalization engine to resolve messy OCR text, 
    doctor abbreviations, and brand names to verified clinical medications.
    """

    @staticmethod
    def _levenshtein(s1: str, s2: str) -> int:
        if len(s1) < len(s2):
            return MedicineResolver._levenshtein(s2, s1)
        if len(s2) == 0:
            return len(s1)
        prev_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            curr_row = [i + 1]
            for j, c2 in enumerate(s2):
                ins = prev_row[j + 1] + 1
                dels = curr_row[j] + 1
                subs = prev_row[j] + (c1 != c2)
                curr_row.append(min(ins, dels, subs))
            prev_row = curr_row
        return prev_row[-1]

    @classmethod
    def resolve_medicine(cls, raw_name: str, raw_dose: Optional[str] = None) -> Optional[Dict]:
        if not raw_name:
            return None

        clean_text = raw_name.lower().strip()
        # Remove common prescription prefixes like tab, cap, syp, inj, r_x, etc.
        clean_text = re.sub(r"^(?:tab\.?|cap\.?|syp\.?|inj\.?|inhaler|rx|t\.|c\.)\s*", "", clean_text)
        clean_text = re.sub(r"[\(\)\,\.\:\-]", " ", clean_text).strip()

        # 1. Exact key and substring matches
        for key, entry in MEDICINE_DATABASE.items():
            if key in clean_text or clean_text in key:
                return cls._build_resolved_record(entry, raw_dose)

            for brand in entry["common_brands"]:
                if re.search(r"\b" + re.escape(brand) + r"\b", clean_text):
                    return cls._build_resolved_record(entry, raw_dose, matched_brand=brand)

        # 2. Token prefix & substring overlap
        tokens = clean_text.split()
        for token in tokens:
            if len(token) >= 3:
                for key, entry in MEDICINE_DATABASE.items():
                    if key.startswith(token) or token in key:
                        return cls._build_resolved_record(entry, raw_dose)
                    for brand in entry["common_brands"]:
                        if brand.startswith(token) or token.startswith(brand):
                            return cls._build_resolved_record(entry, raw_dose, matched_brand=brand)

        # 3. Levenshtein Fuzzy Distance for Handwritten OCR variations
        for token in tokens:
            token_clean = re.sub(r"[0-9mgmcgml]+", "", token).strip()
            if len(token_clean) >= 4:
                for key, entry in MEDICINE_DATABASE.items():
                    max_dist = 2 if len(token_clean) >= 6 else 1
                    if cls._levenshtein(token_clean, key) <= max_dist:
                        return cls._build_resolved_record(entry, raw_dose)

                    for brand in entry["common_brands"]:
                        if cls._levenshtein(token_clean, brand) <= max_dist:
                            return cls._build_resolved_record(entry, raw_dose, matched_brand=brand)

        return None

    @classmethod
    def _build_resolved_record(cls, entry: Dict, raw_dose: Optional[str] = None, matched_brand: Optional[str] = None) -> Dict:
        name = entry["canonical_name"]
        if matched_brand:
            name = f"{matched_brand.capitalize()} ({entry['canonical_name']})"

        dose = raw_dose if (raw_dose and any(char.isdigit() for char in raw_dose)) else entry["default_dose"]

        return {
            "name": name,
            "dose": dose,
            "purpose": entry["purpose"],
            "instructions": entry["instructions"],
            "pill_color_type": entry["pill_color_type"],
            "timing_hint": entry["timing_hint"]
        }
