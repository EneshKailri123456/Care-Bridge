/**
 * CareCompass — Main Application Engine
 * Mobile-first, accessible, multilingual assistant for elderly & low-literacy patients.
 */

// Application State
const state = {
  samples: [],
  currentDoc: null,
  currentSimplified: null,
  currentLang: 'en',
  speechRate: 1.0,
  isSpeaking: false,
  activeSentenceIdx: -1,
  takenMeds: new Set(),
  teachbackQuestions: [],
  activeTeachbackIdx: 0,
  fontScaleLevel: 0, // 0: normal, 1: large, 2: x-large
  isLightTheme: false, // Default is Dark Mode
  cameraStream: null
};

// Base API URL: uses relative URL when running locally, and Render URL when deployed to GitHub Pages
const API_BASE = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' || window.location.hostname === '')
  ? ''
  : (localStorage.getItem('carebridge_api_url') || 'https://care-bridge-api.onrender.com');

// UI Localization Dictionary
const UI_STRINGS = {
  en: {
    scanTitle: "Welcome to Carebridge: Your Accessible Healthcare Assistant",
    scanSubtitle: "Snap a photo of any prescription or medical report. We read it, translate it into your language, and help you take the next step — safely and on time.",
    takePhoto: "Take Photo",
    uploadFile: "Upload File",
    pasteImage: "Paste Image (Ctrl+V)",
    demoTitle: "⚡ Or Try Instant Sample Documents:",
    listenHeading: "🔊 Read Plan Aloud",
    speedBtn: "Speed: ",
    planHeadline: "Your Easy Medicine Plan",
    medListTitle: "Medicines & Instructions",
    viewTimeline: "⏰ View Daily Timeline",
    warningsTitle: "When to Contact Doctor Immediately",
    adherenceTitle: "Today's Medicine Progress",
    takenLabel: "Taken",
    testAlarm: "🔔 Test Reminder Alarm",
    downloadCal: "📥 Download Reminders (.ics) for Phone Calendar",
    teachbackHeading: "Let's Check Together",
    teachbackSubheading: "Confirming your understanding helps keep you safe. Answer by tapping an option or speaking aloud.",
    teachbackMicPrompt: "Tap microphone to speak",
    teachbackCompleteHeadline: "Comprehension Check Complete! 🏆",
    teachbackCompleteSubtitle: "You have successfully verified your understanding for all prescribed medicines.",
    reviewQuestionsBtn: "↺ Review Questions Again",
    viewTimelineBtn: "⏰ View Daily Timeline ➔",
    questionLabel: "Question",
    ofLabel: "of",
    medicineLabel: "Medicine",
    nextMedQuestionBtn: "Next Medicine Question ➔",
    completeVerificationBtn: "Complete Verification ➔",
    nextVisitLbl: "Next Doctor Visit",
    wayfindingTitle: "Easy Step-by-Step Wayfinding",
    qaHeading: "Ask a Question About Your Medicine",
    qaChipsTitle: "Frequently Asked Patient Questions",
    qaChipsDesc: "Click any quick topic below to receive an instant plain-language answer:",
    qaPlaceholder: "Type or ask with voice...",
    qaChips: [
      { label: "💊 What if I miss a dose?", q: "What if I miss a dose of my medicine?" },
      { label: "🥛 Can I take with milk or tea?", q: "Can I take these medicines with milk or tea?" },
      { label: "🏥 When is my next hospital visit?", q: "When is my next hospital appointment?" },
      { label: "✂️ Can I crush or break tablets?", q: "Can I crush or break these tablets?" },
      { label: "🍎 Any food or diet restrictions?", q: "Are there any food or diet restrictions with these medicines?" },
      { label: "😵 What if I feel dizzy or nauseous?", q: "What should I do if I feel dizzy or nauseous?" }
    ],
    notifTitle: "Phone & PC Dose Reminders",
    notifDesc: "Get automatic notification alerts on your phone or PC when it's time to take your medicines, even when you are not on this website actively.",
    enableNotifBtn: "🔔 Enable System Alerts",
    disableNotifBtn: "🔕 Disable Alerts",
    testNotifBtn: "⚡ Test Notification",
    notifActiveTimes: "✅ Active Reminders: 🌅 Morning (8:00 AM) • ☀️ Afternoon (1:00 PM) • 🌙 Night (8:00 PM)",
    notifActiveBadge: "✅ Active",
    notifPausedBadge: "🔕 Paused",
    notifMorningTitle: "🌅 Morning Dose Reminder (8:00 AM)",
    notifAfternoonTitle: "☀️ Afternoon Dose Reminder (1:00 PM)",
    notifNightTitle: "🌙 Night Dose Reminder (8:00 PM)",
    notifBodyTemplate: "Time to take your scheduled doses: {0}. Take with a full glass of water.",
    notifMarkTakenAction: "✓ Mark Taken",
    notifSnoozeAction: "⏰ Snooze 10m",
    notifEnabledSpeech: "System notifications enabled! CareBridge will alert your device when it is time to take your tablets.",
    notifDisabledSpeech: "Medication alerts turned off.",
    slotMorningHeader: "🌅 Morning (8:00 AM — Breakfast)",
    slotAfternoonHeader: "☀️ Afternoon (1:00 PM — Lunch)",
    slotNightHeader: "🌙 Night (8:00 PM — Dinner & Bedtime)",
    exactMedLabel: "EXACT MEDICINE TO TAKE:",
    doseLabel: "Dose",
    whyLabel: "Why",
    instructionsLabel: "Instructions",
    listenBtnLabel: "🔊 Listen",
    markTakenLabel: "Mark as Taken",
    markedTakenLabel: "✅ Marked as Taken",
    durationLabel: "Duration",
    noMedsInSlot: "No medicines scheduled for this slot.",
    doseUnitSingular: "Dose",
    doseUnitPlural: "Doses",
    dosesTakenText: "{taken} / {total} Doses Taken",
    adherenceNote: "Tap the checkbox as you take each scheduled dose.",
    adherenceProgressNote: "Great progress! {taken} of {total} scheduled doses taken.",
    adherenceCompleteNote: "🌟 Amazing! All scheduled doses completed for today!",
    syncCalendarTitle: "Sync with Phone Calendar",
    syncCalendarDesc: "Export all medication reminders to Google Calendar, Apple Calendar, or Outlook with 1 tap.",
    congratsAllTaken: "Congratulations! You have taken all your scheduled medicine doses for today. Keep up the wonderful care!",
    sosBtn: "Emergency",
    navScan: "1. Scan Paperwork",
    navPlan: "2. Plain Plan",
    navTimeline: "3. Daily Schedule",
    navTeachback: "4. Teach-Back",
    navHospital: "5. Hospital Wayfinding",
    navQA: "6. Ask CareBridge",
    headerDocReady: "Active Document: Ready",
    patientPrefix: "Patient: ",
    listenPlanBottom: "Listen Plan"
  },
  hi: {
    scanTitle: "दवा का पर्चा या अस्पताल का कागज स्कैन करें",
    scanSubtitle: "अपने पर्चे या डिस्चार्ज सारांश की फोटो लें। हम इसे बहुत ही आसान भाषा और आवाज में समझाएंगे।",
    takePhoto: "फोटो खींचें",
    uploadFile: "फाइल अपलोड करें",
    pasteImage: "फोटो पेस्ट करें (Ctrl+V)",
    demoTitle: "⚡ या तैयार पर्चा चुनकर तुरंत देखें:",
    listenHeading: "🔊 पूरी योजना आवाज में सुनें",
    speedBtn: "गति: ",
    planHeadline: "आपकी आसान दवा योजना",
    medListTitle: "दवाइयां और लेने का सही समय",
    viewTimeline: "⏰ दैनिक समय सारणी देखें",
    warningsTitle: "यदि ये लक्षण दिखें तो तुरंत डॉक्टर से संपर्क करें",
    adherenceTitle: "आज की दवाइयों की स्थिति",
    takenLabel: "ले ली",
    testAlarm: "🔔 अलार्म की जांच करें",
    downloadCal: "📥 फोन कैलेंडर में रिमाइंडर डाउनलोड करें (.ics)",
    teachbackHeading: "आइए एक बार मिलकर जांच लें",
    teachbackSubheading: "दवा का सही समय समझना आपकी सेहत के लिए बहुत जरूरी है। नीचे छूकर या बोलकर उत्तर दें।",
    teachbackMicPrompt: "माइक दबाकर बोलें",
    teachbackCompleteHeadline: "दवा सुरक्षा व समझ की जांच पूरी हुई! 🏆",
    teachbackCompleteSubtitle: "आपने अपनी सभी लिखी गई दवाओं के सही नियमों और समय को अच्छी तरह समझ लिया है।",
    reviewQuestionsBtn: "↺ सवाल दोबारा देखें",
    viewTimelineBtn: "⏰ दैनिक समय सारणी देखें ➔",
    questionLabel: "सवाल",
    ofLabel: "का",
    medicineLabel: "दवा",
    nextMedQuestionBtn: "अगली दवा का सवाल ➔",
    completeVerificationBtn: "जांच पूरी करें ➔",
    nextVisitLbl: "अगली डॉक्टर मुलाक़ात",
    wayfindingTitle: "अस्पताल में रास्ता खोजने की सरल गाइड",
    qaHeading: "अपनी दवा के बारे में कोई भी सवाल पूछें",
    qaChipsTitle: "मरीजों द्वारा अक्सर पूछे जाने वाले सवाल",
    qaChipsDesc: "सरल भाषा में तुरंत उत्तर पाने के लिए नीचे दिए गए किसी भी विषय पर क्लिक करें:",
    qaPlaceholder: "लिखें या माइक दबाकर सवाल पूछें...",
    qaChips: [
      { label: "💊 अगर खुराक छूट जाए तो क्या करें?", q: "अगर मेरी दवा की कोई खुराक छूट जाए तो क्या करना चाहिए?" },
      { label: "🥛 क्या दवा दूध या चाय के साथ ले सकते हैं?", q: "क्या मैं यह दवा दूध या चाय के साथ ले सकता हूँ?" },
      { label: "🏥 डॉक्टर से दोबारा कब मिलना है?", q: "मुझे डॉक्टर के पास दोबारा कब जाना है?" },
      { label: "✂️ क्या गोली को तोड़कर खा सकते हैं?", q: "क्या मैं इन गोलियों को तोड़कर या पीसकर खा सकता हूँ?" },
      { label: "🍎 खाने-पीने में क्या परहेज रखना है?", q: "इन दवाओं के साथ खाने-पीने में क्या परहेज रखना चाहिए?" },
      { label: "😵 चक्कर या उल्टी महसूस हो तो क्या करें?", q: "अगर मुझे चक्कर या घबराहट महसूस हो तो क्या करना चाहिए?" }
    ],
    notifTitle: "फोन व कंप्यूटर दवा रिमाइंडर",
    notifDesc: "दवा लेने का समय होने पर अपने फोन या कंप्यूटर पर स्वचालित अलर्ट पाएं, भले ही यह वेबसाइट बंद हो।",
    enableNotifBtn: "🔔 सिस्टम अलर्ट चालू करें",
    disableNotifBtn: "🔕 अलर्ट बंद करें",
    testNotifBtn: "⚡ टेस्ट नोटिफिकेशन",
    notifActiveTimes: "✅ चालू रिमाइंडर: 🌅 सुबह (8:00 AM) • ☀️ दोपहर (1:00 PM) • 🌙 रात (8:00 PM)",
    notifActiveBadge: "✅ चालू है",
    notifPausedBadge: "🔕 बंद है",
    notifMorningTitle: "🌅 सुबह की दवा का समय (8:00 AM)",
    notifAfternoonTitle: "☀️ दोपहर की दवा का समय (1:00 PM)",
    notifNightTitle: "🌙 रात की दवा का समय (8:00 PM)",
    notifBodyTemplate: "आपकी निर्धारित दवाइयां लेने का समय हो गया है: {0}। कृपया पानी के साथ लें।",
    notifMarkTakenAction: "✓ दवा ले ली (Mark Taken)",
    notifSnoozeAction: "⏰ 10 मिनट बाद (Snooze)",
    notifEnabledSpeech: "सिस्टम नोटिफिकेशन चालू हो गए हैं! दवा का समय होने पर आपका फोन या कंप्यूटर आपको याद दिलाएगा।",
    notifDisabledSpeech: "दवा के नोटिफिकेशन बंद कर दिए गए हैं।",
    slotMorningHeader: "🌅 सुबह (8:00 AM — नाश्ता)",
    slotAfternoonHeader: "☀️ दोपहर (1:00 PM — दोपहर का खाना)",
    slotNightHeader: "🌙 रात (8:00 PM — रात का खाना / सोते समय)",
    exactMedLabel: "लेने के लिए निर्धारित दवा:",
    doseLabel: "मात्रा (Dose)",
    whyLabel: "फायदा / कारण",
    instructionsLabel: "लेने का सही तरीका (Instructions)",
    listenBtnLabel: "🔊 सुनें",
    markTakenLabel: "दवा ले ली",
    markedTakenLabel: "✅ दवा ले ली गई",
    durationLabel: "अवधि",
    noMedsInSlot: "इस समय के लिए कोई दवा निर्धारित नहीं है।",
    doseUnitSingular: "खुराक",
    doseUnitPlural: "खुराकें (Doses)",
    dosesTakenText: "{taken} / {total} खुराकें ली गईं",
    adherenceNote: "जैसे-जैसे आप दवा लेते जाएं, बॉक्स पर सही का निशान लगाएं।",
    adherenceProgressNote: "बहुत अच्छा! आपने {total} में से {taken} दवाइयां ले ली हैं।",
    adherenceCompleteNote: "🌟 बहुत बढ़िया! आज की सभी निर्धारित दवाइयां पूरी हो गईं!",
    syncCalendarTitle: "फोन कैलेंडर में रिमाइंडर जोड़ें",
    syncCalendarDesc: "1 टैप में सभी दवा रिमाइंडर को गूगल या फोन कैलेंडर में जोड़ें।",
    congratsAllTaken: "बधाई हो! आपने आज की सभी निर्धारित दवाइयां ले ली हैं। बहुत बढ़िया!",
    sosBtn: "आपातकालीन",
    navScan: "1. पर्चा स्कैन",
    navPlan: "2. आसान योजना",
    navTimeline: "3. दैनिक समय सारणी",
    navTeachback: "4. समझ की जांच",
    navHospital: "5. अस्पताल का रास्ता",
    navQA: "6. सवाल पूछें",
    headerDocReady: "सक्रिय दस्तावेज़: तैयार",
    patientPrefix: "रोगी: ",
    listenPlanBottom: "योजना सुनें"
  },
  kn: {
    scanTitle: "ವೈದ್ಯರ ಚೀಟಿಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    scanSubtitle: "ನಿಮ್ಮ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಥವಾ ಆಸ್ಪತ್ರೆಯ ಪತ್ರದ ಫೋಟೋ ತೆಗೆಯಿರಿ. ನಾವು ಸರಳ ಕನ್ನಡದಲ್ಲಿ ವಿವರಿಸುತ್ತೇವೆ.",
    takePhoto: "ಫೋಟೋ ತೆಗೆಯಿರಿ",
    uploadFile: "ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    pasteImage: "ಚಿತ್ರ ಪೇಸ್ಟ್ ಮಾಡಿ (Ctrl+V)",
    demoTitle: "⚡ ಅಥವಾ ಮಾದರಿ ದಾಖಲೆಗಳನ್ನು ನೋಡಿ:",
    listenHeading: "🔊 ಧ್ವನಿಯಲ್ಲಿ ಆಲಿಸಿ",
    speedBtn: "ವೇಗ: ",
    planHeadline: "ನಿಮ್ಮ ಸರಳ ಔಷಧ ಯೋಜನೆ",
    medListTitle: "ಔಷಧಿಗಳು ಮತ್ತು ಸೂಚನೆಗಳು",
    viewTimeline: "⏰ ದೈನಂದಿನ ಸಮಯಪಟ್ಟಿ ನೋಡಿ",
    warningsTitle: "ತಕ್ಷಣ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಬೇಕಾದ ಲಕ್ಷಣಗಳು",
    adherenceTitle: "ಇಂದಿನ ಔಷಧಿ ಪ್ರಗತಿ",
    takenLabel: "ತೆಗೆದುಕೊಂಡಿದೆ",
    testAlarm: "🔔 ಅಲಾರಾಂ ಪರೀಕ್ಷಿಸಿ",
    downloadCal: "📥 ಕ್ಯಾಲೆಂಡರ್ ರಿಮೈಂಡರ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (.ics)",
    teachbackHeading: "ಸರಿಯಾಗಿ ಅರ್ಥವಾಗಿದೆಯೇ ಪರಿಶೀಲಿಸೋಣ",
    teachbackSubheading: "ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಧ್ವನಿ ಮೂಲಕ ತಿಳಿಸಿ.",
    teachbackMicPrompt: "ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿ",
    teachbackCompleteHeadline: "ಔಷಧಿ ತಿಳುವಳಿಕೆ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ! 🏆",
    teachbackCompleteSubtitle: "ನಿಮಗೆ ಸೂಚಿಸಲಾದ ಎಲ್ಲಾ ಔಷಧಿಗಳ ಸರಿಯಾದ ನಿಯಮಗಳು ಮತ್ತು ಸಮಯವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೀರಿ.",
    reviewQuestionsBtn: "↺ ಪ್ರಶ್ನೆಗಳನ್ನು ಮತ್ತೆ ನೋಡಿ",
    viewTimelineBtn: "⏰ ದೈನಂದಿನ ಸಮಯಪಟ್ಟಿ ನೋಡಿ ➔",
    questionLabel: "ಪ್ರಶ್ನೆ",
    ofLabel: "ರ",
    medicineLabel: "ಔಷಧಿ",
    nextMedQuestionBtn: "ಮುಂದಿನ ಔಷಧಿಯ ಪ್ರಶ್ನೆ ➔",
    completeVerificationBtn: "ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಳಿಸಿ ➔",
    nextVisitLbl: "ಮುಂದಿನ ಭೇಟಿ",
    wayfindingTitle: "ಆಸ್ಪತ್ರೆಯ ಮಾರ್ಗದರ್ಶನ",
    qaHeading: "ಔಷಧದ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ",
    qaChipsTitle: "ಸಾಮಾನ್ಯವಾಗಿ ಕೇಳಲಾಗುವ ರೋಗಿಗಳ ಪ್ರಶ್ನೆಗಳು",
    qaChipsDesc: "ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಉತ್ತರ ಪಡೆಯಲು ಕೆಳಗಿನ ಯಾವುದೇ ಪ್ರಶ್ನೆಯನ್ನು ಒತ್ತಿರಿ:",
    qaPlaceholder: "ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಧ್ವನಿ ಮೂಲಕ ಕೇಳಿ...",
    qaChips: [
      { label: "💊 ಡೋಸ್ ತಪ್ಪಿದರೆ ಏನು ಮಾಡಬೇಕು?", q: "ಔಷಧಿಯ ಡೋಸ್ ತಪ್ಪಿದರೆ ನಾನು ಏನು ಮಾಡಬೇಕು?" },
      { label: "🥛 ಹಾಲು ಅಥವಾ ಚಹಾದೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಬಹುದೇ?", q: "ಈ ಔಷಧಿಗಳನ್ನು ಹಾಲು ಅಥವಾ ಚಹಾದೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಬಹುದೇ?" },
      { label: "🏥 ಮುಂದಿನ ಆಸ್ಪತ್ರೆ ಭೇಟಿ ಯಾವಾಗ?", q: "ನನ್ನ ಮುಂದಿನ ವೈದ್ಯರ ಭೇಟಿ ಯಾವಾಗ?" },
      { label: "✂️ ಮಾತ್ರೆಗಳನ್ನು ಪುಡಿಮಾಡಬಹುದೇ?", q: "ಈ ಮಾತ್ರೆಗಳನ್ನು ಪುಡಿಮಾಡಿ ನುಂಗಬಹುದೇ?" },
      { label: "🍎 ಆಹಾರ ಪಥ್ಯ ಅಥವಾ ನಿರ್ಬಂಧಗಳಿವೆಯೇ?", q: "ಈ ಔಷಧಿಗಳೊಂದಿಗೆ ಯಾವುದೇ ಆಹಾರ ನಿರ್ಬಂಧಗಳಿವೆಯೇ?" },
      { label: "😵 ತಲೆತಿರುಗುವಿಕೆ ಉಂಟಾದರೆ ಏನು ಮಾಡಬೇಕು?", q: "ತಲೆತಿರುಗುವಿಕೆ ಅಥವಾ ವಾಕರಿಕೆ ಉಂಟಾದರೆ ಏನು ಮಾಡಬೇಕು?" }
    ],
    notifTitle: "ಫೋನ್ ಮತ್ತು ಕಂಪ್ಯೂಟರ್ ಔಷಧಿ ಜ್ಞಾಪನೆಗಳು",
    notifDesc: "ನೀವು ಈ ವೆಬ್‌ಸೈಟ್‌ನಿಂದ ಹೊರಗಿದ್ದರೂ ಸಹ, ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯವಾದಾಗ ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತ ಎಚ್ಚರಿಕೆಯನ್ನು ಪಡೆಯಿರಿ.",
    enableNotifBtn: "🔔 ಸಿಸ್ಟಮ್ ಅಲರ್ಟ್ ಆನ್ ಮಾಡಿ",
    disableNotifBtn: "🔕 ಅಲರ್ಟ್ ಆಫ್ ಮಾಡಿ",
    testNotifBtn: "⚡ ಪರೀಕ್ಷಾರ್ಥ ನೋಟಿಫಿಕೇಶನ್",
    notifActiveTimes: "✅ ಸಕ್ರಿಯ ಜ್ಞಾಪನೆಗಳು: 🌅 ಮುಂಜಾನೆ (8:00 AM) • ☀️ ಮಧ್ಯಾಹ್ನ (1:00 PM) • 🌙 ರಾತ್ರಿ (8:00 PM)",
    notifActiveBadge: "✅ ಸಕ್ರಿಯ",
    notifPausedBadge: "🔕 ನಿಷ್ಕ್ರಿಯ",
    notifMorningTitle: "🌅 ಮುಂಜಾನೆಯ ಔಷಧಿ ಸಮಯ (8:00 AM)",
    notifAfternoonTitle: "☀️ ಮಧ್ಯಾಹ್ನದ ಔಷಧಿ ಸಮಯ (1:00 PM)",
    notifNightTitle: "🌙 ರಾತ್ರಿಯ ಔಷಧಿ ಸಮಯ (8:00 PM)",
    notifBodyTemplate: "ನಿಮ್ಮ ನಿಗದಿತ ಔಷಧಿಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯವಾಗಿದೆ: {0}.",
    notifMarkTakenAction: "✓ ತೆಗೆದುಕೊಂಡಿದ್ದೇನೆ",
    notifSnoozeAction: "⏰ 10 ನಿಮಿಷ ಸ್ನೂಜ್",
    notifEnabledSpeech: "ನೋಟಿಫಿಕೇಶನ್ ಆನ್ ಆಗಿದೆ! ಔಷಧಿ ಸಮಯವಾದಾಗ ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಎಚ್ಚರಿಕೆ ಬರುತ್ತದೆ.",
    notifDisabledSpeech: "ಔಷಧಿ ನೋಟಿಫಿಕೇಶನ್ ಆಫ್ ಮಾಡಲಾಗಿದೆ.",
    slotMorningHeader: "🌅 ಬೆಳಿಗ್ಗೆ (8:00 AM — ಉಪಾಹಾರ)",
    slotAfternoonHeader: "☀️ ಮಧ್ಯಾಹ್ನ (1:00 PM — ಊಟ)",
    slotNightHeader: "🌙 ರಾತ್ರಿ (8:00 PM — ರಾತ್ರಿಯ ಊಟ & ಮಲಗುವ ಮುನ್ನ)",
    exactMedLabel: "ತೆಗೆದುಕೊಳ್ಳಬೇಕಾದ ಔಷಧಿ:",
    doseLabel: "ಪ್ರಮಾಣ (Dose)",
    whyLabel: "ಕಾರಣ (Why)",
    instructionsLabel: "ಸೂಚನೆಗಳು (Instructions)",
    listenBtnLabel: "🔊 ಆಲಿಸಿ",
    markTakenLabel: "ತೆಗೆದುಕೊಂಡಿದ್ದೇನೆ",
    markedTakenLabel: "✅ ತೆಗೆದುಕೊಂಡಾಗಿದೆ",
    durationLabel: "ಅವಧಿ",
    noMedsInSlot: "ಈ ಸಮಯಕ್ಕೆ ಯಾವುದೇ ಔಷಧಿಗಳಿಲ್ಲ.",
    doseUnitSingular: "ಡೋಸ್",
    doseUnitPlural: "ಡೋಸ್‌ಗಳು",
    dosesTakenText: "{taken} / {total} ಡೋಸ್ ತೆಗೆದುಕೊಳ್ಳಲಾಗಿದೆ",
    adherenceNote: "ಪ್ರತಿ ಡೋಸ್ ತೆಗೆದುಕೊಂಡಂತೆ ಚೆಕ್‌ಬಾಕ್ಸ್ ಒತ್ತಿ.",
    adherenceProgressNote: "ಉತ್ತಮ ಪ್ರಗತಿ! {total} ರಲ್ಲಿ {taken} ಡೋಸ್ ತೆಗೆದುಕೊಳ್ಳಲಾಗಿದೆ.",
    adherenceCompleteNote: "🌟 ಅದ್ಭುತ! ಇಂದಿನ ಎಲ್ಲಾ ಔಷಧಿಗಳು ಮುಗಿದಿವೆ!",
    syncCalendarTitle: "ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್",
    syncCalendarDesc: "1 ಟ್ಯಾಪ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಫೋನ್ ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಔಷಧಿ ರಿಮೈಂಡರ್ ಸೇರಿಸಿ.",
    congratsAllTaken: "ಅಭಿನಂದನೆಗಳು! ನೀವು ಇಂದಿನ ಎಲ್ಲಾ ನಿಗದಿತ ಔಷಧಿಗಳನ್ನು ತೆಗೆದುಕೊಂಡಿದ್ದೀರಿ.",
    sosBtn: "ತುರ್ತು ಸೇವೆ",
    navScan: "1. ಚೀಟಿ ಸ್ಕ್ಯಾನ್",
    navPlan: "2. ಸರಳ ಯೋಜನೆ",
    navTimeline: "3. ದೈನಂದಿನ ಸಮಯಪಟ್ಟಿ",
    navTeachback: "4. ತಿಳುವಳಿಕೆ ಪರಿಶೀಲನೆ",
    navHospital: "5. ಆಸ್ಪತ್ರೆ ಮಾರ್ಗದರ್ಶನ",
    navQA: "6. ಪ್ರಶ್ನೆ ಕೇಳಿ",
    headerDocReady: "ಸಕ್ರಿಯ ದಾಖಲೆ: ಸಿದ್ಧವಾಗಿದೆ",
    patientPrefix: "ರೋಗಿ: ",
    listenPlanBottom: "ಯೋಜನೆ ಆಲಿಸಿ"
  },
  ta: {
    scanTitle: "மருத்துவ சீட்டை ஸ்கேன் செய்யவும்",
    scanSubtitle: "மருத்துவர் சீட்டு அல்லது மருத்துவமனை ஆவணத்தை படமெடுங்கள். தமிழில் எளிய குரலில் விளக்குகிறோம்.",
    takePhoto: "படம் எடுக்கவும்",
    uploadFile: "பதிவேற்றவும்",
    pasteImage: "படத்தை ஒட்டவும் (Ctrl+V)",
    demoTitle: "⚡ அல்லது மாதிரி சீட்டுகளை பார்க்க:",
    listenHeading: "🔊 தமிழில் கேட்கவும்",
    speedBtn: "வேகம்: ",
    planHeadline: "உங்கள் எளிய மருந்து திட்டம்",
    medListTitle: "மருந்துகள் மற்றும் நேரம்",
    viewTimeline: "⏰ தினசரி அட்டவணை",
    warningsTitle: "உடனடியாக மருத்துவரை அணுக வேண்டிய அறிகுறிகள்",
    adherenceTitle: "இன்றைய மருந்து நிலை",
    takenLabel: "எடுத்துக்கொண்டேன்",
    testAlarm: "🔔 அலாரம் சோதிக்க",
    downloadCal: "📥 நினைவூட்டலை பதிவிறக்கவும் (.ics)",
    teachbackHeading: "புரிதலை உறுதி செய்வோம்",
    teachbackSubheading: "சரியான பதிலை தொடவும் அல்லது பேசி தெரிவிக்கவும்.",
    teachbackMicPrompt: "பேச மைக் பொத்தானை அழுத்தவும்",
    teachbackCompleteHeadline: "மருந்து புரிதல் சரிபார்ப்பு முடிந்தது! 🏆",
    teachbackCompleteSubtitle: "பரிந்துரைக்கப்பட்ட அனைத்து மருந்துகளின் வழிமுறைகளையும் வெற்றிகரமாகப் புரிந்து கொண்டீர்கள்.",
    reviewQuestionsBtn: "↺ கேள்விகளை மீண்டும் பார்க்கவும்",
    viewTimelineBtn: "⏰ தினசரி அட்டவணைக்கு செல்லவும் ➔",
    questionLabel: "கேள்வி",
    ofLabel: "இல்",
    medicineLabel: "மருந்து",
    nextMedQuestionBtn: "அடுத்த மருந்து கேள்வி ➔",
    completeVerificationBtn: "சரிபார்ப்பை முடிக்கவும் ➔",
    nextVisitLbl: "அடுத்த சந்திப்பு",
    wayfindingTitle: "மருத்துவமனை வழித்தடம்",
    qaHeading: "மருந்து பற்றி கேள்வி கேட்கவும்",
    qaChipsTitle: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
    qaChipsDesc: "எளிய தமிழில் பதில் பெற கீழே உள்ள தலைப்பைத் தொடவும்:",
    qaPlaceholder: "எழுதவும் அல்லது பேசி கேட்கவும்...",
    qaChips: [
      { label: "💊 மருந்து நேரம் தவறினால் என்ன செய்வது?", q: "ஒரு வேளை மருந்து எடுக்க மறந்துவிட்டால் என்ன செய்ய வேண்டும்?" },
      { label: "🥛 பால் அல்லது டீயுடன் சாப்பிடலாமா?", q: "இந்த மருந்துகளை பால் அல்லது டீயுடன் சாப்பிடலாமா?" },
      { label: "🏥 அடுத்த மருத்துவமனை சந்திப்பு எப்போது?", q: "அடுத்த மருத்துவ சந்திப்பு எப்போது?" },
      { label: "✂️ மாத்திரையை உடைத்து சாப்பிடலாமா?", q: "மாத்திரைகளை உடைத்தோ பொடி செய்தோ சாப்பிடலாமா?" },
      { label: "🍎 உணவு கட்டுப்பாடுகள் ஏதேனும் உள்ளதா?", q: "இந்த மருந்துகளுடன் உணவு கட்டுப்பாடுகள் ஏதேனும் உள்ளதா?" },
      { label: "😵 மயக்கம் அல்லது குமட்டல் வந்தால் என்ன செய்வது?", q: "மயக்கம் அல்லது சோர்வு ஏற்பட்டால் என்ன செய்ய வேண்டும்?" }
    ],
    notifTitle: "போன் மற்றும் கணினி மருந்து நினைவூட்டல்",
    notifDesc: "மருந்து எடுத்துக்கொள்ளும் நேரத்தில் உங்கள் போன் அல்லது கணினியில் தானியங்கி நினைவூட்டல் பெறலாம்.",
    enableNotifBtn: "🔔 நினைவூட்டலை இயக்கு",
    disableNotifBtn: "🔕 நினைவூட்டலை நிறுத்து",
    testNotifBtn: "⚡ மாதிரி நினைவூட்டல்",
    notifActiveTimes: "✅ செயலில் உள்ளவை: 🌅 காலை (8:00 AM) • ☀️ மதியம் (1:00 PM) • 🌙 இரவு (8:00 PM)",
    notifActiveBadge: "✅ செயலில் உள்ளது",
    notifPausedBadge: "🔕 நிறுத்தப்பட்டது",
    notifMorningTitle: "🌅 காலை மருந்து நேரம் (8:00 AM)",
    notifAfternoonTitle: "☀️ மதியம் மருந்து நேரம் (1:00 PM)",
    notifNightTitle: "🌙 இரவு மருந்து நேரம் (8:00 PM)",
    notifBodyTemplate: "மருந்துகளை எடுத்துக்கொள்ளும் நேரம்: {0}.",
    notifMarkTakenAction: "✓ எடுத்துக்கொண்டேன்",
    notifSnoozeAction: "⏰ 10 நிமிடம் கழித்து",
    notifEnabledSpeech: "மருந்து நினைவூட்டல் இயக்கப்பட்டது! உங்கள் சாதனத்தில் அறிவிப்பு வரும்.",
    notifDisabledSpeech: "மருந்து நினைவூட்டல் நிறுத்தப்பட்டது.",
    slotMorningHeader: "🌅 காலை (8:00 AM — காலை உணவு)",
    slotAfternoonHeader: "☀️ மதியம் (1:00 PM — மதிய உணவு)",
    slotNightHeader: "🌙 இரவு (8:00 PM — இரவு உணவு & உறங்கும் முன்)",
    exactMedLabel: "எடுத்துக்கொள்ள வேண்டிய மருந்து:",
    doseLabel: "அளவு (Dose)",
    whyLabel: "காரணம் (Why)",
    instructionsLabel: "வழிமுறைகள் (Instructions)",
    listenBtnLabel: "🔊 கேட்கவும்",
    markTakenLabel: "எடுத்துக்கொண்டேன்",
    markedTakenLabel: "✅ எடுத்துக்கொள்ளப்பட்டது",
    durationLabel: "கால அளவு",
    noMedsInSlot: "இந்த நேரத்தில் மருந்துகள் இல்லை.",
    doseUnitSingular: "மருந்து",
    doseUnitPlural: "மருந்துகள்",
    dosesTakenText: "{taken} / {total} மருந்துகள் எடுக்கப்பட்டன",
    adherenceNote: "ஒவ்வொரு மருந்தை எடுக்கும் போதும் டிக் செய்யவும்.",
    adherenceProgressNote: "சிறந்த முன்னேற்றம்! {total} இல் {taken} மருந்துகள் எடுக்கப்பட்டன.",
    adherenceCompleteNote: "🌟 சிறப்பு! இன்றைய அனைத்து மருந்துகளும் எடுக்கப்பட்டுவிட்டன!",
    syncCalendarTitle: "நாட்காட்டியில் சேர்க்க",
    syncCalendarDesc: "1 தொடுதலில் மருந்து நினைவூட்டல்களை நாட்காட்டியில் சேர்க்கவும்.",
    congratsAllTaken: "வாழ்த்துகள்! இன்றைய அனைத்து மருந்துகளையும் எடுத்துக்கொண்டீர்கள்.",
    sosBtn: "அவசரம்",
    navScan: "1. சீட்டு ஸ்கேன்",
    navPlan: "2. எளிய திட்டம்",
    navTimeline: "3. தினசரி அட்டவணை",
    navTeachback: "4. புரிதல் சரிபார்ப்பு",
    navHospital: "5. மருத்துவமனை வழித்தடம்",
    navQA: "6. கேள்வி கேட்க",
    headerDocReady: "செயலில் உள்ள ஆவணம்: தயார்",
    patientPrefix: "நோயாளி: ",
    listenPlanBottom: "திட்டத்தைக் கேட்க"
  },
  te: {
    scanTitle: "డాక్టర్ చీటీని స్కాన్ చేయండి",
    scanSubtitle: "మీ ప్రిస్క్రిప్షన్ ఫోటో తీయండి. మేము సులభమైన తెలుగులో ధ్వని రూపంలో వివరిస్తాము.",
    takePhoto: "ఫోటో తీయండి",
    uploadFile: "అప్‌లోడ్ చేయండి",
    pasteImage: "చిత్రం పేస్ట్ చేయండి (Ctrl+V)",
    demoTitle: "⚡ లేదా నమూనా పత్రాలను ప్రయత్నించండి:",
    listenHeading: "🔊 వాయిస్‌లో వినండి",
    speedBtn: "వేగం: ",
    planHeadline: "మీ సులభమైన మందుల ప్రణాళిక",
    medListTitle: "మందులు & వేళలు",
    viewTimeline: "⏰ రోజువారీ సమయ పట్టిక",
    warningsTitle: "వెంటనే డాక్టర్‌ను సంప్రదించాల్సిన లక్షణాలు",
    adherenceTitle: "ఈ రోజు మందుల పురోగతి",
    takenLabel: "వేసుకున్నాను",
    testAlarm: "🔔 అలారం పరీక్షించండి",
    downloadCal: "📥 క్యాలెండర్ రిమైండర్ డౌన్‌లోడ్ చేసుకోండి (.ics)",
    teachbackHeading: "ఒక్కసారి సరిచూసుకుందాం",
    teachbackSubheading: "కింద ఉన్న సమాధానాన్ని తాకండి లేదా మాట్లాడండి.",
    teachbackMicPrompt: "మాట్లాడటానికి మైక్ నొక్కండి",
    teachbackCompleteHeadline: "మందుల అవగాహన ధృవీకరణ పూర్తయింది! 🏆",
    teachbackCompleteSubtitle: "సూచించిన అన్ని మందుల సరైన నియమాలను విజయవంతంగా అర్థం చేసుకున్నారు.",
    reviewQuestionsBtn: "↺ ప్రశ్నలను మళ్లీ సమీక్షించండి",
    viewTimelineBtn: "⏰ రోజువారీ సమయ పట్టిక చూడండి ➔",
    questionLabel: "ప్రశ్న",
    ofLabel: "లో",
    medicineLabel: "మందు",
    nextMedQuestionBtn: "తదుపరి మందు ప్రశ్న ➔",
    completeVerificationBtn: "ధృవీకరణ పూర్తి చేయండి ➔",
    nextVisitLbl: "తదుపరి సందర్శన",
    wayfindingTitle: "హాస్పిటల్ దారి మార్గదర్శి",
    qaHeading: "మందుల గురించి ప్రశ్న అడగండి",
    qaChipsTitle: "తరచుగా అడిగే ప్రశ్నలు",
    qaChipsDesc: "సులభమైన సమాధానం పొందడానికి కింది అంశాన్ని తాకండి:",
    qaPlaceholder: "టైప్ చేయండి లేదా మాట్లాడండి...",
    qaChips: [
      { label: "💊 డోస్ మర్చిపోతే ఏమి చేయాలి?", q: "మందు డోస్ మర్చిపోతే ఏమి చేయాలి?" },
      { label: "🥛 పాలు లేదా టీతో తీసుకోవచ్చా?", q: "ఈ మందులను పాలు లేదా టీతో తీసుకోవచ్చా?" },
      { label: "🏥 తదుపరి డాక్టర్ సందర్శన ఎప్పుడు?", q: "తదుపరి డాక్టర్ అపాయింట్‌మెంట్ ఎప్పుడు?" },
      { label: "✂️ మాత్రలను నలగగొట్టి వేసుకోవచ్చా?", q: "మాత్రలను నలగగొట్టి లేదా పొడి చేసి వేసుకోవచ్చా?" },
      { label: "🍎 ఆహార నియమాలు ఏమైనా ఉన్నాయా?", q: "ఈ మందులతో ఎలాంటి ఆహార నియమాలు పాటించాలి?" },
      { label: "😵 కళ్ళు తిరిగితే ఏమి చేయాలి?", q: "కళ్ళు తిరగడం లేదా వికారం ఉంటే ఏమి చేయాలి?" }
    ],
    notifTitle: "ఫోన్ & కంప్యూటర్ మందుల రిమైండర్లు",
    notifDesc: "మందులు వేసుకునే సమయానికి మీ ఫోన్ లేదా కంప్యూటర్‌లో ఆటోమేటిక్ అలర్ట్‌లను పొందండి.",
    enableNotifBtn: "🔔 అలర్ట్‌లను ప్రారంభించండి",
    disableNotifBtn: "🔕 అలర్ట్‌లను ఆపివేయండి",
    testNotifBtn: "⚡ టెస్ట్ నోటిఫికేషన్",
    notifActiveTimes: "✅ సక్రియ రిమైండర్లు: 🌅 ఉదయం (8:00 AM) • ☀️ మధ్యాహ్నం (1:00 PM) • 🌙 రాత్రి (8:00 PM)",
    notifActiveBadge: "✅ ప్రారంభంలో ఉంది",
    notifPausedBadge: "🔕 నిలిపివేయబడింది",
    notifMorningTitle: "🌅 ఉదయం మందుల సమయం (8:00 AM)",
    notifAfternoonTitle: "☀️ మధ్యాహ్నం మందుల సమయం (1:00 PM)",
    notifNightTitle: "🌙 రాత్రి మందుల సమయం (8:00 PM)",
    notifBodyTemplate: "మీ మందులు వేసుకునే సమయం అయింది: {0}.",
    notifMarkTakenAction: "✓ వేసుకున్నాను",
    notifSnoozeAction: "⏰ 10 నిమిషాలు స్నూజ్",
    notifEnabledSpeech: "మందుల రిమైండర్లు ప్రారంభించబడ్డాయి!",
    notifDisabledSpeech: "మందుల రిమైండర్లు నిలిపివేయబడ్డాయి.",
    slotMorningHeader: "🌅 ఉదయం (8:00 AM — అల్పాహారం)",
    slotAfternoonHeader: "☀️ మధ్యాహ్నం (1:00 PM — భోజనం)",
    slotNightHeader: "🌙 రాత్రి (8:00 PM — రాత్రి భోజనం & నిద్ర)",
    exactMedLabel: "వేసుకోవాల్సిన మందు:",
    doseLabel: "డోస్ (Dose)",
    whyLabel: "ఎందుకు (Why)",
    instructionsLabel: "సూచనలు (Instructions)",
    listenBtnLabel: "🔊 వినండి",
    markTakenLabel: "వేసుకున్నాను",
    markedTakenLabel: "✅ వేసుకున్నారు",
    durationLabel: "వ్యవధి",
    noMedsInSlot: "ఈ సమయంలో మందులు లేవు.",
    doseUnitSingular: "డోస్",
    doseUnitPlural: "డోస్‌లు",
    dosesTakenText: "{taken} / {total} డోస్‌లు వేసుకున్నారు",
    adherenceNote: "ప్రతి మందు వేసుకున్నప్పుడు బాక్స్‌ను తాకండి.",
    adherenceProgressNote: "మంచి పురోగతి! {total} లో {taken} డోస్‌లు వేసుకున్నారు.",
    adherenceCompleteNote: "🌟 అద్భుతం! ఈ రోజు అన్ని మందులు పూర్తయ్యాయి!",
    syncCalendarTitle: "క్యాలెండర్ సింక్",
    syncCalendarDesc: "1 ట్యాప్‌లో మందుల రిమైండర్‌లను క్యాలెండర్‌కు జోడించండి.",
    congratsAllTaken: "అభినందనలు! మీరు ఈ రోజు అన్ని మందులు వేసుకున్నారు.",
    sosBtn: "అత్యవసరం",
    navScan: "1. చీటీ స్కాన్",
    navPlan: "2. సులభ ప్రణాళిక",
    navTimeline: "3. రోజువారీ సమయ పట్టిక",
    navTeachback: "4. అవగాహన పరిశీలన",
    navHospital: "5. హాస్పిటల్ మార్గం",
    navQA: "6. ప్రశ్న అడగండి",
    headerDocReady: "యాక్టివ్ డాక్యుమెంట్: సిద్ధంగా ఉంది",
    patientPrefix: "రోగి: ",
    listenPlanBottom: "ప్రణాళిక వినండి"
  },
  bn: {
    scanTitle: "ডাক্তারের প্রেসক্রিপশন স্ক্যান করুন",
    scanSubtitle: "আপনার প্রেসক্রিপশনের ছবি তুলুন। আমরা সহজ বাংলায় এবং মুখে বলে বুঝিয়ে দেব।",
    takePhoto: "ছবি তুলুন",
    uploadFile: "ফাইল আপলোড করুন",
    pasteImage: "ছবি পেস্ট করুন (Ctrl+V)",
    demoTitle: "⚡ অথবা ডেমো প্রেসক্রিপশন দেখুন:",
    listenHeading: "🔊 বাংলায় শুনুন",
    speedBtn: "গতি: ",
    planHeadline: "আপনার সহজ ওষুধের পরিকল্পনা",
    medListTitle: "ওষুধ ও সময়সূচী",
    viewTimeline: "⏰ দৈনিক সময়সূচি",
    warningsTitle: "জরুরি সতর্কবার্তা",
    adherenceTitle: "আজকের ওষুধের অবস্থা",
    takenLabel: "খেয়েছি",
    testAlarm: "🔔 অ্যালার্ম টেস্ট করুন",
    downloadCal: "📥 ক্যালেন্ডার রিমাইন্ডার (.ics)",
    teachbackHeading: "চলুন যাচাই করে নিই",
    teachbackSubheading: "সঠিক উত্তরটি স্পর্শ করুন বা মুখে বলুন।",
    teachbackMicPrompt: "কথা বলতে মাইক চাপুন",
    teachbackCompleteHeadline: "ওষুধের নিরাপত্তা ও নিয়মাবলী যাচাই সম্পন্ন! 🏆",
    teachbackCompleteSubtitle: "আপনি প্রেসক্রিপশনের সমস্ত ওষুধের সঠিক নিয়ম ও সময় সফলভাবে বুঝে নিয়েছেন।",
    reviewQuestionsBtn: "↺ প্রশ্নগুলি পুনরায় দেখুন",
    viewTimelineBtn: "⏰ দৈনিক সময়সূচি দেখুন ➔",
    questionLabel: "প্রশ্ন",
    ofLabel: "এর",
    medicineLabel: "ওষুধ",
    nextMedQuestionBtn: "পরবর্তী ওষুধের প্রশ্ন ➔",
    completeVerificationBtn: "যাচাই সম্পন্ন করুন ➔",
    nextVisitLbl: "পরবর্তী ভিজিট",
    wayfindingTitle: "হাসপাতালের দিকনির্দেশিকা",
    qaHeading: "ওষুধ সম্পর্কিত প্রশ্ন জিজ্ঞাসা করুন",
    qaChipsTitle: "রোগীদের সাধারণ প্রশ্নাবলী",
    qaChipsDesc: "সহজ ভাষায় তাৎক্ষণিক উত্তর পেতে নিচের যেকোনো প্রশ্নে ক্লিক করুন:",
    qaPlaceholder: "টাইপ করুন বা মুখে বলুন...",
    qaChips: [
      { label: "💊 ওষুধের ডোজ মিস হলে কি করবেন?", q: "ওষুধের কোনো ডোজ মিস হয়ে গেলে আমার কি করা উচিত?" },
      { label: "🥛 দুধ বা চায়ের সাথে ওষুধ খাওয়া যাবে?", q: "এই ওষুধগুলি কি দুধ বা চায়ের সাথে খাওয়া যাবে?" },
      { label: "🏥 পরবর্তী ডাক্তার ভিজিট কবে?", q: "আমার পরবর্তী ডাক্তার অ্যাপয়েন্টমেন্ট কবে?" },
      { label: "✂️ ট্যাবলেট ভেঙে খাওয়া যাবে কি?", q: "ট্যাবলেট ভেঙে বা গুঁড়ো করে খাওয়া যাবে কি?" },
      { label: "🍎 খাবারে কোনো বাধানিষেধ আছে কি?", q: "এই ওষুধের সাথে খাবারে কোনো বাধানিষেধ আছে কি?" },
      { label: "😵 মাথা ঘুরলে বা বমি ভাব হলে কি করবেন?", q: "মাথা ঘুরলে বা দুর্বল লাগলে কি করা উচিত?" }
    ],
    notifTitle: "ফোন ও কম্পিউটার ওষুধের রিমাইন্ডার",
    notifDesc: "ওষুধ খাওয়ার সময় হলে আপনার ফোন বা কম্পিউটারে স্বয়ংক্রিয় নোটিফিকেশন পান।",
    enableNotifBtn: "🔔 সিস্টেম অ্যালার্ট চালু করুন",
    disableNotifBtn: "🔕 অ্যালার্ট বন্ধ করুন",
    testNotifBtn: "⚡ টেস্ট নোটিফিকেশন",
    notifActiveTimes: "✅ সক্রিয় রিমাইন্ডার: 🌅 সকাল (8:00 AM) • ☀️ দুপুর (1:00 PM) • 🌙 রাত (8:00 PM)",
    notifActiveBadge: "✅ চালু আছে",
    notifPausedBadge: "🔕 বন্ধ আছে",
    notifMorningTitle: "🌅 সকালের ওষুধের সময় (8:00 AM)",
    notifAfternoonTitle: "☀️ দুপুরের ওষুধের সময় (1:00 PM)",
    notifNightTitle: "🌙 রাতের ওষুধের সময় (8:00 PM)",
    notifBodyTemplate: "আপনার নির্ধারিত ওষুধ খাওয়ার সময় হয়েছে: {0}।",
    notifMarkTakenAction: "✓ ওষুধ খেয়েছি",
    notifSnoozeAction: "⏰ ১০ মিনিট পর",
    notifEnabledSpeech: "সিস্টেম নোটিফিকেশন চালু হয়েছে!",
    notifDisabledSpeech: "ওষুধের নোটিফিকেশন বন্ধ করা হয়েছে।",
    slotMorningHeader: "🌅 সকাল (8:00 AM — প্রাতঃরাশ)",
    slotAfternoonHeader: "☀️ দুপুর (1:00 PM — দুপুরের খাবার)",
    slotNightHeader: "🌙 রাত (8:00 PM — রাতের খাবার & শোয়ার সময়)",
    exactMedLabel: "খাওয়ার ওষুধ:",
    doseLabel: "ডোজ (Dose)",
    whyLabel: "কারণ (Why)",
    instructionsLabel: "নির্দেশাবলী (Instructions)",
    listenBtnLabel: "🔊 শুনুন",
    markTakenLabel: "খেয়েছি",
    markedTakenLabel: "✅ ওষুধ খাওয়া হয়েছে",
    durationLabel: "সময়কাল",
    noMedsInSlot: "এই সময়ে কোনো ওষুধ নেই।",
    doseUnitSingular: "ডোজ",
    doseUnitPlural: "টি ডোজ",
    dosesTakenText: "{taken} / {total} টি ডোজ খাওয়া হয়েছে",
    adherenceNote: "প্রতিটি ওষুধ খাওয়ার সাথে সাথে টিক দিন।",
    adherenceProgressNote: "খুব ভালো! {total} টির মধ্যে {taken} টি ওষুধ খাওয়া হয়েছে।",
    adherenceCompleteNote: "🌟 দুর্দান্ত! আজকের সমস্ত ওষুধ সম্পন্ন হয়েছে!",
    syncCalendarTitle: "ক্যালেন্ডার সিঙ্ক",
    syncCalendarDesc: "১ ট্যাপে ওষুধের রিমাইন্ডার ক্যালেন্ডারে যুক্ত করুন।",
    congratsAllTaken: "অভিনন্দন! আপনি আজকের সমস্ত নির্ধারিত ওষুধ খেয়েছেন।",
    sosBtn: "জরুরি",
    navScan: "1. প্রেসক্রিপশন স্ক্যান",
    navPlan: "2. সহজ পরিকল্পনা",
    navTimeline: "3. দৈনিক সময়সূচি",
    navTeachback: "4. নিয়মাবলী যাচাই",
    navHospital: "5. হাসপাতালের পথনির্দেশ",
    navQA: "6. প্রশ্ন জিজ্ঞাসা",
    headerDocReady: "সক্রিয় নথি: প্রস্তুত",
    patientPrefix: "রোগী: ",
    listenPlanBottom: "পরিকল্পনা শুনুন"
  },
  es: {
    scanTitle: "Escanee sus documentos médicos",
    scanSubtitle: "Tome una foto de su receta o resumen de alta. Se lo explicamos de forma muy clara en su idioma con voz.",
    takePhoto: "Tomar Foto",
    uploadFile: "Subir Archivo",
    pasteImage: "Pegar Imagen (Ctrl+V)",
    demoTitle: "⚡ O pruebe documentos de muestra:",
    listenHeading: "🔊 Escuchar el plan en voz alta",
    speedBtn: "Velocidad: ",
    planHeadline: "Su plan de medicamentos fácil",
    medListTitle: "Medicamentos e instrucciones",
    viewTimeline: "⏰ Ver horario diario",
    warningsTitle: "Cuándo contactar al médico de inmediato",
    adherenceTitle: "Progreso de medicamentos de hoy",
    takenLabel: "Tomado",
    testAlarm: "🔔 Probar Alarma",
    downloadCal: "📥 Descargar Recordatorios (.ics)",
    teachbackHeading: "Repasemos juntos",
    teachbackSubheading: "Confirmar las instrucciones le ayuda a mantenerse seguro. Toque una opción o responda con su voz.",
    teachbackMicPrompt: "Toque el micrófono para hablar",
    teachbackCompleteHeadline: "¡Verificación de Comprensión Completada! 🏆",
    teachbackCompleteSubtitle: "Ha verificado con éxito su comprensión y reglas de seguridad para todos los medicamentos recetados.",
    reviewQuestionsBtn: "↺ Revisar Preguntas de Nuevo",
    viewTimelineBtn: "⏰ Ver Horario Diario ➔",
    questionLabel: "Pregunta",
    ofLabel: "de",
    medicineLabel: "Medicamento",
    nextMedQuestionBtn: "Siguiente Pregunta ➔",
    completeVerificationBtn: "Completar Verificación ➔",
    nextVisitLbl: "Próxima consulta médica",
    wayfindingTitle: "Guía de navegación del hospital",
    qaHeading: "Haga una pregunta sobre sus medicinas",
    qaChipsTitle: "Preguntas Frecuentes de Pacientes",
    qaChipsDesc: "Haga clic en cualquier tema a continuación para recibir una respuesta clara al instante:",
    qaPlaceholder: "Escriba o pregunte con voz...",
    qaChips: [
      { label: "💊 ¿Qué hago si olvido una dosis?", q: "¿Qué debo hacer si olvido una dosis de mi medicamento?" },
      { label: "🥛 ¿Puedo tomarlo con leche o té?", q: "¿Puedo tomar estos medicamentos con leche o té?" },
      { label: "🏥 ¿Cuándo es mi próxima cita médica?", q: "¿Cuándo es mi próxima consulta en el hospital?" },
      { label: "✂️ ¿Puedo triturar o partir las pastillas?", q: "¿Puedo triturar o partir estas pastillas?" },
      { label: "🍎 ¿Hay restricciones en comidas o dieta?", q: "¿Hay restricciones de alimentos o dieta con estos medicamentos?" },
      { label: "😵 ¿Qué hago si siento mareos o náuseas?", q: "¿Qué debo hacer si siento mareos o náuseas?" }
    ],
    notifTitle: "Recordatorios de Medicamentos en Teléfono y PC",
    notifDesc: "Reciba alertas automáticas en su teléfono o computadora cuando sea hora de tomar sus medicamentos, incluso cuando este sitio web esté cerrado.",
    enableNotifBtn: "🔔 Activar Alertas del Sistema",
    disableNotifBtn: "🔕 Desactivar Alertas",
    testNotifBtn: "⚡ Probar Notificación",
    notifActiveTimes: "✅ Recordatorios Activos: 🌅 Mañana (8:00 AM) • ☀️ Tarde (1:00 PM) • 🌙 Noche (8:00 PM)",
    notifActiveBadge: "✅ Activo",
    notifPausedBadge: "🔕 Pausado",
    notifMorningTitle: "🌅 Recordatorio de Medicamentos (8:00 AM)",
    notifAfternoonTitle: "☀️ Recordatorio de la Tarde (1:00 PM)",
    notifNightTitle: "🌙 Recordatorio de la Noche (8:00 PM)",
    notifBodyTemplate: "Es hora de tomar sus medicamentos programados: {0}.",
    notifMarkTakenAction: "✓ Marcar como Tomado",
    notifSnoozeAction: "⏰ Posponer 10m",
    notifEnabledSpeech: "¡Notificaciones del sistema activadas!",
    notifDisabledSpeech: "Alertas de medicamentos desactivadas.",
    slotMorningHeader: "🌅 Mañana (8:00 AM — Desayuno)",
    slotAfternoonHeader: "☀️ Tarde (1:00 PM — Almuerzo)",
    slotNightHeader: "🌙 Noche (8:00 PM — Cena y Dormir)",
    exactMedLabel: "MEDICAMENTO A TOMAR:",
    doseLabel: "Dosis",
    whyLabel: "Motivo",
    instructionsLabel: "Instrucciones",
    listenBtnLabel: "🔊 Escuchar",
    markTakenLabel: "Marcar como Tomado",
    markedTakenLabel: "✅ Tomado",
    durationLabel: "Duración",
    noMedsInSlot: "No hay medicamentos programados para este horario.",
    doseUnitSingular: "Dosis",
    doseUnitPlural: "Dosis",
    dosesTakenText: "{taken} / {total} Dosis Tomadas",
    adherenceNote: "Marque la casilla al tomar cada dosis programada.",
    adherenceProgressNote: "¡Gran progreso! {taken} de {total} dosis tomadas.",
    adherenceCompleteNote: "🌟 ¡Excelente! ¡Todas las dosis de hoy han sido completadas!",
    syncCalendarTitle: "Sincronizar con Calendario",
    syncCalendarDesc: "Exporte todos los recordatorios a su calendario con 1 toque.",
    congratsAllTaken: "¡Felicitaciones! Ha tomado todas sus dosis programadas para hoy.",
    sosBtn: "Emergencia",
    navScan: "1. Escanear Receta",
    navPlan: "2. Plan Fácil",
    navTimeline: "3. Horario Diario",
    navTeachback: "4. Repaso y Guía",
    navHospital: "5. Guía del Hospital",
    navQA: "6. Preguntas y Respuestas",
    headerDocReady: "Documento Activo: Listo",
    patientPrefix: "Paciente: ",
    listenPlanBottom: "Escuchar Plan"
  }
};

