import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List, Tuple

class MusicHappinessAnalyzer:
    def __init__(self, df):
        self.df = df
        self.music_features = [
            'tempo', 'energy', 'valence', 'danceability', 
            'loudness', 'speechiness', 'acousticness', 
            'instrumentalness', 'liveness'
        ]
        self.happiness_metrics = [
            'Life Ladder', 'Social support', 'Healthy life expectancy at birth',
            'Freedom to make life choices', 'Generosity', 'Positive affect',
            'Negative affect'
        ]

    def analyze_global_correlations(self) -> Dict:
        """Analyze global correlations between music features and happiness metrics"""
        correlations = {}
        for metric in self.happiness_metrics:
            if metric in self.df.columns:
                correlations[str(metric)] = {
                    str(feature): float(self.df[feature].corr(self.df[metric]))
                    for feature in self.music_features
                    if feature in self.df.columns
                }
        return correlations

    def analyze_regional_patterns(self) -> Dict:
        """Analyze regional patterns in music-happiness relationships"""
        regional_patterns = {}
        for region in self.df['region'].unique():
            region_data = self.df[self.df['region'] == region]
            regional_patterns[str(region)] = {
                'correlations': self._get_correlations(region_data),
                'happiness_profile': self._get_happiness_profile(region_data)
            }
        return regional_patterns

    def _get_correlations(self, data: pd.DataFrame) -> Dict:
        """Calculate correlations for a specific dataset"""
        correlations = {}
        for metric in self.happiness_metrics:
            if metric in data.columns:
                correlations[str(metric)] = {
                    str(feature): float(data[feature].corr(data[metric]))
                    for feature in self.music_features
                    if feature in data.columns
                }
        return correlations

    def _get_happiness_profile(self, data: pd.DataFrame) -> Dict:
        """Get happiness profile for a specific dataset"""
        return {
            str(metric): {
                'mean': float(data[metric].mean()),
                'std': float(data[metric].std()),
                'median': float(data[metric].median())
            } for metric in self.happiness_metrics 
            if metric in data.columns
        } 