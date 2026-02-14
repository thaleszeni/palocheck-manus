import sys
import os
import cv2
import numpy as np
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.vision import PaloDetector

def diagnose_detection():
    img_path = "/Users/thalescassianozeni/.gemini/antigravity/brain/43f6fae6-685c-4475-aaef-8e6a2150b96b/uploaded_media_1769276475732.png"
    
    detector = PaloDetector()
    
    print("=== DIAGNÓSTICO DE DETECÇÃO ===\n")
    
    # 1. Load and Preprocess
    try:
        warped, gray, processed = detector.preprocess(img_path)
        print(f"✓ Imagem carregada: {gray.shape}")
    except Exception as e:
        print(f"✗ ERRO no pré-processamento: {e}")
        return
    
    # 2. ROI Detection
    roi, sep_found = detector.detect_test_area(gray)
    print(f"ROI: {roi}")
    print(f"Separator Found: {sep_found}")
    
    x_roi, y_roi, w_roi, h_roi = roi
    print(f"ROI Start Y: {y_roi} ({y_roi/gray.shape[0]*100:.1f}% da altura)")
    print(f"ROI Height: {h_roi} ({h_roi/gray.shape[0]*100:.1f}% da altura)")
    
    # 3. Cropped ROI Statistics
    roi_gray = gray[y_roi:y_roi+h_roi, :]
    roi_processed = processed[y_roi:y_roi+h_roi, :]
    
    print(f"\n--- ROI Crop Stats ---")
    print(f"Gray Mean: {np.mean(roi_gray):.1f}")
    print(f"Gray Std: {np.std(roi_gray):.1f}")
    print(f"Binary White Pixels: {np.sum(roi_processed > 0)} ({np.sum(roi_processed > 0) / roi_processed.size * 100:.2f}%)")
    
    # 4. Run Standard Detection
    palos_standard = detector.detect_palos(processed, gray, relaxed=False)
    print(f"\n--- Standard Mode ---")
    print(f"Detected: {len(palos_standard)} palos")
    
    # 5. Run Relaxed Detection (if standard failed)
    if len(palos_standard) < 50:
        print("\n--- Relaxed Mode (Rescue) ---")
        # Manually trigger relaxed without the sparse rejection
        detector.last_run_meta = {'separator_found': sep_found}
        
        # Create relaxed threshold
        thresh_relaxed = cv2.adaptiveThreshold(
            roi_gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY_INV, 31, 10
        )
        kernel = np.ones((2,2), np.uint8)
        processed_relaxed = cv2.morphologyEx(thresh_relaxed, cv2.MORPH_CLOSE, kernel)
        
        # Distance Transform
        dist_transform = cv2.distanceTransform(processed_relaxed, cv2.DIST_L2, 3)
        ret, markers_base = cv2.threshold(dist_transform, 0.1 * dist_transform.max(), 255, 0)
        markers_base = np.uint8(markers_base)
        
        num_labels, markers = cv2.connectedComponents(markers_base)
        print(f"Connected Components: {num_labels}")
        
        # Count valid candidates
        valid_count = 0
        for label in range(1, num_labels):
            y_idxs, x_idxs = np.where(markers == label)
            if len(y_idxs) == 0: continue
            
            y_min, y_max = np.min(y_idxs), np.max(y_idxs)
            x_min, x_max = np.min(x_idxs), np.max(x_idxs)
            w = x_max - x_min
            h = y_max - y_min
            
            aspect = h / w if w > 0 else 0
            if aspect > 1.3 and h > 8:
                valid_count += 1
        
        print(f"Valid Candidates (relaxed filters): {valid_count}")
        
        # Save debug images
        cv2.imwrite("/tmp/debug_roi_gray.jpg", roi_gray)
        cv2.imwrite("/tmp/debug_processed.jpg", processed_relaxed)
        cv2.imwrite("/tmp/debug_markers.jpg", markers_base)
        print("\n[Debug images saved to /tmp/]")

if __name__ == "__main__":
    diagnose_detection()