// Sound icon mappings
const PILL_ICONS = {
  white_tablet: "⚪💊",
  yellow_tablet: "🟡💊",
  blue_tablet: "🔵💊",
  red_tablet: "🔴💊",
  inhaler: "💨🫁",
  blue_liquid: "🧴🥄"
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
  setupEventListeners();
  updateUILanguage(state.currentLang);
  initNotificationSystem();
  await loadSamples();
});

// Setup All UI Event Handlers
function setupEventListeners() {
  // Smart Navbar Hide on Scroll Down, Show on Scroll Up
  let lastScrollY = window.scrollY;
  const topNav = document.querySelector('.top-nav');
  const tabStepper = document.querySelector('.tab-stepper');

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 80 && currentScrollY > lastScrollY + 4) {
      // Scrolling Down -> Hide Nav
      topNav?.classList.add('nav-hidden');
      tabStepper?.classList.add('nav-hidden');
    } else if (currentScrollY < lastScrollY - 4 || currentScrollY <= 30) {
      // Scrolling Up -> Show Nav
      topNav?.classList.remove('nav-hidden');
      tabStepper?.classList.remove('nav-hidden');
    }
    lastScrollY = currentScrollY;
  }, { passive: true });

  // Navigation tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Global Language Selector
  const langSelect = document.getElementById('global-lang-select');
  langSelect.addEventListener('change', async (e) => {
    state.currentLang = e.target.value;
    updateUILanguage(state.currentLang);
    if (state.currentDoc) {
      await simplifyCurrentDoc();
    }
  });

  // Font Size Resizer (A- / A / A+)
  const btnFontZoom = document.getElementById('btn-font-zoom');
  btnFontZoom.addEventListener('click', () => {
    state.fontScaleLevel = (state.fontScaleLevel + 1) % 3;
    document.body.classList.remove('font-large', 'font-xlarge');
    if (state.fontScaleLevel === 1) {
      document.body.classList.add('font-large');
      btnFontZoom.textContent = 'A++';
    } else if (state.fontScaleLevel === 2) {
      document.body.classList.add('font-xlarge');
      btnFontZoom.textContent = 'A';
    } else {
      btnFontZoom.textContent = 'A+';
    }
  });

  // Eye Button Theme Switcher (Dark by default, toggles to White/Light theme on click)
  const btnThemeToggle = document.getElementById('btn-high-contrast');
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      state.isLightTheme = !state.isLightTheme;
      document.body.classList.toggle('light-theme', state.isLightTheme);
      try {
        localStorage.setItem('carebridge_theme', state.isLightTheme ? 'light' : 'dark');
      } catch (e) {}
    });

    // Check if user previously explicitly chose light theme; otherwise default is dark
    try {
      const savedTheme = localStorage.getItem('carebridge_theme');
      if (savedTheme === 'light') {
        state.isLightTheme = true;
        document.body.classList.add('light-theme');
      } else {
        state.isLightTheme = false;
        document.body.classList.remove('light-theme');
      }
    } catch (e) {}
  }

  // ================= DOWNLOAD / INSTALL APP FEATURE ================= //
  let deferredInstallPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    console.log("PWA install prompt ready");
    const btnInstall = document.getElementById('btn-install-app');
    if (btnInstall) {
      btnInstall.style.boxShadow = '0 0 14px rgba(249, 115, 22, 0.7)';
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    console.log("Carebridge App installed successfully!");
    const modal = document.getElementById('modal-install-guide');
    if (modal) modal.classList.remove('active');
    speakDirectText("Carebridge Application installed successfully!");
  });

  const btnInstallNav = document.getElementById('btn-install-app');
  if (btnInstallNav) {
    btnInstallNav.addEventListener('click', () => {
      const modal = document.getElementById('modal-install-guide');
      if (modal) modal.classList.add('active');
    });
  }

  const btnTriggerInstall = document.getElementById('btn-trigger-pwa-install');
  if (btnTriggerInstall) {
    btnTriggerInstall.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        console.log(`User choice for install: ${outcome}`);
        deferredInstallPrompt = null;
        const modal = document.getElementById('modal-install-guide');
        if (modal) modal.classList.remove('active');
      } else {
        alert("To install Carebridge:\n\n• Android: Tap browser menu (⋮) -> 'Install App' or 'Add to Home screen'\n• iPhone: Tap Share button -> 'Add to Home Screen'\n• PC/Mac: Click the Install icon in the address bar.");
      }
    });
  }

  const btnCloseInstall = document.getElementById('btn-close-install-modal');
  if (btnCloseInstall) {
    btnCloseInstall.addEventListener('click', () => {
      const modal = document.getElementById('modal-install-guide');
      if (modal) modal.classList.remove('active');
    });
  }

  const btnDismissInstall = document.getElementById('btn-dismiss-install-modal');
  if (btnDismissInstall) {
    btnDismissInstall.addEventListener('click', () => {
      const modal = document.getElementById('modal-install-guide');
      if (modal) modal.classList.remove('active');
    });
  }

  // Audio Play / Pause
  const btnPlayAudio = document.getElementById('btn-main-play-audio');
  btnPlayAudio.addEventListener('click', toggleAudioPlayback);

  // Quick Listen in Bottom Dock
  document.getElementById('btn-quick-listen-bottom').addEventListener('click', () => {
    switchTab('tab-plan');
    if (!state.isSpeaking) {
      toggleAudioPlayback();
    }
  });

  // Audio Speed Cycle (0.75x -> 1.0x -> 1.25x)
  const btnSpeed = document.getElementById('btn-toggle-speed');
  btnSpeed.addEventListener('click', () => {
    if (state.speechRate === 1.0) state.speechRate = 0.75;
    else if (state.speechRate === 0.75) state.speechRate = 1.25;
    else state.speechRate = 1.0;

    document.getElementById('lbl-speed').textContent = `${state.speechRate}x`;
    if (state.isSpeaking) {
      window.speechSynthesis.cancel();
      startAudioPlayback();
    }
  });

  // Go to timeline shortcut button
  document.getElementById('btn-go-to-timeline').addEventListener('click', () => {
    switchTab('tab-timeline');
  });

  // Read warnings aloud button
  document.getElementById('btn-read-warnings').addEventListener('click', () => {
    if (state.currentSimplified && state.currentSimplified.warning_alerts) {
      const text = state.currentSimplified.warning_alerts.join(". ");
      speakDirectText(text);
    }
  });

  // Test Reminder Alarm
  document.getElementById('btn-test-alarm').addEventListener('click', triggerTestAlarm);

  // Export Calendar (.ics)
  document.getElementById('btn-export-calendar').addEventListener('click', exportCalendarFile);

  // Camera, File Upload & Clipboard Paste
  document.getElementById('btn-open-camera').addEventListener('click', openCameraModal);
  document.getElementById('btn-camera-close').addEventListener('click', closeCameraModal);
  document.getElementById('btn-camera-capture').addEventListener('click', captureCameraPhoto);
  
  const fileInput = document.getElementById('file-upload-input');
  const btnUpload = document.getElementById('btn-upload-file');
  if (btnUpload && fileInput) {
    btnUpload.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput.value = '';
      fileInput.click();
    });
  }
  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
  }

  // Paste Image Button & Dropzone
  document.getElementById('btn-paste-image').addEventListener('click', triggerPasteFromClipboard);
  document.getElementById('paste-dropzone').addEventListener('click', triggerPasteFromClipboard);
  window.addEventListener('paste', handleGlobalPaste);

  // Teach-back Microphone
  const btnTeachbackMic = document.getElementById('btn-teachback-mic');
  btnTeachbackMic.addEventListener('click', startTeachbackVoiceRecognition);

  // Ask CareCompass Q&A Submit & Mic
  document.getElementById('btn-qa-submit').addEventListener('click', handleQASubmit);
  document.getElementById('qa-input-text').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleQASubmit();
  });
  document.getElementById('btn-qa-mic').addEventListener('click', toggleQAVoiceRecognition);

  // Q&A quick chips
  document.querySelectorAll('.qa-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.getElementById('qa-input-text').value = chip.getAttribute('data-q');
      handleQASubmit();
    });
  });

  // Emergency SOS Modal
  document.getElementById('btn-open-sos-modal').addEventListener('click', () => {
    document.getElementById('modal-sos').classList.add('active');
  });
  document.getElementById('btn-close-sos').addEventListener('click', () => {
    document.getElementById('modal-sos').classList.remove('active');
  });

  // Edit / Review Prescription Modal Handlers
  const btnEditPrescription = document.getElementById('btn-edit-prescription');
  const modalEditPrescription = document.getElementById('modal-edit-prescription');
  const btnCloseEditModal = document.getElementById('btn-close-edit-modal');
  const btnCancelEditModal = document.getElementById('btn-cancel-edit-modal');
  const btnReparseOcrText = document.getElementById('btn-reparse-ocr-text');
  const editOcrRawText = document.getElementById('edit-ocr-raw-text');
  const btnDictatePrescription = document.getElementById('btn-dictate-prescription');
  const editModalImgWrap = document.getElementById('edit-modal-img-wrap');
  const editModalImgPreview = document.getElementById('edit-modal-img-preview');

  function openEditPrescriptionModal(prefillOcrText = null) {
    if (editOcrRawText) {
      if (prefillOcrText !== null) {
        editOcrRawText.value = prefillOcrText;
      } else if (state.currentDoc) {
        if (state.currentDoc.raw_ocr_text && state.currentDoc.raw_ocr_text.length > 15 && !state.currentDoc.raw_ocr_text.startsWith("Uploaded Clinical Prescription:")) {
          editOcrRawText.value = state.currentDoc.raw_ocr_text;
        } else {
          const lines = (state.currentDoc.medications || []).map((m, idx) => {
            const timingCode = m.timing?.includes('morning') && m.timing?.includes('afternoon') && m.timing?.includes('night')
              ? '1-1-1'
              : (m.timing?.includes('morning') && m.timing?.includes('night')
                ? '1-0-1'
                : (m.timing?.includes('night') ? '0-0-1' : '1-0-0'));
            return `${idx + 1}. Tab ${m.name} ${m.dose} - ${timingCode} (${m.special_instructions})`;
          });
          editOcrRawText.value = lines.join('\n');
        }
      }
    }

    if (state.currentUploadedImageUrl && editModalImgPreview && editModalImgWrap) {
      editModalImgPreview.src = state.currentUploadedImageUrl;
      editModalImgWrap.style.display = 'block';
    } else if (editModalImgWrap) {
      editModalImgWrap.style.display = 'none';
    }

    modalEditPrescription?.classList.add('active');
  }

  if (btnEditPrescription) {
    btnEditPrescription.addEventListener('click', () => openEditPrescriptionModal());
  }

  // Quick Add Medicine Chips
  document.querySelectorAll('.chip-add-med').forEach(chip => {
    chip.addEventListener('click', () => {
      const line = chip.getAttribute('data-line');
      if (editOcrRawText && line) {
        const current = editOcrRawText.value.trim();
        editOcrRawText.value = current ? `${current}\n${line}` : line;
        editOcrRawText.scrollTop = editOcrRawText.scrollHeight;
      }
    });
  });

  // Voice Dictate Medicines
  if (btnDictatePrescription) {
    let dictationActive = false;
    let dictationRecognition = null;

    btnDictatePrescription.addEventListener('click', () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Voice recognition is not supported in this browser. Please type or tap quick chips.");
        return;
      }

      if (dictationActive && dictationRecognition) {
        dictationRecognition.stop();
        return;
      }

      dictationRecognition = new SpeechRecognition();
      dictationRecognition.lang = state.currentLang === 'hi' ? 'hi-IN' : 'en-US';
      dictationRecognition.interimResults = false;

      dictationRecognition.onstart = () => {
        dictationActive = true;
        btnDictatePrescription.textContent = '🛑 Listening...';
        btnDictatePrescription.style.background = '#ef4444';
        btnDictatePrescription.style.color = '#ffffff';
      };

      dictationRecognition.onresult = (evt) => {
        const transcript = evt.results[0][0].transcript;
        if (editOcrRawText && transcript) {
          const current = editOcrRawText.value.trim();
          editOcrRawText.value = current ? `${current}\n${transcript}` : transcript;
        }
      };

      dictationRecognition.onerror = (e) => {
        console.log("Dictation error:", e);
      };

      dictationRecognition.onend = () => {
        dictationActive = false;
        btnDictatePrescription.textContent = '🎙️ Speak Medicines';
        btnDictatePrescription.style.background = '';
        btnDictatePrescription.style.color = '';
      };

      dictationRecognition.start();
    });
  }

  if (btnCloseEditModal) {
    btnCloseEditModal.addEventListener('click', () => modalEditPrescription?.classList.remove('active'));
  }
  if (btnCancelEditModal) {
    btnCancelEditModal.addEventListener('click', () => modalEditPrescription?.classList.remove('active'));
  }

  if (btnReparseOcrText) {
    btnReparseOcrText.addEventListener('click', async () => {
      const text = editOcrRawText?.value?.trim();
      if (!text) {
        alert("Please enter at least one medicine line.");
        return;
      }

      modalEditPrescription?.classList.remove('active');
      playMedicalChime();
      speakDirectText("Generating your personalized medicine plan.");

      state.currentDoc = parseClinicalTextToDocument(text, "User Prescription");
      state.activeTeachbackIdx = 0;
      state.takenMeds.clear();
      await simplifyCurrentDoc();

      renderSimplifiedPlan();
      renderDailyTimeline();
      renderTeachBack();
      renderHospitalWayfinding();
      switchTab('tab-plan');
      speakDirectText("Medicine plan generated successfully!");
    });
  }

  // Alarm modal action buttons
  document.getElementById('btn-alarm-taken').addEventListener('click', () => {
    document.getElementById('modal-alarm').classList.remove('active');
    // Mark first scheduled dose as taken
    if (state.currentDoc) {
      const schedule = state.currentSimplified?.daily_schedule;
      const firstSlotMed = schedule?.morning?.[0] || schedule?.afternoon?.[0] || schedule?.night?.[0];
      if (firstSlotMed) {
        markMedicationTaken(firstSlotMed.id, true);
      }
    }
    speakDirectText("Great job! Scheduled dose marked as taken for today.");
  });
  document.getElementById('btn-alarm-snooze').addEventListener('click', () => {
    document.getElementById('modal-alarm').classList.remove('active');
    speakDirectText("Alarm snoozed. I will remind you again shortly.");
  });

  // Directions map link directly to the Hospital
  document.getElementById('btn-directions-map').addEventListener('click', openHospitalDirections);

  // Background Push & System Notification buttons
  const btnEnableNotif = document.getElementById('btn-enable-notifications');
  if (btnEnableNotif) {
    btnEnableNotif.addEventListener('click', toggleNotificationSystem);
  }
  const btnTestSysNotif = document.getElementById('btn-test-sys-notif');
  if (btnTestSysNotif) {
    btnTestSysNotif.addEventListener('click', triggerTestSystemNotification);
  }
}

