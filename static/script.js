// Function 1: Modal ko band karke Main Content dikhana (Guest ya Login ke baad)
function closeModal() {
    document.getElementById('initial-modal').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
}

// Function 2: Login Form ko dikhana
function openLoginForm() {
    // Ye 'auth-forms' div ko visible karega
    const authForms = document.getElementById('auth-forms');
    if (authForms) authForms.style.display = 'block'; 
    
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
}

// Function 3: Signup Form ko dikhana
function openSignupForm() {
    // Ye 'auth-forms' div ko visible karega
    const authForms = document.getElementById('auth-forms');
    if (authForms) authForms.style.display = 'block';
    
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
}


// Event Listeners (Pop-up button clicks)

// Login Button click
document.getElementById('login-btn').addEventListener('click', openLoginForm);

// Sign Up Button click
document.getElementById('signup-btn').addEventListener('click', openSignupForm);

// Login Form Submit (MOCK Logic)
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault(); 
    alert("Login Successful! Redirecting to detector.");
    closeModal(); // Login ke baad main page open karo
});

// Signup Form Submit (MOCK Logic)
document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault(); 
    alert("Signup Successful! Logging in and redirecting.");
    closeModal(); // Signup ke baad main page open karo
});


// Function 4: Tab Switching (Text vs URL)
function showInput(type) {
    const textSection = document.getElementById('text-input');
    const urlSection = document.getElementById('url-input');
    const textTab = document.getElementById('text-tab');
    const urlTab = document.getElementById('url-tab');

    if (type === 'text') {
        textSection.style.display = 'block';
        urlSection.style.display = 'none';
        textTab.classList.add('active');
        urlTab.classList.remove('active');
    } else {
        textSection.style.display = 'none';
        urlSection.style.display = 'block';
        textTab.classList.remove('active');
        urlTab.classList.add('active');
    }
}

// Function 5: Send data to the Node.js backend
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

    // Set loading state
    resultBox.className = 'result loading';
    resultBox.innerHTML = 'Checking... Please wait.';

    try {
        // API Call to Node.js Backend
        const response = await fetch('/api/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input: newsInput, type: inputType }),
        });

        const result = await response.json();
        
        // Display result based on API response
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
        resultBox.innerHTML = '<h2>❌ ERROR ❌</h2><p>Could not connect to the server (Node.js backend).</p>';
    }
}