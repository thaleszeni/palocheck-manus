import sys
import os
import cv2
import numpy as np
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.vision import PaloDetector

def validate_margins():
    # Use the most recent image
    img_path = "/Users/thalescassianozeni/.gemini/antigravity/brain/43f6fae6-685c-4475-aaef-8e6a2150b96b/uploaded_media_1_1769277072984.png"
    
    detector = PaloDetector()
    print("=== VALIDATION: MARGINS ===\n")
    
    # 1. Load
    warped, gray, processed = detector.preprocess(img_path)
    height, width = gray.shape
    print(f"Image Dims: {width}x{height}")
    
    # 2. Pipeline
    roi, sep_found = detector.detect_test_area(gray)
    palos = detector.detect_palos(processed, gray)
    lines = detector.cluster_lines(palos, img_height=height)
    intervals = detector.segment_intervals(lines)
    
    # 3. Calculate Metrics WITH DIMS
    mm_per_px = 25.4 / 300
    metrics = detector.calculate_metrics(intervals, mm_per_px=mm_per_px, img_dims=(width, height))
    
    print("\n--- Margins MM ---")
    print(f"Top Margin: {metrics.get('margins_mm', {}).get('top')} mm")
    print(f"Left Margins: {metrics.get('margins_mm', {}).get('left')}")
    print(f"Right Margins: {metrics.get('margins_mm', {}).get('right')}")
    
    # Validation
    if metrics.get('margins_mm', {}).get('top') != "N/A":
        print("✓ SUCCESS: Top margin calculated")
    else:
        print("✗ FAIL: Top margin is N/A")

if __name__ == "__main__":
    validate_margins()
