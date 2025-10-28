// FINAL WORKING JAVASCRIPT CODE - Profile, Avatar, Login/Logout

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
        
        updateUIOnLoginStatus();
        modal.classList.remove('modal-fade-out');
    }, { once: true }); 

    if (modal.getAnimations().length === 0) {
        modal.style.display = 'none';
        mainContent.style.display = 'block';
        updateUIOnLoginStatus();
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

// CRITICAL FIX: Missing Event Listeners for Login/Signup buttons
document.getElementById('login-btn').onclick = openLoginForm;
document.getElementById('signup-btn').onclick = openSignupForm;


// --- DATABASE INTEGRATION & API Calls (Mock) ---

// Function to handle Signup (MOCK sends data to /register)
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const messageDiv = document.getElementById('signup-message');
    
    // For mock: LocalStorage use karna
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', data.username);
    localStorage.setItem('userGender', data.gender);
    localStorage.setItem('userBirthDate', data.birth_date); 

    isLoggedIn = true;
    messageDiv.style.color = 'green';
    messageDiv.textContent = 'Registration successful (Mock)! Logging in...';
    setTimeout(closeModal, 1500); 
});


// Function to handle login (MOCK sends data to /login)
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const messageDiv = document.getElementById('login-message');

    // For mock: assume login is successful if email is provided
    if (data.email) { 
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('isLoggedIn', 'true');
        isLoggedIn = true;
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Login successful!';
        setTimeout(closeModal, 1500);
    } else {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Login failed: Invalid credentials.';
    }
});


// Function to handle Logout
function logoutUser() {
    localStorage.clear(); 
    isLoggedIn = false;
    alert("Logged out successfully. Reloading page.");
    window.location.reload(); 
}

// --- PROFILE & AVATAR HANDLING (FINAL PATHS) ---

function displayUserAvatar() {
    const avatarIcon = document.getElementById('avatar-icon');
    const profileAvatar = document.getElementById('profile-avatar');
    
    if (!avatarIcon || !profileAvatar) return;

    const savedAvatar = localStorage.getItem('userAvatar');
    const gender = localStorage.getItem('userGender');
    
    let avatarSrc;
    if (savedAvatar && isLoggedIn) {
        avatarSrc = savedAvatar; // Custom image (Base64)
    } else if (isLoggedIn || gender) {
        // Default avatar (Gender ke hisaab se)
        // Correct file extension (Male: webp, Female: jpeg)
        avatarSrc = gender === 'Female' ? 
                    '{{ url_for("static", filename="image/default_female.jpeg") }}' : 
                    '{{ url_for("static", filename="image/default_male.webp") }}';

    } else {
        // Guest mode - default male
        avatarSrc = '{{ url_for("static", filename="image/default_male.webp") }}';
    }
    
    avatarIcon.src = avatarSrc;
    profileAvatar.src = avatarSrc;
}

function updateProfileDetails() {
    const usernameSpan = document.getElementById('profile-username');
    const emailSpan = document.getElementById('profile-email');
    const genderSpan = document.getElementById('profile-gender');
    const bdSpan = document.getElementById('profile-birthdate');
    const statusSpan = document.getElementById('profile-status');
    
    if (isLoggedIn) {
        if (usernameSpan) usernameSpan.textContent = localStorage.getItem('userName') || 'Pro User';
        if (emailSpan) emailSpan.textContent = localStorage.getItem('userEmail');
        if (genderSpan) genderSpan.textContent = localStorage.getItem('userGender');
        if (bdSpan) bdSpan.textContent = localStorage.getItem('userBirthDate');
        if (statusSpan) statusSpan.textContent = "PRO USER (Logged In)";
        if (statusSpan) statusSpan.style.color = "#34a853"; 
    } else {
        if (usernameSpan) usernameSpan.textContent = 'Guest User';
        if (emailSpan) emailSpan.textContent = 'guest@factcheck.com';
        if (statusSpan) statusSpan.textContent = "GUEST MODE";
        if (statusSpan) statusSpan.style.color = "#fbbc05"; 
    }
    displayUserAvatar();
}

// Image Upload Handler (Converts to Base64 and saves)
document.getElementById('image-upload-input').addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = function() {
            localStorage.setItem('userAvatar', reader.result);
            alert("Profile photo updated successfully! Please refresh.");
            displayUserAvatar(); 
        }
        reader.readAsDataURL(file); 
    }
});


// --- General UI Logic ---
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

function showInput(type) {
    document.querySelectorAll('.input-section').forEach(section => {
        section.style.display = 'none';
    });
    document.querySelectorAll('.tab-buttons button').forEach(button => {
        button.classList.remove('active');
    });

    const inputElement = document.getElementById(type + '-input');
    const tabElement = document.getElementById(type + '-tab');
    
    if(inputElement && tabElement) {
        inputElement.style.display = 'block';
        tabElement.classList.add('active');
    }
    
    if (type === 'tools') {
        updateProFeaturesVisibility();
    }
    if (type === 'profile') { 
        updateProfileDetails(); 
    }
}


// Function 5: Send news to API (Flask Backend)
async function sendNews(inputType) {
    // ... (Your existing API call logic)
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
    updateUIOnLoginStatus(); 
};