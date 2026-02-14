"""
ROI Validator: Valida a detecção de ROI através de múltiplas estratégias
para garantir máxima confiabilidade e adaptabilidade a diferentes scans.
"""

import cv2
import numpy as np

class ROIValidator:
    def __init__(self):
        self.validation_log = []
        
    def validate_roi_by_structure(self, img, roi):
        """
        Valida a ROI verificando se há marcos estruturais (linhas) 
        próximos ao topo da ROI detectada.
        """
        x, y, w, h = roi
        roi_img = img[y:y+h, x:x+w]
        
        # Busca por linhas horizontais no topo da ROI
        v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 20))
        v_mask = cv2.morphologyEx(roi_img, cv2.MORPH_OPEN, v_kernel)
        row_sums = np.sum(v_mask, axis=1)
        
        # Se há densidade significativa nos primeiros 5% da ROI, é um bom sinal
        top_region = row_sums[:int(h*0.05)]
        has_structure = np.max(top_region) > (w * 255 * 0.02)
        
        return has_structure, np.max(top_region)
    
    def validate_roi_by_density(self, img, roi):
        """
        Valida a ROI verificando se há uma distribuição adequada de traços
        verticais ao longo da altura da ROI.
        """
        x, y, w, h = roi
        roi_img = img[y:y+h, x:x+w]
        
        v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 25))
        v_mask = cv2.morphologyEx(roi_img, cv2.MORPH_OPEN, v_kernel)
        row_sums = np.sum(v_mask, axis=1)
        
        # Dividir em 5 intervalos (conforme manual: 5 tempos)
        interval_height = h // 5
        interval_densities = []
        
        for i in range(5):
            start = i * interval_height
            end = (i + 1) * interval_height if i < 4 else h
            interval_density = np.mean(row_sums[start:end])
            interval_densities.append(interval_density)
        
        # Verificar se há traços em todos os intervalos (não deve estar vazio)
        has_content_in_all = all(d > (w * 255 * 0.01) for d in interval_densities)
        avg_density = np.mean(interval_densities)
        
        return has_content_in_all, interval_densities, avg_density
    
    def validate_roi_by_margins(self, img, roi):
        """
        Valida a ROI verificando se as margens laterais estão livres de traços
        (indicando que a ROI não invadiu as bordas do papel).
        """
        x, y, w, h = roi
        
        # Verificar margens laterais (primeiros e últimos 5% da largura)
        margin_width = int(w * 0.05)
        
        left_margin = img[y:y+h, x:x+margin_width]
        right_margin = img[y:y+h, x+w-margin_width:x+w]
        
        left_density = np.sum(left_margin) / (h * margin_width * 255)
        right_density = np.sum(right_margin) / (h * margin_width * 255)
        
        # Margens devem ter baixa densidade (< 5%)
        margins_clean = left_density < 0.05 and right_density < 0.05
        
        return margins_clean, left_density, right_density
    
    def validate_roi_comprehensive(self, img, roi):
        """
        Realiza validação completa da ROI usando múltiplas estratégias.
        Retorna um score de confiança e detalhes de cada validação.
        """
        has_structure, structure_value = self.validate_roi_by_structure(img, roi)
        has_content, interval_densities, avg_density = self.validate_roi_by_density(img, roi)
        margins_clean, left_margin, right_margin = self.validate_roi_by_margins(img, roi)
        
        # Calcular score de confiança
        confidence = 0.0
        
        if has_structure:
            confidence += 0.3
        if has_content:
            confidence += 0.3
        if margins_clean:
            confidence += 0.2
        
        # Bônus se a densidade média for razoável (não muito baixa, não muito alta)
        if 0.02 < avg_density < 0.15:
            confidence += 0.2
        
        validation_result = {
            "confidence_score": round(confidence, 2),
            "has_structure": has_structure,
            "has_content": has_content,
            "margins_clean": margins_clean,
            "structure_value": float(structure_value),
            "interval_densities": [float(d) for d in interval_densities],
            "avg_density": float(avg_density),
            "left_margin_density": float(left_margin),
            "right_margin_density": float(right_margin),
            "validation_log": self.validation_log
        }
        
        return validation_result
