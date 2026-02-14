import sys
import os
sys.path.append("/Users/thalescassianozeni/.gemini/antigravity/scratch/palocheck/backend")
from vision import PaloDetector

def test_intervals():
    img_path = "/Users/thalescassianozeni/.gemini/antigravity/scratch/palocheck/backend/storage/dataset/case_24_raw.png"
    detector = PaloDetector()
    warped, gray, processed = detector.preprocess(img_path)
    roi, _ = detector.detect_test_area(processed)
    palos = detector.detect_palos(processed, gray, roi=roi)
    lines = detector.cluster_lines(palos, gray.shape[0])
    intervals = detector.segment_intervals(lines)
    
    print(f"Total palos: {len(palos)}")
    print(f"Marks detected: {len(detector.last_marks)}")
    print(f"Lines detected: {len(lines)}")
    print(f"Intervals: {len(intervals)}")
    
    for i, interval in enumerate(intervals):
        print(f"  Interval {i+1}: {len(interval)} palos")
    
    total_from_intervals = sum(len(iv) for iv in intervals)
    print(f"\nTotal from intervals: {total_from_intervals}")
    print(f"Match: {total_from_intervals == len(palos)}")

if __name__ == "__main__":
    test_intervals()
