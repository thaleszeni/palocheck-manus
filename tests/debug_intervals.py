import sys
import os
sys.path.append("/Users/thalescassianozeni/.gemini/antigravity/scratch/palocheck/backend")
from vision import PaloDetector

def debug_intervals():
    img_path = "/Users/thalescassianozeni/.gemini/antigravity/scratch/palocheck/backend/storage/dataset/case_24_raw.png"
    detector = PaloDetector()
    warped, gray, processed = detector.preprocess(img_path)
    roi, _ = detector.detect_test_area(processed)
    palos = detector.detect_palos(processed, gray, roi=roi)
    lines = detector.cluster_lines(palos, gray.shape[0])
    
    marks = detector.last_marks
    print(f"=== MARKS (4 expected) ===")
    for m in sorted(marks, key=lambda x: (x["center"][1], x["center"][0])):
        print(f"  Mark at Y={m['center'][1]:.0f}, X={m['center'][0]:.0f}")
    
    print(f"\n=== LINES ({len(lines)}) ===")
    for i, line in enumerate(lines):
        y_range = f"Y: {min(p['center'][1] for p in line):.0f} - {max(p['center'][1] for p in line):.0f}"
        x_range = f"X: {min(p['center'][0] for p in line):.0f} - {max(p['center'][0] for p in line):.0f}"
        print(f"  Line {i+1}: {len(line)} palos, {y_range}, {x_range}")
    
    intervals = detector.segment_intervals(lines)
    print(f"\n=== INTERVALS ({len(intervals)}) ===")
    for i, iv in enumerate(intervals):
        if iv:
            y_range = f"Y: {min(p['center'][1] for p in iv):.0f} - {max(p['center'][1] for p in iv):.0f}"
            print(f"  Interval {i+1}: {len(iv)} palos, {y_range}")
        else:
            print(f"  Interval {i+1}: 0 palos")

if __name__ == "__main__":
    debug_intervals()
