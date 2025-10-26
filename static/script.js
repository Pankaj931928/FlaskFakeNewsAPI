// FINAL WORKING JAVASCRIPT CODE - Database Registration and Login

// Global Flags and Cache
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; 
let isTranslated = false; 
let originalTextCache = ''; 


// --- Modal and Login/Guest Functions ---

function closeModal() {
    const modal = document.getElementById('initial-modal');
    const mainContent = document.getElementById('main-content');

    // Smooth Fade-out logic
    modal.classList.add('modal-fade-out');

    modal.addEventListener('animationend', () => {
        modal.style.display = 'none';
        
        mainContent.style.display = 'block';
        mainContent.classList.add('content-fade-in'); 
        
        updateProFeaturesVisibility();
        modal.classList.remove('modal-fade-out');
    }, { once: true }); 

    if (modal.getAnimations().length === 0) {
        modal.style.display = 'none';
        mainContent.style.display = 'block';
        updateProFeaturesVisibility();
    }
}

function openLoginForm() {
    const authForms = document.getElementById('auth-forms');
    if (authForms) authForms.style.display = 'block'; 
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-message').textContent = '';
}

function openSignupForm() {
    const authForms = document.getElementById('auth-forms');
    if (authForms) authForms.style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('signup-message').textContent = '';
}

// --- CRITICAL FIX: Missing Event Listeners ---
document.getElementById('login-btn').onclick = openLoginForm;
document.getElementById('signup-btn').onclick = openSignupForm;


// --- Database Integration & API Calls ---

// Function to handle Signup (sends data to /register)
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    // FormData se saare fields ka data collect karna
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const messageDiv = document.getElementById('signup-message');
    
    messageDiv.textContent = 'Registering...';

    // Data ko Flask /register API ko bhejna
    const response = await fetch('/register', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
        // Registration successful hone par turant Login status set karna
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('isLoggedIn', 'true');
        isLoggedIn = true;
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Registration successful! Logging in...';
        setTimeout(closeModal, 1500);
    } else {
        messageDiv.style.color = 'red';
        messageDiv.textContent = result.message || 'Registration failed.';
    }
});


// Function to handle login (sends data to /login)
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const messageDiv = document.getElementById('login-message');

    messageDiv.textContent = 'Logging in...';

    // Data ko Flask /login API ko bhejna
    const response = await fetch('/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
        // Login successful hone par turant Login status set karna
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('isLoggedIn', 'true');
        isLoggedIn = true;
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Login successful!';
        setTimeout(closeModal, 1500);
    } else {
        messageDiv.style.color = 'red';
        messageDiv.textContent = result.message || 'Login failed: Invalid credentials.';
    }
});


// --- Profile/Pro Tools Logic ---

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


// --- Feature Functions (Speak, Translate, SendNews) ---

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

// Function 5: Send news to API (Flask Backend) - No changes
async function sendNews(inputType) {
    // ... (Your previous working API call logic)
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


// FEATURE 1: Text Speaker Logic 
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

// FEATURE 2: Translation Logic (Mock) 
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
        
        textarea.value = `[HINDI MOCK] ${translatedText}`;
        isTranslated = true;
    } else {
        textarea.value = originalTextCache;
        isTranslated = false;
    }
}

// Initial call when page is loaded
window.onload = function() {
    updateProFeaturesVisibility(); 
};