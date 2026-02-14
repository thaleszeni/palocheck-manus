import cv2
import numpy as np
import sys
import os
from pdf2image import convert_from_path

# Adiciona o diretório atual ao path para importar vision
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from vision import PaloDetector

def test_real_patient_scan():
    pdf_path = "/home/ubuntu/upload/AdobeScan24dejan.de2026.pdf(1).pdf"
    
    print(f"Convertendo PDF: {pdf_path}")
    images = convert_from_path(pdf_path)
    img_path = "patient_scan.png"
    images[0].save(img_path, "PNG")
    
    detector = PaloDetector()
    
    print("Processando imagem...")
    warped, gray, opening = detector.preprocess(img_path)
    roi = detector.detect_test_area(gray)
    
    print("\n--- RESULTADOS DA DETECÇÃO ---")
    print(f"ROI Detectada: {roi}")
    print(f"TOP_CUTOFF Aplicado: {detector.last_run_meta.get('top_cutoff_applied')}")
    print(f"Linha Separadora Encontrada: {detector.last_run_meta.get('separator_found')}")
    print(f"Confiança ROI: {detector.last_run_meta.get('roi_confidence')}")
    print(f"Fonte da ROI: {detector.last_run_meta.get('roi_source')}")
    
    # Detecção de palos
    palos = detector.detect_palos(opening, gray, roi=roi)
    print(f"Total de Palos Detectados: {len(palos)}")
    
    # Desenhar ROI para inspeção visual (se possível no log)
    debug_img = warped.copy()
    x, y, w, h = roi
    cv2.rectangle(debug_img, (x, y), (x + w, y + h), (0, 255, 0), 3)
    cv2.line(debug_img, (0, int(detector.last_run_meta.get('top_cutoff_applied'))), 
             (warped.shape[1], int(detector.last_run_meta.get('top_cutoff_applied'))), (0, 0, 255), 5)
    cv2.imwrite("debug_patient_scan.png", debug_img)
    
    print("\nImagem de debug salva em 'debug_patient_scan.png'")
    
    # Validação lógica: se encontrou a linha separadora, o teste passou na detecção estrutural
    if detector.last_run_meta.get('separator_found'):
        print("✓ SUCESSO: Linha separadora horizontal detectada corretamente.")
    else:
        print("⚠ AVISO: Linha separadora não detectada. Usando fallback adaptativo.")

if __name__ == "__main__":
    try:
        test_real_patient_scan()
    except Exception as e:
        print(f"FALHA NO TESTE: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