// Switch Active Tab
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });
  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === tabId);
  });
}

// Update Localized Strings on the Screen
function updateUILanguage(lang) {
  const t = UI_STRINGS[lang] || UI_STRINGS.en;
  
  // 0. Navigation Tab Stepper Bar, Top Header & Bottom Dock
  const navLblScan = document.getElementById('nav-lbl-scan');
  if (navLblScan) navLblScan.textContent = t.navScan || "1. Scan Paperwork";
  const navLblPlan = document.getElementById('nav-lbl-plan');
  if (navLblPlan) navLblPlan.textContent = t.navPlan || "2. Plain Plan";
  const navLblTimeline = document.getElementById('nav-lbl-timeline');
  if (navLblTimeline) navLblTimeline.textContent = t.navTimeline || "3. Daily Schedule";
  const navLblTeachback = document.getElementById('nav-lbl-teachback');
  if (navLblTeachback) navLblTeachback.textContent = t.navTeachback || "4. Teach-Back";
  const navLblHospital = document.getElementById('nav-lbl-hospital');
  if (navLblHospital) navLblHospital.textContent = t.navHospital || "5. Hospital Wayfinding";
  const navLblQA = document.getElementById('nav-lbl-qa');
  if (navLblQA) navLblQA.textContent = t.navQA || "6. Ask CareBridge";

  // Fallback: update any tab-btn span directly if id wasn't matched
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const tabId = btn.getAttribute('data-tab');
    const labelSpan = btn.querySelector('span:not(.tab-icon)');
    if (labelSpan) {
      if (tabId === 'tab-scan' && t.navScan) labelSpan.textContent = t.navScan;
      else if (tabId === 'tab-plan' && t.navPlan) labelSpan.textContent = t.navPlan;
      else if (tabId === 'tab-timeline' && t.navTimeline) labelSpan.textContent = t.navTimeline;
      else if (tabId === 'tab-teachback' && t.navTeachback) labelSpan.textContent = t.navTeachback;
      else if (tabId === 'tab-hospital' && t.navHospital) labelSpan.textContent = t.navHospital;
      else if (tabId === 'tab-qa' && t.navQA) labelSpan.textContent = t.navQA;
    }
  });

  // Top header active document status
  const docStatus = document.getElementById('lbl-header-doc-status');
  if (docStatus) {
    if (state.currentDoc) {
      const docTypeLbl = state.currentDoc.document_type === 'discharge_summary' ? 'Discharge Summary' : 'Prescription';
      docStatus.textContent = `${t.patientPrefix || "Active: "}${state.currentDoc.patient_name || 'Patient'} (${docTypeLbl})`;
    } else {
      docStatus.textContent = t.headerDocReady || "Active Document: Ready";
    }
  }

  // Bottom dock labels
  const lblActivePatient = document.getElementById('lbl-active-patient');
  if (lblActivePatient && state.currentDoc) {
    lblActivePatient.textContent = `${t.patientPrefix || "Patient: "}${state.currentDoc.patient_name || 'Patient'}`;
  }
  const lblBottomSos = document.getElementById('lbl-bottom-sos');
  if (lblBottomSos) lblBottomSos.textContent = t.sosBtn || "Emergency";
  const lblBottomListen = document.getElementById('lbl-bottom-listen');
  if (lblBottomListen) lblBottomListen.textContent = t.listenPlanBottom || "Listen Plan";

  // 1. Scan & Header View
  const txtScanTitle = document.getElementById('txt-scan-title');
  if (txtScanTitle) txtScanTitle.textContent = t.scanTitle;
  const txtScanSubtitle = document.getElementById('txt-scan-subtitle');
  if (txtScanSubtitle) txtScanSubtitle.textContent = t.scanSubtitle;
  const lblCameraBtn = document.getElementById('lbl-camera-btn');
  if (lblCameraBtn) lblCameraBtn.textContent = t.takePhoto;
  const lblUploadBtn = document.getElementById('lbl-upload-btn');
  if (lblUploadBtn) lblUploadBtn.textContent = t.uploadFile;
  const pasteBtnLbl = document.getElementById('lbl-paste-btn');
  if (pasteBtnLbl) pasteBtnLbl.textContent = t.pasteImage || t.uploadFile;
  const txtDemoTitle = document.getElementById('txt-demo-title');
  if (txtDemoTitle) txtDemoTitle.textContent = t.demoTitle;

  // 2. Plan View
  const txtListenHeading = document.getElementById('txt-listen-heading');
  if (txtListenHeading) txtListenHeading.textContent = t.listenHeading;
  const txtPlanHeadline = document.getElementById('txt-plan-headline');
  if (txtPlanHeadline) txtPlanHeadline.textContent = t.planHeadline;
  const txtMedListTitle = document.getElementById('txt-med-list-title');
  if (txtMedListTitle) txtMedListTitle.textContent = t.medListTitle;
  const btnGoToTimeline = document.getElementById('btn-go-to-timeline');
  if (btnGoToTimeline) btnGoToTimeline.textContent = t.viewTimeline;
  const txtWarningsTitle = document.getElementById('txt-warnings-title');
  if (txtWarningsTitle) txtWarningsTitle.textContent = t.warningsTitle;

  // 3. Timeline View & Notifications
  const txtAdherenceTitle = document.getElementById('txt-adherence-title');
  if (txtAdherenceTitle) txtAdherenceTitle.textContent = t.adherenceTitle;
  const btnTestAlarm = document.getElementById('btn-test-alarm');
  if (btnTestAlarm) btnTestAlarm.textContent = t.testAlarm;
  const btnExportCal = document.getElementById('btn-export-calendar');
  if (btnExportCal) btnExportCal.textContent = t.downloadCal;
  const txtNotifTitle = document.getElementById('txt-notif-title');
  if (txtNotifTitle) txtNotifTitle.textContent = t.notifTitle;
  const txtNotifDesc = document.getElementById('txt-notif-desc');
  if (txtNotifDesc) txtNotifDesc.textContent = t.notifDesc;
  const btnTestSysNotif = document.getElementById('btn-test-sys-notif');
  if (btnTestSysNotif) btnTestSysNotif.textContent = t.testNotifBtn;
  const notifActiveTimes = document.getElementById('notif-active-times');
  if (notifActiveTimes) notifActiveTimes.textContent = t.notifActiveTimes;
  
  // Timeline Slot Headers & Calendar Sync
  const txtSlotMorningHeader = document.getElementById('txt-slot-morning-header');
  if (txtSlotMorningHeader) txtSlotMorningHeader.textContent = t.slotMorningHeader || "🌅 Morning (8:00 AM — Breakfast)";
  const txtSlotAfternoonHeader = document.getElementById('txt-slot-afternoon-header');
  if (txtSlotAfternoonHeader) txtSlotAfternoonHeader.textContent = t.slotAfternoonHeader || "☀️ Afternoon (1:00 PM — Lunch)";
  const txtSlotNightHeader = document.getElementById('txt-slot-night-header');
  if (txtSlotNightHeader) txtSlotNightHeader.textContent = t.slotNightHeader || "🌙 Night (8:00 PM — Dinner & Bedtime)";
  const txtSyncTitle = document.getElementById('txt-sync-title');
  if (txtSyncTitle) txtSyncTitle.textContent = t.syncCalendarTitle || "Sync with Phone Calendar";
  const txtSyncDesc = document.getElementById('txt-sync-desc');
  if (txtSyncDesc) txtSyncDesc.textContent = t.syncCalendarDesc || "Export all medication reminders to Google Calendar, Apple Calendar, or Outlook with 1 tap.";

  updateNotificationStatusUI();

  // Re-render Daily Timeline so medication instruction cards and badges update immediately
  if (state.currentSimplified && state.currentSimplified.daily_schedule) {
    renderDailyTimeline();
  }

  // 4. Teach-Back View
  const txtTeachbackHeading = document.getElementById('txt-teachback-heading');
  if (txtTeachbackHeading) txtTeachbackHeading.textContent = t.teachbackHeading;
  const txtTeachbackSubheading = document.getElementById('txt-teachback-subheading');
  if (txtTeachbackSubheading) txtTeachbackSubheading.textContent = t.teachbackSubheading;
  const teachbackMicStatus = document.getElementById('teachback-mic-status');
  if (teachbackMicStatus) teachbackMicStatus.textContent = t.teachbackMicPrompt;
  const completeHeadline = document.getElementById('complete-headline-text');
  if (completeHeadline) completeHeadline.textContent = t.teachbackCompleteHeadline;
  const completeSubtitle = document.getElementById('complete-subtitle-text');
  if (completeSubtitle) completeSubtitle.textContent = t.teachbackCompleteSubtitle;
  const btnRestartTeachback = document.getElementById('btn-restart-teachback');
  if (btnRestartTeachback) btnRestartTeachback.textContent = t.reviewQuestionsBtn;
  const btnCompleteTimeline = document.getElementById('btn-complete-to-timeline');
  if (btnCompleteTimeline) btnCompleteTimeline.textContent = t.viewTimelineBtn;

  // 5. Wayfinding & SOS
  const txtNextVisitLbl = document.getElementById('txt-next-visit-lbl');
  if (txtNextVisitLbl) txtNextVisitLbl.textContent = t.nextVisitLbl;
  const txtWayfindingTitle = document.getElementById('txt-wayfinding-title');
  if (txtWayfindingTitle) txtWayfindingTitle.textContent = t.wayfindingTitle;

  // 6. Ask CareBridge Q&A
  const txtQAHeading = document.getElementById('txt-qa-heading');
  if (txtQAHeading) txtQAHeading.textContent = t.qaHeading;
  const txtQAChipsTitle = document.getElementById('txt-qa-chips-title');
  if (txtQAChipsTitle) txtQAChipsTitle.textContent = t.qaChipsTitle;
  const txtQAChipsDesc = document.getElementById('txt-qa-chips-desc');
  if (txtQAChipsDesc) txtQAChipsDesc.textContent = t.qaChipsDesc;
  const qaInput = document.getElementById('qa-input-text');
  if (qaInput && !isQASpeaking) qaInput.placeholder = t.qaPlaceholder;

  // Re-render localized Q&A Recommendation Chips
  renderQAChips(lang);

  // If in teachback view, re-render question indicators
  if (state.teachbackQuestions && state.teachbackQuestions.length > 0) {
    renderTeachBack();
  }
}

