import os
import numpy as np
import pickle
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import tensorflow as tf
import asyncio
from concurrent.futures import ThreadPoolExecutor

# ----------------------
# FastAPI app
# ----------------------
app = FastAPI(title="Plant Disease Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------
# File & Model paths
# ----------------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MODEL_PATH = "plant_disease_model.tflite"
LABELS_PATH = "labels.pkl"

# ----------------------
# Load labels
# ----------------------
if not os.path.exists(LABELS_PATH):
    raise FileNotFoundError(f"Labels file not found: {LABELS_PATH}")

with open(LABELS_PATH, "rb") as f:
    labels = pickle.load(f)
print(f"✅ Labels loaded: {labels}")

# ----------------------
# Load TFLite model
# ----------------------
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()
input_shape = input_details[0]["shape"]
print(f"✅ Model loaded. Input shape: {input_shape}")

# ----------------------
# Thread executor for CPU-bound work
# ----------------------
executor = ThreadPoolExecutor(max_workers=1)

async def run_in_thread(func, *args):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, func, *args)

# ----------------------
# Preprocess image
# ----------------------
def preprocess_image(img_path, target_size=(224, 224)):
    """Open image, resize, normalize, expand dims, reshape."""
    image = Image.open(img_path).convert("RGB")
    
    # Reduce huge images for faster processing
    image.thumbnail((512, 512), Image.BILINEAR)
    image = image.resize(target_size, Image.BILINEAR)
    
    arr = np.array(image).astype(np.float32) / 255.0
    arr = np.expand_dims(arr, axis=0)
    arr = arr.reshape(input_shape)
    return arr

# ----------------------
# Prediction
# ----------------------
def predict_disease(img_path):
    try:
        img = preprocess_image(img_path, target_size=(input_shape[1], input_shape[2]))
        print(f"Input tensor shape: {img.shape}, dtype: {img.dtype}")

        interpreter.set_tensor(input_details[0]['index'], img)
        interpreter.invoke()

        out = interpreter.get_tensor(output_details[0]['index'])
        if out.ndim == 2:
            out = out[0]

        pred_index = int(np.argmax(out))
        confidence = float(np.max(out))
        label = labels[pred_index] if pred_index < len(labels) else "Unknown"

        print(f"Prediction: {label}, Confidence: {confidence}")
        return label, confidence
    except Exception as e:
        raise RuntimeError(f"Prediction failed: {e}")

# ----------------------
# API endpoint
# ----------------------
@app.post("/predict")
async def predict(photo: UploadFile = File(...)):
    try:
        # Save uploaded file
        img_path = os.path.join(UPLOAD_DIR, photo.filename)
        with open(img_path, "wb") as f:
            content = await photo.read()
            f.write(content)
        print(f"Saved file: {img_path}, size: {len(content)} bytes")

        # Run prediction in separate thread to avoid blocking
        label, confidence = await run_in_thread(predict_disease, img_path)
        os.remove(img_path)

        recommendation = (
            f"Prediction: {label}\n"
            "- Keep leaves dry\n"
            "- Rotate crops\n"
            "- Use organic sprays\n"
            "- Follow safety guidelines\n"
            "- Consult local agricultural extension for treatments"
        )

        return JSONResponse({
            "diagnosis": label,
            "confidence": round(confidence, 4),
            "recommendation": recommendation
        })

    except Exception as e:
        print(f"❌ Error: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)

# ----------------------
# Run server
# ----------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("plant_disease_api:app", host="0.0.0.0", port=8001, reload=True)
