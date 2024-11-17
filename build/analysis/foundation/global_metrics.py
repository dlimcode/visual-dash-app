import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List

class GlobalMetricsAnalyzer:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.music_features = [
            'tempo', 'energy', 'valence', 'danceability', 
            'loudness', 'speechiness', 'acousticness', 
            'instrumentalness', 'liveness'
        ]
        self.wellbeing_metrics = [
            'Life Ladder', 'Average MHQ Score'
        ] + [col for col in df.columns if 'Average' in col and 'Score' in col]

    def get_regional_summary(self) -> Dict:
        """Compute regional summaries for key metrics"""
        try:
            # Music features by region
            music_summary = {}
            for region in self.df['region'].unique():
                region_data = self.df[self.df['region'] == region]
                music_summary[str(region)] = {
                    str(feature): {
                        'mean': float(region_data[feature].mean()),
                        'std': float(region_data[feature].std())
                    }
                    for feature in self.music_features
                    if feature in self.df.columns
                }

            # Wellbeing metrics by region
            wellbeing_summary = {}
            for region in self.df['region'].unique():
                region_data = self.df[self.df['region'] == region]
                wellbeing_summary[str(region)] = {
                    str(metric): {
                        'mean': float(region_data[metric].mean()),
                        'std': float(region_data[metric].std())
                    }
                    for metric in self.wellbeing_metrics
                    if metric in self.df.columns
                }

            return {
                'music': music_summary,
                'wellbeing': wellbeing_summary
            }
        except Exception as e:
            return {'error': str(e)}

    def analyze_singapore_position(self) -> Dict:
        """Analyze Singapore's position relative to global distributions"""
        try:
            singapore = self.df[self.df['Country'] == 'Singapore']
            if len(singapore) == 0:
                return {'error': 'No data available for Singapore'}

            music_position = {}
            for feature in self.music_features:
                if feature in singapore.columns:
                    music_position[str(feature)] = {
                        'value': float(singapore[feature].iloc[0]),
                        'global_mean': float(self.df[feature].mean()),
                        'global_std': float(self.df[feature].std()),
                        'percentile': float(stats.percentileofscore(
                            self.df[feature].dropna(), 
                            singapore[feature].iloc[0]
                        ))
                    }

            wellbeing_position = {}
            for metric in self.wellbeing_metrics:
                if metric in singapore.columns:
                    wellbeing_position[str(metric)] = {
                        'value': float(singapore[metric].iloc[0]),
                        'global_mean': float(self.df[metric].mean()),
                        'global_std': float(self.df[metric].std()),
                        'percentile': float(stats.percentileofscore(
                            self.df[metric].dropna(), 
                            singapore[metric].iloc[0]
                        ))
                    }

            return {
                'music_features': music_position,
                'wellbeing': wellbeing_position
            }
        except Exception as e:
            return {'error': str(e)}

    def get_correlation_matrix(self) -> Dict:
        """Compute correlation matrix between music features and wellbeing metrics"""
        try:
            # Get available features and metrics
            available_features = [f for f in self.music_features if f in self.df.columns]
            available_metrics = [m for m in self.wellbeing_metrics if m in self.df.columns]
            
            # Calculate correlations
            correlations = {}
            for feature in available_features:
                correlations[str(feature)] = {}
                for metric in available_metrics:
                    correlations[str(feature)][str(metric)] = float(
                        self.df[feature].corr(self.df[metric])
                    )
            
            return correlations
        except Exception as e:
            return {'error': str(e)}

    def analyze_genre_impact(self) -> Dict:
        """Analyze impact of music genres on wellbeing metrics"""
        try:
            genre_stats = {}
            for genre in self.df['track_genre'].unique():
                genre_data = self.df[self.df['track_genre'] == genre]
                genre_stats[str(genre)] = {}
                
                # Calculate stats for each metric
                for metric in self.wellbeing_metrics:
                    if metric in self.df.columns:
                        genre_stats[str(genre)][str(metric)] = {
                            'mean': float(genre_data[metric].mean()),
                            'std': float(genre_data[metric].std()),
                            'count': int(len(genre_data))
                        }

            return genre_stats
        except Exception as e:
            return {'error': str(e)} 