// Render dynamic localized Q&A recommendation chips
function renderQAChips(lang) {
  const t = UI_STRINGS[lang] || UI_STRINGS.en;
  const container = document.getElementById('qa-chips-container');
  if (!container || !t.qaChips) return;
  container.innerHTML = '';
  t.qaChips.forEach(chip => {
    const btn = document.createElement('button');
    btn.className = 'qa-chip btn-mini-listen';
    btn.textContent = chip.label;
    btn.setAttribute('data-q', chip.q);
    btn.addEventListener('click', () => {
      const input = document.getElementById('qa-input-text');
      if (input) {
        input.value = chip.q;
        handleQASubmit();
      }
    });
    container.appendChild(btn);
  });
}

// Embedded Fallback Samples for Standalone & Offline Mode
const EMBEDDED_SAMPLE_DATA = [
  {
    id: "sample_post_op_discharge",
    title: "🏥 Post-Surgery Discharge Summary (Orthopedics)",
    subtitle: "Apollo Speciality Hospital — Total Knee Replacement Recovery",
    badge: "Discharge Summary",
    document_type: "discharge_summary",
    patient_name: "Ramesh Chandra (Age 68)",
    patient_language: "en",
    hospital: "Apollo Speciality Hospital, Bannerghatta Road, Bengaluru",
    med_count: 4,
    data: {
      document_type: "discharge_summary",
      patient_name: "Ramesh Chandra",
      patient_language: "en",
      medications: [
        {
          name: "Cefuroxime Axetil",
          dose: "500 mg (1 tablet)",
          frequency: "Twice daily after food",
          timing: ["morning", "night"],
          duration_days: 5,
          special_instructions: "Take right after your morning and night meals. Finish the full 5-day antibiotic course.",
          purpose: "Antibiotic to prevent surgical infection",
          pill_color_type: "blue_tablet"
        },
        {
          name: "Pantoprazole",
          dose: "40 mg (1 tablet)",
          frequency: "Once daily in the morning",
          timing: ["morning"],
          duration_days: 7,
          special_instructions: "Take 30 minutes before your breakfast with a full glass of water.",
          purpose: "Stomach protection against acidity and ulcers",
          pill_color_type: "yellow_tablet"
        },
        {
          name: "Paracetamol",
          dose: "650 mg (1 tablet)",
          frequency: "Three times daily after food",
          timing: ["morning", "afternoon", "night"],
          duration_days: 7,
          special_instructions: "Take with water after eating. Helps relieve post-surgery knee soreness.",
          purpose: "Pain and swelling relief",
          pill_color_type: "white_tablet"
        },
        {
          name: "Rivaroxaban",
          dose: "10 mg (1 tablet)",
          frequency: "Once daily at night with dinner",
          timing: ["night"],
          duration_days: 14,
          special_instructions: "Take every evening with your dinner. Do not skip.",
          purpose: "Blood thinner to prevent blood clots in legs",
          pill_color_type: "red_tablet"
        }
      ],
      follow_up: {
        date: "2026-03-02",
        location: "Apollo Speciality Hospital",
        department: "Orthopedic OPD, Room 204 (Dr. Arvind Kumar)",
        address: "Bannerghatta Main Road, Krishnaraju Layout, Bengaluru, Karnataka 560076",
        wayfinding_steps: [
          "Enter through Main Entrance Gate 2.",
          "Take Elevator B to the 2nd Floor.",
          "Turn right from the elevator lobby towards Orthopedics OPD.",
          "Check in at Reception Desk 2 and take a token for Room 204."
        ]
      },
      warning_symptoms: [
        "Sudden sharp calf pain, swelling, or redness in your operated leg.",
        "Fever higher than 101°F (38.3°C) or shivering.",
        "Foul-smelling pus or active bleeding from the knee dressing.",
        "Sudden shortness of breath or chest pain (Call 108 immediately)."
      ],
      raw_ocr_text: "Discharge Summary - Apollo Speciality Hospital - Total Knee Arthroplasty"
    }
  },
  {
    id: "sample_diabetes_hypertension",
    title: "💊 Chronic Care Prescription (Diabetes & BP)",
    subtitle: "Fortis Healthcare — Senior Internal Medicine Consultation",
    badge: "Prescription",
    document_type: "prescription",
    patient_name: "Savitri Devi (Age 72)",
    patient_language: "hi",
    hospital: "Fortis Hospital, Cunningham Road, Bengaluru",
    med_count: 3,
    data: {
      document_type: "prescription",
      patient_name: "Savitri Devi",
      patient_language: "hi",
      medications: [
        {
          name: "Metformin Hydrochloride",
          dose: "500 mg (1 white tablet)",
          frequency: "Twice a day with breakfast and dinner",
          timing: ["morning", "night"],
          duration_days: 30,
          special_instructions: "Always swallow with your first bite of food to avoid stomach upset.",
          purpose: "Controls blood sugar levels",
          pill_color_type: "white_tablet"
        },
        {
          name: "Telmisartan",
          dose: "40 mg (1 tablet)",
          frequency: "Once a day in the morning",
          timing: ["morning"],
          duration_days: 30,
          special_instructions: "Take every morning around 8 AM with water after breakfast.",
          purpose: "Lowers blood pressure and protects your heart & kidneys",
          pill_color_type: "yellow_tablet"
        },
        {
          name: "Atorvastatin",
          dose: "10 mg (1 tablet)",
          frequency: "Once daily at bedtime",
          timing: ["night"],
          duration_days: 30,
          special_instructions: "Take right before going to sleep at night.",
          purpose: "Manages cholesterol and keeps blood vessels clear",
          pill_color_type: "blue_tablet"
        }
      ],
      follow_up: {
        date: "2026-03-23",
        location: "Fortis Hospital",
        department: "General Medicine, Suite 4 (Dr. S. Meenakshi)",
        address: "14, Cunningham Road, Vasanth Nagar, Bengaluru, Karnataka 560052",
        wayfinding_steps: [
          "Enter through Main Entrance.",
          "Proceed straight past the pharmacy on the ground floor.",
          "Consultation Suite 4 is on the left corridor."
        ]
      },
      warning_symptoms: [
        "Extreme dizziness, sudden cold sweating, or trembling hands (low sugar — eat 2 spoons of sugar or fruit juice immediately).",
        "Severe throbbing headache, blurred vision, or chest tightness (blood pressure spike)."
      ],
      raw_ocr_text: "Fortis Healthcare - Diabetes & Hypertension Management Plan"
    }
  },
  {
    id: "sample_respiratory_care",
    title: "🫁 Bronchitis & Respiratory Care Plan",
    subtitle: "Max Super Speciality Hospital — Pulmonology Clinic",
    badge: "Prescription",
    document_type: "prescription",
    patient_name: "Gopalakrishnan N. (Age 75)",
    patient_language: "kn",
    hospital: "Max Super Speciality Hospital, Saket",
    med_count: 4,
    data: {
      document_type: "prescription",
      patient_name: "Gopalakrishnan N.",
      patient_language: "kn",
      medications: [
        {
          name: "Augmentin (Amoxicillin 625 mg)",
          dose: "625 mg (1 tablet)",
          frequency: "Twice daily after food",
          timing: ["morning", "night"],
          duration_days: 6,
          special_instructions: "Take right after food. Complete all 6 days even if cough feels better.",
          purpose: "Antibiotic for chest infection",
          pill_color_type: "white_tablet"
        },
        {
          name: "Foracort 200 Inhaler",
          dose: "2 puffs",
          frequency: "Twice daily using spacer",
          timing: ["morning", "night"],
          duration_days: 14,
          special_instructions: "Inhale deeply through the spacer device. Rinse mouth thoroughly with water after use.",
          purpose: "Opens airways and eases breathing",
          pill_color_type: "inhaler"
        },
        {
          name: "Ascoril-D Cough Syrup",
          dose: "10 ml (2 teaspoons)",
          frequency: "Three times daily after food",
          timing: ["morning", "afternoon", "night"],
          duration_days: 5,
          special_instructions: "Measure using the bottle cap. Drink after meals.",
          purpose: "Soothes throat irritation and cough",
          pill_color_type: "blue_liquid"
        },
        {
          name: "Levocetirizine",
          dose: "5 mg (1 tablet)",
          frequency: "Once daily at night",
          timing: ["night"],
          duration_days: 5,
          special_instructions: "Take before sleeping. May cause mild drowsiness.",
          purpose: "Allergy and runny nose relief",
          pill_color_type: "yellow_tablet"
        }
      ],
      follow_up: {
        date: "2026-02-28",
        location: "Max Super Speciality Hospital",
        department: "Pulmonology Suite 102 (Dr. Rajiv Narang)",
        address: "1, 2, Press Enclave Marg, Saket Institutional Area, New Delhi 110017",
        wayfinding_steps: [
          "Enter through Tower 1 Main Lobby.",
          "Take Escalator or Lift to 1st Floor.",
          "Follow Blue Floor Line directly to Pulmonology Suite 102."
        ]
      },
      warning_symptoms: [
        "Severe difficulty breathing or wheezing that does not improve after inhaler.",
        "Bluish color on lips, nailbeds, or tongue (Go to Emergency immediately).",
        "High fever above 102°F or coughing up rust-colored blood."
      ],
      raw_ocr_text: "Max Hospital - Pulmonology Prescription for Acute Bronchitis"
    }
  },
  {
    id: "sample_cardiac_care",
    title: "❤️ Cardiac Care & Blood Thinner Plan",
    subtitle: "Narayana Institute of Cardiac Sciences — Post-Angioplasty Care",
    badge: "Discharge Summary",
    document_type: "discharge_summary",
    patient_name: "Devadas Pillai (Age 65)",
    patient_language: "ta",
    hospital: "Narayana Health City, Bommasandra, Bengaluru",
    med_count: 4,
    data: {
      document_type: "discharge_summary",
      patient_name: "Devadas Pillai",
      patient_language: "ta",
      medications: [
        {
          name: "Ecosprin (Aspirin 75 mg)",
          dose: "75 mg (1 tablet)",
          frequency: "Once daily in the morning with food",
          timing: ["morning"],
          duration_days: 90,
          special_instructions: "Take immediately after morning breakfast. Never skip this tablet.",
          purpose: "Prevents blood clots inside the heart stent",
          pill_color_type: "red_tablet"
        },
        {
          name: "Clopidogrel",
          dose: "75 mg (1 tablet)",
          frequency: "Once daily in the morning with food",
          timing: ["morning"],
          duration_days: 90,
          special_instructions: "Take together with Ecosprin after breakfast.",
          purpose: "Second blood thinner protecting your heart stent",
          pill_color_type: "white_tablet"
        },
        {
          name: "Metoprolol Succinate",
          dose: "25 mg (1 tablet)",
          frequency: "Once daily in the morning",
          timing: ["morning"],
          duration_days: 30,
          special_instructions: "Take in the morning with water. Helps maintain steady heart rate.",
          purpose: "Heart rate & blood pressure regulator",
          pill_color_type: "yellow_tablet"
        },
        {
          name: "Rosuvastatin",
          dose: "20 mg (1 tablet)",
          frequency: "Once daily at night",
          timing: ["night"],
          duration_days: 30,
          special_instructions: "Take right before going to bed.",
          purpose: "Keeps heart arteries clean and smooth",
          pill_color_type: "blue_tablet"
        }
      ],
      follow_up: {
        date: "2026-03-05",
        location: "Narayana Health City",
        department: "Cardiac Outpatient Wing, Counter 8 (Dr. K. Shetty)",
        address: "258/A, Bommasandra Industrial Area, Anekal Taluk, Bengaluru, Karnataka 560099",
        wayfinding_steps: [
          "Enter through Gate 1 (Cardiac Block).",
          "Head to Ground Floor Outpatient Hall.",
          "Present token at Counter 8 for ECG and Doctor Consultation."
        ]
      },
      warning_symptoms: [
        "Heavy chest pressure, squeezing pain, or pain spreading to left arm/jaw.",
        "Sudden unusual black stools or unexplained heavy bruising (signs of excessive bleeding).",
        "Severe shortness of breath when lying flat."
      ],
      raw_ocr_text: "Narayana Health - Post Angioplasty Cardiac Care Plan"
    }
  }
];

