import sys
import os
import cv2
import numpy as np
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.vision import PaloDetector

def survey_structure():
    img_path = "/Users/thalescassianozeni/.gemini/antigravity/brain/43f6fae6-685c-4475-aaef-8e6a2150b96b/uploaded_media_1769273805234.png"
    
    detector = PaloDetector()
    warped, gray, processed = detector.preprocess(img_path)
    height, width = gray.shape
    
    print(f"Image Dimensions: {width}x{height}")
    
    # 1. Survey Horizontal Lines (Top 50%)
    print("\n--- HORIZONTAL LINES SURVEY (0-50%) ---")
    roi = gray[0:int(height*0.5), :]
    _, thresh = cv2.threshold(roi, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # Use generic line detection
    edges = cv2.Canny(roi, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=50, minLineLength=width*0.1, maxLineGap=10)
    
    detected_lines = []
    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            if abs(y2 - y1) < 5: # Strictly horizontal
                w_line = abs(x2 - x1)
                y_center = (y1 + y2) // 2
                detected_lines.append((y_center, w_line, x1, x2))
    
    # Cluster/Sort by Y
    detected_lines.sort(key=lambda x: x[0])
    for y, w_line, x1, x2 in detected_lines:
        print(f"Y={y} | Width={w_line} ({int(w_line/width*100)}%) | X range={x1}-{x2}")

    # 2. Survey Palos (Where are these 27?)
    print("\n--- DETECTED PALOS SURVEY ---")
    # Run detecting on FULL image (relaxed=True just to see everything or normal)
    # Using 'detect_palos' logic manually to avoid its internal cropping for now
    # Actually, let's call detector.detect_palos but assuming full ROI to see where they are
    
    # For survey, we force detect_palos to run on full image by bypassing detect_test_area inside it?
    # No, detect_palos calls detect_test_area. 
    # Let's inspect the results returned by validate_template logic which used detect_palos.
    # We will just run the core detection logic here manually.
    
    # Core detection logic from detect_palos
    kernel = np.ones((2,2), np.uint8)
    eroded = cv2.erode(processed, kernel, iterations=1)
    dist_transform = cv2.distanceTransform(eroded, cv2.DIST_L2, 3)
    ret, last_etching = cv2.threshold(dist_transform, 0.4 * dist_transform.max(), 255, 0)
    last_etching = np.uint8(last_etching)
    num_labels, markers = cv2.connectedComponents(last_etching)
    
    print(f"Found {num_labels} connected components in full image.")
    valid_palos = 0
    for label in range(1, num_labels):
        mask = np.uint8(markers == label) # This is incorrect for connectedComponents (labels start at 0bg, 1..N)
        # Actually standard connectedComponents returns labels map.
        y_idxs, x_idxs = np.where(markers == label)
        if len(y_idxs) == 0: continue
        
        y_min, y_max = np.min(y_idxs), np.max(y_idxs)
        x_min, x_max = np.min(x_idxs), np.max(x_idxs)
        w_p = x_max - x_min
        h_p = y_max - y_min
        
        # Apply filters
        aspect_ratio = h_p / float(w_p) if w_p > 0 else 0
        if 2.5 < aspect_ratio < 60.0 and h_p > 10:
             print(f"Palo Candidate: Y={y_min}-{y_max} | X={x_min}-{x_max} | H={h_p}")
             valid_palos += 1
             
    print(f"Total Valid Palos Candidates: {valid_palos}")

if __name__ == "__main__":
    survey_structure()
