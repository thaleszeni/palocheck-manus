import sys
import os
import cv2
import json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.vision import PaloDetector

def validate_template():
    # Path to the blank template uploaded by user
    img_path = "/Users/thalescassianozeni/.gemini/antigravity/brain/43f6fae6-685c-4475-aaef-8e6a2150b96b/uploaded_media_1769273805234.png"
    
    detector = PaloDetector()
    try:
        warped, gray, processed = detector.preprocess(img_path)
    except Exception as e:
        print(f"Preprocess Error: {e}")
        return

    # 1. Test ROI/Separator Detection
    roi, found = detector.detect_test_area(gray)
    print(f"Separator Found: {found}")
    print(f"ROI: {roi}")
    
    # 2. Test Detection (Should be 0 palos)
    palos = detector.detect_palos(processed, gray)
    print(f"Detected Palos: {len(palos)}")
    
    # Visual Debug
    x, y, w, h = roi
    cv2.rectangle(processed, (x, y), (x+w, y+h), (0, 255, 0), 3) # Green ROI
    
    # Save debug
    output_path = "/Users/thalescassianozeni/.gemini/antigravity/scratch/palocheck/backend/debug_template.jpg"
    cv2.imwrite(output_path, processed)
    print(f"Saved debug image to {output_path}")
    
    # Assertion
    if found and len(palos) == 0:
        print("SUCCESS: Template structure recognized and training area excluded.")
    else:
        print("FAILURE: System either missed the separator or counted printer/training marks.")

if __name__ == "__main__":
    validate_template()