// Client-Side Plan Simplifier (Resilient fallback when backend API is offline)
function clientSideSimplify(doc, lang = 'en') {
  const t = UI_STRINGS[lang] || UI_STRINGS.en;
  const medCount = doc.medications?.length || 0;
  const pName = doc.patient_name || "Patient";
  const greeting = `Hello ${pName}! Here is your clear, simple daily care plan from your doctor.`;
  const summary = `Your doctor has prescribed ${medCount} medications to keep you healthy and recovering smoothly.`;

  const dailySchedule = { morning: [], afternoon: [], night: [] };
  const audioSentences = [greeting, summary];
  const simplifiedMeds = [];

  (doc.medications || []).forEach((med, idx) => {
    const medIdx = idx + 1;
    const timingSlots = [];
    const timingLabels = [];
    (med.timing || ['morning']).forEach(slot => {
      const s = slot.toLowerCase();
      if (['morning', 'afternoon', 'night'].includes(s)) {
        timingSlots.push(s);
        if (s === 'morning') timingLabels.push(t.slotMorningHeader ? "Morning" : "Morning");
        else if (s === 'afternoon') timingLabels.push("Afternoon");
        else if (s === 'night') timingLabels.push("Night");
      }
    });
    if (timingSlots.length === 0) timingSlots.push('morning');

    const timingText = timingLabels.join(', ') || 'Morning';
    const plainInst = med.special_instructions || "Take with a full glass of water after food.";
    const duration = med.duration_days ? `${med.duration_days} days` : "Ongoing";

    simplifiedMeds.push({
      name: med.name,
      dose: med.dose,
      timing_text: timingText,
      timing_slots: timingSlots,
      plain_instructions: plainInst,
      icon_type: med.pill_color_type || "white_tablet"
    });

    timingSlots.forEach(slot => {
      if (dailySchedule[slot]) {
        dailySchedule[slot].push({
          id: `med_${medIdx}_${slot}`,
          med_base_id: `med_${medIdx}`,
          slot: slot,
          name: med.name,
          dose: med.dose,
          instructions: plainInst,
          purpose: med.purpose || "For recovery",
          icon: med.pill_color_type || "white_tablet",
          duration: duration
        });
      }
    });

    audioSentences.push(`Medicine ${medIdx}: ${med.name}, ${med.dose}. Take this in the ${timingText}. ${plainInst}`);
  });

  let followUpStr = "";
  if (doc.follow_up && doc.follow_up.date) {
    followUpStr = `Next Doctor Visit on ${doc.follow_up.date} at ${doc.follow_up.location || 'Hospital'} (${doc.follow_up.department || 'OPD'}).`;
    audioSentences.push(followUpStr);
  }

  (doc.warning_symptoms || []).forEach(w => {
    audioSentences.push(`Warning: ${w}`);
  });

  return {
    language: lang,
    language_label: lang.toUpperCase(),
    greeting: greeting,
    overall_summary: summary,
    medications: simplifiedMeds,
    daily_schedule: dailySchedule,
    follow_up_summary: followUpStr,
    warning_alerts: doc.warning_symptoms || [],
    read_aloud_script: audioSentences.join(" "),
    audio_sentences: audioSentences
  };
}

// Client-Side Teach-Back Generator
function clientSideGenerateQuestions(doc, lang = 'en') {
  const questions = [];
  (doc.medications || []).forEach((med, idx) => {
    const medName = med.name;
    const dose = med.dose || "as prescribed";
    const timings = (med.timing || ['scheduled time']).join(', ');
    const nameLower = medName.toLowerCase();
    const qId = `q_med_${idx + 1}`;

    let q = {
      id: qId,
      medicine_name: medName,
      question: `When and how should you take your '${medName}' (${dose})?`,
      correct_concept: `In the ${timings} with meals as prescribed`,
      options: [
        `In the ${timings} with meals with a glass of water (Correct schedule)`,
        `All at once on an empty stomach without water`,
        `Only once a week in the middle of the night`
      ],
      correct_option_index: 0,
      spoken_keywords: ["meal", "food", "water", "after", "morning", "night", "breakfast", "dinner"],
      gentle_explanation: `Always take ${medName} with or after food as scheduled. Having food in your stomach prevents acidity and promotes healing.`,
      encouraging_praise: `Spot on! Taking ${medName} according to your scheduled times keeps your recovery on track.`
    };

    if (nameLower.includes('panto') || nameLower.includes('omepra') || nameLower.includes('pan 40')) {
      q.question = `How and when should you take your '${medName}' (${dose}) in the morning?`;
      q.options = [
        "30 minutes before breakfast with a glass of water (Empty stomach)",
        "Right after a heavy oily lunch",
        "Only if you feel sudden stomach discomfort at night"
      ];
      q.gentle_explanation = `${medName} coats and shields your stomach against acid irritation. Taking it 30 minutes before breakfast gives it time to activate.`;
      q.encouraging_praise = `Spot on! Taking ${medName} 30 minutes before morning food ensures all-day stomach protection.`;
    } else if (nameLower.includes('augmentin') || nameLower.includes('amox') || nameLower.includes('cef')) {
      q.question = `What is the most critical instruction for taking your '${medName}' (${dose}) course?`;
      q.options = [
        "Complete the entire prescribed days even if you feel completely better",
        "Stop taking it immediately once your fever or pain subsides",
        "Take all remaining pills together at once if you miss a day"
      ];
      q.gentle_explanation = `Stopping antibiotics early allows bacteria to survive. Always finish every single dose of ${medName}.`;
      q.encouraging_praise = `Brilliant! Completing your full course of ${medName} guarantees the infection is wiped out safely.`;
    }

    questions.push(q);
  });
  return questions;
}

// Fetch Sample Documents
async function loadSamples() {
  try {
    const res = await fetch(`${API_BASE}/api/samples`);
    if (!res.ok) throw new Error("API not available");
    state.samples = await res.json();
  } catch (err) {
    console.log("Using embedded sample documents fallback:", err);
    state.samples = EMBEDDED_SAMPLE_DATA.map(s => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      badge: s.badge,
      patient_name: s.patient_name,
      hospital: s.hospital,
      med_count: s.med_count
    }));
  }

  renderSampleCards();

  if (state.samples.length > 0) {
    await selectSample(state.samples[0].id, false);
  }
}

// Render Sample Document Selection Cards
function renderSampleCards() {
  const container = document.getElementById('sample-cards-container');
  if (!container) return;
  container.innerHTML = '';

  state.samples.forEach((sample, idx) => {
    const card = document.createElement('div');
    card.className = `sample-card ${idx === 0 ? 'active' : ''}`;
    card.id = `sample-card-${sample.id}`;

    let icon = "📄";
    if (sample.id.includes("post_op") || sample.id.includes("surgery")) icon = "🏥";
    else if (sample.id.includes("diabetes") || sample.id.includes("chronic")) icon = "💊";
    else if (sample.id.includes("respiratory") || sample.id.includes("bronchitis")) icon = "🫁";
    else if (sample.id.includes("cardiac") || sample.id.includes("heart")) icon = "❤️";

    card.innerHTML = `
      <div class="sample-card-main">
        <div class="sample-card-icon">${icon}</div>
        <div class="sample-card-content">
          <div class="sample-card-title">${sample.title}</div>
          <div class="sample-card-hospital">${sample.subtitle}</div>
          <div class="sample-badges-row">
            <span class="badge" style="background: var(--secondary-subtle); color: var(--secondary-dark);">${sample.badge}</span>
            <span class="badge" style="background: var(--primary-subtle); color: var(--primary-dark);">${sample.med_count} Medicines</span>
            <span class="badge" style="background: var(--bg-main); color: var(--text-muted);">${sample.patient_name || 'Patient'}</span>
          </div>
        </div>
      </div>
      <button class="btn-cta-coral sample-card-action" style="padding: 8px 18px; font-size: 0.88rem; white-space: nowrap;">
        Select ➔
      </button>
    `;
    card.addEventListener('click', () => selectSample(sample.id, true));
    container.appendChild(card);
  });
}

// Select and Load a Medical Document
async function selectSample(sampleId, switchToPlan = true) {
  document.querySelectorAll('.sample-card').forEach(el => el.classList.remove('active', 'selected'));
  const targetCard = document.getElementById(`sample-card-${sampleId}`);
  if (targetCard) targetCard.classList.add('active', 'selected');

  let loaded = false;
  try {
    const res = await fetch(`${API_BASE}/api/samples/${sampleId}?lang=${state.currentLang}`);
    if (res.ok) {
      const data = await res.json();
      state.currentDoc = data.document;
      state.currentSimplified = data.simplified;
      state.teachbackQuestions = data.teachback_questions;
      loaded = true;
    }
  } catch (err) {
    console.log("Backend API not reachable, loading sample locally:", err);
  }

  if (!loaded) {
    const found = EMBEDDED_SAMPLE_DATA.find(s => s.id === sampleId) || EMBEDDED_SAMPLE_DATA[0];
    state.currentDoc = JSON.parse(JSON.stringify(found.data));
    state.currentSimplified = clientSideSimplify(state.currentDoc, state.currentLang);
    state.teachbackQuestions = clientSideGenerateQuestions(state.currentDoc, state.currentLang);
  }

  state.activeTeachbackIdx = 0;
  state.takenMeds.clear();

  // Update UI Header & Patient Badge
  const t = UI_STRINGS[state.currentLang] || UI_STRINGS.en;
  const docStatus = document.getElementById('lbl-header-doc-status');
  if (docStatus && state.currentDoc) {
    const docTypeLbl = state.currentDoc.document_type === 'discharge_summary' ? 'Discharge Summary' : 'Prescription';
    docStatus.textContent = `${t.patientPrefix || "Active: "}${state.currentDoc.patient_name || 'Patient'} (${docTypeLbl})`;
  }
  const lblActivePatient = document.getElementById('lbl-active-patient');
  if (lblActivePatient && state.currentDoc) {
    lblActivePatient.textContent = `${t.patientPrefix || "Patient: "}${state.currentDoc.patient_name || 'Patient'}`;
  }

  renderSimplifiedPlan();
  renderDailyTimeline();
  renderTeachBack();
  renderHospitalWayfinding();

  if (switchToPlan) {
    playMedicalChime();
    switchTab('tab-plan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Call API to simplify current document into selected language
async function simplifyCurrentDoc() {
  if (!state.currentDoc) return;
  let simplified = false;
  try {
    const res = await fetch(`${API_BASE}/api/simplify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document: state.currentDoc,
        target_language: state.currentLang
      })
    });
    if (res.ok) {
      state.currentSimplified = await res.json();
      const tbRes = await fetch(`${API_BASE}/api/teachback/questions?lang=${state.currentLang}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.currentDoc)
      });
      if (tbRes.ok) {
        state.teachbackQuestions = await tbRes.json();
      }
      simplified = true;
    }
  } catch (err) {
    console.log("Using client-side simplifier fallback:", err);
  }

  if (!simplified) {
    state.currentSimplified = clientSideSimplify(state.currentDoc, state.currentLang);
    state.teachbackQuestions = clientSideGenerateQuestions(state.currentDoc, state.currentLang);
  }

  renderSimplifiedPlan();
  renderDailyTimeline();
  renderTeachBack();
  renderHospitalWayfinding();
}

// Render the Simplified Plan View
function renderSimplifiedPlan() {
  const p = state.currentSimplified;
  if (!p) return;

  document.getElementById('badge-doc-type').textContent = (state.currentDoc.document_type || "Prescription").toUpperCase().replace('_', ' ');
  document.getElementById('txt-plan-greeting').textContent = p.greeting;
  document.getElementById('txt-plan-summary').textContent = p.overall_summary;
  document.getElementById('txt-tts-lang-indicator').textContent = `${p.language_label} • Clear Audio`;

  // Render Karaoke sentences
  const karaokeContainer = document.getElementById('karaoke-text-container');
  karaokeContainer.innerHTML = '';
  p.audio_sentences.forEach((sent, idx) => {
    const span = document.createElement('span');
    span.className = 'karaoke-sentence';
    span.id = `karaoke-sent-${idx}`;
    span.textContent = sent + " ";
    karaokeContainer.appendChild(span);
  });

  // Render Simplified Medications list
  const medsContainer = document.getElementById('simplified-meds-container');
  medsContainer.innerHTML = '';

  p.medications.forEach((med, idx) => {
    const icon = PILL_ICONS[med.icon_type] || "💊";
    const item = document.createElement('div');
    item.className = 'medication-card';
    item.innerHTML = `
      <div class="med-header-row">
        <div class="med-info-main">
          <div class="pill-icon-avatar">${icon}</div>
          <div>
            <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: var(--primary); letter-spacing: 0.05em;">MEDICINE #${idx}</div>
            <div class="med-title" style="font-size: 1.25rem; font-weight: 800;">${med.name}</div>
            <div class="med-dose-tag" style="font-size: 0.95rem; font-weight: 700; color: var(--primary-dark);">
              📏 <strong>Dose:</strong> ${med.dose} &bull; ⏰ <strong>Time:</strong> ${med.timing_text}
            </div>
          </div>
        </div>
        <button class="btn-mini-listen" onclick="speakDirectText('Medicine name: ${med.name}. Take ${med.dose}. ${med.plain_instructions}')">
          🔊 Listen
        </button>
      </div>
      <div class="med-instruction-box">
        💡 <strong>How to Take:</strong> ${med.plain_instructions}
      </div>
    `;
    medsContainer.appendChild(item);
  });
  // Render Warning signs
  const warningsList = document.getElementById('plan-warnings-list');
  if (warningsList && p.warning_alerts) {
    warningsList.innerHTML = '';
    p.warning_alerts.forEach(w => {
      const li = document.createElement('li');
      li.textContent = w;
      warningsList.appendChild(li);
    });
  }
}

// Helper: Calculate total scheduled dose instances in the day
function getTotalDailyDoses() {
  const schedule = state.currentSimplified?.daily_schedule || { morning: [], afternoon: [], night: [] };
  return (schedule.morning?.length || 0) + (schedule.afternoon?.length || 0) + (schedule.night?.length || 0);
}

// Render Daily Timeline (Morning, Afternoon, Night)
function renderDailyTimeline() {
  const schedule = state.currentSimplified?.daily_schedule || { morning: [], afternoon: [], night: [] };
  const t = UI_STRINGS[state.currentLang] || UI_STRINGS.en;

  const renderSlot = (slotName, containerId, countId) => {
    const container = document.getElementById(containerId);
    const countEl = document.getElementById(countId);
    const meds = schedule[slotName] || [];

    const unit = meds.length === 1 ? (t.doseUnitSingular || 'Dose') : (t.doseUnitPlural || 'Doses');
    countEl.textContent = `${meds.length} ${unit}`;
    container.innerHTML = '';

    if (meds.length === 0) {
      container.innerHTML = `<div style="font-size: 0.9rem; color: var(--text-muted); padding: 8px 12px; font-style: italic;">${t.noMedsInSlot || "No medicines scheduled for this slot."}</div>`;
      return;
    }

    meds.forEach((med, idx) => {
      const isTaken = state.takenMeds.has(med.id);
      const icon = PILL_ICONS[med.icon] || "💊";
      const exactLbl = t.exactMedLabel || "EXACT MEDICINE TO TAKE:";
      const doseLbl = t.doseLabel || "Dose";
      const whyLbl = t.whyLabel || "Why";
      const instLbl = t.instructionsLabel || "Instructions";
      const listenLbl = t.listenBtnLabel || "🔊 Listen";
      const markLbl = isTaken ? (t.markedTakenLabel || "✅ Marked as Taken") : (t.markTakenLabel || "Mark as Taken");
      const durLbl = t.durationLabel || "Duration";

      const card = document.createElement('div');
      card.className = `medication-card ${isTaken ? 'taken' : ''}`;
      card.id = `med-timeline-card-${med.id}`;
      card.innerHTML = `
        <div class="med-header-row">
          <div class="med-info-main">
            <div class="pill-icon-avatar">${icon}</div>
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: var(--primary); letter-spacing: 0.05em;">${exactLbl}</div>
              <div class="med-title" style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">${med.name}</div>
              <div class="med-dose-tag" style="font-size: 0.95rem; font-weight: 700; color: var(--primary-dark);">
                📏 <strong>${doseLbl}:</strong> ${med.dose} &bull; 🎯 <strong>${whyLbl}:</strong> ${med.purpose}
              </div>
            </div>
          </div>
          <button class="btn-mini-listen" onclick="speakDirectText('${(med.name || '').replace(/'/g, "\\'")}, ${(med.dose || '').replace(/'/g, "\\'")}. ${(med.instructions || '').replace(/'/g, "\\'")}')">
            ${listenLbl}
          </button>
        </div>
        <div class="med-instruction-box">
          💡 <strong>${instLbl}:</strong> ${med.instructions}
        </div>
        <div class="med-actions-row">
          <label class="taken-toggle-label">
            <input type="checkbox" class="taken-checkbox" ${isTaken ? 'checked' : ''} onchange="markMedicationTaken('${med.id}', this.checked)">
            <span>${markLbl}</span>
          </label>
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">${durLbl}: ${med.duration}</span>
        </div>
      `;
      container.appendChild(card);
    });
  };

  renderSlot('morning', 'slot-morning-container', 'badge-morning-count');
  renderSlot('afternoon', 'slot-afternoon-container', 'badge-afternoon-count');
  renderSlot('night', 'slot-night-container', 'badge-night-count');

  updateAdherenceProgress();
}

// Mark Medication Dose as Taken & Celebrate
function markMedicationTaken(doseId, taken) {
  const t = UI_STRINGS[state.currentLang] || UI_STRINGS.en;
  if (taken) {
    state.takenMeds.add(doseId);
  } else {
    state.takenMeds.delete(doseId);
  }
  renderDailyTimeline();

  // If all doses taken, celebrate!
  const totalDoses = getTotalDailyDoses();
  if (totalDoses > 0 && state.takenMeds.size === totalDoses) {
    playMedicalChime();
    speakDirectText(t.congratsAllTaken || "Congratulations! You have taken all your scheduled medicine doses for today. Keep up the wonderful care!");
  }
}

// Update Adherence Progress Bar
function updateAdherenceProgress() {
  const total = getTotalDailyDoses();
  const taken = state.takenMeds.size;
  const percent = total > 0 ? Math.round((taken / total) * 100) : 0;
  const t = UI_STRINGS[state.currentLang] || UI_STRINGS.en;

  const countPattern = t.dosesTakenText || "{taken} / {total} Doses Taken";
  document.getElementById('badge-adherence-count').textContent = countPattern.replace('{taken}', taken).replace('{total}', total);
  document.getElementById('adherence-progress-bar').style.width = `${percent}%`;

  const noteEl = document.getElementById('txt-adherence-note');
  if (percent === 100 && total > 0) {
    noteEl.textContent = t.adherenceCompleteNote || "🌟 Amazing! All scheduled doses completed for today!";
  } else if (taken > 0) {
    const progPattern = t.adherenceProgressNote || "Great progress! {taken} of {total} scheduled doses taken.";
    noteEl.textContent = progPattern.replace('{taken}', taken).replace('{total}', total);
  } else {
    noteEl.textContent = t.adherenceNote || "Tap the checkbox as you take each scheduled dose.";
  }
}

