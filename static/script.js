// static/script.js - Translation logic ko replace karo

// Global Flag to track login status
let isLoggedIn = false; 
let isTranslated = false; 
let originalTextCache = ''; // Original text save karne ke liye

// ... (baki saare functions: closeModal, openLoginForm, showInput, sendNews, etc.)


// --- NEW FEATURE 2: Translation Logic (Mock) ---
function translateText() {
    const textarea = document.getElementById('news-text');
    let currentText = textarea.value;

    if (!currentText) {
        alert("Please paste text in the Text Input area first.");
        return;
    }

    if (!isTranslated) {
        // English to Hindi/Hinglish (Mock Translation)
        originalTextCache = currentText; // Original text ko save karo

        let translatedText = currentText
            .replace(/news/gi, 'खबर')
            .replace(/today/gi, 'आज')
            .replace(/is/gi, 'है')
            .replace(/real/gi, 'सत्य')
            .replace(/actor/gi, 'अभिनेता');
        
        // FIX: Textarea mein translated text dikhaana
        textarea.value = `[HINDI MOCK] ${translatedText}`;
        isTranslated = true;
        // alert ko hata diya, ab text area mein hi dikhega
    } else {
        // Back to Original English
        textarea.value = originalTextCache;
        isTranslated = false;
        // alert ko hata diya
    }
}