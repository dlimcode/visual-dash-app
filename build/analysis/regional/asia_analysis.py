import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List, Tuple

class AsiaAnalyzer:
    def __init__(self, df):
        self.df = df
        self.asia_data = df[df['region'] == 'Asia']
        self.asian_countries = self.asia_data['Country'].unique()
        
        # Core metrics
        self.wellbeing_metrics = [
            'Average MHQ Score', 'Average Cognition Score',
            'Average Adaptability & Resilence Score',
            'Average Drive & Motivation Score',
            'Average Mood & Outlook Score',
            'Average Social Self Score',
            'Average Mind-Body Connection Score'
        ]
        
        self.music_features = [
            'tempo', 'energy', 'valence', 'danceability',
            'loudness', 'speechiness', 'acousticness',
            'instrumentalness', 'liveness'
        ]

    def analyze_asian_patterns(self) -> Dict:
        """Analyze patterns in Asian countries"""
        return {
            'music_patterns': self._analyze_music_features(),
            'wellbeing_landscape': self._analyze_wellbeing(),
            'demographics': self._analyze_demographics(),
            'cultural_factors': self._analyze_cultural_factors()
        }

    def _analyze_music_features(self) -> Dict:
        """Analyze music features for Asian countries"""
        music_analysis = {
            'genre_distribution': {
                str(genre): int(count)
                for genre, count in self.asia_data['track_genre'].value_counts().items()
            },
            'feature_stats': {}
        }
        
        # Analyze all music features
        for feature in self.music_features:
            if feature in self.asia_data.columns:
                music_analysis['feature_stats'][str(feature)] = {
                    'mean': float(self.asia_data[feature].mean()),
                    'std': float(self.asia_data[feature].std()),
                    'by_country': {
                        str(country): float(mean)
                        for country, mean in self.asia_data.groupby('Country')[feature].mean().items()
                    }
                }

        return music_analysis

    def _analyze_wellbeing(self) -> Dict:
        """Analyze wellbeing metrics for Asian countries"""
        wellbeing = {
            'mhq_dimensions': {},
            'happiness_metrics': {}
        }
        
        # MHQ dimensions analysis
        for dimension in self.wellbeing_metrics:
            if dimension in self.asia_data.columns:
                wellbeing['mhq_dimensions'][str(dimension)] = {
                    'mean': float(self.asia_data[dimension].mean()),
                    'std': float(self.asia_data[dimension].std()),
                    'by_country': {
                        str(country): float(mean)
                        for country, mean in self.asia_data.groupby('Country')[dimension].mean().items()
                    }
                }

        # Happiness metrics analysis
        happiness_metrics = ['Life Ladder', 'Social support', 'Positive affect', 'Negative affect']
        for metric in happiness_metrics:
            if metric in self.asia_data.columns:
                wellbeing['happiness_metrics'][str(metric)] = {
                    'mean': float(self.asia_data[metric].mean()),
                    'std': float(self.asia_data[metric].std()),
                    'by_country': {
                        str(country): float(mean)
                        for country, mean in self.asia_data.groupby('Country')[metric].mean().items()
                    }
                }

        return wellbeing

    def _analyze_demographics(self) -> Dict:
        """Analyze demographic patterns in Asia"""
        demographics = {
            'age_groups': {},
            'education': {},
            'employment': {}
        }
        
        # Age groups analysis
        age_groups = ['18-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75+']
        for age in age_groups:
            if age in self.asia_data.columns:
                demographics['age_groups'][str(age)] = {
                    'mean': float(self.asia_data[age].mean()),
                    'by_country': {
                        str(country): float(mean)
                        for country, mean in self.asia_data.groupby('Country')[age].mean().items()
                    }
                }

        # Education analysis
        education_levels = [
            'Primary Education', 'Some High School', 'High School',
            "Associate's Degree", 'Vocational certification',
            "Bachelor's Degree", "Master's Degree", 'PhD or Doctorate'
        ]
        for edu in education_levels:
            if edu in self.asia_data.columns:
                demographics['education'][str(edu)] = {
                    'mean': float(self.asia_data[edu].mean()),
                    'by_country': {
                        str(country): float(mean)
                        for country, mean in self.asia_data.groupby('Country')[edu].mean().items()
                    }
                }

        return demographics

    def _analyze_cultural_factors(self) -> Dict:
        """Analyze cultural factors in Asia"""
        return {
            'music_preferences': {
                'dominant_genre': str(self.asia_data['track_genre'].mode().iloc[0]),
                'genre_distribution': {
                    str(genre): int(count)
                    for genre, count in self.asia_data['track_genre'].value_counts().items()
                }
            },
            'wellbeing_profile': {
                'top_dimension': str(max(
                    self.wellbeing_metrics,
                    key=lambda x: self.asia_data[x].mean() if x in self.asia_data.columns else -float('inf')
                )),
                'dimension_ranks': {
                    str(metric): int(rank + 1)
                    for rank, metric in enumerate(sorted(
                        [m for m in self.wellbeing_metrics if m in self.asia_data.columns],
                        key=lambda x: self.asia_data[x].mean(),
                        reverse=True
                    ))
                }
            }
        }