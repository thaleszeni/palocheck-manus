import cv2
import numpy as np
import sys
import os

# Adiciona o diretório atual ao path para importar vision
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from vision import PaloDetector

def create_mock_test_sheet(with_header_noise=False):
    # Simula uma folha A4 (proporção 1:1.41)
    height, width = 1414, 1000
    img = np.ones((height, width, 3), dtype=np.uint8) * 255
    
    # Desenha linha separadora oficial (marco estrutural)
    cv2.line(img, (50, 300), (950, 300), (0, 0, 0), 2)
    
    # Adiciona ruído no cabeçalho (zona proibida) se solicitado
    if with_header_noise:
        # Rabiscos aleatórios no topo
        for _ in range(20):
            x1, y1 = np.random.randint(50, 950), np.random.randint(50, 250)
            x2, y2 = x1 + np.random.randint(-20, 20), y1 + np.random.randint(10, 50)
            cv2.line(img, (x1, y1), (x2, y2), (50, 50, 50), 2)
            
    # Adiciona 100 palos na área útil (Segunda Parte)
    for row in range(5):
        y_base = 400 + row * 150
        for col in range(20):
            x = 100 + col * 40
            cv2.line(img, (x, y_base), (x, y_base + 60), (0, 0, 0), 2)
            
    return img

def test_top_cutoff_isolation():
    detector = PaloDetector()
    
    # Caso 1: Imagem limpa
    img_clean = create_mock_test_sheet(with_header_noise=False)
    cv2.imwrite("test_clean.png", img_clean)
    warped, gray, opening = detector.preprocess("test_clean.png")
    roi = detector.detect_test_area(gray)
    palos_clean = detector.detect_palos(opening, gray, roi=roi)
    count_clean = len(palos_clean)
    
    # Caso 2: Imagem com rabiscos no topo
    img_noisy = create_mock_test_sheet(with_header_noise=True)
    cv2.imwrite("test_noisy.png", img_noisy)
    warped_n, gray_n, opening_n = detector.preprocess("test_noisy.png")
    roi_n = detector.detect_test_area(gray_n)
    palos_noisy = detector.detect_palos(opening_n, gray_n, roi=roi_n)
    count_noisy = len(palos_noisy)
    
    print(f"--- TESTE DE ISOLAMENTO DE TOPO ---")
    print(f"Contagem Limpa: {count_clean}")
    print(f"Contagem com Ruído no Topo: {count_noisy}")
    print(f"ROI Aplicada (Clean): {roi}")
    print(f"ROI Aplicada (Noisy): {roi_n}")
    print(f"Confiança ROI: {detector.last_run_meta['roi_confidence']}")
    
    # O teste passa se a contagem for idêntica (indicando que o topo foi isolado)
    assert count_clean == count_noisy, f"ERRO: O ruído no topo contaminou a contagem! {count_clean} != {count_noisy}"
    assert count_clean == 100, f"ERRO: Contagem base incorreta. Esperado 100, obtido {count_clean}"
    print("SUCESSO: Zona superior isolada corretamente.")

if __name__ == "__main__":
    try:
        test_top_cutoff_isolation()
    except Exception as e:
        print(f"FALHA NO TESTE: {e}")
        sys.exit(1)
