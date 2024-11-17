import pandas as pd
import numpy as np
from typing import Dict, List, Optional

class AnalysisValidator:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.singapore_data = df[df['Country'] == 'Singapore']
        self.asia_data = df[df['region'] == 'Asia']
        
        # Define expected output schemas
        self.expected_schemas = {
            'music_recommendations': {
                'required_keys': ['optimal_features', 'genre_recommendations', 'feature_targets'],
                'types': {'optimal_features': dict, 'genre_recommendations': dict, 'feature_targets': dict}
            },
            'demographic_recommendations': {
                'required_keys': ['age', 'employment', 'education'],
                'types': {'age': dict, 'employment': dict, 'education': dict}
            },
            'implementation_strategy': {
                'required_keys': ['phasing', 'stakeholders', 'monitoring'],
                'types': {'phasing': list, 'stakeholders': list, 'monitoring': dict}
            }
        }

    def validate_output_structure(self, output: Dict, schema_name: str) -> bool:
        """Validate output structure against expected schema"""
        schema = self.expected_schemas.get(schema_name)
        if not schema:
            raise ValueError(f"Unknown schema: {schema_name}")
            
        # Check required keys
        for key in schema['required_keys']:
            if key not in output:
                return False
            if not isinstance(output[key], schema['types'][key]):
                return False
        return True

    def validate_data_consistency(self) -> Dict[str, bool]:
        """Validate data consistency across analysis components"""
        return {
            'singapore_data_complete': self._check_singapore_data_completeness(),
            'music_features_complete': self._check_music_features_completeness(),
            'demographic_data_valid': self._check_demographic_data_validity()
        }

    def _check_singapore_data_completeness(self) -> bool:
        """Check if Singapore data has all required fields"""
        required_fields = [
            'Average MHQ Score', 'Life Ladder', 'tempo', 'energy', 
            'valence', 'danceability'
        ]
        return all(field in self.singapore_data.columns for field in required_fields)

    def _check_music_features_completeness(self) -> bool:
        """Validate music features data"""
        music_features = [
            'tempo', 'energy', 'valence', 'danceability', 'loudness',
            'speechiness', 'acousticness', 'instrumentalness', 'liveness'
        ]
        return all(feature in self.df.columns for feature in music_features)

    def _check_demographic_data_validity(self) -> bool:
        """Validate demographic data structure"""
        demographic_categories = {
            'age': ['18-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75+'],
            'employment': ['Employed / Self employed', 'Unemployed', 'Homemaker'],
            'education': ['Primary Education', 'Bachelor\'s Degree', 'Master\'s Degree']
        }
        return all(all(cat in self.df.columns for cat in cats) 
                  for cats in demographic_categories.values()) 