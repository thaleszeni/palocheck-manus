import pytest
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.vision import PaloDetector

def test_metrics_calculation_robustness():
    detector = PaloDetector()
    
    # Case 1: Empty intervals (Should not crash, return low confidence)
    intervals_empty = [[], [], [], [], []]
    metrics_empty = detector.calculate_metrics(intervals_empty)
    assert metrics_empty["confidence_score"] == 0
    assert metrics_empty["total"] == 0
    
    # Case 2: Uneven intervals (Should not crash, return 0 confidence due to segmentation mismatch if < 5)
    intervals_uneven = [[{'pressure': 100, 'height': 50, 'center': [10, 10]}] for _ in range(3)] 
    metrics_uneven = detector.calculate_metrics(intervals_uneven)
    assert metrics_uneven["confidence_score"] == 0
    assert "irregular" in str(metrics_uneven["confidence_reasons"])

    # Case 3: Valid intervals (Should return high confidence)
    valid_palo = {'pressure': 100, 'height': 50, 'center': [10, 10]}
    intervals_valid = [[valid_palo] * 10 for _ in range(5)]
    metrics_valid = detector.calculate_metrics(intervals_valid)
    assert metrics_valid["confidence_score"] > 50
    assert metrics_valid["total"] == 50

if __name__ == "__main__":
    test_metrics_calculation_robustness()
    print("All tests passed!")