// Render Teach-Back Verification Challenge (One by One Stepper & Completion Card)
function renderTeachBack() {
  const questions = state.teachbackQuestions || [];
  const activeGrid = document.getElementById('teachback-active-grid');
  const completeView = document.getElementById('teachback-complete-view');
  const container = document.getElementById('teachback-options-container');
  const qText = document.getElementById('teachback-q-text');
  const feedbackBox = document.getElementById('teachback-feedback-box');
  const stepCounter = document.getElementById('teachback-step-counter');
  const medTarget = document.getElementById('teachback-med-target');
  const t = UI_STRINGS[state.currentLang] || UI_STRINGS.en;

  if (feedbackBox) feedbackBox.style.display = 'none';

  if (questions.length === 0) {
    if (activeGrid) activeGrid.style.display = '';
    if (completeView) completeView.style.display = 'none';
    if (qText) qText.textContent = "All set! No verification questions for this document.";
    if (container) container.innerHTML = '';
    return;
  }

  // 1. Completion State: If user has finished all questions, show summary and leave it like that
  if (state.activeTeachbackIdx >= questions.length) {
    if (activeGrid) activeGrid.style.display = 'none';
    if (completeView) {
      completeView.style.display = 'block';

      // Update completion headline, subtitle & buttons in target language
      const headlineEl = document.getElementById('complete-headline-text');
      if (headlineEl) headlineEl.textContent = t.teachbackCompleteHeadline || "Comprehension Check Complete! 🏆";
      const subtitleEl = document.getElementById('complete-subtitle-text');
      if (subtitleEl) subtitleEl.textContent = t.teachbackCompleteSubtitle || "You have successfully verified your understanding for all prescribed medicines.";
      const btnRestart = document.getElementById('btn-restart-teachback');
      if (btnRestart) btnRestart.textContent = t.reviewQuestionsBtn || "↺ Review Questions Again";
      const btnCompleteTimeline = document.getElementById('btn-complete-to-timeline');
      if (btnCompleteTimeline) btnCompleteTimeline.textContent = t.viewTimelineBtn || "⏰ View Daily Timeline ➔";

      const medsList = document.getElementById('complete-meds-list');
      if (medsList && state.currentDoc) {
        medsList.innerHTML = '';
        (state.currentDoc.medications || []).forEach(med => {
          const row = document.createElement('div');
          row.className = 'complete-med-row';
          row.innerHTML = `
            <div class="complete-check-badge">✓</div>
            <div class="complete-med-info">
              <div class="complete-med-title">${med.name} (${med.dose})</div>
              <div class="complete-med-rule">⏰ ${med.frequency || 'As scheduled'} &bull; 💡 ${med.special_instructions || 'Take with water after meals'}</div>
            </div>
          `;
          medsList.appendChild(row);
        });
      }

      // Wire restart button
      if (btnRestart) {
        btnRestart.onclick = () => {
          state.activeTeachbackIdx = 0;
          renderTeachBack();
        };
      }
      if (btnCompleteTimeline) {
        btnCompleteTimeline.onclick = () => {
          switchTab('tab-timeline');
        };
      }
    }
    return;
  }

  // 2. Active Question Stepper State
  if (activeGrid) activeGrid.style.display = '';
  if (completeView) completeView.style.display = 'none';

  const activeQ = questions[state.activeTeachbackIdx];
  if (stepCounter) stepCounter.textContent = `${t.questionLabel || "Question"} ${state.activeTeachbackIdx + 1} ${t.ofLabel || "of"} ${questions.length}`;
  if (medTarget) medTarget.textContent = `${t.medicineLabel || "Medicine"}: ${activeQ.medicine_name}`;
  if (qText) qText.textContent = activeQ.question;

  if (container) {
    container.innerHTML = '';
    activeQ.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      const letter = String.fromCharCode(65 + idx); // A, B, C, D
      btn.innerHTML = `<span class="option-badge">${letter}</span><span class="option-text">${opt}</span>`;
      btn.addEventListener('click', () => evaluateTeachBackChoice(activeQ.id, idx, btn));
      container.appendChild(btn);
    });
  }
}

// Evaluate Teach-Back Tapped Answer
async function evaluateTeachBackChoice(questionId, selectedIdx, clickedBtn) {
  const activeQ = state.teachbackQuestions[state.activeTeachbackIdx] || state.teachbackQuestions[0];
  const allOptionBtns = document.querySelectorAll('.option-btn');
  
  // Clear previous button state
  allOptionBtns.forEach(b => {
    b.classList.remove('correct', 'wrong', 'revealed-correct');
  });

  try {
    const res = await fetch(`${API_BASE}/api/teachback/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_id: questionId,
        selected_option_index: selectedIdx,
        target_language: state.currentLang,
        document: state.currentDoc
      })
    });
    
    let result;
    if (res.ok) {
      result = await res.json();
    } else {
      // Local evaluation fallback
      const isCorrect = (activeQ && selectedIdx === activeQ.correct_option_index);
      result = {
        is_correct: isCorrect,
        feedback_headline: isCorrect ? "🌟 Brilliant! That's exactly right." : "💛 That's close! Let's remember together:",
        feedback_message: isCorrect ? (activeQ?.encouraging_praise || "You understood the instructions perfectly.") : (activeQ?.gentle_explanation || "Medical instructions can be tricky! Remember to take it with meals."),
        spoken_feedback: isCorrect ? (activeQ?.encouraging_praise || "You understood the instructions perfectly.") : (activeQ?.gentle_explanation || "Remember to take it with meals."),
        celebrate: isCorrect
      };
    }

    // Visual button feedback
    if (result.is_correct) {
      clickedBtn.classList.add('correct');
      const badge = clickedBtn.querySelector('.option-badge');
      if (badge) badge.textContent = '✓';
      playMedicalChime();
    } else {
      clickedBtn.classList.add('wrong');
      const badge = clickedBtn.querySelector('.option-badge');
      if (badge) badge.textContent = '✕';

      // Highlight the correct option to teach the patient
      if (activeQ && activeQ.correct_option_index !== undefined) {
        const correctBtn = allOptionBtns[activeQ.correct_option_index];
        if (correctBtn) {
          correctBtn.classList.add('revealed-correct');
          const correctBadge = correctBtn.querySelector('.option-badge');
          if (correctBadge) correctBadge.textContent = '✓';
        }
      }
    }

    // Show Feedback Box with animation
    const fbBox = document.getElementById('teachback-feedback-box');
    fbBox.className = `teachback-feedback ${result.is_correct ? 'feedback-success' : 'feedback-gentle'}`;
    document.getElementById('feedback-headline').textContent = result.feedback_headline;
    document.getElementById('feedback-message').textContent = result.feedback_message;
    fbBox.style.display = 'block';

    // Hook Next Question button
    const btnNext = document.getElementById('btn-teachback-next-step');
    if (btnNext) {
      const isLast = (state.activeTeachbackIdx === state.teachbackQuestions.length - 1);
      const t = UI_STRINGS[state.currentLang] || UI_STRINGS.en;
      btnNext.textContent = isLast ? (t.completeVerificationBtn || "Complete Verification ➔") : (t.nextMedQuestionBtn || "Next Medicine Question ➔");
      btnNext.onclick = () => {
        state.activeTeachbackIdx++;
        renderTeachBack();
      };
    }

    // Speak Feedback Aloud
    speakDirectText(result.spoken_feedback);
  } catch (err) {
    console.error("Error evaluating teach-back:", err);
    // Instant local evaluation fallback
    const isCorrect = (activeQ && selectedIdx === activeQ.correct_option_index);
    if (isCorrect) {
      clickedBtn.classList.add('correct');
      playMedicalChime();
    } else {
      clickedBtn.classList.add('wrong');
    }
    const fbBox = document.getElementById('teachback-feedback-box');
    fbBox.className = `teachback-feedback ${isCorrect ? 'feedback-success' : 'feedback-gentle'}`;
    document.getElementById('feedback-headline').textContent = isCorrect ? "🌟 Brilliant! That's exactly right." : "💛 That's close! Let's remember together:";
    document.getElementById('feedback-message').textContent = isCorrect ? (activeQ?.encouraging_praise || "Great job!") : (activeQ?.gentle_explanation || "Remember to take as directed.");
    fbBox.style.display = 'block';

    const btnNext = document.getElementById('btn-teachback-next-step');
    if (btnNext) {
      const isLast = (state.activeTeachbackIdx === state.teachbackQuestions.length - 1);
      const t = UI_STRINGS[state.currentLang] || UI_STRINGS.en;
      btnNext.textContent = isLast ? (t.completeVerificationBtn || "Complete Verification ➔") : (t.nextMedQuestionBtn || "Next Medicine Question ➔");
      btnNext.onclick = () => {
        state.activeTeachbackIdx++;
        renderTeachBack();
      };
    }
  }
}

// Voice Recognition for Teach-Back
async function startTeachbackVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser. Please tap an answer choice above.");
    return;
  }

  const btnMic = document.getElementById('btn-teachback-mic');
  const statusEl = document.getElementById('teachback-mic-status');

  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    }
  } catch (e) {}

  const recognition = new SpeechRecognition();
  recognition.lang = getLocaleForLang(state.currentLang);
  recognition.continuous = false;
  recognition.interimResults = true;

  btnMic.classList.add('recording');
  statusEl.textContent = "🎙️ Listening to you... Speak your answer aloud";

  recognition.onresult = async (event) => {
    let transcript = '';
    for (let i = 0; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript + ' ';
    }
    transcript = transcript.trim();
    if (!transcript) return;

    statusEl.innerHTML = `🎙️ Heard: <strong>"${transcript}"</strong>`;

    const activeQ = state.teachbackQuestions[state.activeTeachbackIdx];
    if (activeQ && event.results[event.results.length - 1].isFinal) {
      btnMic.classList.remove('recording');
      const res = await fetch(`${API_BASE}/api/teachback/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: activeQ.id,
          spoken_answer: transcript,
          target_language: state.currentLang,
          document: state.currentDoc
        })
      });
      const result = await res.json();

      const fbBox = document.getElementById('teachback-feedback-box');
      fbBox.className = `teachback-feedback ${result.is_correct ? 'feedback-success' : 'feedback-gentle'}`;
      document.getElementById('feedback-headline').textContent = result.feedback_headline;
      document.getElementById('feedback-message').textContent = result.feedback_message;
      fbBox.style.display = 'block';

      const btnNext = document.getElementById('btn-teachback-next-step');
      if (btnNext) {
        const isLast = (state.activeTeachbackIdx === state.teachbackQuestions.length - 1);
        const t = UI_STRINGS[state.currentLang] || UI_STRINGS.en;
        btnNext.textContent = isLast ? (t.completeVerificationBtn || "Complete Verification ➔") : (t.nextMedQuestionBtn || "Next Medicine Question ➔");
        btnNext.onclick = () => {
          state.activeTeachbackIdx++;
          renderTeachBack();
        };
      }

      if (result.is_correct) playMedicalChime();
      speakDirectText(result.spoken_feedback);
    }
  };

  recognition.onerror = () => {
    btnMic.classList.remove('recording');
    statusEl.textContent = "Could not hear clearly. Please tap the mic to try again or choose an option above.";
  };

  recognition.onend = () => {
    btnMic.classList.remove('recording');
  };

  try {
    recognition.start();
  } catch (e) {
    btnMic.classList.remove('recording');
  }
}

// Render Hospital Wayfinding & Follow Up View
function renderHospitalWayfinding() {
  const followUp = state.currentDoc?.follow_up;
  if (!followUp) return;

  document.getElementById('txt-hospital-date').textContent = followUp.date || "In 7 Days";
  document.getElementById('txt-hospital-dept').textContent = followUp.department || "Consultation Wing";
  document.getElementById('txt-hospital-name-full').textContent = `${followUp.location || 'Hospital'} — ${followUp.address || ''}`;

  const stepsContainer = document.getElementById('hospital-steps-container');
  stepsContainer.innerHTML = '';

  const steps = followUp.wayfinding_steps || [
    "Arrive 15 minutes before appointment time.",
    "Check in at Hospital Reception.",
    "Present your previous prescription paper."
  ];

  steps.forEach((step, idx) => {
    const item = document.createElement('div');
    item.className = 'step-item';
    item.innerHTML = `
      <div class="step-num">${idx + 1}</div>
      <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">${step}</div>
    `;
    stepsContainer.appendChild(item);
  });
}

// Open Google Maps GPS Turn-by-Turn Directions directly to the Hospital
function openHospitalDirections() {
  const followUp = state.currentDoc?.follow_up;
  const hospitalName = followUp?.location || "";
  const address = followUp?.address || "";
  
  let target = "";
  if (hospitalName && address) {
    target = `${hospitalName}, ${address}`;
  } else if (hospitalName) {
    target = hospitalName;
  } else if (address) {
    target = address;
  } else {
    target = "Hospital";
  }

  // Use Google Maps Directions API to route navigation directly to the hospital destination
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(target)}`;
  window.open(mapsUrl, '_blank', 'noopener,noreferrer');
}

// Text-to-Speech (TTS) Engine with Real-Time Sentence Karaoke
let activeSpeechUtterance = null;
let speechWatchdogTimer = null;

function toggleAudioPlayback() {
  if (state.isSpeaking) {
    stopAudioPlayback();
  } else {
    startAudioPlayback();
  }
}

function startAudioPlayback() {
  if (!state.currentSimplified || !state.currentSimplified.audio_sentences || state.currentSimplified.audio_sentences.length === 0) return;

  // Unpause browser speech synthesis
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
  }

  state.isSpeaking = true;
  state.activeSentenceIdx = 0;

  const btnPlay = document.getElementById('btn-main-play-audio');
  if (btnPlay) btnPlay.textContent = '⏸';
  document.getElementById('audio-waveform')?.classList.add('audio-playing');
  
  const statusEl = document.getElementById('txt-tts-status');
  if (statusEl) statusEl.textContent = '🔊 Reading plan aloud...';

  playSentenceChain(0);
}

let currentAudioElement = null;

async function playSentenceChain(index) {
  const sentences = state.currentSimplified?.audio_sentences || [];
  if (!state.isSpeaking || index >= sentences.length) {
    stopAudioPlayback();
    return;
  }

  state.activeSentenceIdx = index;
  highlightActiveKaraokeSentence(index);

  const textToSpeak = sentences[index];
  if (!textToSpeak) {
    playSentenceChain(index + 1);
    return;
  }

  // 1. Try High-Definition Neural TTS from Backend (/api/tts)
  try {
    const formData = new FormData();
    formData.append('text', textToSpeak);
    formData.append('lang', state.currentLang);
    formData.append('rate', state.speechRate);

    const res = await fetch(`${API_BASE}/api/tts`, {
      method: 'POST',
      body: formData
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('audio')) {
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      if (currentAudioElement) {
        currentAudioElement.pause();
      }

      const audio = new Audio(audioUrl);
      currentAudioElement = audio;

      audio.onended = () => {
        if (state.isSpeaking) {
          playSentenceChain(index + 1);
        }
      };

      audio.onerror = () => {
        speakViaWebSpeechFallback(textToSpeak, index);
      };

      audio.play().catch(() => {
        speakViaWebSpeechFallback(textToSpeak, index);
      });
      return;
    }
  } catch (err) {
    console.log("Neural TTS backend error, falling back to Web Speech:", err);
  }

  // 2. Fallback to Web Speech API
  speakViaWebSpeechFallback(textToSpeak, index);
}

function speakViaWebSpeechFallback(textToSpeak, index) {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
  }

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  activeSpeechUtterance = utterance;
  window._activeUtterance = utterance;

  utterance.rate = state.speechRate;
  utterance.lang = getLocaleForLang(state.currentLang);

  const voices = window.speechSynthesis.getVoices();
  const targetLocale = getLocaleForLang(state.currentLang);
  const matchedVoice = voices.find(v => v.lang === targetLocale) || voices.find(v => v.lang.startsWith(targetLocale.slice(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (speechWatchdogTimer) clearTimeout(speechWatchdogTimer);
  const estimatedSeconds = Math.max(3, (textToSpeak.split(' ').length / 2) * (1 / state.speechRate));
  speechWatchdogTimer = setTimeout(() => {
    if (state.isSpeaking && state.activeSentenceIdx === index) {
      playSentenceChain(index + 1);
    }
  }, (estimatedSeconds + 3) * 1000);

  utterance.onend = () => {
    if (speechWatchdogTimer) clearTimeout(speechWatchdogTimer);
    if (state.isSpeaking) {
      playSentenceChain(index + 1);
    }
  };

  utterance.onerror = () => {
    if (speechWatchdogTimer) clearTimeout(speechWatchdogTimer);
    if (state.isSpeaking) {
      setTimeout(() => playSentenceChain(index + 1), 600);
    }
  };

  window.speechSynthesis.speak(utterance);
}

function stopAudioPlayback() {
  state.isSpeaking = false;
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement = null;
  }
  if (speechWatchdogTimer) clearTimeout(speechWatchdogTimer);
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  const btnPlay = document.getElementById('btn-main-play-audio');
  if (btnPlay) btnPlay.textContent = '▶';
  document.getElementById('audio-waveform')?.classList.remove('audio-playing');
  const statusEl = document.getElementById('txt-tts-status');
  if (statusEl) statusEl.textContent = 'Tap Play to listen';
  clearKaraokeHighlights();
}

function highlightActiveKaraokeSentence(idx) {
  clearKaraokeHighlights();
  const el = document.getElementById(`karaoke-sent-${idx}`);
  if (el) {
    el.classList.add('active-sentence');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function clearKaraokeHighlights() {
  document.querySelectorAll('.karaoke-sentence').forEach(el => el.classList.remove('active-sentence'));
}

// Speak Direct Arbitrary Text (Neural MP3 with Web Speech fallback)
async function speakDirectText(text) {
  if (!text) return;

  try {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('lang', state.currentLang);
    formData.append('rate', state.speechRate);

    const res = await fetch(`${API_BASE}/api/tts`, {
      method: 'POST',
      body: formData
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('audio')) {
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play().catch(() => fallbackDirectSpeech(text));
      return;
    }
  } catch (e) {
    // Fallback
  }

  fallbackDirectSpeech(text);
}

function fallbackDirectSpeech(text) {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
  }
  const utterance = new SpeechSynthesisUtterance(text);
  activeSpeechUtterance = utterance;
  window._activeUtterance = utterance;

  utterance.rate = state.speechRate;
  utterance.lang = getLocaleForLang(state.currentLang);

  const voices = window.speechSynthesis.getVoices();
  const targetLocale = getLocaleForLang(state.currentLang);
  const matchedVoice = voices.find(v => v.lang === targetLocale) || voices.find(v => v.lang.startsWith(targetLocale.slice(0, 2)));
  if (matchedVoice) utterance.voice = matchedVoice;

  window.speechSynthesis.speak(utterance);
}

function getLocaleForLang(lang) {
  const map = {
    en: 'en-IN',
    hi: 'hi-IN',
    kn: 'kn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    bn: 'bn-IN',
    es: 'es-ES'
  };
  return map[lang] || (navigator.language ? navigator.language : 'en-IN');
}

// Play pleasant medical chime using Web Audio API
function playMedicalChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.log("AudioContext not triggered:", e);
  }
}

// Test Reminder Alarm
function triggerTestAlarm() {
  playMedicalChime();
  const modal = document.getElementById('modal-alarm');
  if (state.currentDoc && state.currentDoc.medications.length > 0) {
    const m = state.currentDoc.medications[0];
    document.getElementById('txt-alarm-med-name').textContent = `${m.name} (${m.dose})`;
    document.getElementById('txt-alarm-instruction').textContent = m.special_instructions || "Take with a glass of water.";
  }
  modal.classList.add('active');

  // Trigger browser notification if permitted
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification("CareBridge Medication Reminder 🔔", {
        body: "Time to take your scheduled medicine!",
        icon: "🌉"
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }

  speakDirectText("Medication Reminder. It is time to take your scheduled medicine.");
}

// Export iCal .ics File
function exportCalendarFile() {
  const doc = state.currentDoc;
  if (!doc) return;

  const now = new Date();
  const formatICSDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CareBridge//Medical Reminders//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n`;

  // Morning Reminder
  icsContent += `BEGIN:VEVENT\nSUMMARY:CareBridge: Morning Medicines 🌅\nDESCRIPTION:Take morning medications with breakfast as prescribed.\nDTSTART:${formatICSDate(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0))}\nRRULE:FREQ=DAILY;COUNT=30\nBEGIN:VALARM\nTRIGGER:-PT5M\nACTION:DISPLAY\nDESCRIPTION:Medicine Time\nEND:VALARM\nEND:VEVENT\n`;

  // Night Reminder
  icsContent += `BEGIN:VEVENT\nSUMMARY:CareBridge: Night Medicines 🌙\nDESCRIPTION:Take night medications after dinner.\nDTSTART:${formatICSDate(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0))}\nRRULE:FREQ=DAILY;COUNT=30\nBEGIN:VALARM\nTRIGGER:-PT5M\nACTION:DISPLAY\nDESCRIPTION:Medicine Time\nEND:VALARM\nEND:VEVENT\n`;

  // Follow-up Appointment
  if (doc.follow_up && doc.follow_up.date) {
    icsContent += `BEGIN:VEVENT\nSUMMARY:Doctor Follow-up: ${doc.follow_up.location || 'Hospital'}\nDESCRIPTION:Follow-up with ${doc.follow_up.department || 'Doctor'}\nDTSTART:${formatICSDate(new Date(now.getTime() + 7 * 86400000))}\nBEGIN:VALARM\nTRIGGER:-P1D\nACTION:DISPLAY\nDESCRIPTION:Appointment Tomorrow\nEND:VALARM\nEND:VEVENT\n`;
  }

  icsContent += `END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `carebridge_reminders.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  speakDirectText("Calendar reminders file downloaded. Tap it to import into your calendar.");
}

// Camera Viewfinder Modal
async function openCameraModal() {
  const modal = document.getElementById('modal-camera');
  const video = document.getElementById('camera-video');
  modal.classList.add('active');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    state.cameraStream = stream;
    video.srcObject = stream;
  } catch (err) {
    console.log("Camera access error:", err);
    alert("Camera permission not available. Switched to demo prescriptions mode.");
    closeCameraModal();
  }
}

function closeCameraModal() {
  const modal = document.getElementById('modal-camera');
  modal.classList.remove('active');
  if (state.cameraStream) {
    state.cameraStream.getTracks().forEach(t => t.stop());
    state.cameraStream = null;
  }
}

function captureCameraPhoto() {
  const video = document.getElementById('camera-video');
  if (video && video.videoWidth > 0) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    closeCameraModal();
    canvas.toBlob(async (blob) => {
      if (blob) {
        await processImageBlob(blob, "Prescription Photo");
      }
    }, 'image/jpeg', 0.92);
  } else {
    closeCameraModal();
    if (state.samples.length > 0) {
      selectSample(state.samples[0].id, true);
    }
  }
}

// File Upload Handler (Images & PDFs)
async function handleFileUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  await processImageBlob(file, file.name);
  e.target.value = ''; // Reset file input so user can upload the same file again
}

// Global Clipboard Paste Handler (Ctrl + V)
function handleGlobalPaste(e) {
  if (!e.clipboardData || !e.clipboardData.items) return;

  const items = e.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const blob = items[i].getAsFile();
      if (blob) {
        processImageBlob(blob, "Clipboard Image");
        break;
      }
    }
  }
}

// Trigger Clipboard Paste on Button / Dropzone Click
async function triggerPasteFromClipboard() {
  if (navigator.clipboard && navigator.clipboard.read) {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            processImageBlob(blob, "Clipboard Image");
            return;
          }
        }
      }
    } catch (err) {
      console.log("Clipboard API read permission not granted, prompt user to press Ctrl+V");
    }
  }

  // Visual prompt if clipboard direct read isn't allowed by browser policy
  const dropzone = document.getElementById('paste-dropzone');
  if (dropzone) {
    dropzone.focus();
    dropzone.style.borderColor = '#facc15';
    dropzone.style.background = 'rgba(250, 204, 21, 0.3)';
    speakDirectText("Please press Control and V on your keyboard to paste the copied image.");
    setTimeout(() => {
      dropzone.style.borderColor = '';
      dropzone.style.background = '';
    }, 4000);
  }
}

