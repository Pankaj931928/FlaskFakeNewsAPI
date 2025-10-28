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
        localStorage.setItem('userName', fullName || data.email); // Save new name
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

    // Data ko Input Fields mein load karna
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

    // Avatar aur Profile details ko screen par update karna
    updateProfileDetails(); 
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
        openLoginForm(); // Open login form by default
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
            // FIX: Name ko update karna
            statusP.textContent = userName ? userName.split(' ')[0] : 'My Account'; 
            statusP.style.color = '#fff';
        } else {
            statusP.textContent = 'Login';
            statusP.style.color = '#fff';
        }
    }
    // Link the header icon click to the new logic
    const headerLink = document.getElementById('header-profile-link');
    if (headerLink) headerLink.onclick = handleProfileClick;
}

// --- General UI Logic ---

function updateProFeaturesVisibility() {
    // FIX: Guest mode mein Profile tab hide karna
    const profileTab = document.getElementById('profile-tab');
    
    const proGuestDiv = document.getElementById('pro-features-guest');
    const proLoggedInDiv = document.getElementById('pro-features-logged-in');

    if (isLoggedIn) {
        if (profileTab) profileTab.style.display = 'block';
        if (proLoggedInDiv) proLoggedInDiv.style.display = 'block';
        if (proGuestDiv) proGuestDiv.style.display = 'none';
    } else {
        if (profileTab) profileTab.style.display = 'none'; // FIX: Profile tab ko Guest mode mein hide kiya
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

// Function 5: Send news to API (Flask Backend) - No changes here
async function sendNews(inputType) { /* Use your existing API call logic */ }
function speakText() { /* Your existing speakText logic */ }
function translateText() { /* Your existing translateText logic */ }


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