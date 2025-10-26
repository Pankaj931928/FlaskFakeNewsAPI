# app.py (FINAL CODE: MySQL Database Integration)

from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt # Password hashing ke liye zaroori
import requests
from bs4 import BeautifulSoup 
import random 
from datetime import datetime
import re

# 1. Flask App Initialization (MUST BE FIRST)
app = Flask(__name__, static_folder='static', template_folder='templates')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# --- MySQL Configuration (MUST BE CORRECTED BEFORE RUNNING) ---
# FIX: 'root' username aur 'tiger' password assumed hai. Syntax theek kiya gaya hai.
# Yahan root:tiger@localhost/fakenewsdb hona chahiye (jo aapne bataya tha)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:tiger@localhost/fakenewsdb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False 
app.config['SECRET_KEY'] = 'your_super_secret_key_for_session'

# 2. Database Initialization
db = SQLAlchemy(app)
bcrypt = Bcrypt(app) # Bcrypt initialize kiya

# 3. User Model (Database Table Structure)
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    birth_date = db.Column(db.String(10), nullable=False)
    password = db.Column(db.String(60), nullable=False) # Hashed password
    
    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"

# 4. Database mein tables banane ke liye
with app.app_context():
    db.create_all() 

print("✅ Server initialized. Using Mock API for Fake News Detection.")


# Verified Source Keywords (Aapke channels)
VERIFIED_SOURCES = ['zee news', 'ndtv', 'aj tak', 'aaj tak', 'toi', 'hindustan times', 'reuters', 'ap news'] 

# ----------------------------------------------------
# --- DATABASE AUTHENTICATION ROUTES (NEW LOGIC) ---
# ----------------------------------------------------

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user already exists
    user_exists = User.query.filter_by(email=data['email']).first()
    if user_exists:
        return jsonify({'success': False, 'message': 'Email already registered.'})

    # Password ko hash karna (security ke liye)
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    # Naya User Create Karna
    new_user = User(
        username=data['username'],
        email=data['email'],
        gender=data['gender'],
        age=data['age'],
        birth_date=data['birth_date'],
        password=hashed_password
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        # Registration successful hone par turant session set karna
        session['user_id'] = new_user.id
        return jsonify({'success': True, 'message': 'Registration successful! Logging in.'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Database Error. Please check MySQL: {e}'})


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    # User check karna aur password verify karna
    if user and bcrypt.check_password_hash(user.password, data['password']):
        # Session set karna
        session['user_id'] = user.id
        return jsonify({'success': True, 'message': 'Logged in successfully.'})
    else:
        return jsonify({'success': False, 'message': 'Login failed. Invalid email or password.'})

# ----------------------------------------------------
# --- MOCK API AND REMAINING ROUTES ---
# ----------------------------------------------------

def call_fake_news_api(text):
    text_lower = text.lower()
    word_count = len(text_lower.split())
    
    # --- 1. Real-Time Date/Day Fact Check Logic ---
    today = datetime.now().strftime('%A').lower() 
    day_regex = r"today is (monday|tuesday|wednesday|thursday|friday|saturday|sunday)"
    
    if "today is" in text_lower:
        match = re.search(day_regex, text_lower)
        if match:
            day_stated = match.group(1)
            if day_stated == today:
                return {'label': 'real', 'confidence': 99, 'service': 'Custom Fact Checker: Day Verified'}
            else:
                return {'label': 'fake', 'confidence': 99, 'service': 'Custom Fact Checker: Day Mismatch'}
    
    # --- 2. Highly Sensational/Misinformation Claims Logic ---
    if ('dead' in text_lower or 'died' in text_lower or 'killed' in text_lower or 'hoax' in text_lower):
        if word_count < 20: 
            return {'label': 'fake', 'confidence': random.randint(95, 99), 'service': 'Sensational Claim Detector'}
            
    # --- 3. Verified Source Trust Logic ---
    for source in VERIFIED_SOURCES:
        if source in text_lower:
            return {'label': 'real', 'confidence': random.randint(85, 95), 'service': 'Source Trust Score'}

    # --- 4. Clickbait/Soft Sensationalism Logic ---
    if 'urgent' in text_lower or 'secret' in text_lower or 'shocking' in text_lower or 'must read' in text_lower or 'exclusive' in text_lower:
        return {'label': 'fake', 'confidence': random.randint(75, 85), 'service': 'Clickbait Detector'}

    # --- 5. Neutral/Default Check ---
    if word_count > 15 and word_count < 60:
         return {'label': 'real', 'confidence': random.randint(70, 80), 'service': 'Content Depth Score'}
         
    # 6. Default: Random fallback
    if random.choice([True, False]):
        return {'label': 'real', 'confidence': random.randint(60, 70), 'service': 'Neutral/Random Check'}
    else:
        return {'label': 'fake', 'confidence': random.randint(60, 70), 'service': 'Neutral/Random Check'}

# Function jo URL se text nikalega (User-Agent fix ke saath)
def get_text_from_url(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return f"ERROR: Could not fetch content (Status: {response.status_code})."
        soup = BeautifulSoup(response.text, 'html.parser')
        paragraphs = soup.find_all(['p', 'h1', 'h2'])
        text = ' '.join([p.get_text() for p in paragraphs])
        
        if len(text) < 50:
            title = soup.find('title').get_text() if soup.find('title') else ""
            return title + " " + text
        return text

    except requests.exceptions.RequestException:
        return "ERROR: Could not fetch content from URL (Timeout/Connection Error)."
    except Exception:
        return "ERROR: Could not parse web page content."

# --- Main Render/Check Routes ---

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/check', methods=['POST'])
def predict():
    data = request.get_json(force=True)
    input_data = data.get('input', '')
    input_type = data.get('type', 'text')
    text_to_check = input_data

    if input_type == 'url':
        text_to_check = get_text_from_url(input_data)
        if "ERROR" in text_to_check:
            return jsonify({'isFake': True, 'confidence': 99, 'reason': text_to_check})
        
    if not text_to_check or text_to_check.strip() == "":
        return jsonify({'isFake': False, 'confidence': 50, 'reason': 'No substantial content found to check.'})

    api_result = call_fake_news_api(text_to_check)

    is_fake = (api_result['label'] == 'fake')
    confidence = api_result['confidence']
    reason = f"Classification done using {api_result['service']}."

    return jsonify({
        'isFake': is_fake,
        'confidence': confidence,
        'reason': reason
    })

if __name__ == '__main__':
    # 'app.run' se pehle session secret key set karna zaroori hai
    # Secret key set kar di gayi hai 'app.config' mein.
    print("--- Starting Flask Server (API Mode) ---")
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)