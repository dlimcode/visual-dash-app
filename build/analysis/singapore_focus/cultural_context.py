import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List, Tuple

class CulturalContextAnalyzer:
    def __init__(self, df):
        self.df = df
        self.singapore_data = df[df['Country'] == 'Singapore']
        self.asia_data = df[df['region'] == 'Asia']
        
        # Cultural indicators from World Happiness Report
        self.cultural_indicators = [
            'Social support', 'Freedom to make life choices',
            'Generosity', 'Perceptions of corruption',
            'Positive affect', 'Negative affect'
        ]
        
        # Music features for cultural analysis
        self.music_features = [
            'tempo', 'energy', 'valence', 'danceability',
            'loudness', 'speechiness', 'acousticness',
            'instrumentalness', 'liveness', 'track_genre'
        ]
        
        # Well-being categories
        self.wellbeing_cats = [
            '% Distressed', '% Struggling', '% Enduring',
            '% Managing', '% Succeeding', '% Thriving'
        ]

    def analyze_cultural_influences(self) -> Dict:
        """Analyze cultural influences on music and well-being"""
        return {
            'cultural_metrics': self._get_cultural_metrics(),
            'music_cultural_patterns': self._analyze_music_cultural_patterns(),
            'wellbeing_cultural_context': self._analyze_wellbeing_cultural_context()
        }

    def _get_cultural_metrics(self) -> Dict:
        """Compare Singapore's cultural indicators with regional/global"""
        metrics = {}
        for indicator in self.cultural_indicators:
            if pd.notna(self.singapore_data[indicator].iloc[0]):
                metrics[indicator] = {
                    'singapore': self.singapore_data[indicator].iloc[0],
                    'asia_mean': self.asia_data[indicator].mean(),
                    'global_mean': self.df[indicator].mean(),
                    'percentile_asia': stats.percentileofscore(
                        self.asia_data[indicator].dropna(), 
                        self.singapore_data[indicator].iloc[0]
                    ),
                    'percentile_global': stats.percentileofscore(
                        self.df[indicator].dropna(), 
                        self.singapore_data[indicator].iloc[0]
                    )
                }
        return metrics

    def _analyze_music_cultural_patterns(self) -> Dict:
        """Analyze cultural influences on music preferences"""
        patterns = {
            'genre_context': {
                'singapore_genre': self.singapore_data['track_genre'].iloc[0],
                'asia_popular': self.asia_data['track_genre'].mode().iloc[0],
                'global_popular': self.df['track_genre'].mode().iloc[0]
            },
            'feature_cultural_alignment': {}
        }
        
        for feature in self.music_features[:-1]:  # Exclude track_genre
            patterns['feature_cultural_alignment'][feature] = {
                'singapore_value': self.singapore_data[feature].iloc[0],
                'asia_similarity': 1 - abs(
                    self.singapore_data[feature].iloc[0] - 
                    self.asia_data[feature].mean()
                ) / self.asia_data[feature].std(),
                'global_similarity': 1 - abs(
                    self.singapore_data[feature].iloc[0] - 
                    self.df[feature].mean()
                ) / self.df[feature].std()
            }
        
        return patterns

    def _analyze_wellbeing_cultural_context(self) -> Dict:
        """Analyze cultural context of well-being patterns"""
        context = {
            'category_distributions': {},
            'cultural_correlations': {}
        }
        
        # Analyze well-being category distributions
        for category in self.wellbeing_cats:
            context['category_distributions'][category] = {
                'singapore': self.singapore_data[category].iloc[0],
                'asia_mean': self.asia_data[category].mean(),
                'global_mean': self.df[category].mean()
            }
        
        # Analyze correlations with cultural indicators
        for indicator in self.cultural_indicators:
            if pd.notna(self.singapore_data[indicator].iloc[0]):
                context['cultural_correlations'][indicator] = {
                    'asia': self.asia_data[indicator].corr(
                        self.asia_data['Average MHQ Score']
                    ),
                    'global': self.df[indicator].corr(
                        self.df['Average MHQ Score']
                    )
                }
        
        return context 