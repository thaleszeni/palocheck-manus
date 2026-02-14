import cv2
import numpy as np
import os
import sys
from vision import PaloDetector

def create_mock_test_image(with_header_noise=False):
    height, width = 2000, 1400
    img = np.ones((height, width, 3), dtype=np.uint8) * 255
    sep_y = 300
    cv2.line(img, (100, sep_y), (width-100, sep_y), (0, 0, 0), 2)
    if with_header_noise:
        cv2.putText(img, "NOME: JOAO SILVA", (100, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,0), 2)
        for i in range(10):
            cv2.line(img, (200 + i*50, 200), (200 + i*50, 250), (0,0,0), 2)
    for line_idx in range(3):
        y_start = sep_y + 100 + line_idx * 150
        for i in range(20):
            x = 200 + i * 40
            cv2.line(img, (x, y_start), (x, y_start + 40), (0,0,0), 2)
    return img

def test_roi_exclusion():
    detector = PaloDetector()
    print("--- TESTE 1: Exclusão de Ruído no Topo ---")
    img_clean = create_mock_test_image(with_header_noise=False)
    cv2.imwrite("test_clean.png", img_clean)
    _, gray_clean, processed_clean = detector.preprocess("test_clean.png")
    roi_clean, _ = detector.detect_test_area(processed_clean)
    palos_clean = detector.detect_palos(processed_clean, gray_clean, roi=roi_clean)
    
    img_noisy = create_mock_test_image(with_header_noise=True)
    cv2.imwrite("test_noisy.png", img_noisy)
    _, gray_noisy, processed_noisy = detector.preprocess("test_noisy.png")
    roi_noisy, _ = detector.detect_test_area(processed_noisy)
    palos_noisy = detector.detect_palos(processed_noisy, gray_noisy, roi=roi_noisy)
    
    print(f"Palos Limpa: {len(palos_clean)}, Palos Ruído Topo: {len(palos_noisy)}")
    if len(palos_clean) == len(palos_noisy) == 60:
        print("✅ SUCESSO: O topo foi isolado e não contaminou a contagem.")
    else:
        print("❌ FALHA: Contagem contaminada pelo topo.")
        return False
    return True

def test_roi_failure():
    detector = PaloDetector()
    print("\n--- TESTE 2: Bloqueio de ROI Inválida ---")
    img_fail = np.random.randint(0, 256, (2000, 1400, 3), dtype=np.uint8)
    cv2.imwrite("test_fail.png", img_fail)
    _, gray, processed = detector.preprocess("test_fail.png")
    roi, _ = detector.detect_test_area(processed)
    palos = detector.detect_palos(processed, gray, roi=roi)
    metrics = detector.calculate_metrics([palos])
    
    print(f"Status: {metrics.get('status')}, Total: {metrics.get('total')}")
    if metrics.get('status') == 'needs_review' and metrics.get('total') == 'N/A':
        print("✅ SUCESSO: Métricas bloqueadas (N/A) para ROI inválida.")
    else:
        print("❌ FALHA: Sistema permitiu métricas com ROI inválida.")
        return False
    return True

if __name__ == "__main__":
    s1 = test_roi_exclusion()
    s2 = test_roi_failure()
    if s1 and s2:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
        # Cleanup
        for f in ["test_clean.png", "test_noisy.png", "test_fail.png"]:
            if os.path.exists(f): os.remove(f)
    else:
        sys.exit(1)
