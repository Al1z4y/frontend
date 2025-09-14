from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np
import pandas as pd
import pickle
import uvicorn
import os
import joblib
# Create FastAPI app
app = FastAPI(
    title="Medicine Management System API",
    description="AI-powered disease prediction and treatment recommendations",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",                 # local dev
        "https://disease-predictor-omega.vercel.app"  # your deployed frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load model
MODEL_PATH = os.path.join(BASE_DIR, "models", "svc.pkl")
try:
    svc = joblib.load(MODEL_PATH)
    print(f"✅ Model loaded successfully from {MODEL_PATH}")
except FileNotFoundError:
    print("❌ Error: Model file 'svc.pkl' not found in models folder")
    svc = None

# Load datasets
DATASET_DIR = os.path.join(BASE_DIR, "datasets")
try:
    sym_des = pd.read_csv(os.path.join(DATASET_DIR, "symtoms_df.csv"))
    precautions = pd.read_csv(os.path.join(DATASET_DIR, "precautions_df.csv"))
    workout = pd.read_csv(os.path.join(DATASET_DIR, "workout_df.csv"))
    description = pd.read_csv(os.path.join(DATASET_DIR, "description.csv"))
    medications = pd.read_csv(os.path.join(DATASET_DIR, "medications.csv"))
    diets = pd.read_csv(os.path.join(DATASET_DIR, "diets.csv"))
    print("✅ Datasets loaded successfully")
except FileNotFoundError as e:
    print(f"❌ Error loading datasets: {e}")

# Pydantic models for request/response
class SymptomsRequest(BaseModel):
    symptoms: List[str]

class DiseaseResponse(BaseModel):
    predicted_disease: str
    description: str
    precautions: List[str]
    medications: List[str]
    diet: List[str]
    workout: List[str]



# Symptoms dictionary and diseases list (same as original)
symptoms_dict = {
    'itching': 0, 'skin_rash': 1, 'nodal_skin_eruptions': 2, 'continuous_sneezing': 3,
    'shivering': 4, 'chills': 5, 'joint_pain': 6, 'stomach_pain': 7, 'acidity': 8,
    'ulcers_on_tongue': 9, 'muscle_wasting': 10, 'vomiting': 11, 'burning_micturition': 12,
    'spotting_ urination': 13, 'fatigue': 14, 'weight_gain': 15, 'anxiety': 16,
    'cold_hands_and_feets': 17, 'mood_swings': 18, 'weight_loss': 19, 'restlessness': 20,
    'lethargy': 21, 'patches_in_throat': 22, 'irregular_sugar_level': 23, 'cough': 24,
    'high_fever': 25, 'sunken_eyes': 26, 'breathlessness': 27, 'sweating': 28,
    'dehydration': 29, 'indigestion': 30, 'headache': 31, 'yellowish_skin': 32,
    'dark_urine': 33, 'nausea': 34, 'loss_of_appetite': 35, 'pain_behind_the_eyes': 36,
    'back_pain': 37, 'constipation': 38, 'abdominal_pain': 39, 'diarrhoea': 40,
    'mild_fever': 41, 'yellow_urine': 42, 'yellowing_of_eyes': 43, 'acute_liver_failure': 44,
    'fluid_overload': 45, 'swelling_of_stomach': 46, 'swelled_lymph_nodes': 47,
    'malaise': 48, 'blurred_and_distorted_vision': 49, 'phlegm': 50, 'throat_irritation': 51,
    'redness_of_eyes': 52, 'sinus_pressure': 53, 'runny_nose': 54, 'congestion': 55,
    'chest_pain': 56, 'weakness_in_limbs': 57, 'fast_heart_rate': 58,
    'pain_during_bowel_movements': 59, 'pain_in_anal_region': 60, 'bloody_stool': 61,
    'irritation_in_anus': 62, 'neck_pain': 63, 'dizziness': 64, 'cramps': 65,
    'bruising': 66, 'obesity': 67, 'swollen_legs': 68, 'swollen_blood_vessels': 69,
    'puffy_face_and_eyes': 70, 'enlarged_thyroid': 71, 'brittle_nails': 72,
    'swollen_extremeties': 73, 'excessive_hunger': 74, 'extra_marital_contacts': 75,
    'drying_and_tingling_lips': 76, 'slurred_speech': 77, 'knee_pain': 78,
    'hip_joint_pain': 79, 'muscle_weakness': 80, 'stiff_neck': 81, 'swelling_joints': 82,
    'movement_stiffness': 83, 'spinning_movements': 84, 'loss_of_balance': 85,
    'unsteadiness': 86, 'weakness_of_one_body_side': 87, 'loss_of_smell': 88,
    'bladder_discomfort': 89, 'foul_smell_of urine': 90, 'continuous_feel_of_urine': 91,
    'passage_of_gases': 92, 'internal_itching': 93, 'toxic_look_(typhos)': 94,
    'depression': 95, 'irritability': 96, 'muscle_pain': 97, 'altered_sensorium': 98,
    'red_spots_over_body': 99, 'belly_pain': 100, 'abnormal_menstruation': 101,
    'dischromic _patches': 102, 'watering_from_eyes': 103, 'increased_appetite': 104,
    'polyuria': 105, 'family_history': 106, 'mucoid_sputum': 107, 'rusty_sputum': 108,
    'lack_of_concentration': 109, 'visual_disturbances': 110, 'receiving_blood_transfusion': 111,
    'receiving_unsterile_injections': 112, 'coma': 113, 'stomach_bleeding': 114,
    'distention_of_abdomen': 115, 'history_of_alcohol_consumption': 116,
    'fluid_overload.1': 117, 'blood_in_sputum': 118, 'prominent_veins_on_calf': 119,
    'palpitations': 120, 'painful_walking': 121, 'pus_filled_pimples': 122,
    'blackheads': 123, 'scurring': 124, 'skin_peeling': 125, 'silver_like_dusting': 126,
    'small_dents_in_nails': 127, 'inflammatory_nails': 128, 'blister': 129,
    'red_sore_around_nose': 130, 'yellow_crust_ooze': 131
}

diseases_list = {
    15: 'Fungal infection', 4: 'Allergy', 16: 'GERD', 9: 'Chronic cholestasis',
    14: 'Drug Reaction', 33: 'Peptic ulcer diseae', 1: 'AIDS', 12: 'Diabetes ',
    17: 'Gastroenteritis', 6: 'Bronchial Asthma', 23: 'Hypertension ', 30: 'Migraine',
    7: 'Cervical spondylosis', 32: 'Paralysis (brain hemorrhage)', 28: 'Jaundice',
    29: 'Malaria', 8: 'Chicken pox', 11: 'Dengue', 37: 'Typhoid', 40: 'hepatitis A',
    19: 'Hepatitis B', 20: 'Hepatitis C', 21: 'Hepatitis D', 22: 'Hepatitis E',
    3: 'Alcoholic hepatitis', 36: 'Tuberculosis', 10: 'Common Cold', 34: 'Pneumonia',
    13: 'Dimorphic hemmorhoids(piles)', 18: 'Heart attack', 39: 'Varicose veins',
    26: 'Hypothyroidism', 24: 'Hyperthyroidism', 25: 'Hypoglycemia',
    31: 'Osteoarthristis', 5: 'Arthritis', 0: '(vertigo) Paroymsal  Positional Vertigo',
    2: 'Acne', 38: 'Urinary tract infection', 35: 'Psoriasis', 27: 'Impetigo'
}

# Helper functions
def helper(dis: str):
    """Get disease information including description, precautions, medications, diet, and workout"""
    try:
        desc = description[description['Disease'] == dis]['Description']
        desc = " ".join([w for w in desc])

        pre = precautions[precautions['Disease'] == dis][['Precaution_1', 'Precaution_2', 'Precaution_3', 'Precaution_4']]
        pre = [col for col in pre.values[0] if pd.notna(col)] if len(pre) > 0 else []

        med = medications[medications['Disease'] == dis]['Medication']
        med = [med for med in med.values if pd.notna(med)]

        die = diets[diets['Disease'] == dis]['Diet']
        die = [die for die in die.values if pd.notna(die)]

        wrkout = workout[workout['disease'] == dis]['workout']
        wrkout = [w for w in wrkout.values if pd.notna(w)]

        return desc, pre, med, die, wrkout
    except Exception as e:
        print(f"Error in helper function: {e}")
        return "", [], [], [], []

def get_predicted_value(patient_symptoms: List[str]) -> str:
    """Predict disease based on symptoms"""
    if svc is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    input_vector = np.zeros(len(symptoms_dict))
    for item in patient_symptoms:
        if item in symptoms_dict:
            input_vector[symptoms_dict[item]] = 1
    
    prediction = svc.predict([input_vector])[0]
    return diseases_list.get(prediction, "Unknown disease")

# API Routes

@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint"""
    return """
    <html>
        <head>
            <title>Medicine Management System API</title>
        </head>
        <body>
            <h1>Medicine Management System API</h1>
            <p>Welcome to the AI-powered Medicine Management System</p>
            <p><a href="/docs">View API Documentation</a></p>
        </body>
    </html>
    """

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": svc is not None}

@app.get("/symptoms")
async def get_available_symptoms():
    """Get list of available symptoms"""
    return {"symptoms": list(symptoms_dict.keys())}

@app.get("/diseases")
async def get_available_diseases():
    """Get list of available diseases"""
    return {"diseases": list(diseases_list.values())}

@app.post("/predict", response_model=DiseaseResponse)
async def predict_disease(symptoms_request: SymptomsRequest):
    """Predict disease based on symptoms list"""
    try:
        if not symptoms_request.symptoms:
            raise HTTPException(status_code=400, detail="No symptoms provided")
        
        # Validate symptoms
        invalid_symptoms = [s for s in symptoms_request.symptoms if s not in symptoms_dict]
        if invalid_symptoms:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid symptoms: {invalid_symptoms}. Use /symptoms endpoint to get valid symptoms."
            )
        
        predicted_disease = get_predicted_value(symptoms_request.symptoms)
        desc, precautions, medications, diet, workout = helper(predicted_disease)
        
        return DiseaseResponse(
            predicted_disease=predicted_disease,
            description=desc,
            precautions=precautions,
            medications=medications,
            diet=diet,
            workout=workout
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")



@app.get("/disease-info/{disease_name}")
async def get_disease_info(disease_name: str):
    """Get detailed information about a specific disease"""
    try:
        desc, precautions, medications, diet, workout = helper(disease_name)
        
        if not desc:
            raise HTTPException(status_code=404, detail=f"Disease '{disease_name}' not found")
        
        return {
            "disease": disease_name,
            "description": desc,
            "precautions": precautions,
            "medications": medications,
            "diet": diet,
            "workout": workout
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving disease info: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)