import sys
import os
import cv2
sys.path.append("/Users/thalescassianozeni/.gemini/antigravity/scratch/palocheck/backend")
from vision import PaloDetector

def diagnose_marks():
    img_path = "/Users/thalescassianozeni/.gemini/antigravity/scratch/palocheck/backend/storage/dataset/case_24_raw.png"
    detector = PaloDetector()
    warped, gray, processed = detector.preprocess(img_path)
    roi, _ = detector.detect_test_area(processed)
    palos = detector.detect_palos(processed, gray, roi=roi)
    
    marks = getattr(detector, 'last_marks', [])
    print(f"Total palos: {len(palos)}")
    print(f"Total marks detected: {len(marks)}")
    
    for m in marks:
        print(f"  Mark: {m['bbox']}, Center Y: {m['center'][1]:.1f}")
    
    # Visual overlay
    debug_img = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
    x_roi, y_roi, w_roi, h_roi = roi
    cv2.rectangle(debug_img, (x_roi, y_roi), (x_roi + w_roi, y_roi + h_roi), (0, 255, 0), 2)
    for p in palos:
        x, y, w, h = p["bbox"]
        cv2.rectangle(debug_img, (x, y), (x+w, y+h), (255, 150, 0), 1)
    for m in marks:
        x, y, w, h = m["bbox"]
        cv2.rectangle(debug_img, (x, y), (x+w, y+h), (0, 255, 0), 2)
    
    out_path = "/tmp/debug_marks_overlay.jpg"
    cv2.imwrite(out_path, debug_img)
    print(f"[Overlay saved to {out_path}]")

if __name__ == "__main__":
    diagnose_marks()
