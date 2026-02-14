"""
Testes de Robustez Adaptativa: Valida o Palocheck contra diferentes
condições de imagem (iluminação, rotação, ruído, contraste).
"""

import cv2
import numpy as np
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from vision import PaloDetector
from roi_validator import ROIValidator

def create_realistic_test_sheet(height=1414, width=1000, condition="normal"):
    """
    Cria uma folha de teste realista com diferentes condições.
    """
    img = np.ones((height, width, 3), dtype=np.uint8) * 255
    
    # Aplicar condição de iluminação/contraste
    if condition == "low_contrast":
        img = (img * 0.8).astype(np.uint8)  # Reduzir brilho
    elif condition == "high_contrast":
        img = np.clip(img * 1.2, 0, 255).astype(np.uint8)  # Aumentar brilho
    elif condition == "shadows":
        # Simular sombras (gradiente)
        for y in range(height):
            shadow_factor = 1.0 - (y / height) * 0.3
            img[y, :] = (img[y, :] * shadow_factor).astype(np.uint8)
    
    # Desenhar linha separadora oficial
    cv2.line(img, (50, 300), (950, 300), (0, 0, 0), 2)
    
    # Desenhar 100 palos na área útil
    for row in range(5):
        y_base = 400 + row * 150
        for col in range(20):
            x = 100 + col * 40
            cv2.line(img, (x, y_base), (x, y_base + 60), (0, 0, 0), 2)
    
    # Aplicar ruído se necessário
    if condition == "noisy":
        noise = np.random.normal(0, 10, img.shape)
        img = np.clip(img.astype(float) + noise, 0, 255).astype(np.uint8)
    
    # Aplicar rotação leve se necessário
    if condition == "rotated":
        angle = 5  # 5 graus
        center = (width // 2, height // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        img = cv2.warpAffine(img, M, (width, height), borderValue=(255, 255, 255))
    
    return img

def test_adaptive_robustness():
    """
    Testa a adaptabilidade do Palocheck a diferentes condições.
    """
    detector = PaloDetector()
    validator = ROIValidator()
    
    conditions = ["normal", "low_contrast", "high_contrast", "shadows", "noisy", "rotated"]
    results = {}
    
    print("=" * 70)
    print("TESTE DE ROBUSTEZ ADAPTATIVA DO PALOCHECK")
    print("=" * 70)
    
    for condition in conditions:
        print(f"\n[{condition.upper()}]")
        
        img = create_realistic_test_sheet(condition=condition)
        cv2.imwrite(f"test_{condition}.png", img)
        
        try:
            warped, gray, opening = detector.preprocess(f"test_{condition}.png")
            roi = detector.detect_test_area(gray)
            palos = detector.detect_palos(opening, gray, roi=roi)
            
            # Validar ROI
            validation = validator.validate_roi_comprehensive(gray, roi)
            
            count = len(palos)
            confidence = detector.last_run_meta.get("roi_confidence", 0)
            
            results[condition] = {
                "palo_count": count,
                "roi_confidence": confidence,
                "validation_confidence": validation["confidence_score"],
                "has_structure": validation["has_structure"],
                "has_content": validation["has_content"],
                "margins_clean": validation["margins_clean"]
            }
            
            print(f"  Contagem de Palos: {count}")
            print(f"  ROI Confidence: {confidence:.2f}")
            print(f"  Validation Confidence: {validation['confidence_score']:.2f}")
            print(f"  Status: {'✓ PASSOU' if count == 100 else '✗ FALHOU'}")
            
        except Exception as e:
            print(f"  ✗ ERRO: {e}")
            results[condition] = {"error": str(e)}
    
    # Resumo
    print("\n" + "=" * 70)
    print("RESUMO DOS TESTES")
    print("=" * 70)
    
    passed = sum(1 for r in results.values() if r.get("palo_count") == 100)
    total = len(conditions)
    
    print(f"Testes Aprovados: {passed}/{total}")
    
    for condition, result in results.items():
        status = "✓" if result.get("palo_count") == 100 else "✗"
        print(f"  {status} {condition}: {result.get('palo_count', 'ERRO')}")
    
    # Verificação final
    if passed == total:
        print("\n✓ SUCESSO: O Palocheck é adaptável a diferentes condições!")
        return True
    else:
        print(f"\n✗ FALHA: {total - passed} condições falharam.")
        return False

if __name__ == "__main__":
    success = test_adaptive_robustness()
    sys.exit(0 if success else 1)
