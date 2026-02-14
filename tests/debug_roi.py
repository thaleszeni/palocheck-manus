import sys
import os
import cv2
import numpy as np
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.vision import PaloDetector

def debug_roi():
    # Path to the user uploaded image (using the path from metadata)
    img_path = "/Users/thalescassianozeni/.gemini/antigravity/brain/43f6fae6-685c-4475-aaef-8e6a2150b96b/uploaded_media_1769273373152.png"
    
    detector = PaloDetector()
    img = cv2.imread(img_path)
    if img is None:
        print("Image not found!")
        return

    # Preprocess
    _, gray, _ = detector.preprocess(img_path)
    
    # Run Detection
    roi, found = detector.detect_test_area(gray)
    
    print(f"Separator Found: {found}")
    print(f"ROI: {roi}")
    print(f"Image Height: {img.shape[0]}")
    
    # Visual check
    x, y, w, h = roi
    # Draw ROI
    cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 3)
    # Draw Separator Line (Top of ROI)
    cv2.line(img, (0, y), (img.shape[1], y), (0, 0, 255), 3)
    
    output_path = "/Users/thalescassianozeni/.gemini/antigravity/scratch/palocheck/backend/debug_roi_output.jpg"
    cv2.imwrite(output_path, img)
    print(f"Saved debug image to {output_path}")

if __name__ == "__main__":
    debug_roi()
