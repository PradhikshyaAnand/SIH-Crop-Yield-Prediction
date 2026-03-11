import joblib

# Input: your old pickle model
PICKLE_MODEL = "crop_recommendation_model.pkl"
JOBLIB_MODEL = "crop_recommendation_model.joblib"

try:
    import pickle
    import sklearn
    from sklearn.ensemble import RandomForestClassifier  # or the actual model class used
    # Try loading with pickle
    with open(PICKLE_MODEL, "rb") as f:
        model = pickle.load(f)
    print("✅ Pickle loaded successfully")
except Exception as e:
    print(f"⚠️ Pickle load failed: {e}")
    print("Trying joblib load instead...")
    model = joblib.load(PICKLE_MODEL)

# Save as joblib
joblib.dump(model, JOBLIB_MODEL)
print(f"✅ Model converted to joblib: {JOBLIB_MODEL}")
