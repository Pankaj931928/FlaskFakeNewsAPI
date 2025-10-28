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
        setTimeout(() => { mainContent.classList.add('content-fade-in'); }, 50); 
        
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
    document.getElementById('signup-message').textContent = '';
}

function openSignupForm() {
    const authForms = document.getElementById('auth-forms');
    if (authForms) authForms.style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('login-message').textContent = '';
    document.getElementById('signup-message').textContent = '';
}

// CRITICAL FIX: Missing Event Listeners for Login/Signup buttons
document.getElementById('login-btn').onclick = openLoginForm;
document.getElementById('signup-btn').onclick = openSignupForm;


// --- DATABASE INTEGRATION & API Calls (Mock) ---

// Function to handle Signup (MOCK)
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const messageDiv = document.getElementById('signup-message');
    
    // Yahan hum LocalStorage use kar rahe hain (Mock DB)
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


// Function to handle login (MOCK)
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const messageDiv = document.getElementById('login-message');

    // FIX: Combine First Name + Last Name from Login Form
    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();

    if (data.email) { 
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', fullName || data.email); // Save full name
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

// --- PROFILE & AVATAR HANDLING ---

function displayUserAvatar() {
    const avatarIcon = document.getElementById('avatar-icon');
    const profileAvatar = document.getElementById('profile-avatar');
    
    if (!avatarIcon || !profileAvatar) return;

    const savedAvatar = localStorage.getItem('userAvatar');
    const gender = localStorage.getItem('userGender');
    
    let avatarSrc;
    if (savedAvatar && isLoggedIn) {
        avatarSrc = savedAvatar; // Custom image (Base64)
    } else if (isLoggedIn) {
        // Default avatar (Gender ke hisaab se)
        avatarSrc = gender === 'Female' ? 
                    '/static/image/default_female.jpeg' : 
                    '/static/image/default_male.webp';

    } else {
        // Guest mode - default male
        avatarSrc = '/static/image/default_male.webp';
    }
    
    avatarIcon.src = avatarSrc;
    profileAvatar.src = avatarSrc;
}

// FIX: Profile details ko input fields mein update karna
function updateProfileDetails() {
    const usernameInput = document.getElementById('profile-username-input');
    const emailInput = document.getElementById('profile-email-input');
    const genderInput = document.getElementById('profile-gender-input');
    const bdInput = document.getElementById('profile-birthdate-input');
    
    const storedUsername = localStorage.getItem('userName') || 'Guest User';
    const storedEmail = localStorage.getItem('userEmail') || 'guest@factcheck.com';
    const storedGender = localStorage.getItem('userGender') || 'Male';
    const storedBD = localStorage.getItem('userBirthDate') || '';

    // Data ko Input Fields mein load karna (Alignment fix)
    if (usernameInput) usernameInput.value = storedUsername;
    if (emailInput) emailInput.value = storedEmail;
    if (genderInput) genderInput.value = storedGender;
    if (bdInput) bdInput.value = storedBD;
    
    displayUserAvatar();
    updateHeaderStatus();
}

// NEW: Profile Save Logic
function saveProfileDetails(event) {
    event.preventDefault(); // Form ko refresh hone se rokna
    const form = document.getElementById('profile-edit-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const messageDiv = document.getElementById('profile-message');

    // Data ko LocalStorage mein save karna
    localStorage.setItem('userName', data.username);
    localStorage.setItem('userGender', data.gender);
    localStorage.setItem('userBirthDate', data.birth_date);
    
    messageDiv.style.color = 'green';
    messageDiv.textContent = '✅ Profile details saved successfully!';

    updateProfileDetails(); 
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


// NEW: Header Icon and Status Logic
function handleProfileClick(event) {
    event.preventDefault();

    if (!isLoggedIn) {
        // If not logged in (Guest), show Login Modal
        document.getElementById('initial-modal').style.display = 'flex';
        document.getElementById('main-content').style.display = 'none';
        openLoginForm(); // Login pop-up kholna
    } else {
        // If logged in, go to Profile Tab
        showInput('profile');
    }
}

function updateHeaderStatus() {
    const statusP = document.getElementById('header-user-status');
    if (statusP) {
        if (isLoggedIn) {
            const userName = localStorage.getItem('userName');
            statusP.textContent = userName ? userName : 'My Account'; // FIX: Display full name
            statusP.style.color = '#f7f9fc'; // FIX: Ensure color for better visibility
        } else {
            statusP.textContent = 'Login';
            statusP.style.color = '#f7f9fc';
        }
    }
}

// --- General UI Logic ---

function updateProFeaturesVisibility() {
    const profileTab = document.getElementById('profile-tab');
    
    const proGuestDiv = document.getElementById('pro-features-guest');
    const proLoggedInDiv = document.getElementById('pro-features-logged-in');

    if (isLoggedIn) {
        if (profileTab) profileTab.style.display = 'block';
        if (proLoggedInDiv) proLoggedInDiv.style.display = 'block';
        if (proGuestDiv) proGuestDiv.style.display = 'none';
    } else {
        if (profileTab) profileTab.style.display = 'none'; // Guest mode mein Profile tab hide
        if (proLoggedInDiv) proLoggedInDiv.style.display = 'none';
        if (proGuestDiv) proGuestDiv.style.display = 'block';
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

        if (!response.ok) {
             throw new Error(`HTTP error! Status: ${response.status}`);
        }

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
        resultBox.innerHTML = `<h2>❌ ERROR ❌</h2><p>Could not connect to the server or API failed. (${error.message})</p>`;
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
function updateUIOnLoginStatus() {
    updateProFeaturesVisibility();
    displayUserAvatar();
    updateHeaderStatus(); 
    if (document.getElementById('main-content').style.display === 'block') {
         updateProfileDetails();
    }
}

window.onload = function() {
    updateUIOnLoginStatus();
    if (isLoggedIn) {
        document.getElementById('initial-modal').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        setTimeout(() => { document.getElementById('main-content').classList.add('content-fade-in'); }, 50);
    } else {
        updateHeaderStatus();
    }
};