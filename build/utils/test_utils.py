import pandas as pd
import numpy as np

def load_test_data():
    """Load the actual data for testing"""
    try:
        return pd.read_csv('data/combined_data.csv')
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

def run_test(test_func):
    """Decorator for running tests"""
    def wrapper():
        df = load_test_data()
        if df is not None:
            try:
                result = test_func(df)
                print(f"✓ {test_func.__name__} passed")
                return result
            except Exception as e:
                print(f"✗ {test_func.__name__} failed: {e}")
                return None
    return wrapper 