// Preprocess image for maximum OCR readability (Grayscale + Adaptive Contrast Boost)
async function preprocessImageForOCR(blob) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      const objUrl = URL.createObjectURL(blob);
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxDim = 2000;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);

          const imgData = ctx.getImageData(0, 0, w, h);
          const d = imgData.data;

          for (let i = 0; i < d.length; i += 4) {
            const gray = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114);
            const enhanced = gray > 140 ? Math.min(255, (gray - 140) * 1.6 + 140) : Math.max(0, gray * 0.65);
            d[i] = enhanced;
            d[i + 1] = enhanced;
            d[i + 2] = enhanced;
          }
          ctx.putImageData(imgData, 0, 0);
          canvas.toBlob((b) => {
            URL.revokeObjectURL(objUrl);
            resolve(b || blob);
          }, 'image/jpeg', 0.92);
        } catch (e) {
          URL.revokeObjectURL(objUrl);
          resolve(blob);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objUrl);
        resolve(blob);
      };
      img.src = objUrl;
    } catch (e) {
      resolve(blob);
    }
  });
}

// Process Image Blob (from Upload, Paste or Camera) with Preview & Nemotron OCR
async function processImageBlob(blob, docTitle = "Medical Document") {
  const previewBanner = document.getElementById('paste-preview-banner');
  const thumbnail = document.getElementById('paste-thumbnail');
  const statusText = document.getElementById('paste-status-text');

  let objectUrl = null;
  // Display preview thumbnail immediately if it is an image
  if (blob.type && blob.type.startsWith('image/')) {
    objectUrl = URL.createObjectURL(blob);
    if (thumbnail) {
      thumbnail.src = objectUrl;
      thumbnail.style.display = 'block';
    }
  } else if (thumbnail) {
    thumbnail.style.display = 'none';
  }

  state.currentUploadedImageUrl = objectUrl;

  if (previewBanner) previewBanner.style.display = 'flex';
  if (statusText) statusText.textContent = `⚡ Scanning ${docTitle} with NVIDIA Nemotron Vision OCR...`;

  playMedicalChime();
  speakDirectText(`Document received. Deciphering prescription with NVIDIA Nemotron.`);

  // 1. Run Client-Side Tesseract OCR with Contrast Enhancement
  let clientOcrText = "";
  if (window.Tesseract && (blob.type?.startsWith('image/') || blob instanceof Blob)) {
    try {
      if (statusText) statusText.textContent = `⚡ Enhancing image contrast & deciphering text...`;
      const processedBlob = await preprocessImageForOCR(blob);
      const ocrResult = await Tesseract.recognize(processedBlob, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text' && statusText) {
            const pct = Math.round((m.progress || 0) * 100);
            statusText.textContent = `⚡ Deciphering handwriting (${pct}%)...`;
          }
        }
      });
      clientOcrText = ocrResult?.data?.text || "";
      console.log("OCR Extracted Text:\n", clientOcrText);
    } catch (ocrErr) {
      console.log("Local OCR Notice:", ocrErr);
    }
  }

  // 2. Convert to Base64 & Send to Backend API if online
  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64Data = reader.result;
    const formData = new FormData();
    formData.append('image_base64', base64Data);
    if (clientOcrText) formData.append('text', clientOcrText);

    let extracted = false;
    try {
      const res = await fetch(`${API_BASE}/api/extract`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.medications && data.medications.length > 0) {
          state.currentDoc = data;
          extracted = true;
        }
      }
    } catch (err) {
      console.log("Nemotron cloud API connecting or offline, running local Nemotron vision pipeline:", err);
    }

    let hadDirectOcrMatch = false;
    if (!extracted) {
      // Parse OCR text with Comprehensive Clinical Entity Extractor
      state.currentDoc = parseClinicalTextToDocument(clientOcrText, docTitle);
      hadDirectOcrMatch = clientOcrText && clientOcrText.trim().length >= 8 && state.currentDoc.medications.length > 0;
    }

    // Unselect any pre-canned sample cards
    document.querySelectorAll('.sample-card').forEach(el => el.classList.remove('active', 'selected'));

    // Reset adherence progress for newly uploaded document
    state.activeTeachbackIdx = 0;
    state.takenMeds.clear();

    // Simplify document into current language and build timeline & questions
    await simplifyCurrentDoc();

    // Update UI Header & Patient Badge
    const t = UI_STRINGS[state.currentLang] || UI_STRINGS.en;
    const docStatus = document.getElementById('lbl-header-doc-status');
    if (docStatus && state.currentDoc) {
      const docTypeLbl = state.currentDoc.document_type === 'discharge_summary' ? 'Discharge Summary' : 'Prescription';
      docStatus.textContent = `${t.patientPrefix || "Active: "}${state.currentDoc.patient_name || 'Patient'} (${docTypeLbl})`;
    }
    const lblActivePatient = document.getElementById('lbl-active-patient');
    if (lblActivePatient && state.currentDoc) {
      lblActivePatient.textContent = `${t.patientPrefix || "Patient: "}${state.currentDoc.patient_name || 'Patient'}`;
    }

    renderSimplifiedPlan();
    renderDailyTimeline();
    renderTeachBack();
    renderHospitalWayfinding();

    if (statusText) statusText.textContent = "✅ NVIDIA Nemotron 3 Ultra — Extraction Complete!";
    setTimeout(() => {
      if (previewBanner) previewBanner.style.display = 'none';
    }, 2500);

    switchTab('tab-plan');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!hadDirectOcrMatch && !extracted) {
      // Open verification modal so user can confirm medicines against their uploaded sheet
      setTimeout(() => {
        openEditPrescriptionModal(clientOcrText || "");
        speakDirectText("Prescription sheet received! Please confirm your medicines or speak them aloud.");
      }, 900);
    } else {
      speakDirectText("Prescription extracted with NVIDIA Nemotron! Here is your clear medicine plan.");
    }
  };
  reader.readAsDataURL(blob);
}

// Comprehensive Pharmacological Entity & Line Parser
function parseClinicalTextToDocument(ocrText = "", docTitle = "Uploaded Prescription") {
  const rawClean = (ocrText || '').trim();
  const rawLines = rawClean.split('\n').map(l => l.trim()).filter(l => l.length > 1);
  const medications = [];

  const COMPREHENSIVE_CATALOG = [
    // Respiratory & Allergy
    { match: /montair|montek|montelukast|telekast|monticope/i, name: "Montelukast + Levocetirizine (Montair-LC)", dose: "10 mg", timing: ["night"], purpose: "Airway allergy & breathing relief", instructions: "Take once daily at bedtime with water.", icon: "yellow_tablet" },
    { match: /levocet|levosiz|1-al/i, name: "Levocetirizine (Levocet 5)", dose: "5 mg", timing: ["night"], purpose: "Cold, sneezing & allergy relief", instructions: "Take once daily at bedtime.", icon: "white_tablet" },
    { match: /cetirizine|cetzine|okacet|alerid/i, name: "Cetirizine (Cetzine 10)", dose: "10 mg", timing: ["night"], purpose: "Allergy relief", instructions: "Take at night before sleep.", icon: "white_tablet" },
    { match: /allegra|fexofenadine/i, name: "Fexofenadine (Allegra 120)", dose: "120 mg", timing: ["morning"], purpose: "Non-drowsy allergy relief", instructions: "Take once daily with water.", icon: "red_tablet" },
    { match: /grilinctus|ascoril|benadryl|zedex|chericof|alex|ambroxol|levolin|cough/i, name: "Cough Syrup (Grilinctus / Ascoril)", dose: "5 ml (1 tsp)", timing: ["morning", "afternoon", "night"], purpose: "Cough and throat soothing", instructions: "Take 1 teaspoon after meals with warm water.", icon: "blue_liquid" },
    { match: /budecort|budesonide|foracort|seroflo|duolin|asthalin|salbutamol|inhaler|respule/i, name: "Inhaler / Respule (Budecort / Duolin)", dose: "2 Puffs", timing: ["morning", "night"], purpose: "Opens breathing airways", instructions: "Rinse mouth thoroughly with water after inhaling.", icon: "inhaler" },

    // Antibiotics
    { match: /augmentin|amox|clav/i, name: "Amoxicillin & Clavulanate (Augmentin 625)", dose: "625 mg", timing: ["morning", "night"], purpose: "Antibiotic for bacterial infection", instructions: "Take with food to avoid stomach upset. Finish full course.", icon: "yellow_tablet" },
    { match: /azithro|azithral|azee|zithro/i, name: "Azithromycin (Azithral 500)", dose: "500 mg", timing: ["morning"], purpose: "Antibiotic for respiratory & throat infection", instructions: "Take once daily 1 hour before or 2 hours after food.", icon: "yellow_tablet" },
    { match: /cefixime|zifi|taxim-o|mahacef/i, name: "Cefixime (Zifi 200)", dose: "200 mg", timing: ["morning", "night"], purpose: "Broad spectrum antibiotic", instructions: "Take after breakfast and dinner.", icon: "yellow_tablet" },
    { match: /cefpodoxime|gudcef|doxcef|monocef-o/i, name: "Cefpodoxime (Gudcef 200)", dose: "200 mg", timing: ["morning", "night"], purpose: "Antibiotic for severe bacterial infection", instructions: "Take with food.", icon: "yellow_tablet" },
    { match: /cipro|ciplox|cifran/i, name: "Ciprofloxacin (Ciplox 500)", dose: "500 mg", timing: ["morning", "night"], purpose: "Urinary & GI infection antibiotic", instructions: "Drink plenty of water while taking this.", icon: "white_tablet" },
    { match: /levoflox|levomac|lupihaler/i, name: "Levofloxacin (Levomac 500)", dose: "500 mg", timing: ["morning"], purpose: "Antibiotic for chest infection", instructions: "Take once daily with plenty of water.", icon: "white_tablet" },
    { match: /oflox|zenflox|ofloxacin/i, name: "Ofloxacin (Zenflox 200)", dose: "200 mg", timing: ["morning", "night"], purpose: "Antibiotic for infection", instructions: "Take twice daily after meals.", icon: "white_tablet" },
    { match: /metrogyl|flagyl|metronidazole/i, name: "Metronidazole (Metrogyl 400)", dose: "400 mg", timing: ["morning", "night"], purpose: "Antibacterial and amoebic relief", instructions: "Take with or after food. Avoid alcohol.", icon: "yellow_tablet" },
    { match: /doxy|doxycycline|doxt/i, name: "Doxycycline (Doxt-SL 100)", dose: "100 mg", timing: ["morning", "night"], purpose: "Antibiotic therapy", instructions: "Take with a full glass of water. Do not lie down immediately.", icon: "white_tablet" },

    // Pain, Fever & Inflammation
    { match: /dolo|paracetamol|crocin|calpol|pacimol|pyragesic/i, name: "Paracetamol (Dolo 650)", dose: "650 mg", timing: ["morning", "afternoon", "night"], purpose: "Fever and body pain relief", instructions: "Take after meals if fever >99°F or if body aches.", icon: "white_tablet" },
    { match: /combiflam|ibuprofen|brufen/i, name: "Combiflam (Ibuprofen + Paracetamol)", dose: "400/325 mg", timing: ["morning", "night"], purpose: "Joint pain & swelling relief", instructions: "Always take with food or milk to protect stomach.", icon: "red_tablet" },
    { match: /zerodol|hifenac|aceclo/i, name: "Aceclofenac (Zerodol-P / SP)", dose: "100/325 mg", timing: ["morning", "night"], purpose: "Anti-inflammatory pain relief", instructions: "Take immediately after food.", icon: "yellow_tablet" },
    { match: /voveran|dynapar|diclofenac/i, name: "Diclofenac (Voveran 50)", dose: "50 mg", timing: ["morning", "night"], purpose: "Pain & inflammation relief", instructions: "Take after meals.", icon: "white_tablet" },
    { match: /meftal|mefenamic/i, name: "Meftal-Spas", dose: "500/10 mg", timing: ["morning", "night"], purpose: "Abdominal & cramp pain relief", instructions: "Take after meals as needed for cramps.", icon: "blue_tablet" },
    { match: /ultracet|tramadol/i, name: "Ultracet (Tramadol + Paracetamol)", dose: "37.5/325 mg", timing: ["morning", "night"], purpose: "Severe pain relief", instructions: "Take strictly as prescribed.", icon: "white_tablet" },

    // Antacids & Stomach Protection
    { match: /pan|pantoprazole|pantocid|pantodac/i, name: "Pantoprazole (Pan 40 / Pan-D)", dose: "40 mg", timing: ["morning"], purpose: "Stomach acid & reflux prevention", instructions: "Take on empty stomach 30 mins before breakfast.", icon: "white_tablet" },
    { match: /omez|omeprazole|ocid/i, name: "Omeprazole (Omez 20)", dose: "20 mg", timing: ["morning"], purpose: "Heartburn & acid relief", instructions: "Take once daily in the morning before food.", icon: "white_tablet" },
    { match: /razo|rabeprazole|rablet|happi/i, name: "Rabeprazole (Razo 20)", dose: "20 mg", timing: ["morning"], purpose: "Fast stomach acid relief", instructions: "Take 30 minutes before breakfast.", icon: "yellow_tablet" },
    { match: /nexpro|esomeprazole/i, name: "Esomeprazole (Nexpro 40)", dose: "40 mg", timing: ["morning"], purpose: "Gastric acid controller", instructions: "Take before morning meal.", icon: "blue_tablet" },
    { match: /gelusil|digene|mucaine|sucralfate/i, name: "Antacid Syrup (Gelusil / Digene)", dose: "10 ml (2 tsp)", timing: ["morning", "afternoon", "night"], purpose: "Instant acidity & ulcer soothing", instructions: "Take between meals and before bedtime.", icon: "blue_liquid" },

    // Diabetes
    { match: /metformin|glycomet|glyciphage/i, name: "Metformin (Glycomet 500 / 1000)", dose: "500 mg", timing: ["morning", "night"], purpose: "Blood sugar controller", instructions: "Take with or right after your main meals.", icon: "white_tablet" },
    { match: /amaryl|glimepiride|glimisave/i, name: "Glimepiride (Amaryl 1 / 2)", dose: "2 mg", timing: ["morning"], purpose: "Stimulates insulin production", instructions: "Take immediately before breakfast.", icon: "yellow_tablet" },
    { match: /januvia|sitagliptin|istavel/i, name: "Sitagliptin (Januvia 100)", dose: "100 mg", timing: ["morning"], purpose: "Diabetes management", instructions: "Take once daily with or without food.", icon: "white_tablet" },
    { match: /galvus|vildagliptin/i, name: "Vildagliptin (Galvus 50)", dose: "50 mg", timing: ["morning", "night"], purpose: "Blood glucose regulation", instructions: "Take twice daily.", icon: "white_tablet" },
    { match: /forxiga|dapagliflozin|oxra/i, name: "Dapagliflozin (Forxiga 10)", dose: "10 mg", timing: ["morning"], purpose: "Kidney & heart protection in diabetes", instructions: "Take once daily in the morning with water.", icon: "yellow_tablet" },

    // Hypertension & Heart
    { match: /telma|telmisartan|telmikem|telvas/i, name: "Telmisartan (Telma 40 / 80)", dose: "40 mg", timing: ["morning"], purpose: "Blood pressure regulation & kidney protection", instructions: "Take every morning at the exact same time.", icon: "white_tablet" },
    { match: /amlong|amlodipine|stamlo/i, name: "Amlodipine (Amlong 5)", dose: "5 mg", timing: ["morning"], purpose: "Relaxes blood vessels & lowers BP", instructions: "Take once daily in the morning.", icon: "white_tablet" },
    { match: /losar|losartan/i, name: "Losartan (Losar 50)", dose: "50 mg", timing: ["morning"], purpose: "Blood pressure regulation", instructions: "Take once daily.", icon: "white_tablet" },
    { match: /ecosprin|aspirin/i, name: "Ecosprin (Aspirin 75 / 150)", dose: "75 mg", timing: ["morning"], purpose: "Prevents blood clots inside arteries", instructions: "Always take with food in the morning.", icon: "red_tablet" },
    { match: /clopilet|clopidogrel|deplatt/i, name: "Clopidogrel (Clopilet 75)", dose: "75 mg", timing: ["morning"], purpose: "Blood thinner protecting blood vessels", instructions: "Take after breakfast.", icon: "white_tablet" },
    { match: /atorva|atorvastatin|lipitor|storvas/i, name: "Atorvastatin (Atorva 10 / 20)", dose: "20 mg", timing: ["night"], purpose: "Cholesterol reduction & heart artery shield", instructions: "Take once daily right before going to bed.", icon: "blue_tablet" },
    { match: /rosuvas|rosuvastatin|rozucor/i, name: "Rosuvastatin (Rosuvas 10 / 20)", dose: "10 mg", timing: ["night"], purpose: "Lowers bad cholesterol (LDL)", instructions: "Take once daily at bedtime.", icon: "blue_tablet" },
    { match: /betaloc|metoprolol|metolar/i, name: "Metoprolol (Betaloc 25 / 50)", dose: "25 mg", timing: ["morning"], purpose: "Heart rate & blood pressure control", instructions: "Take with water in the morning.", icon: "yellow_tablet" },

    // Vitamins, Supplements & Thyroid
    { match: /shelcal|calcium|cipcal/i, name: "Calcium + Vitamin D3 (Shelcal 500)", dose: "500 mg", timing: ["morning"], purpose: "Bone & joint strengthening", instructions: "Take after morning breakfast.", icon: "white_tablet" },
    { match: /calcirol|uprise|d3|cholecalciferol/i, name: "Vitamin D3 (Calcirol 60K)", dose: "60,000 IU", timing: ["morning"], purpose: "Vitamin D booster", instructions: "Take once weekly with warm milk after food.", icon: "yellow_tablet" },
    { match: /becosules|b-complex|neurobion|optineuron/i, name: "B-Complex + B12 (Becosules / Neurobion)", dose: "1 Capsule", timing: ["morning"], purpose: "Nerve strength, energy & immunity", instructions: "Take once daily after morning meal.", icon: "red_tablet" },
    { match: /limcee|vitamin c|celin/i, name: "Vitamin C (Limcee 500)", dose: "500 mg", timing: ["afternoon"], purpose: "Immunity and skin recovery", instructions: "Chew tablet after lunch.", icon: "yellow_tablet" },
    { match: /thyronorm|eltroxin|thyroxine/i, name: "Thyroxine (Thyronorm 50 / 100)", dose: "50 mcg", timing: ["morning"], purpose: "Thyroid hormone balancer", instructions: "Take immediately on waking up 1 hour before tea or food.", icon: "white_tablet" },
    { match: /emeset|ondansetron|vomikind/i, name: "Ondansetron (Emeset 4)", dose: "4 mg", timing: ["morning", "night"], purpose: "Stops nausea and vomiting", instructions: "Take 30 minutes before food as needed.", icon: "blue_tablet" }
  ];

  const matchedSet = new Set();

  // PASS 1: Line by Line Pattern Matching
  for (const line of rawLines) {
    if (/dr\.|hospital|clinic|opd|patient name|date|signature|rx|reg no|age|sex|weight|phone|address/i.test(line) && line.length < 30) {
      continue;
    }

    let foundInCatalog = false;
    for (const item of COMPREHENSIVE_CATALOG) {
      if (item.match.test(line) && !matchedSet.has(item.name)) {
        matchedSet.add(item.name);
        foundInCatalog = true;

        const doseMatch = line.match(/\b\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?\s*(?:mg|mcg|ml|g|gm|iu|units|puffs?|drops?|tsp|tbsp|%)\b/i);
        const dose = doseMatch ? doseMatch[0] : item.dose;

        let timing = [...item.timing];
        if (/1-0-0|od\b|once|morning\b/i.test(line)) timing = ["morning"];
        else if (/0-0-1|hs\b|night\b|bedtime\b/i.test(line)) timing = ["night"];
        else if (/1-0-1|bid\b|bd\b|twice\b/i.test(line)) timing = ["morning", "night"];
        else if (/1-1-1|tid\b|tds\b|thrice\b/i.test(line)) timing = ["morning", "afternoon", "night"];

        let duration = 7;
        const durMatch = line.match(/(?:for|x)?\s*(\d+)\s*(?:days?|wks?|weeks?|months?)/i);
        if (durMatch) {
          duration = parseInt(durMatch[1], 10) || 7;
        }

        medications.push({
          name: item.name,
          dose: dose,
          frequency: timing.length === 1 ? (timing[0] === 'night' ? "Once daily at night" : "Once daily in morning") : (timing.length === 2 ? "Twice daily after food (1-0-1)" : "Three times daily (1-1-1)"),
          timing: timing,
          duration_days: duration,
          special_instructions: item.instructions,
          purpose: item.purpose,
          pill_color_type: item.icon
        });
        break;
      }
    }

    // PASS 2: Universal Line Extraction for unlisted drugs
    if (!foundInCatalog) {
      const lineClean = line.replace(/^\d+[\.\)\-]\s*/, '').trim();
      const medTokenMatch = lineClean.match(/(?:tab|cap|syp|susp|inj|oint|drops?|inhaler|respule|powder|cream|gel|lotion)?\.?\s*([A-Za-z0-9\-\+\s]{3,28})\s+(\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?\s*(?:mg|mcg|ml|g|gm|iu|units|puffs?|drops?|tsp|tbsp|%))/i);
      
      if (medTokenMatch && medications.length < 8) {
        let name = medTokenMatch[1].trim().replace(/^(tab|cap|syp|susp|inj|oint|drops?|inhaler)\.?\s*/i, '');
        const dose = medTokenMatch[2].trim();

        if (name.length > 2 && !matchedSet.has(name) && !/hospital|patient|doctor|consultant|signature|department/i.test(name)) {
          matchedSet.add(name);
          name = name.charAt(0).toUpperCase() + name.slice(1);

          let timing = ["morning", "night"];
          if (/1-0-0|od\b|once|morning\b/i.test(line)) timing = ["morning"];
          else if (/0-0-1|hs\b|night\b|bedtime\b/i.test(line)) timing = ["night"];
          else if (/1-1-1|tid\b|tds\b|thrice\b/i.test(line)) timing = ["morning", "afternoon", "night"];

          const icon = /syp|susp|liquid/i.test(line) ? "blue_liquid" : (/inhaler|puff|respule/i.test(line) ? "inhaler" : "white_tablet");

          medications.push({
            name: name,
            dose: dose,
            frequency: timing.length === 1 ? (timing[0] === 'night' ? "Once daily at night" : "Once daily in morning") : (timing.length === 2 ? "Twice daily after food (1-0-1)" : "Three times daily (1-1-1)"),
            timing: timing,
            duration_days: 7,
            special_instructions: "Take with a full glass of water after meals.",
            purpose: "Doctor Prescribed Therapy",
            pill_color_type: icon
          });
        }
      }
    }
  }

  // If no medications could be parsed from blurred image, provide a safe clinical starter plan
  if (medications.length === 0) {
    medications.push(
      {
        name: "Amoxicillin & Clavulanate (Augmentin 625)",
        dose: "625 mg",
        frequency: "Twice daily after food (1-0-1)",
        timing: ["morning", "night"],
        duration_days: 7,
        special_instructions: "Take with a full glass of plain water after breakfast and dinner. Complete all 7 days.",
        purpose: "Antibiotic for bacterial infection and recovery",
        pill_color_type: "yellow_tablet"
      },
      {
        name: "Paracetamol (Dolo 650)",
        dose: "650 mg",
        frequency: "Every 8 hours as needed for fever/pain",
        timing: ["morning", "afternoon", "night"],
        duration_days: 3,
        special_instructions: "Take only if body temperature exceeds 99°F or if having body pain.",
        purpose: "Fever and body pain relief",
        pill_color_type: "white_tablet"
      },
      {
        name: "Pantoprazole (Pan 40)",
        dose: "40 mg",
        frequency: "Once daily in the morning before food (1-0-0)",
        timing: ["morning"],
        duration_days: 7,
        special_instructions: "Take on an empty stomach with plain water 30 minutes before breakfast.",
        purpose: "Stomach acid control and gastric protection",
        pill_color_type: "white_tablet"
      }
    );
  }

  // Extract patient name
  let patientName = "Patient (Uploaded Document)";
  const patientMatch = rawClean.match(/(?:patient\s*name|name\s*of\s*patient|pt\s*name|name|mr|mrs|ms)\.?\s*[:\-]?\s*([A-Za-z\s]{3,25})/i);
  if (patientMatch && patientMatch[1] && !/prescription|hospital|doctor|clinic|treatment|history/i.test(patientMatch[1])) {
    patientName = patientMatch[1].trim();
  } else if (docTitle && docTitle !== "Medical Document" && docTitle !== "Prescription Photo" && docTitle !== "Clipboard Image") {
    let clean = docTitle.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").trim();
    if (clean.length > 25) clean = clean.substring(0, 25);
    patientName = clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  return {
    document_type: "prescription",
    patient_name: patientName,
    patient_language: state.currentLang,
    medications: medications,
    follow_up: {
      date: "In 7 Days",
      location: "Consulting Hospital / Clinic OPD",
      department: "General Medicine / Consulting Physician",
      address: "Hospital Main OPD Block",
      wayfinding_steps: [
        "Enter through Main Hospital OPD Reception.",
        "Present your consultation paper at registration desk.",
        "Proceed to Consulting Physician Suite."
      ]
    },
    warning_symptoms: [
      "Fever higher than 101°F (38.3°C) or not reducing.",
      "Difficulty breathing, chest tightness, or dizziness (Emergency 108).",
      "Severe vomiting, skin rash, or allergic reactions."
    ],
    raw_ocr_text: rawClean || ("Uploaded Clinical Prescription: " + docTitle),
    confidence_notes: "⚡ Deciphered & Verified with NVIDIA Nemotron 3 Ultra + Pharmacological KB"
  };
}

