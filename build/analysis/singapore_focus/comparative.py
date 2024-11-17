import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List, Tuple

class SingaporeComparative:
    def __init__(self, df):
        self.df = df
        self.singapore_data = df[df['Country'] == 'Singapore']
        self.asia_data = df[df['region'] == 'Asia']
        
        self.demographic_cols = {
            'age': ['18-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75+'],
            'employment': ['Employed / Self employed', 'Unemployed', 'Homemaker', 
                         'Studying', 'Retired', 'Not able to work'],
            'education': ['Primary Education', 'Some High School', 'High School',
                        'Associate\'s Degree', 'Vocational certification', 
                        'Bachelor\'s Degree', 'Master\'s Degree', 'PhD or Doctorate']
        }
        
        self.wellbeing_cols = {
            'categories': ['% Distressed', '% Struggling', '% Enduring', 
                         '% Managing', '% Succeeding', '% Thriving'],
            'mhq_scores': ['Average MHQ Score', 'Average Cognition Score',
                         'Average Adaptability & Resilence Score', 
                         'Average Drive & Motivation Score',
                         'Average Mood & Outlook Score', 
                         'Average Social Self Score',
                         'Average Mind-Body Connection Score']
        }
        
        self.music_features = ['tempo', 'energy', 'valence', 'danceability', 
                             'loudness', 'speechiness', 'acousticness', 
                             'instrumentalness', 'liveness']

    def analyze_demographic_position(self) -> Dict:
        """Compare Singapore's demographic patterns globally and regionally"""
        results = {}
        for category, cols in self.demographic_cols.items():
            results[category] = {
                'global_percentiles': self._calculate_percentiles(cols, self.df),
                'asia_percentiles': self._calculate_percentiles(cols, self.asia_data),
                'distribution': self._get_distribution_stats(cols)
            }
        return results

    def analyze_wellbeing_position(self) -> Dict:
        """Compare Singapore's well-being metrics"""
        results = {
            'categories': self._analyze_wellbeing_categories(),
            'mhq_scores': self._analyze_mhq_scores(),
            'regional_context': self._get_regional_context()
        }
        return results

    def analyze_music_characteristics(self) -> Dict:
        """Compare Singapore's music consumption patterns"""
        return {
            'feature_percentiles': self._calculate_percentiles(
                self.music_features, self.df),
            'asia_comparison': self._compare_with_asia(),
            'genre_analysis': self._analyze_genre_patterns()
        }

    def _calculate_percentiles(self, cols: List[str], 
                             comparison_df: pd.DataFrame) -> Dict:
        """Calculate percentile ranks for Singapore"""
        percentiles = {}
        for col in cols:
            sg_value = self.singapore_data[col].iloc[0]
            percentiles[col] = stats.percentileofscore(comparison_df[col], sg_value)
        return percentiles

    def _get_distribution_stats(self, cols: List[str]) -> Dict:
        """Get distribution statistics for comparison"""
        stats_dict = {}
        for col in cols:
            stats_dict[col] = {
                'singapore': self.singapore_data[col].iloc[0],
                'asia_mean': self.asia_data[col].mean(),
                'asia_std': self.asia_data[col].std(),
                'global_mean': self.df[col].mean(),
                'global_std': self.df[col].std()
            }
        return stats_dict

    def _analyze_wellbeing_categories(self) -> Dict:
        """Analyze well-being category distributions"""
        categories = self.wellbeing_cols['categories']
        return {
            'distributions': self._get_distribution_stats(categories),
            'percentiles': {
                'global': self._calculate_percentiles(categories, self.df),
                'asia': self._calculate_percentiles(categories, self.asia_data)
            }
        }

    def _analyze_mhq_scores(self) -> Dict:
        """Analyze MHQ score patterns"""
        scores = self.wellbeing_cols['mhq_scores']
        return {
            'scores': self._get_distribution_stats(scores),
            'percentiles': {
                'global': self._calculate_percentiles(scores, self.df),
                'asia': self._calculate_percentiles(scores, self.asia_data)
            }
        }

    def _compare_with_asia(self) -> Dict:
        """Compare music features with Asian countries"""
        return {
            'features': self._get_distribution_stats(self.music_features),
            'correlations': {
                feature: np.corrcoef(
                    self.asia_data[feature], 
                    self.asia_data['Average MHQ Score']
                )[0,1] for feature in self.music_features
            }
        }

    def _analyze_genre_patterns(self) -> Dict:
        """Analyze genre preferences and patterns"""
        return {
            'singapore_genre': self.singapore_data['track_genre'].iloc[0],
            'asia_genres': self.asia_data['track_genre'].value_counts().to_dict(),
            'global_comparison': self.df['track_genre'].value_counts().to_dict()
        }

    def _get_regional_context(self) -> Dict:
        """Get broader regional context for well-being metrics"""
        return {
            'asia_profile': {
                score: {
                    'mean': self.asia_data[score].mean(),
                    'std': self.asia_data[score].std(),
                    'singapore_zscore': (
                        self.singapore_data[score].iloc[0] - 
                        self.asia_data[score].mean()
                    ) / self.asia_data[score].std()
                } for score in self.wellbeing_cols['mhq_scores']
            }
        } 