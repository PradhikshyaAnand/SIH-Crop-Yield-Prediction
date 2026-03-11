import os
import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# ----------------------
# FastAPI app
# ----------------------
app = FastAPI(title="Crop Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------
# Load model
# ----------------------
MODEL_PATH = "crop_recommendation_model.joblib"
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"{MODEL_PATH} not found!")

model = joblib.load(MODEL_PATH)
print("✅ Crop recommendation model loaded")

# ----------------------
# Request model
# ----------------------
class CropRequest(BaseModel):
    soil: str
    season: str
    previous_crop: str

# ----------------------
# Map 3 inputs → 7 features
# ----------------------
def map_farmer_inputs(soil_type, season, previous_crop):
    # Soil type baseline values
    soil_map = {
        "Sandy": {"N": 30, "P": 20, "K": 25, "ph": 6.0},
        "Loamy": {"N": 60, "P": 40, "K": 50, "ph": 6.8},
        "Clay": {"N": 45, "P": 35, "K": 60, "ph": 7.2},
        "Black Cotton": {"N": 55, "P": 30, "K": 65, "ph": 7.5},
    }

    # Season effects
    season_map = {
        "Kharif": {"temperature": 28, "humidity": 80, "rainfall": 250},
        "Rabi": {"temperature": 18, "humidity": 60, "rainfall": 100},
        "Summer": {"temperature": 35, "humidity": 40, "rainfall": 50},
    }

    # Previous crop effect
    crop_effect = {
        "Paddy": {"N": -10, "P": 0, "K": -5},
        "Wheat": {"N": -5, "P": -5, "K": -5},
        "Pulses": {"N": 15, "P": 0, "K": 0},
        "Maize": {"N": -8, "P": -3, "K": -4},
    }

    # Start with soil defaults
    vals = soil_map.get(soil_type, {"N": 50, "P": 30, "K": 40, "ph": 6.5})
    
    # Add season values
    vals.update(season_map.get(season, {"temperature": 25, "humidity": 60, "rainfall": 100}))

    # Adjust nutrients for previous crop
    effect = crop_effect.get(previous_crop, {"N": 0, "P": 0, "K": 0})
    vals["N"] += effect["N"]
    vals["P"] += effect["P"]
    vals["K"] += effect["K"]

    # Return DataFrame in correct order
    return pd.DataFrame([[vals["N"], vals["P"], vals["K"], vals["temperature"], vals["humidity"], vals["ph"], vals["rainfall"]]],
                        columns=['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'])

# ----------------------
# API endpoint
# ----------------------
@app.post("/recommend")
def recommend(req: CropRequest):
    try:
        # Map farmer inputs → 7 features
        features = map_farmer_inputs(req.soil, req.season, req.previous_crop)
        pred = model.predict(features)[0]
        return {"recommended_crop": str(pred)}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
