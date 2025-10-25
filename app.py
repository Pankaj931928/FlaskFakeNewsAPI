# app.py (FINAL CODE: URL Fixes, 44k+ Samples Display, Caching Off)

from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import requests
from bs4 import BeautifulSoup 
import os

# Flask app initialize karna
app = Flask(__name__, static_folder='static', template_folder='templates')
# Caching band karna taaki browser hamesha naye files hi load kare
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# Model aur Vectorizer ko load karna
model = None
vectorizer = None

# Model loading function
def load_model():
    global model, vectorizer
    # Files ki location check karo
    if not os.path.exists('model.pkl') or not os.path.exists('vectorizer.pkl'):
        print("❌ CRITICAL ERROR: model.pkl or vectorizer.pkl not found. Run 'python train_model.py' first.")
        exit(1) 
    
    try:
        with open('model.pkl', 'rb') as model_file:
            model = pickle.load(model_file)
        with open('vectorizer.pkl', 'rb') as vectorizer_file:
            vectorizer = pickle.load(vectorizer_file)
        print("✅ ML Model loaded successfully by server.")
    except Exception as e:
        print(f"❌ CRITICAL ERROR: Failed to load ML components: {e}")
        exit(1)

# Server shuru hone se pehle model ko load karo
load_model()

# Function jo URL se text nikalega (User-Agent fix ke saath)
def get_text_from_url(url):
    # Header mein User-Agent daalna (taaki server bot na lage aur 403 error na aaye)
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


# 1. Main Page Route
@app.route('/')
def home():
    return render_template('index.html')

# 2. Prediction API Route
@app.route('/api/check', methods=['POST'])
def predict():
    data = request.get_json(force=True)
    input_data = data.get('input', '')
    input_type = data.get('type', 'text')
    
    text_to_check = input_data

    # Agar input URL hai, toh content fetch karo
    if input_type == 'url':
        text_to_check = get_text_from_url(input_data)
        
        if "ERROR" in text_to_check:
            return jsonify({'isFake': True, 'confidence': 99, 'reason': text_to_check})
        
    if not text_to_check or text_to_check.strip() == "":
        return jsonify({'isFake': False, 'confidence': 50, 'reason': 'No substantial content found to check.'})

    try:
        # Prediction logic
        text_features = vectorizer.transform([text_to_check])
        prediction = model.predict(text_features)[0]
        probabilities = model.predict_proba(text_features)[0]
        
        confidence = int(max(probabilities) * 100)
        is_fake = bool(prediction == 0) # 0 = Fake, 1 = Real
        
        # Reason mein 44k+ samples dikhaenge
        reason = "Classified by Logistic Regression ML model (trained on 44k+ samples)." 
        if input_type == 'url':
             reason = "URL content fetched and classified by ML model (44k+ samples)."

        return jsonify({
            'isFake': is_fake,
            'confidence': confidence,
            'reason': reason
        })

    except Exception as e:
        print(f"Prediction Error during classification: {e}")
        return jsonify({'isFake': False, 'confidence': 50, 'reason': "Prediction failed due to internal model error."})

if __name__ == '__main__':
    print("--- Starting Flask Server ---")
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)