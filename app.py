# app.py (FINAL LOGIC: Verified Source & Fact-Check)

from flask import Flask, render_template, request, jsonify
import requests
from bs4 import BeautifulSoup 
import random 
from datetime import datetime
import re

# Flask app initialize karna
app = Flask(__name__, static_folder='static', template_folder='templates')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

print("✅ Server initialized. Using Mock API for Fake News Detection.")

# Verified Source Keywords (Aapke channels)
VERIFIED_SOURCES = ['zee news', 'ndtv', 'aj tak', 'aaj tak', 'toi', 'hindustan times', 'reuters', 'ap news'] 

# --- Mock API Logic ---
def call_fake_news_api(text):
    text_lower = text.lower()
    word_count = len(text.split())
    
    # --- 1. Real-Time Date/Day Fact Check Logic (Highest Priority) ---
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
    
    # --- 2. Highly Sensitive/Sensational Claims Logic (FIX) ---
    # High-risk keywords aur chote sentences (Fake ka score badhega)
    if ('dead' in text_lower or 'died' in text_lower or 'killed' in text_lower or 'arrested' in text_lower) and word_count < 20:
        return {'label': 'fake', 'confidence': random.randint(90, 99), 'service': 'Sensational Claim Detector'}

    # --- 3. Clickbait/Sensationalism Logic ---
    if 'urgent' in text_lower or 'secret' in text_lower or 'shocking' in text_lower or 'must read' in text_lower:
        return {'label': 'fake', 'confidence': random.randint(85, 95), 'service': 'Clickbait Detector'}
    
    # --- 4. Verified Source Trust Logic (NEW) ---
    # Agar text mein koi verified source ka naam ho
    for source in VERIFIED_SOURCES:
        if source in text_lower:
            return {'label': 'real', 'confidence': random.randint(80, 95), 'service': 'Source Trust Score'}

    # --- 5. Baaki sabke liye final check (Content length par zyada bharosa) ---
    if word_count > 40 and 'exclusive' not in text_lower:
         return {'label': 'real', 'confidence': random.randint(75, 85), 'service': 'Content Depth Score'}
         
    # 6. Default: Agar koi strong rule match nahi hua, toh 50/50 chance
    if random.choice([True, False]):
        return {'label': 'real', 'confidence': random.randint(60, 75), 'service': 'Neutral/Random Check'}
    else:
        return {'label': 'fake', 'confidence': random.randint(60, 75), 'service': 'Neutral/Random Check'}

# Function jo URL se text nikalega (User-Agent fix ke saath) - NO CHANGES
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

# --- API Routes ---
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
    print("--- Starting Flask Server (API Mode) ---")
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)