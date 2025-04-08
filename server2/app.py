import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
import time
import os
import base64
import uvicorn  
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import asyncio
from typing import List, Dict, Optional
from pydantic import BaseModel
import threading
import io

app = FastAPI(title="Enhanced Photo Detector")

# Create templates and static directories if they don't exist
os.makedirs("templates", exist_ok=True)
os.makedirs("static", exist_ok=True)

# Set up templates
templates = Jinja2Templates(directory="templates")

# Store frames and results globally for web streaming
latest_frame = None
latest_result = None
processing_lock = threading.Lock()

class EnhancedPhotoDetector:
    def __init__(self):
        # Load OpenCV's pre-trained face and eye detectors
        self.face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.eye_cascade_path = cv2.data.haarcascades + 'haarcascade_eye.xml'
        
        self.face_cascade = cv2.CascadeClassifier(self.face_cascade_path)
        self.eye_cascade = cv2.CascadeClassifier(self.eye_cascade_path)
        
        # Check if cascade files loaded successfully
        if self.face_cascade.empty():
            raise ValueError(f"Error: Could not load face cascade from {self.face_cascade_path}")
        if self.eye_cascade.empty():
            raise ValueError(f"Error: Could not load eye cascade from {self.eye_cascade_path}")
            
        print("OpenCV Haar cascades loaded successfully")
        
        # Load pretrained model for feature extraction
        base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
        
        # Add custom layers for liveness detection
        x = base_model.output
        x = GlobalAveragePooling2D()(x)
        x = Dense(128, activation='relu')(x)
        x = Dropout(0.5)(x)
        predictions = Dense(1, activation='sigmoid')(x)
        
        # Create the final model
        self.model = Model(inputs=base_model.input, outputs=predictions)
        
        # Freeze the base model layers
        for layer in base_model.layers:
            layer.trainable = False
        
        # Compile the model
        self.model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        
        # Eye tracking specific variables
        self.gaze_history = []
        self.blink_history = []
        self.prev_eye_areas = []
        self.start_time = None
        
        # Photo detection specific variables
        self.frame_history = []  # Store recent frames for motion analysis
        self.max_history = 30  # Store up to 30 frames
        self.micro_movement_threshold = 0.8  # Threshold for micro-movement detection
        
    def detect_eyes(self, frame):
        """Detect face and eyes using OpenCV Haar cascades"""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = self.face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.1, 
            minNeighbors=5, 
            minSize=(80, 80)
        )
        
        if len(faces) == 0:
            return frame, None, None, None
        
        # Process the largest face found
        x, y, w, h = max(faces, key=lambda rect: rect[2] * rect[3])
        
        # Create face ROI
        roi_gray = gray[y:y+h, x:x+w]
        roi_color = frame[y:y+h, x:x+w]
        
        # Draw face rectangle
        cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
        
        # Detect eyes within the face ROI
        eyes = self.eye_cascade.detectMultiScale(
            roi_gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(20, 20)
        )
        
        eye_centers = []
        eye_areas = []
        
        for (ex, ey, ew, eh) in eyes[:2]:  # Process up to 2 eyes
            # Draw eye rectangle
            cv2.rectangle(roi_color, (ex, ey), (ex+ew, ey+eh), (0, 255, 0), 2)
            
            # Calculate eye center
            eye_center = (x + ex + ew//2, y + ey + eh//2)
            eye_centers.append(eye_center)
            
            # Calculate eye area for blink detection
            eye_areas.append(ew * eh)
            
            # Draw eye center
            cv2.circle(frame, eye_center, 3, (0, 0, 255), -1)
        
        # Detect blinks by analyzing eye area changes
        is_blinking = False
        if self.prev_eye_areas and len(eye_areas) == len(self.prev_eye_areas):
            # If eye area decreases significantly, it's likely a blink
            area_ratios = [curr/prev if prev > 0 else 1.0 for curr, prev in zip(eye_areas, self.prev_eye_areas)]
            is_blinking = any(ratio < 0.7 for ratio in area_ratios)
        
        # Update previous eye areas
        self.prev_eye_areas = eye_areas
        
        # Record eye positions and blink state
        if self.start_time is None:
            self.start_time = time.time()
        
        # Only store data every 0.1 seconds to prevent oversampling
        current_time = time.time()
        if len(self.gaze_history) == 0 or current_time - self.start_time > 0.1:
            if eye_centers:
                self.gaze_history.append(eye_centers)
                self.blink_history.append(is_blinking)
                self.start_time = current_time
        
        # Store face region for motion analysis
        face_region = frame[y:y+h, x:x+w].copy()
        resized_face = cv2.resize(face_region, (100, 100))  # Standardize size
        self.frame_history.append(resized_face)
        
        # Keep history at a reasonable size
        if len(self.frame_history) > self.max_history:
            self.frame_history.pop(0)
        
        return frame, (x, y, w, h), eye_centers, is_blinking
    
    def detect_micro_movements(self):
        """Detect micro-movements in face region to differentiate between photos and real faces"""
        if len(self.frame_history) < 10:
            return 0.5  # Not enough data
        
        # Calculate differences between consecutive frames
        diffs = []
        for i in range(1, len(self.frame_history)):
            # Convert to grayscale
            prev_gray = cv2.cvtColor(self.frame_history[i-1], cv2.COLOR_BGR2GRAY)
            curr_gray = cv2.cvtColor(self.frame_history[i], cv2.COLOR_BGR2GRAY)
            
            # Calculate absolute difference
            diff = cv2.absdiff(prev_gray, curr_gray)
            
            # Calculate mean difference
            mean_diff = np.mean(diff)
            diffs.append(mean_diff)
        
        # Analyze differences
        avg_diff = np.mean(diffs)
        std_diff = np.std(diffs)
        
        # Real faces will have more micro-movements
        # Photos will have very little movement, primarily from camera shake or lighting changes
        
        # Normalize to 0-1 scale (higher is more likely to be a real person)
        # Threshold determined empirically - may need adjustment
        movement_score = min(1.0, (avg_diff * 8) + (std_diff * 4))
        
        # Apply sigmoid-like normalization to make the decision boundary sharper
        if movement_score < 0.2:  # Very little movement - likely a photo
            movement_score = movement_score * 0.25
        elif movement_score > 0.4:  # Significant movement - likely a real person
            movement_score = 0.5 + (movement_score * 0.5)
        
        return movement_score
    
    def detect_reflection_patterns(self, frame):
        """Detect reflection patterns that are common in photos (e.g., glossy surfaces)"""
        # Extract face region
        if len(self.frame_history) == 0:
            return 0.5
        
        face_img = self.frame_history[-1]  # Use most recent face image
        
        # Convert to HSV color space to separate brightness
        hsv = cv2.cvtColor(face_img, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)
        
        # Detect highlights (reflection points)
        # These are common in photos due to flash or glossy paper
        _, thresh = cv2.threshold(v, 240, 255, cv2.THRESH_BINARY)
        
        # Calculate percentage of highlight pixels
        highlight_ratio = np.sum(thresh) / (thresh.shape[0] * thresh.shape[1] * 255)
        
        # Calculate brightness variance (more uniform in photos)
        brightness_std = np.std(v)
        normalized_std = min(brightness_std / 40.0, 1.0)  # Normalize
        
        # Combine metrics
        # Photos tend to have more highlights and more uniform lighting
        reflection_score = 0.7 * (1.0 - highlight_ratio * 10) + 0.3 * normalized_std
        
        return reflection_score
    
    def analyze_texture_frequency(self, frame):
        """Analyze frequency domain characteristics of face region"""
        if len(self.frame_history) == 0:
            return 0.5
        
        face_img = self.frame_history[-1]
        gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
        
        # Apply 2D FFT
        f_transform = np.fft.fft2(gray)
        f_shift = np.fft.fftshift(f_transform)
        magnitude_spectrum = np.log(np.abs(f_shift) + 1)
        
        # Analyze frequency distribution
        # Photos often have regular printing patterns in high frequencies
        height, width = magnitude_spectrum.shape
        center_y, center_x = height // 2, width // 2
        
        # Analyze high frequency content (further from center)
        high_freq_mask = np.zeros_like(magnitude_spectrum, dtype=bool)
        y, x = np.ogrid[:height, :width]
        mask_radius = min(center_y, center_x) // 2
        outer_area = ((y - center_y)**2 + (x - center_x)**2 >= mask_radius**2)
        high_freq_mask[outer_area] = True
        
        # Analyze mid frequency content
        mid_freq_mask = np.zeros_like(magnitude_spectrum, dtype=bool)
        mid_outer = ((y - center_y)**2 + (x - center_x)**2 >= (mask_radius//2)**2)
        mid_inner = ((y - center_y)**2 + (x - center_x)**2 < mask_radius**2)
        mid_freq_mask[mid_outer & mid_inner] = True
        
        # Calculate ratio of high to mid frequency energy
        high_energy = np.sum(magnitude_spectrum[high_freq_mask])
        mid_energy = np.sum(magnitude_spectrum[mid_freq_mask])
        
        # Avoid division by zero
        if mid_energy == 0:
            freq_ratio = 1.0
        else:
            freq_ratio = high_energy / mid_energy
            
        # Photos often have higher ratio due to printing patterns
        # Convert to score (0-1, higher is more likely to be real face)
        if freq_ratio > 1.5:  # Empirical threshold
            texture_score = max(0, 1.0 - (freq_ratio - 1.5) / 3.0)
        else:
            texture_score = min(1.0, 0.7 + (1.5 - freq_ratio) / 5.0)
            
        return texture_score
    
    def analyze_eye_tracking_data(self):
        """Analyze collected eye tracking data for liveness detection"""
        if len(self.gaze_history) < 10:
            return 0.5  # Not enough data, neutral score
        
        # Calculate movement variance (real humans have more varied movement)
        movement_variances = []
        
        # For each eye, calculate movement between frames
        for i in range(min(2, len(self.gaze_history[0]))):  # Up to 2 eyes
            positions = []
            for frame_data in self.gaze_history:
                if len(frame_data) > i:
                    positions.append(frame_data[i])
            
            if len(positions) > 1:
                # Calculate movements between consecutive positions
                movements = [self._distance(positions[j], positions[j-1]) 
                            for j in range(1, len(positions))]
                
                if movements:
                    # Get variance and mean of movement
                    var_movement = np.var(movements)
                    avg_movement = np.mean(movements)
                    movement_variances.append((var_movement, avg_movement))
        
        # No valid movement data
        if not movement_variances:
            return 0.5
        
        # Average the variances and means
        avg_variance = np.mean([v[0] for v in movement_variances])
        avg_movement = np.mean([v[1] for v in movement_variances])
        
        # Count blinks
        blink_count = sum(self.blink_history)
        blink_rate = blink_count / len(self.blink_history) if self.blink_history else 0
        
        # Natural movement has both some average movement and variance in that movement
        movement_score = min(1.0, (avg_movement * 0.1) + (avg_variance * 0.01))
        
        # Combine movement score with blink rate
        # Real humans should have some movement variance and occasional blinks
        liveness_score = 0.7 * movement_score + 0.3 * min(blink_rate * 5, 1.0)
        
        return liveness_score
    
    def _distance(self, p1, p2):
        """Calculate Euclidean distance between two points"""
        return np.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)
    
    def preprocess_image(self, frame):
        """Preprocess image for the neural network"""
        # Resize to 224x224 (MobileNetV2 input size)
        img = cv2.resize(frame, (224, 224))
        # Convert BGR to RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        # Preprocess for MobileNetV2
        img = img / 255.0
        return img
    
    def determine_liveness(self, frame):
        """Combine all detection methods for robust liveness detection"""
        # Extract features from eye tracking
        tracked_frame, face_rect, eye_centers, is_blinking = self.detect_eyes(frame)
        
        if face_rect is None:
            return 0.0, tracked_frame, "No face detected"
        
        # Calculate scores from different methods
        eye_tracking_score = self.analyze_eye_tracking_data()
        micro_movement_score = self.detect_micro_movements()
        reflection_score = self.detect_reflection_patterns(frame)
        texture_score = self.analyze_texture_frequency(frame)
        
        # Neural network prediction for overall image features
        preprocessed = self.preprocess_image(frame)
        preprocessed = np.expand_dims(preprocessed, axis=0)
        nn_score = self.model.predict(preprocessed, verbose=0)[0][0]
        
        # Calculate weighted final score
        # Prioritize micro-movements and texture analysis as these are most effective
        final_score = (
            0.3 * micro_movement_score +
            0.2 * texture_score +
            0.2 * eye_tracking_score +
            0.2 * reflection_score +
            0.1 * nn_score
        )
        
        # Apply threshold adjustment for clearer decision boundary
        if final_score < 0.4:
            final_score *= 0.8  # Reduce low scores further (more likely photo)
        elif final_score > 0.6:
            final_score = 0.6 + (final_score - 0.6) * 1.2  # Boost high scores (more likely human)
            final_score = min(final_score, 1.0)  # Cap at 1.0
        
        # Debug information
        debug_info = (f"Move: {micro_movement_score:.2f}, Tex: {texture_score:.2f}, "
                     f"Eye: {eye_tracking_score:.2f}, Ref: {reflection_score:.2f}")
        
        return final_score, tracked_frame, debug_info
    
    def reset_tracking_data(self):
        """Reset all tracking data"""
        self.gaze_history = []
        self.blink_history = []
        self.prev_eye_areas = []
        self.frame_history = []
        self.start_time = None

# Initialize the detector globally
detector = EnhancedPhotoDetector()

# Create HTML templates
with open("templates/index.html", "w") as f:
    f.write("""
<!DOCTYPE html>
<html>
<head>
    <title>Enhanced Photo vs Human Detector</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f0f0f0;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .video-container {
            width: 100%;
            margin: 20px auto;
            text-align: center;
        }
        #videoElement {
            width: 100%;
            max-width: 640px;
            border: 3px solid #ccc;
            border-radius: 8px;
        }
        .controls {
            margin: 20px 0;
            text-align: center;
        }
        button {
            background-color: #4CAF50;
            border: none;
            color: white;
            padding: 10px 20px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 4px;
        }
        button:hover {
            background-color: #45a049;
        }
        .status {
            margin: 20px 0;
            padding: 15px;
            border-radius: 4px;
            text-align: center;
            font-weight: bold;
            font-size: 18px;
        }
        .result-human {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .result-photo {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .result-waiting {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeeba;
        }
        .debug-info {
            margin: 10px 0;
            padding: 10px;
            background-color: #e9ecef;
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
        }
        .instructions {
            margin: 20px 0;
            padding: 15px;
            background-color: #e7f3fe;
            border-left: 6px solid #2196F3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Enhanced Photo vs Human Detector</h1>
        
        <div class="instructions">
            <h3>Instructions:</h3>
            <ul>
                <li>Position your face in front of the camera</li>
                <li>Keep reasonably still but natural (micro-movements are analyzed)</li>
                <li>Try using a photo of a person to test detection</li>
                <li>Wait at least 3-5 seconds for the system to analyze movements</li>
            </ul>
        </div>
        
        <div class="video-container">
            <img id="videoElement" src="/video_feed" alt="Video Stream">
        </div>
        
        <div class="controls">
            <button id="resetButton" onclick="resetDetection()">Reset Detection</button>
        </div>
        
        <div id="resultStatus" class="status result-waiting">
            Waiting for detection results...
        </div>
        
        <div id="debugInfo" class="debug-info">
            Initializing system...
        </div>
    </div>

    <script>
        // Periodically check detection results
        setInterval(function() {
            fetch('/detection_result')
                .then(response => response.json())
                .then(data => {
                    const resultElement = document.getElementById('resultStatus');
                    const debugElement = document.getElementById('debugInfo');
                    
                    if (data.score > 0.5) {
                        resultElement.className = 'status result-human';
                        resultElement.textContent = `HUMAN (Score: ${data.score.toFixed(2)})`;
                    } else {
                        resultElement.className = 'status result-photo';
                        resultElement.textContent = `PHOTO/FAKE (Score: ${data.score.toFixed(2)})`;
                    }
                    
                    debugElement.textContent = data.debug_info;
                })
                .catch(error => console.error('Error fetching detection result:', error));
        }, 500);
        
        function resetDetection() {
            fetch('/reset_detection', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const resultElement = document.getElementById('resultStatus');
                        resultElement.className = 'status result-waiting';
                        resultElement.textContent = 'Waiting for detection results...';
                        document.getElementById('debugInfo').textContent = 'Detection reset. Collecting new data...';
                    }
                })
                .catch(error => console.error('Error resetting detection:', error));
        }
    </script>
</body>
</html>
    """)

# Initialize webcam
def get_frame():
    global latest_frame, latest_result
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        raise RuntimeError("Could not open webcam. Please check your camera connection.")
        
    print("Webcam opened successfully")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        # Process frame for liveness detection
        with processing_lock:
            score, processed_frame, debug_info = detector.determine_liveness(frame)
            
            # Display result on frame
            result_text = "HUMAN" if score > 0.5 else "PHOTO/FAKE"
            confidence = f"Score: {score:.2f}"
            
            # Add text with background for better visibility
            frame_height, frame_width = processed_frame.shape[:2]
            cv2.rectangle(processed_frame, (10, 15), (200, 80), (0, 0, 0), -1)
            cv2.putText(processed_frame, result_text, (15, 40), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0) if score > 0.5 else (0, 0, 255), 2)
            cv2.putText(processed_frame, confidence, (15, 70), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 1)
            
            # Add debug info
            cv2.rectangle(processed_frame, (10, frame_height - 50), (frame_width - 10, frame_height - 10), (0, 0, 0), -1)
            cv2.putText(processed_frame, debug_info, (15, frame_height - 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            # Store the latest result
            latest_result = {
                "score": float(score),
                "debug_info": debug_info
            }
            
            # Encode the frame as JPEG
            _, buffer = cv2.imencode('.jpg', processed_frame)
            latest_frame = buffer.tobytes()
            
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + latest_frame + b'\r\n')
              
    # Release resources when done
    cap.release()

# Start the camera in a separate thread
def start_camera():
    global latest_frame
    # Initialize with a blank image
    blank_image = np.zeros((480, 640, 3), np.uint8)
    text = "Initializing camera..."
    cv2.putText(blank_image, text, (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    _, buffer = cv2.imencode('.jpg', blank_image)
    latest_frame = buffer.tobytes()
    
    camera_thread = threading.Thread(target=lambda: next(get_frame()))
    camera_thread.daemon = True
    camera_thread.start()

# FastAPI route for the main page
@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# FastAPI route for video streaming
@app.get("/video_feed")
async def video_feed():
    return StreamingResponse(get_frame(), 
                            media_type="multipart/x-mixed-replace; boundary=frame")

# FastAPI route to get the latest detection result
@app.get("/detection_result")
async def detection_result():
    global latest_result
    
    if latest_result is None:
        return {"score": 0.0, "debug_info": "Initializing..."}
    return latest_result

# FastAPI route to reset detection
@app.post("/reset_detection")
async def reset_detection():
    with processing_lock:
        detector.reset_tracking_data()
    return {"success": True}

# Initialize application when started
@app.on_event("startup")
async def startup_event():
    global latest_result
    latest_result = {"score": 0.0, "debug_info": "Starting up..."}
    print("Enhanced Photo Detector service starting...")
    print("Loading detector model...")
    print("Detector initialized successfully")
    
if __name__ == "__main__":
    # Start with a reasonable resolution and port
    print("Starting Enhanced Photo Detector API")
    print("Once started, access the interface at http://localhost:8000")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)