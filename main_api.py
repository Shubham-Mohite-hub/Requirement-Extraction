from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import re
from requirement_extractor import extract_requirements 

app = FastAPI()

# Load the "brain" (Trained at VIIT with 97% accuracy!)
model = joblib.load("requirement_model.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")

class TextInput(BaseModel):
    text: str

def clean_input(text):
    """Removes email headers and extra whitespace for the Enron dataset."""
    # Removes 'From:', 'To:', etc.
    text = re.sub(r'(?m)^(Subject|Date|From|To|Cc|Bcc|X-.*):.*$', '', text)
    return text.strip()

@app.post("/analyze")
async def analyze_text(input_data: TextInput):
    try:
        # 1. Preprocessing (Clean the noise)
        raw_text = clean_input(input_data.text)
        
        # 2. Hybrid Extraction (Rules + NER)
        structured_data = extract_requirements(raw_text)
        
        # 3. Machine Learning Classification
        vectorized_text = vectorizer.transform([raw_text])
        prediction = model.predict(vectorized_text)[0]
        
        # CLEANUP: If the prediction is a long sentence, shorten it for the UI
        display_label = prediction if len(prediction.split()) < 6 else " ".join(prediction.split()[:5]) + "..."
        
        return {
            "status": "success",
            "predicted_category": display_label,
            "analysis_details": structured_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Use 127.0.0.1 for local testing. Use 0.0.0.0 if teammates need to access it over WiFi.
    uvicorn.run(app, host="127.0.0.1", port=8000)