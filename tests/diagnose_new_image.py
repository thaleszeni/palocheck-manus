import sys
import os
import cv2
import numpy as np
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.vision import PaloDetector

def diagnose_new_image():
    # Use the most recent user uploaded image
    img_path = "/Users/thalescassianozeni/.gemini/antigravity/brain/43f6fae6-685c-4475-aaef-8e6a2150b96b/uploaded_media_1_1769277072984.png"
    
    detector = PaloDetector()
    
    print("=== DIAGNÓSTICO IMAGEM MAIS RECENTE ===\n")
    
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
    print(f"ROI End Y: {y_roi + h_roi} ({(y_roi + h_roi)/gray.shape[0]*100:.1f}% da altura)")
    print(f"ROI Height: {h_roi} ({h_roi/gray.shape[0]*100:.1f}% da altura)")
    
    # 3. Run Detection
    palos = detector.detect_palos(processed, gray)
    print(f"\n--- Detecção ---")
    print(f"Total Palos: {len(palos)}")
    
    if palos:
        # Check where palos are located
        y_positions = [p["center"][1] for p in palos]
        min_y = min(y_positions)
        max_y = max(y_positions)
        print(f"Y Range: {min_y:.1f} - {max_y:.1f}")
        print(f"Y Range (% altura): {min_y/gray.shape[0]*100:.1f}% - {max_y/gray.shape[0]*100:.1f}%")
    
    # Save debug image with overlay
    debug_img = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
    # Draw ROI
    cv2.rectangle(debug_img, (x_roi, y_roi), (x_roi + w_roi, y_roi + h_roi), (0, 255, 0), 2)
    # Draw palos
    for p in palos:
        x, y, w, h = p["bbox"]
        cv2.rectangle(debug_img, (x, y), (x+w, y+h), (0, 0, 255), 1)
    
    cv2.imwrite("/tmp/debug_detection_overlay.jpg", debug_img)
    print(f"\n[Debug overlay salvo em /tmp/debug_detection_overlay.jpg]")

if __name__ == "__main__":
    diagnose_new_image()
