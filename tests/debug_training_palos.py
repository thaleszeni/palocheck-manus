import sys
import os
import cv2
import numpy as np
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.vision import PaloDetector

def debug_training_palos():
    img_path = "/Users/thalescassianozeni/.gemini/antigravity/brain/43f6fae6-685c-4475-aaef-8e6a2150b96b/uploaded_media_1769273805234.png"
    
    detector = PaloDetector()
    warped, gray, processed = detector.preprocess(img_path)
    height, width = processed.shape
    
    # Crop Top 30%
    header_h = int(height * 0.35)
    header_roi = processed[0:header_h, :]
    header_gray = gray[0:header_h, :]
    
    print(f"Scanning Header ROI: 0-{header_h}")
    
    # Run generic palo detection on this strip
    # We use 'relaxed=True' to ensure we pick up printed samples even if small
    # But wait, printed samples are usually strong.
    
    # Use standard detect logic manually to avoid recursion limits or cropping
    kernel = np.ones((2,2), np.uint8)
    eroded = cv2.erode(header_roi, kernel, iterations=1)
    dist_transform = cv2.distanceTransform(eroded, cv2.DIST_L2, 3)
    ret, last_etching = cv2.threshold(dist_transform, 0.4 * dist_transform.max(), 255, 0)
    last_etching = np.uint8(last_etching)
    num_labels, markers = cv2.connectedComponents(last_etching)
    
    # Bump markers
    markers = markers + 1
    markers[header_roi == 0] = 0
    img_color = cv2.cvtColor(header_roi, cv2.COLOR_GRAY2BGR)
    markers = cv2.watershed(img_color, markers)
    
    training_palos = []
    for label in range(2, num_labels + 1):
        mask = np.uint8(markers == label)
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours: continue
        x, y, w, h = cv2.boundingRect(contours[0])
        
        # Valid palo shape?
        aspect = h/w if w>0 else 0
        if 1.5 < aspect < 20 and h > 10:
            training_palos.append((y+h, x, w, h)) # Store bottom Y
            
    print(f"Found {len(training_palos)} potential training palos.")
    if training_palos:
        max_y = max(p[0] for p in training_palos)
        print(f"Lowest Training Palo Bottom: {max_y}")
        print(f"Proposed Split Y (with buffer): {max_y + 20}")
    else:
        print("No training palos found.")

if __name__ == "__main__":
    debug_training_palos()
