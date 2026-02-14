import sys
import os
import json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.vision import PaloDetector

def validate_pipeline():
    detector = PaloDetector()
    
    print("--- CENÁRIO 1: SEGMENTAÇÃO BEM SUCEDIDA ---")
    # Simula 5 intervalos com 50 palos cada (perfeito)
    # Mocking 'palo' objects: just need 'pressure', 'height', 'center', 'bbox'
    valid_palo = {'pressure': 100, 'height': 50, 'center': [10, 10], 'bbox': [0,0,10,10]}
    intervals_success = [[valid_palo] * 50 for _ in range(5)]
    
    metrics_success = detector.calculate_metrics(intervals_success)
    print(json.dumps(metrics_success, indent=2))
    
    print("\n--- CENÁRIO 2: FALHA NA SEGMENTAÇÃO (NEEDS REVIEW) ---")
    # Simula 3 intervalos (o algoritmo falhou em achar 5)
    intervals_fail = [[valid_palo] * 50 for _ in range(3)]
    
    metrics_fail = detector.calculate_metrics(intervals_fail)
    print(json.dumps(metrics_fail, indent=2))

if __name__ == "__main__":
    validate_pipeline()
