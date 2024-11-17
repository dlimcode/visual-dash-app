import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List

class MusicPatternAnalyzer:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.music_features = [
            'tempo', 'energy', 'valence', 'danceability', 
            'loudness', 'speechiness', 'acousticness', 
            'instrumentalness', 'liveness'
        ]
    
    def get_feature_distributions(self) -> Dict:
        """Analyze distributions of music features"""
        distributions = {}
        for feature in self.music_features:
            if feature in self.df.columns:
                distributions[str(feature)] = {
                    'mean': float(self.df[feature].mean()),
                    'std': float(self.df[feature].std()),
                    'median': float(self.df[feature].median()),
                    'skew': float(self.df[feature].skew()),
                    'kurtosis': float(self.df[feature].kurtosis())
                }
        return distributions
    
    def analyze_regional_preferences(self) -> Dict:
        """Analyze music preferences by region"""
        # Calculate regional means and std for each feature
        regional_stats = {}
        for region in self.df['region'].unique():
            region_data = self.df[self.df['region'] == region]
            regional_stats[str(region)] = {}
            
            for feature in self.music_features:
                if feature in self.df.columns:
                    regional_stats[str(region)][str(feature)] = {
                        'mean': float(region_data[feature].mean()),
                        'std': float(region_data[feature].std())
                    }

        # Calculate genre distribution
        genre_dist = (self.df.groupby(['region', 'track_genre'])
                     .size()
                     .unstack(fill_value=0)
                     .apply(lambda x: x / x.sum(), axis=1)  # Convert to percentages
                     .to_dict('index'))
        
        # Convert genre distribution to proper format
        formatted_genre_dist = {
            str(region): {
                str(genre): float(value) 
                for genre, value in genres.items()
            }
            for region, genres in genre_dist.items()
        }

        return {
            'features_by_region': regional_stats,
            'genre_distribution': formatted_genre_dist
        }
    
    def get_singapore_profile(self) -> Dict:
        """Get Singapore's music profile"""
        singapore = self.df[self.df['Country'] == 'Singapore']
        if len(singapore) == 0:
            return {
                'error': 'No data available for Singapore'
            }

        profile = {
            'features': {},
            'genre': str(singapore['track_genre'].iloc[0]) if 'track_genre' in singapore.columns else 'Unknown'
        }

        for feature in self.music_features:
            if feature in singapore.columns:
                profile['features'][str(feature)] = {
                    'value': float(singapore[feature].iloc[0]),
                    'percentile': float(stats.percentileofscore(
                        self.df[feature].dropna(), 
                        singapore[feature].iloc[0]
                    ))
                }

        return profile
    
    def find_similar_countries(self, metric='euclidean', n_neighbors=5):
        """Find countries with similar music profiles"""
        features_normalized = (self.df[self.music_features] - self.df[self.music_features].mean()) / \
                            self.df[self.music_features].std()
        
        singapore_idx = self.df[self.df['Country'] == 'Singapore'].index[0]
        singapore_profile = features_normalized.loc[singapore_idx]
        
        distances = {}
        for idx, row in features_normalized.iterrows():
            if idx != singapore_idx:
                if metric == 'euclidean':
                    dist = np.sqrt(((row - singapore_profile) ** 2).sum())
                elif metric == 'cosine':
                    dist = 1 - np.dot(row, singapore_profile) / \
                          (np.linalg.norm(row) * np.linalg.norm(singapore_profile))
                distances[self.df.loc[idx, 'Country']] = dist
        
        return dict(sorted(distances.items(), key=lambda x: x[1])[:n_neighbors]) 