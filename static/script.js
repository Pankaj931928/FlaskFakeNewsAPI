// FINAL WORKING JAVASCRIPT CODE

// Global Flags and Cache
let isLoggedIn = false; 
let isTranslated = false; 
let originalTextCache = ''; 


// --- Modal and Login/Guest Functions (Fixes Login Fail) ---

function closeModal() {
    // Ye function Guest/Login hone par modal band karta hai
    document.getElementById('initial-modal').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    updateProFeaturesVisibility(); // Pro Tools tab ko update karta hai
}

function openLoginForm() {
    const authForms = document.getElementById('auth-forms');
    if (authForms) authForms.style.display = 'block'; 
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
}

function openSignupForm() {
    const authForms = document.getElementById('auth-forms');
    if (authForms) authForms.style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
}

// Function to control Pro Features visibility (Guest vs Login)
function updateProFeaturesVisibility() {
    const proGuestDiv = document.getElementById('pro-features-guest');
    const proLoggedInDiv = document.getElementById('pro-features-logged-in');

    if (proGuestDiv && proLoggedInDiv) {
        if (isLoggedIn) {
            proLoggedInDiv.style.display = 'block';
            proGuestDiv.style.display = 'none';
        } else {
            proLoggedInDiv.style.display = 'none';
            proGuestDiv.style.display = 'block';
        }
    }
}


// --- Event Listeners (CRITICAL FIX for Button Not Working) ---

// FIX: 'onclick' property use ki gayi hai for reliability
document.getElementById('login-btn').onclick = openLoginForm;
document.getElementById('signup-btn').onclick = openSignupForm;


// Login Form Submit Logic
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    isLoggedIn = true;
    alert("Login Successful! Pro features unlocked.");
    closeModal(); 
});

// Signup Form Submit Logic
document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault(); 
    isLoggedIn = true;
    alert("Signup Successful! Pro features unlocked.");
    closeModal();
});


// --- Tab Switching ---

function showInput(type) {
    document.querySelectorAll('.input-section').forEach(section => {
        section.style.display = 'none';
    });
    document.querySelectorAll('.tab-buttons button').forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(type + '-input').style.display = 'block';
    document.getElementById(type + '-tab').classList.add('active');

    if (type === 'tools') {
        updateProFeaturesVisibility();
    }
}


// Function 5: Send news to API (Flask Backend) - No changes here
async function sendNews(inputType) {
    const inputElement = (inputType === 'text') ? 
                         document.getElementById('news-text') : 
                         document.getElementById('news-url');
    
    const newsInput = inputElement.value.trim();
    const resultBox = document.getElementById('result-box');

    if (!newsInput) {
        resultBox.className = 'result loading';
        resultBox.innerHTML = 'Please enter text or a URL to check.';
        return;
    }

    resultBox.className = 'result loading';
    resultBox.innerHTML = 'Checking... Please wait.';

    try {
        const response = await fetch('/api/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: newsInput, type: inputType }),
        });

        const result = await response.json();
        
        if (result.isFake) {
            resultBox.className = 'result fake';
            resultBox.innerHTML = `<h2>🚨 FAKE NEWS DETECTED 🚨</h2><p>Confidence: ${result.confidence}%</p><p class="small-text">${result.reason}</p>`;
        } else {
            resultBox.className = 'result real';
            resultBox.innerHTML = `<h2>✅ NEWS APPEARS REAL ✅</h2><p>Confidence: ${result.confidence}%</p><p class="small-text">${result.reason}</p>`;
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        resultBox.className = 'result fake';
        resultBox.innerHTML = '<h2>❌ ERROR ❌</h2><p>Could not connect to the server (API Error).</p>';
    }
}


// --- FEATURE 1: Text Speaker Logic ---
function speakText() {
    const textToSpeak = document.getElementById('news-text').value;
    if (!textToSpeak) {
        alert("Please paste text in the Text Input area first.");
        return;
    }
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'en-IN'; 
    window.speechSynthesis.speak(utterance);
}

// --- FEATURE 2: Translation Logic (Mock) ---
function translateText() {
    const textarea = document.getElementById('news-text');
    let currentText = textarea.value;

    if (!currentText) {
        alert("Please paste text in the Text Input area first.");
        return;
    }

    if (!isTranslated) {
        originalTextCache = currentText;

        let translatedText = currentText
            .replace(/news/gi, 'खबर')
            .replace(/today/gi, 'आज')
            .replace(/is/gi, 'है')
            .replace(/real/gi, 'सत्य')
            .replace(/actor/gi, 'अभिनेता');
        
        // FIX: Translation text area mein dikhana
        textarea.value = `[HINDI MOCK] ${translatedText}`;
        isTranslated = true;
    } else {
        // Back to Original English
        textarea.value = originalTextCache;
        isTranslated = false;
    }
}

// Initial call when page is loaded
window.onload = function() {
    updateProFeaturesVisibility(); 
};