import sys
import os
import cv2
import numpy as np
sys.path.append("/Users/thalescassianozeni/.gemini/antigravity/scratch/palocheck/backend")
from vision import PaloDetector

def diagnose_line_3():
    img_path = "/Users/thalescassianozeni/.gemini/antigravity/scratch/palocheck/backend/storage/dataset/case_24_raw.png"
    detector = PaloDetector()
    _, gray, processed = detector.preprocess(img_path)
    roi, _ = detector.detect_test_area(processed)
    palos = detector.detect_palos(processed, gray, roi=roi)
    lines = detector.cluster_lines(palos, gray.shape[0])
    
    if len(lines) < 3:
        print("Less than 3 lines detected.")
        return
        
    line_3 = lines[2]
    print(f"Line 3 has {len(line_3)} palos.")
    
    y_centers = [p["center"][1] for p in line_3]
    print(f"Y Center Range: {min(y_centers):.2f} - {max(y_centers):.2f}")
    
    # Try to sub-cluster Line 3
    y_centers_arr = np.array(y_centers).reshape(-1, 1)
    from sklearn.cluster import KMeans
    # If we suspect it's two lines, try K=2
    kmeans = KMeans(n_clusters=2, n_init=10).fit(y_centers_arr)
    c1 = y_centers_arr[kmeans.labels_ == 0]
    c2 = y_centers_arr[kmeans.labels_ == 1]
    
    print(f"Sub-cluster 1: {len(c1)} palos, Avg Y: {np.mean(c1):.2f}")
    print(f"Sub-cluster 2: {len(c2)} palos, Avg Y: {np.mean(c2):.2f}")
    print(f"Difference in Avg Y: {abs(np.mean(c1) - np.mean(c2)):.2f}")

if __name__ == "__main__":
    diagnose_line_3()
