import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app instance
app = FastAPI()

# Allow requests from your Next.js frontend (usually runs on localhost:3000 for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://face-detector-olive.vercel.app"],  # Adjust this based on your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Function to detect faces in an image
def detect_faces(image_data):
    # Load the pre-trained Haar Cascade classifier for face detection
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    # Convert the image data to a numpy array
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Convert the image to grayscale for face detection
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Detect faces using the Haar Cascade classifier
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    
    # Return True if faces are detected, else False
    return len(faces) > 0

# Endpoint to handle image upload and face detection
@app.post("/verify")
async def verify_image(file: UploadFile = File(...)):
    # Check if the uploaded file is an image
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File provided is not an image")
    
    try:
        # Read the contents of the uploaded file
        contents = await file.read()
        
        # Call the face detection function
        has_face = detect_faces(contents)
        
        # Return JSON response indicating whether a face was detected
        return JSONResponse(content={"hasFace": has_face})
    except Exception as e:
        # Handle any errors and return a 500 error with the error message
        raise HTTPException(status_code=500, detail=str(e))

# Run the app with 'uvicorn main:app --reload' in your terminal
