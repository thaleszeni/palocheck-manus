import cv2
import numpy as np
from typing import List, Dict, Any
from roi_validator import ROIValidator

class PaloDetector:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {
            "min_height": 10,
            "max_width_ratio": 0.3, # Width / Height
            "min_area": 20,
            "angle_threshold": 20, # Max degrees from vertical
            "top_cutoff_fixed_pct": 0.15 # 15% fixed top cutoff
        }
        self.last_run_meta = {}
        self.roi_validator = ROIValidator()

    def find_paper_and_warp(self, img):
        height, width = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Enhanced contrast for tricky backgrounds (more aggressive CLAHE)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(10,10))
        gray = clahe.apply(gray)
        
        # Apply a median blur to reduce noise while preserving edges
        blurred = cv2.medianBlur(gray, 5)
        
        # Canny edge detection with adaptive thresholds
        sigma = 0.33
        v = np.median(blurred)
        lower = int(max(0, (1.0 - sigma) * v))
        upper = int(min(255, (1.0 + sigma) * v))
        edged = cv2.Canny(blurred, lower, upper)
        
        contours, _ = cv2.findContours(edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)
        
        for c in contours:
            area = cv2.contourArea(c)
            if area < (width * height * 0.10): continue # Reduzir limite mínimo para capturar mais contornos
                
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.02 * peri, True)
            
            if len(approx) == 4:
                pts = approx.reshape(4, 2)
                rect = np.zeros((4, 2), dtype="float32")
                
                s = pts.sum(axis=1)
                rect[0] = pts[np.argmin(s)]
                rect[2] = pts[np.argmax(s)]
                
                diff = np.diff(pts, axis=1)
                rect[1] = pts[np.argmin(diff)]
                rect[3] = pts[np.argmax(diff)]
                
                (tl, tr, br, bl) = rect
                widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
                widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
                maxWidth = max(int(widthA), int(widthB))
                
                heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
                heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
                maxHeight = max(int(heightA), int(heightB))
                
                dst = np.array([
                    [0, 0],
                    [maxWidth - 1, 0],
                    [maxWidth - 1, maxHeight - 1],
                    [0, maxHeight - 1]], dtype="float32")
                
                M = cv2.getPerspectiveTransform(rect, dst)
                warped = cv2.warpPerspective(img, M, (maxWidth, maxHeight))
                return warped
        
        # Fallback to simple thresholding
        _, isolator = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        kernel = np.ones((5,5), np.uint8)
        isolator = cv2.dilate(isolator, kernel, iterations=2)
        contours, _ = cv2.findContours(isolator, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)
        
        for c in contours:
            area = cv2.contourArea(c)
            # Area must be at least 20% of the image to be the paper
            if area < (width * height * 0.15): continue # Reduzir limite mínimo para capturar mais contornos
                
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.02 * peri, True)
            
            # If we found a quadrilateral-ish shape
            if 4 <= len(approx) <= 8: # Permitir mais vértices para formas ligeiramente irregulares
                # Get the bounding box points and sort them
                pts = approx.reshape(-1, 2)
                rect = np.zeros((4, 2), dtype="float32")
                
                # top-left has smallest sum, bottom-right has largest sum
                s = pts.sum(axis=1)
                rect[0] = pts[np.argmin(s)]
                rect[2] = pts[np.argmax(s)]
                
                # top-right smallest diff, bottom-left largest diff
                diff = np.diff(pts, axis=1)
                rect[1] = pts[np.argmin(diff)]
                rect[3] = pts[np.argmax(diff)]
                
                (tl, tr, br, bl) = rect
                widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
                widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
                maxWidth = max(int(widthA), int(widthB))
                
                heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
                heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
                maxHeight = max(int(heightA), int(heightB))
                
                dst = np.array([
                    [0, 0],
                    [maxWidth - 1, 0],
                    [maxWidth - 1, maxHeight - 1],
                    [0, maxHeight - 1]], dtype="float32")
                
                M = cv2.getPerspectiveTransform(rect, dst)
                warped = cv2.warpPerspective(img, M, (maxWidth, maxHeight))
                return warped
                
        return img # Fallback

    def preprocess(self, image_path: str):
        # Load image
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Não foi possível carregar a imagem.")
            
        # 1. Perspective Correction & Background Removal
        # Convert to HLS to isolate the "white" paper better against RGB backgrounds
        hls = cv2.cvtColor(img, cv2.COLOR_BGR2HLS)
        l_channel = hls[:, :, 1]
        
        # Adaptive thresholding on Luminance to find the paper (more robust parameters)
        paper_mask = cv2.adaptiveThreshold(l_channel, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 15) # Aumentar block size e C para maior adaptabilidade
        
        # 2. Warp Paper
        warped = self.find_paper_and_warp(img)
        if warped is None: warped = img
        
        # 3. Focus on dark strokes (the palos)
        gray = cv2.cvtColor(warped, cv2.COLOR_BGR2GRAY)
        
        # Balance lighting with CLAHE
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        gray_balanced = clahe.apply(gray)
        
        # Use a very sharp adaptive threshold for thin lines (ajustado para melhor isolamento)
        thresh = cv2.adaptiveThreshold(
            gray_balanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY_INV, 21, 8 # Aumentar block size e C para capturar traços mais finos e lidar com variações
        )
        
        # Filter out small salt-and-pepper noise com morphological operations mais sofisticadas
        kernel = np.ones((2,2), np.uint8)
        opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
        
        # Aplicar closing para preencher pequenos buracos nos traços
        kernel_close = np.ones((3,3), np.uint8)
        opening = cv2.morphologyEx(opening, cv2.MORPH_CLOSE, kernel_close, iterations=1)
        
        # Bridge vertical fragments (mais agressivo para lidar com ruído)
        v_kernel = np.array([[0, 1, 0], [0, 1, 0], [0, 1, 0]], dtype=np.uint8)
        opening = cv2.dilate(opening, v_kernel, iterations=2)
        
        return warped, gray, opening

    def detect_test_area(self, img):
        """
        Detecta a área útil (ROI) baseada na estrutura do formulário oficial.
        Implementa TOP_CUTOFF rigoroso e detecção de marcos estruturais.
        """
        height, width = img.shape
        separator_found = False
        
        # 1. Localização de Marcos Estruturais (Linhas Horizontais do Formulário)
        # O formulário oficial possui linhas que delimitam o cabeçalho e zona de treino.
        # Em scans reais, a linha separadora pode estar entre 20% e 50% da altura total.
        scan_start_y = int(height * 0.10)
        search_region_end = int(height * 0.60) 
        search_roi = img[scan_start_y:search_region_end, :]
        
        # Pré-processamento agressivo para encontrar linhas retas
        clahe = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(8,8))
        enhanced_roi = clahe.apply(search_roi)
        thresh = cv2.adaptiveThreshold(enhanced_roi, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                       cv2.THRESH_BINARY_INV, 21, 15)
        
        # Busca por linhas horizontais longas (mínimo 40% da largura do papel para ser mais inclusivo)
        # Reduzimos o threshold para 100 para capturar linhas mais finas em scans reais
        lines = cv2.HoughLinesP(thresh, 1, np.pi/180, threshold=100, 
                                minLineLength=width*0.4, maxLineGap=150)
        
        best_line_y = -1
        if lines is not None:
            horizontal_lines_y = []
            for line in lines:
                x1, y1, x2, y2 = line[0]
                # Filtro para linhas horizontais (inclinação < 3 graus para lidar com scans levemente tortos)
                angle = np.abs(np.arctan2(y2 - y1, x2 - x1) * 180 / np.pi)
                if angle < 3.0:
                    horizontal_lines_y.append((y1 + y2) // 2)
            
            if horizontal_lines_y:
                # Em scans reais, podem aparecer múltiplas linhas no cabeçalho (bordas de campos).
                # A linha separadora oficial é tipicamente a linha horizontal mais longa
                # que está situada abaixo do cabeçalho de identificação.
                horizontal_lines_y.sort(reverse=True)
                
                # Filtramos para pegar a linha que está mais próxima do meio da região de busca,
                # que geralmente é a divisória oficial.
                best_line_y = horizontal_lines_y[0] + scan_start_y
                separator_found = True

        # 2. TOP_CUTOFF_ADAPTATIVO: Densidade de traços verticais
        # Útil caso a linha separadora esteja falha ou apagada.
        v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 25))
        v_mask = cv2.morphologyEx(img, cv2.MORPH_OPEN, v_kernel)
        row_sums = np.sum(v_mask, axis=1)
        
        adaptive_y = -1
        # Busca por onde os traços verticais começam a aparecer de forma consistente
        threshold_density = width * 255 * 0.04 
        for y in range(int(height * 0.15), int(height * 0.50)):
            if row_sums[y] > threshold_density:
                if np.mean(row_sums[y:y+40]) > threshold_density:
                    adaptive_y = y
                    break
        
        # 3. TOP_CUTOFF_FIXO (Segurança absoluta de 20% baseada no modelo oficial)
        fixed_y = int(height * 0.20)
        
        # 4. DEFINIÇÃO DO LIMITE SUPERIOR (TOP_CUTOFF)
        # Priorizamos a linha do formulário, com fallback para densidade e valor fixo.
        # Em scans reais, a linha separadora é o marco definitivo.
        if separator_found:
            # A linha separadora é o limite superior absoluto.
            # Adicionamos um buffer de 10 pixels para garantir que a própria linha não seja contada como ruído.
            split_y = best_line_y + 10
        else:
            # Fallback para densidade ou valor fixo se a linha não for encontrada.
            split_y = max(fixed_y, adaptive_y - 10 if adaptive_y > 0 else 0)
            
        # Garantir que o split_y não seja irrealisticamente baixo
        split_y = max(split_y, fixed_y)
            
        # 5. ROI FINAL E CONFIANÇA
        side_margin = int(width * 0.04)
        footer_margin = int(height * 0.04)
        roi = [side_margin, split_y, width - 2*side_margin, height - split_y - footer_margin]
        
        # Cálculo de Confiança (ROI_GUARD)
        roi_confidence = 0.4 # Base
        if separator_found: roi_confidence += 0.4
        if adaptive_y > 0 and abs(adaptive_y - split_y) < 100: roi_confidence += 0.2
        
        # Penalidade se a área útil for muito pequena
        if roi[3] < height * 0.3: roi_confidence -= 0.3

        self.last_run_meta.update({
            "roi_source": "form_structure" if separator_found else "adaptive_density",
            "roi_confidence": round(max(0.0, min(1.0, roi_confidence)), 2),
            "separator_found": separator_found,
            "top_cutoff_applied": split_y,
            "roi_rect": roi
        })
        
        return roi

        return [0, split_y, width, roi_height], separator_found

    def detect_palos(self, processed_img, gray_img, roi=None, relaxed=False):
        """
        Identifies vertical strokes (palos) ONLY within ROI.
        Strictly discards anything outside.
        """
        height, width = processed_img.shape
        x_roi, y_roi, w_roi, h_roi = roi if roi else [0, 0, width, height]
        
        # Apply strict ROI mask
        mask = np.zeros_like(processed_img)
        mask[y_roi:y_roi+h_roi, x_roi:x_roi+w_roi] = 255
        roi_processed_working = cv2.bitwise_and(processed_img, mask)
        
        contours, _ = cv2.findContours(roi_processed_working, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        temp_palos = []
        temp_marks = []
        discarded_outside = 0
        discarded_reason = {}

        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            center_y = y + h/2
            center_x = x + w/2
            
            # STRICT VALIDATION: Is the center within the ROI?
            if not (y_roi <= center_y <= y_roi + h_roi and x_roi <= center_x <= x_roi + w_roi):
                discarded_outside += 1
                reason = "OUTSIDE_ROI_TOPZONE" if center_y < y_roi else "OUTSIDE_ROI_OTHER"
                discarded_reason[reason] = discarded_reason.get(reason, 0) + 1
                continue

            area = cv2.contourArea(cnt)
            # Filtro mais rigoroso para descartar ruido: minimo 15 pixels
            if area < 15: continue 
            
            aspect_ratio = h / float(w) if w > 0 else 0
            
            # Reject very wide shapes
            if w > (width * 0.20): continue
            
            # Identify Interval Marks
            if 0.05 < aspect_ratio < 0.3 and 15 < w < (width * 0.12) and h >= 4:
                # Marks must be well within the ROI height (not touching the split line)
                if (y_roi + h_roi * 0.05) < center_y < (y_roi + h_roi * 0.95):
                    temp_marks.append({
                        "id": f"mark_{len(temp_marks)+1}",
                        "center": [float(x + w/2), float(y + h/2)],
                        "bbox": [int(x), int(y), int(w), int(h)],
                        "type": "interval_mark"
                    })
                continue

            # Identify Palos
            min_aspect = 1.1 if relaxed else 1.8
            if min_aspect < aspect_ratio < 70.0 and (height * 0.005) < h < (height * 0.4):
                # Extra safety: discard if too close to the top of ROI (likely a fragment of header)
                if y < y_roi + (h_roi * 0.02):
                    discarded_outside += 1
                    discarded_reason["OUTSIDE_ROI_TOPZONE"] = discarded_reason.get("OUTSIDE_ROI_TOPZONE", 0) + 1
                    continue
                
                rect = cv2.minAreaRect(cnt)
                raw_angle = rect[2]
                rect_w, rect_h = rect[1]
                normalized_angle = (90 + raw_angle) if rect_w > rect_h else (90 - abs(raw_angle))
                
                arc_len = cv2.arcLength(cnt, False)
                dist_ends = np.sqrt(w**2 + h**2)
                tortuosity = (arc_len / (2 * dist_ends)) if dist_ends > 0 else 1.0
                
                # Hook detection
                hook_top = "none"
                hook_bottom = "none"
                palo_roi = gray_img[y:y+h, x:x+w]
                if h > 20 and palo_roi.size > 0:
                    top_part = palo_roi[:max(1, h//5), :]
                    bottom_part = palo_roi[-max(1, h//5):, :]
                    
                    def detect_hook_side(region, rw):
                        if region.size == 0: return "none"
                        M = cv2.moments((255 - region).astype(np.uint8))
                        if M["m00"] > 0:
                            local_cx = M["m10"] / M["m00"]
                            palo_center_x = rw / 2
                            thr = max(3.0, rw * 0.35)
                            if local_cx < palo_center_x - thr: return "left"
                            if local_cx > palo_center_x + thr: return "right"
                        return "none"
                    
                    hook_top = detect_hook_side(top_part, w)
                    hook_bottom = detect_hook_side(bottom_part, w)

                temp_palos.append({
                    "id": f"palo_{len(temp_palos)+1}",
                    "center": [float(x + w/2), float(y + h/2)],
                    "bbox": [int(x), int(y), int(w), int(h)],
                    "height": float(h),
                    "width": float(w),
                    "angle": float(normalized_angle),
                    "tortuosity": float(tortuosity),
                    "pressure": float(255 - np.mean(gray_img[y:y+h, x:x+w])),
                    "hooks": {"top": hook_top, "bottom": hook_bottom}
                })

        self.last_marks = temp_marks
        self.last_run_meta["total_detected_raw"] = len(temp_palos) + discarded_outside
        self.last_run_meta["total_kept_in_roi"] = len(temp_palos)
        self.last_run_meta["total_discarded_outside_roi"] = discarded_outside
        self.last_run_meta["discard_reasons"] = discarded_reason
        
        return temp_palos

    def cluster_lines(self, palos, img_height):
        if not palos: return []
        sorted_palos = sorted(palos, key=lambda p: p["center"][1])
        avg_h = sum(p["height"] for p in palos) / len(palos)
        y_tolerance = avg_h * 0.6
        
        lines = []
        current_line = [sorted_palos[0]]
        for p in sorted_palos[1:]:
            y_dist = abs(p["center"][1] - np.mean([x["center"][1] for x in current_line]))
            if y_dist < y_tolerance:
                current_line.append(p)
            else:
                current_line.sort(key=lambda x: x["center"][0])
                lines.append(current_line)
                current_line = [p]
        if current_line:
            current_line.sort(key=lambda x: x["center"][0])
            lines.append(current_line)
        return lines

    def segment_intervals(self, lines, total_intervals=5):
        if not lines: return [[] for _ in range(total_intervals)]
        palos_ordered = [p for line in lines for p in line]
        marks = getattr(self, 'last_marks', [])
        
        if not marks or len(marks) < 1:
            chunk_size = max(1, len(palos_ordered) // total_intervals)
            return [palos_ordered[i*chunk_size:(i+1)*chunk_size if i<4 else None] for i in range(total_intervals)]

        delimiters = sorted(marks[:4], key=lambda m: (m["center"][1], m["center"][0]))
        intervals = [[] for _ in range(total_intervals)]
        
        for palo in palos_ordered:
            p_x, p_y = palo["center"]
            interval_idx = 0
            for i, mark in enumerate(delimiters):
                m_x, m_y = mark["center"]
                line_tol = palo.get("height", 30) * 0.6
                if p_y < m_y - line_tol or (abs(p_y - m_y) <= line_tol and p_x < m_x):
                    interval_idx = i
                    break
                else:
                    interval_idx = i + 1
            intervals[min(interval_idx, total_intervals - 1)].append(palo)
        return intervals

    def calculate_metrics(self, intervals, mm_per_px=None, img_dims=None):
        """
        Calcula métricas oficiais conforme manual.
        Bloqueia resultados se a ROI for incerta (needs_review).
        """
        # Recupera metadados da ROI
        roi_confidence = self.last_run_meta.get("roi_confidence", 0)
        roi_source = self.last_run_meta.get("roi_source", "unknown")
        
        # Validação de integridade dos intervalos
        valid_intervals = len(intervals) == 5 and all(isinstance(i, list) for i in intervals)
        
        # ROI_GUARD: Se confiança < 0.7 ou intervalos inválidos -> needs_review
        needs_review = roi_confidence < 0.7 or not valid_intervals
        
        if needs_review:
            reason = "LOW_CONFIDENCE_ROI" if roi_confidence < 0.7 else "SEGMENTATION_FAILURE"
            return {
                "status": "needs_review",
                "total": "N/A",
                "reason_code": reason,
                "confidence_score": int(roi_confidence * 100),
                "roi_source": roi_source,
                "total_detected_raw": self.last_run_meta.get("total_detected_raw", 0),
                "total_discarded_outside_roi": self.last_run_meta.get("total_discarded_outside_roi", 0),
                "discard_reasons": self.last_run_meta.get("discard_reasons", {}),
                "intervals": ["N/A"] * 5,
                "nor": "N/A",
                "mean": "N/A",
                "cv": "N/A",
                "trend": "N/A"
            }

        all_palos = [p for interval in intervals for p in interval]
        counts = [len(inter) for inter in intervals]
        total = sum(counts)
        
        # NOR conforme manual: (Soma das diferenças absolutas * 100) / Total
        diffs = [abs(counts[i+1] - counts[i]) for i in range(len(counts)-1)]
        nor = (sum(diffs) * 100 / total) if total > 0 else 0
        
        mean_prod = np.mean(counts)
        cv = (np.std(counts) / mean_prod * 100) if mean_prod > 0 else 0
        
        # Tendência qualitativa
        if counts[-1] > counts[0] * 1.1: trend = "Ascendente"
        elif counts[-1] < counts[0] * 0.9: trend = "Descendente"
        else: trend = "Estável"

        return {
            "status": "success",
            "total": total,
            "intervals": counts,
            "nor": round(nor, 2),
            "cv": round(cv, 2),
            "mean": round(mean_prod, 2),
            "trend": trend,
            "confidence_score": int(roi_confidence * 100),
            "roi_source": roi_source,
            "total_detected_raw": self.last_run_meta.get("total_detected_raw"),
            "total_kept_in_roi": self.last_run_meta.get("total_kept_in_roi"),
            "total_discarded_outside_roi": self.last_run_meta.get("total_discarded_outside_roi"),
            "discard_reasons": self.last_run_meta.get("discard_reasons")
        }

        counts = [len(inter) for inter in intervals]
        mean_productivity = np.mean(counts) if counts else 0
        std_dev = np.std(counts) if counts else 0
        cv = (std_dev / mean_productivity * 100) if mean_productivity > 0 else 0
        nor = (max(counts) - min(counts)) if counts else 0
        
        # Trend
        if len(counts) >= 2:
            trend_val = "Ascendente" if counts[-1] > counts[0] else "Descendente"
            if abs(counts[-1] - counts[0]) < (total * 0.05): trend_val = "Estável"
        else:
            trend_val = "N/A"

        avg_pressure = np.mean([p["pressure"] for p in all_palos]) if all_palos else 0
        avg_slant = np.mean([p["angle"] for p in all_palos]) if all_palos else 0
        
        # Physical metrics
        avg_height_mm = np.mean([p["height"] for p in all_palos]) * mm_per_px if mm_per_px and all_palos else None
        
        # Track metadata for output
        meta = self.last_run_meta
        
        return {
            "total": total,
            "intervals": counts,
            "nor": round(nor, 2),
            "cv": round(cv, 2),
            "mean": round(mean_productivity, 2),
            "trend": trend_val,
            "avg_pressure": round(avg_pressure, 2),
            "avg_height_mm": round(avg_height_mm, 2) if avg_height_mm else "N/A",
            "slant": round(avg_slant, 1),
            "confidence_score": int(roi_confidence * 100),
            "roi_source": meta.get("roi_source"),
            "roi_confidence": meta.get("roi_confidence"),
            "total_detected_raw": meta.get("total_detected_raw"),
            "total_kept_in_roi": meta.get("total_kept_in_roi"),
            "total_discarded_outside_roi": meta.get("total_discarded_outside_roi"),
            "discard_reasons": meta.get("discard_reasons"),
            "regional_confidence": {
                "needs_review": needs_review
            }
        }
