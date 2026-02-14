import sys
import os
import cv2
import numpy as np
from typing import List, Dict, Any

# Mocking a bit or just importing
sys.path.append("/Users/thalescassianozeni/.gemini/antigravity/scratch/palocheck/backend")
from vision import PaloDetector

def diagnose():
    img_path = "/Users/thalescassianozeni/.gemini/antigravity/scratch/palocheck/backend/storage/dataset/case_24_raw.png"
    if not os.path.exists(img_path):
        print(f"File not found: {img_path}")
        return

    detector = PaloDetector()
    warped, gray, processed = detector.preprocess(img_path)
    roi, found = detector.detect_test_area(processed)
    
    # Run detection
    palos = detector.detect_palos(processed, gray, roi=roi)
    
    print(f"Total palos detected: {len(palos)}")
    
    # Look for suspect palos (very tall)
    heights = [p["height"] for p in palos]
    avg_h = sum(heights) / len(heights) if heights else 0
    std_h = np.std(heights) if heights else 0
    
    print(f"Average height: {avg_h:.2f}")
    print(f"Std Dev height: {std_h:.2f}")
    
    suspects = [p for p in palos if p["height"] > avg_h + 2 * std_h]
    print(f"Suspect palos (height > avg + 2*std): {len(suspects)}")
    for p in suspects[:10]:
        print(f"ID: {p['id']}, BBox: {p['bbox']}, Height: {p['height']}")

    # Check for vertical clusters
    lines = detector.cluster_lines(palos, gray.shape[0])
    print(f"Lines detected: {len(lines)}")
    for i, line in enumerate(lines[:5]):
        print(f"Line {i+1}: {len(line)} palos")

if __name__ == "__main__":
    diagnose()
