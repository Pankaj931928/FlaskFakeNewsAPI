# app.py (FINAL PURE API CODE: No ML file loading)

from flask import Flask, render_template, request, jsonify
import requests
from bs4 import BeautifulSoup 
import random 

# Flask app initialize karna
app = Flask(__name__, static_folder='static', template_folder='templates')
# Caching band karna
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

print("✅ Server initialized. Using Mock API for Fake News Detection.")

# --- Mock API Logic ---
def call_fake_news_api(text):
    # Yeh logic sirf dikhane ke liye hai ki API call successful hui
    text = text.lower() # Text ko lower case mein karte hain
    
    # 1. Simple, neutral statements ko REAL batao
    if len(text.split()) < 5 or "is a" in text or "is the" in text or "is an" in text:
        return {'label': 'real', 'confidence': random.randint(90, 99), 'service': 'Custom Mock API'}

    # 2. Clickbait/Sensationalism ko FAKE batao
    if 'urgent' in text or 'secret' in text or 'shocking' in text or 'must read' in text:
        return {'label': 'fake', 'confidence': random.randint(85, 95), 'service': 'Custom Mock API'}
    
    # 3. Baaki sabke liye random result (API ka behavior simulate karna)
    if random.choice([True, False]):
        return {'label': 'real', 'confidence': random.randint(70, 85), 'service': 'Custom Mock API'}
    else:
        return {'label': 'fake', 'confidence': random.randint(65, 80), 'service': 'Custom Mock API'}

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

    # --- Prediction via Mock API ---
    api_result = call_fake_news_api(text_to_check)

    is_fake = (api_result['label'] == 'fake')
    confidence = api_result['confidence']
    reason = f"Classification done using External API Simulation ({api_result['service']})."

    return jsonify({
        'isFake': is_fake,
        'confidence': confidence,
        'reason': reason
    })

if __name__ == '__main__':
    print("--- Starting Flask Server (API Mode) ---")
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)