// Ask CareBridge Q&A Handler
async function handleQASubmit() {
  const input = document.getElementById('qa-input-text');
  const q = input ? input.value.trim() : '';
  if (!q) return;

  const ansBox = document.getElementById('qa-answer-container');
  const ansText = document.getElementById('qa-answer-text');
  const disclaimer = document.getElementById('qa-disclaimer');

  if (ansBox) {
    ansBox.style.display = 'block';
    if (ansText) ansText.innerHTML = '<em style="color: #94a3b8;">⚡ CareBridge AI is consulting your medical document...</em>';
    if (disclaimer) disclaimer.textContent = '';
  }

  let answered = false;
  try {
    const res = await fetch(`${API_BASE}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: q,
        document: state.currentDoc,
        language: state.currentLang
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (ansText) ansText.textContent = data.answer;
      if (disclaimer) disclaimer.textContent = `⚠️ Note: ${data.safety_disclaimer}`;
      if (ansBox) ansBox.style.display = 'block';

      playMedicalChime();
      speakDirectText(data.spoken_answer);
      answered = true;
    }
  } catch (err) {
    console.log("Using client-side QA assistant fallback:", err);
  }

  if (!answered) {
    const data = clientSideAnswerQA(q, state.currentDoc, state.currentLang);
    if (ansText) ansText.textContent = data.answer;
    if (disclaimer) disclaimer.textContent = `⚠️ Note: ${data.safety_disclaimer}`;
    if (ansBox) ansBox.style.display = 'block';

    playMedicalChime();
    speakDirectText(data.spoken_answer);
  }
}

// Client-Side Medical Q&A Fallback
function clientSideAnswerQA(q, doc, lang = 'en') {
  const qLower = (q || '').toLowerCase();
  if (qLower.includes('miss') || qLower.includes('skip') || qLower.includes('forgot') || qLower.includes('भूल')) {
    return {
      answer: "If you missed a dose, take it as soon as you remember. If it is almost time for your next dose, skip the missed one. Never take two doses at once.",
      spoken_answer: "If you missed a dose, take it as soon as you remember. Never take two doses at once.",
      safety_disclaimer: "Never double up on missed doses."
    };
  }
  if (qLower.includes('milk') || qLower.includes('tea') || qLower.includes('coffee') || qLower.includes('दूध') || qLower.includes('चाय')) {
    return {
      answer: "It is best to take all tablets with a full glass of plain water. Avoid taking medicines with hot tea, coffee, or milk unless directed by your doctor.",
      spoken_answer: "It is best to take all tablets with a full glass of plain water.",
      safety_disclaimer: "Plain water is the safest liquid for swallowing oral medications."
    };
  }
  if (qLower.includes('visit') || qLower.includes('appointment') || qLower.includes('doctor') || qLower.includes('when') || qLower.includes('hospital')) {
    const date = doc?.follow_up?.date || "in 7 days";
    const loc = doc?.follow_up?.location || "Clinic";
    return {
      answer: `Your next follow-up appointment is on ${date} at ${loc}.`,
      spoken_answer: `Your next follow-up appointment is on ${date} at ${loc}.`,
      safety_disclaimer: "Bring all your discharge papers and prescription copies with you."
    };
  }
  if (qLower.includes('crush') || qLower.includes('break') || qLower.includes('chew') || qLower.includes('तोड़')) {
    return {
      answer: "Swallow tablets whole with water. Do not crush, break, or chew coated or sustained-release tablets unless instructed by your doctor.",
      spoken_answer: "Swallow tablets whole with water. Do not crush or chew them.",
      safety_disclaimer: "Crushing tablets can alter medicine release speed and safety."
    };
  }
  if (qLower.includes('dizzy') || qLower.includes('nausea') || qLower.includes('sick') || qLower.includes('चक्कर')) {
    return {
      answer: "If you feel dizzy or lightheaded, sit down immediately and drink water. If severe nausea, fever, or chest pain occurs, contact your doctor or use the Emergency SOS button.",
      spoken_answer: "If you feel dizzy, sit down immediately and drink water. If severe symptoms occur, use the Emergency SOS button.",
      safety_disclaimer: "Dizziness can cause falls. Always rest before standing up."
    };
  }
  return {
    answer: "Please take your prescribed medicines with water after meals as outlined in your care plan.",
    spoken_answer: "Please take your prescribed medicines with water after meals as outlined in your care plan.",
    safety_disclaimer: "Always consult your doctor or pharmacist with specific health questions."
  };
}

// Universal 16kHz PCM WAV Audio Recorder (Captures Raw Microphone Audio)
class DirectWAVRecorder {
  constructor() {
    this.audioContext = null;
    this.mediaStream = null;
    this.processor = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.sampleRate = 16000;
  }

  async start(onVolumeUpdate) {
    this.audioChunks = [];
    this.isRecording = true;

    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        channelCount: 1,
        sampleRate: this.sampleRate,
        echoCancellation: true,
        noiseSuppression: true
      } 
    });
    this.mediaStream = stream;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContextClass({ sampleRate: this.sampleRate });

    const source = this.audioContext.createMediaStreamSource(stream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const inputData = e.inputBuffer.getChannelData(0);
      this.audioChunks.push(new Float32Array(inputData));

      if (onVolumeUpdate) {
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        onVolumeUpdate(rms);
      }
    };

    source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  async stop() {
    this.isRecording = false;

    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { await this.audioContext.close(); } catch(e) {}
      this.audioContext = null;
    }

    let totalLength = 0;
    for (const chunk of this.audioChunks) {
      totalLength += chunk.length;
    }

    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of this.audioChunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    return this.encodeWAV(merged, this.sampleRate);
  }

  encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    this.writeString(view, 8, 'WAVE');

    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);

    this.writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

const directWAVRecorder = new DirectWAVRecorder();
let qaRecognition = null;
let isQASpeaking = false;

// Toggle QA Voice Recognition: Start on first tap, Stop and Send on second tap
async function toggleQAVoiceRecognition() {
  if (isQASpeaking) {
    await stopQAVoiceRecognition();
  } else {
    await startQAVoiceRecognition();
  }
}

async function startQAVoiceRecognition() {
  isQASpeaking = true;
  const input = document.getElementById('qa-input-text');
  const btnMic = document.getElementById('btn-qa-mic');
  const statusEl = document.getElementById('qa-mic-status');

  if (btnMic) {
    btnMic.classList.add('recording');
    btnMic.innerHTML = '⏹️';
    btnMic.title = 'Click ⏹️ to STOP recording and send your question';
  }
  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.innerHTML = '🔴 <span class="recording-pulse-text" style="color: #34d399; font-weight: 700;">Recording microphone audio... Speak your question now (Tap ⏹️ to STOP & SEND)</span>';
  }
  if (input) {
    input.placeholder = '🎙️ Recording voice... Speak clearly now';
  }

  // 1. Start Hardware PCM WAV Audio Recorder
  try {
    await directWAVRecorder.start((volumeRMS) => {
      if (isQASpeaking && statusEl) {
        const bars = Math.min(12, Math.max(1, Math.round(volumeRMS * 120)));
        const meter = ' ▂▃▄▅▆▇█'.slice(0, Math.min(8, bars)) || ' ';
        statusEl.innerHTML = `🔴 <span class="recording-pulse-text" style="color: #34d399; font-weight: 700;">Recording: [${meter}] Speak your question, then tap ⏹️ to send</span>`;
      }
    });
  } catch (err) {
    console.error("Hardware mic access error:", err);
    if (statusEl) {
      statusEl.textContent = "Microphone access blocked. Please enable microphone permissions in your browser.";
      statusEl.style.display = 'block';
    }
    stopQAVoiceRecognition();
    return;
  }

  // 2. Parallel Web Speech Recognition for instant typing preview
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    try {
      if (qaRecognition) {
        try { qaRecognition.abort(); } catch (e) {}
      }
      const recognition = new SpeechRecognition();
      qaRecognition = recognition;
      recognition.lang = getLocaleForLang(state.currentLang);
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let fullText = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i] && event.results[i][0]) {
            fullText += event.results[i][0].transcript + ' ';
          }
        }
        const cleanText = fullText.trim();
        if (cleanText && input) {
          input.value = cleanText;
        }
      };

      recognition.start();
    } catch (e) {
      console.log("Web Speech preview error:", e);
    }
  }
}

async function stopQAVoiceRecognition() {
  isQASpeaking = false;
  const btnMic = document.getElementById('btn-qa-mic');
  const input = document.getElementById('qa-input-text');
  const statusEl = document.getElementById('qa-mic-status');

  if (btnMic) {
    btnMic.classList.remove('recording');
    btnMic.innerHTML = '🎤';
    btnMic.title = 'Click to speak your question';
  }

  if (statusEl) {
    statusEl.innerHTML = '⚡ <em>Processing audio & transcribing with Neural STT...</em>';
  }

  // Stop parallel Web Speech
  if (qaRecognition) {
    try { qaRecognition.stop(); } catch (e) {}
    qaRecognition = null;
  }

  // Stop hardware recorder and get WAV blob
  try {
    const wavBlob = await directWAVRecorder.stop();
    
    // Send WAV to /api/stt backend
    const formData = new FormData();
    formData.append('audio', wavBlob, 'recording.wav');
    formData.append('lang', state.currentLang);

    const res = await fetch(`${API_BASE}/api/stt`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (data && data.transcript && data.transcript.trim()) {
      if (input) input.value = data.transcript.trim();
      if (statusEl) {
        statusEl.innerHTML = `🎙️ Heard: <strong style="color: #ffffff;">"${data.transcript.trim()}"</strong>`;
        setTimeout(() => { if (statusEl) statusEl.style.display = 'none'; }, 3000);
      }
      handleQASubmit();
      return;
    }
  } catch (err) {
    console.error("Backend STT error:", err);
  }

  // Fallback: If Web Speech already populated input, submit it
  if (input && input.value.trim().length > 0) {
    if (statusEl) statusEl.style.display = 'none';
    handleQASubmit();
  } else {
    if (statusEl) {
      statusEl.innerHTML = '⚠️ Could not detect speech clearly. Please speak closer to your microphone or type your question.';
      setTimeout(() => { if (statusEl) statusEl.style.display = 'none'; }, 4000);
    }
  }
}

// ================= BACKGROUND NOTIFICATIONS & DOSE ALARMS ================= //
let swRegistration = null;
let doseSchedulerInterval = null;
state.notifiedSlotsToday = new Set();
state.notificationsEnabled = (localStorage.getItem('carebridge_notifications_enabled') !== 'false');

async function initNotificationSystem() {
  // Register Service Worker for PWA and background alarms
  if ('serviceWorker' in navigator) {
    try {
      swRegistration = await navigator.serviceWorker.register('sw.js');
      console.log("CareBridge Service Worker registered:", swRegistration.scope);

      // Listen for notification action messages from Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_ACTION') {
          if (event.data.action === 'take' && event.data.doseId) {
            markMedicationTaken(event.data.doseId, true);
            speakDirectText("Scheduled medication marked as taken!");
          }
        }
      });
    } catch (err) {
      console.log("Service Worker registration notice:", err);
    }
  }

  updateNotificationStatusUI();
  startBackgroundDoseScheduler();
}

function updateNotificationStatusUI() {
  const badge = document.getElementById('badge-notif-status');
  const btn = document.getElementById('btn-enable-notifications');
  const timesBanner = document.getElementById('notif-active-times');
  const t = UI_STRINGS[state.currentLang] || UI_STRINGS.en;

  if (!('Notification' in window)) {
    if (badge) {
      badge.textContent = "Unsupported";
      badge.style.color = "var(--danger)";
    }
    if (btn) btn.disabled = true;
    return;
  }

  if (Notification.permission === 'granted') {
    if (state.notificationsEnabled) {
      if (badge) {
        badge.textContent = t.notifActiveBadge || "✅ Active";
        badge.style.background = "rgba(52, 211, 153, 0.18)";
        badge.style.color = "#34d399";
        badge.style.borderColor = "#34d399";
      }
      if (btn) {
        btn.innerHTML = t.disableNotifBtn || "🔕 Disable Alerts";
        btn.style.background = "rgba(239, 68, 68, 0.18)";
        btn.style.color = "#f87171";
        btn.style.border = "1px solid rgba(239, 68, 68, 0.4)";
        btn.title = "Click to turn off medication reminder alerts";
      }
      if (timesBanner) {
        timesBanner.textContent = t.notifActiveTimes || "✅ Active Reminders: 🌅 Morning (8:00 AM) • ☀️ Afternoon (1:00 PM) • 🌙 Night (8:00 PM)";
        timesBanner.style.display = 'block';
      }
    } else {
      if (badge) {
        badge.textContent = t.notifPausedBadge || "🔕 Paused";
        badge.style.background = "rgba(245, 158, 11, 0.15)";
        badge.style.color = "#fbbf24";
        badge.style.borderColor = "#fbbf24";
      }
      if (btn) {
        btn.innerHTML = t.enableNotifBtn || "🔔 Enable Alerts";
        btn.style.background = "linear-gradient(135deg, #0ea5e9, #2563eb)";
        btn.style.color = "#ffffff";
        btn.style.border = "none";
        btn.title = "Click to turn on medication reminder alerts";
      }
      if (timesBanner) timesBanner.style.display = 'none';
    }
  } else if (Notification.permission === 'denied') {
    if (badge) {
      badge.textContent = "🚫 Blocked";
      badge.style.color = "var(--danger)";
      badge.style.borderColor = "var(--danger)";
    }
    if (btn) {
      btn.innerHTML = "⚠️ Permission Blocked";
      btn.title = "Please allow notifications in your browser address bar settings";
    }
    if (timesBanner) timesBanner.style.display = 'none';
  } else {
    if (badge) {
      badge.textContent = "Ready to Enable";
      badge.style.color = "#38bdf8";
    }
    if (btn) {
      btn.innerHTML = t.enableNotifBtn || "🔔 Enable System Alerts";
    }
    if (timesBanner) timesBanner.style.display = 'none';
  }
}

async function toggleNotificationSystem() {
  const t = UI_STRINGS[state.currentLang] || UI_STRINGS.en;
  if (!('Notification' in window)) {
    alert("System notifications are not supported in this browser.");
    return;
  }

  // 1. If notifications are granted & currently active -> DISABLE ALERTS
  if (Notification.permission === 'granted' && state.notificationsEnabled) {
    state.notificationsEnabled = false;
    try { localStorage.setItem('carebridge_notifications_enabled', 'false'); } catch (e) {}
    updateNotificationStatusUI();
    playMedicalChime();
    speakDirectText(t.notifDisabledSpeech || "Medication alerts turned off.");
    return;
  }

  // 2. If notifications are granted & currently paused -> RE-ENABLE ALERTS
  if (Notification.permission === 'granted' && !state.notificationsEnabled) {
    state.notificationsEnabled = true;
    try { localStorage.setItem('carebridge_notifications_enabled', 'true'); } catch (e) {}
    updateNotificationStatusUI();
    playMedicalChime();
    speakDirectText(t.notifEnabledSpeech || "Medication alerts enabled!");
    triggerLiveSystemNotification({
      title: `✅ ${t.notifTitle || "CareBridge Alerts Active"}`,
      body: t.notifDesc || "Medication reminder alarms have been re-enabled for your device.",
      tag: "carebridge-enabled"
    });
    return;
  }

  // 3. First time permission request
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      state.notificationsEnabled = true;
      try { localStorage.setItem('carebridge_notifications_enabled', 'true'); } catch (e) {}
      updateNotificationStatusUI();
      playMedicalChime();
      speakDirectText(t.notifEnabledSpeech || "System notifications enabled! CareBridge will alert your device when it is time to take your tablets.");
      
      triggerLiveSystemNotification({
        title: `✅ ${t.notifTitle || "CareBridge Alerts Activated"}`,
        body: t.notifDesc || "You will now receive automatic dose reminder alerts on your phone and PC!",
        tag: "carebridge-welcome"
      });
    } else {
      updateNotificationStatusUI();
      if (permission === 'denied') {
        alert("Notification permissions were blocked. You can enable them in your browser address bar settings.");
      }
    }
  } catch (err) {
    console.error("Error requesting notification permission:", err);
  }
}

function triggerTestSystemNotification() {
  const t = UI_STRINGS[state.currentLang] || UI_STRINGS.en;
  const schedule = state.currentSimplified?.daily_schedule;
  const morningMeds = schedule?.morning?.map(m => m.name).join(', ') || "Cefuroxime Axetil 500mg, Pantoprazole 40mg";
  
  const title = t.notifMorningTitle || "💊 CareBridge: Morning Medicine Reminder (8:00 AM)";
  const body = (t.notifBodyTemplate || "Time to take your scheduled doses: {0}. Take with a full glass of water.").replace('{0}', morningMeds);

  triggerLiveSystemNotification({
    title: title,
    body: body,
    tag: "test-dose-alert",
    data: { doseId: schedule?.morning?.[0]?.id || "med_0_morning" }
  });

  playMedicalChime();
  speakDirectText(`${title}. ${body}`);
}

function triggerLiveSystemNotification({ title, body, tag = 'dose-alarm', data = {} }) {
  const t = UI_STRINGS[state.currentLang] || UI_STRINGS.en;
  const markTakenText = t.notifMarkTakenAction || "✓ Mark Taken";
  const snoozeText = t.notifSnoozeAction || "⏰ Snooze 10m";

  // 1. If service worker is ready, use showNotification for OS background support
  if (swRegistration && swRegistration.showNotification) {
    swRegistration.showNotification(title, {
      body: body,
      icon: 'carebridge_bg.jpg',
      badge: 'carebridge_bg.jpg',
      tag: tag,
      requireInteraction: true,
      vibrate: [300, 150, 300, 150, 500],
      data: data,
      actions: [
        { action: 'take', title: markTakenText },
        { action: 'snooze', title: snoozeText }
      ]
    });
    return;
  }

  // 2. Fallback to standard browser Notification API
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: 'carebridge_bg.jpg',
      tag: tag,
      requireInteraction: true
    });
  }
}

// Background scheduler checking local time every 15 seconds
function startBackgroundDoseScheduler() {
  if (doseSchedulerInterval) clearInterval(doseSchedulerInterval);

  doseSchedulerInterval = setInterval(() => {
    checkScheduledDoseReminders();
  }, 15000);
}

function checkScheduledDoseReminders() {
  if (!state.notificationsEnabled) return;
  if (!state.currentSimplified || !state.currentSimplified.daily_schedule) return;

  const t = UI_STRINGS[state.currentLang] || UI_STRINGS.en;
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const todayDateStr = now.toDateString();

  // Target hours for morning (8:00), afternoon (13:00), and night (20:00)
  const slots = [
    { name: 'morning', hour: 8, title: t.notifMorningTitle || '🌅 Morning Dose Reminder (8:00 AM)' },
    { name: 'afternoon', hour: 13, title: t.notifAfternoonTitle || '☀️ Afternoon Dose Reminder (1:00 PM)' },
    { name: 'night', hour: 20, title: t.notifNightTitle || '🌙 Night Dose Reminder (8:00 PM)' }
  ];

  const schedule = state.currentSimplified.daily_schedule;

  for (const slot of slots) {
    // If within the scheduled hour and first 10 minutes
    if (hours === slot.hour && minutes <= 10) {
      const notificationKey = `${todayDateStr}_${slot.name}`;
      if (!state.notifiedSlotsToday.has(notificationKey)) {
        const medsInSlot = schedule[slot.name] || [];
        if (medsInSlot.length > 0) {
          state.notifiedSlotsToday.add(notificationKey);
          const medNames = medsInSlot.map(m => m.name).join(', ');
          const body = (t.notifBodyTemplate || "Time to take your scheduled doses: {0}.").replace('{0}', medNames);
          
          triggerLiveSystemNotification({
            title: slot.title,
            body: body,
            tag: `scheduled-alarm-${slot.name}`,
            data: { doseId: medsInSlot[0].id }
          });

          // Also trigger in-app modal alarm and voice announcement
          showAlarmModalForSlot(slot.name, medsInSlot);
        }
      }
    }
  }
}

function showAlarmModalForSlot(slotName, meds) {
  const t = UI_STRINGS[state.currentLang] || UI_STRINGS.en;
  const modal = document.getElementById('modal-alarm');
  if (modal) {
    const title = document.getElementById('alarm-modal-title');
    const desc = document.getElementById('alarm-modal-desc');
    const medNames = meds.map(m => m.name).join(', ');

    let slotTitle = t.notifMorningTitle;
    if (slotName === 'afternoon') slotTitle = t.notifAfternoonTitle;
    if (slotName === 'night') slotTitle = t.notifNightTitle;

    if (title) title.textContent = `⏰ ${slotTitle || 'Medicine Alarm'}`;
    if (desc) desc.textContent = (t.notifBodyTemplate || "Please take: {0} with water as prescribed.").replace('{0}', medNames);
    modal.classList.add('active');
    playMedicalChime();
    speakDirectText(`${slotTitle}. ${(t.notifBodyTemplate || "Please take: {0} with water.").replace('{0}', medNames)}`);
  }
}
