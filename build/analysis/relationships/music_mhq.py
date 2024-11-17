import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List, Tuple

class MusicMHQAnalyzer:
    def __init__(self, df):
        self.df = df
        self.music_features = [
            'tempo', 'energy', 'valence', 'danceability', 
            'loudness', 'speechiness', 'acousticness', 
            'instrumentalness', 'liveness'
        ]
        self.mhq_dimensions = [
            'Average MHQ Score',
            'Average Cognition Score',
            'Average Adaptability & Resilence Score',
            'Average Drive & Motivation Score',
            'Average Mood & Outlook Score',
            'Average Social Self Score',
            'Average Mind-Body Connection Score'
        ]
        self.mhq_categories = [
            '% Distressed', '% Struggling', '% Enduring',
            '% Managing', '% Succeeding', '% Thriving'
        ]

    def analyze_global_correlations(self) -> Dict:
        """Analyze global correlations between music features and MHQ metrics"""
        return {
            'dimensions': self._analyze_dimension_correlations(),
            'categories': self._analyze_category_correlations(),
            'key_patterns': self._identify_key_patterns()
        }

    def _analyze_dimension_correlations(self) -> Dict:
        """Analyze correlations with MHQ dimensions"""
        correlations = {}
        for dimension in self.mhq_dimensions:
            if dimension in self.df.columns:
                correlations[str(dimension)] = {
                    str(feature): float(self.df[feature].corr(self.df[dimension]))
                    for feature in self.music_features
                    if feature in self.df.columns
                }
        return correlations

    def _analyze_category_correlations(self) -> Dict:
        """Analyze correlations with MHQ categories"""
        correlations = {}
        for category in self.mhq_categories:
            if category in self.df.columns:
                correlations[str(category)] = {
                    str(feature): float(self.df[feature].corr(self.df[category]))
                    for feature in self.music_features
                    if feature in self.df.columns
                }
        return correlations

    def _identify_key_patterns(self) -> Dict:
        """Identify strongest music-MHQ relationships"""
        patterns = {
            'top_dimension_correlations': {},
            'category_trends': {},
            'feature_importance': {}
        }
        
        # Analyze each music feature's relationship with MHQ dimensions
        for feature in self.music_features:
            if feature in self.df.columns:
                dimension_correlations = {
                    str(dim): float(self.df[feature].corr(self.df[dim]))
                    for dim in self.mhq_dimensions
                    if dim in self.df.columns
                }
                
                # Find strongest correlation
                strongest_dim = max(dimension_correlations.items(), key=lambda x: abs(x[1]))
                
                patterns['feature_importance'][str(feature)] = {
                    'strongest_dimension': {
                        'dimension': str(strongest_dim[0]),
                        'correlation': float(strongest_dim[1])
                    },
                    'correlation_range': {
                        'min': float(min(dimension_correlations.values())),
                        'max': float(max(dimension_correlations.values()))
                    }
                }
        
        return patterns

    def analyze_regional_variations(self) -> Dict:
        """Analyze regional variations in music-MHQ relationships"""
        variations = {}
        for region in self.df['region'].unique():
            region_data = self.df[self.df['region'] == region]
            variations[str(region)] = {
                'dimension_correlations': self._get_region_correlations(region_data),
                'mhq_profile': self._get_region_mhq_profile(region_data)
            }
        return variations

    def _get_region_correlations(self, data: pd.DataFrame) -> Dict:
        """Calculate correlations for a specific region"""
        correlations = {}
        for dimension in self.mhq_dimensions:
            if dimension in data.columns:
                correlations[str(dimension)] = {
                    str(feature): float(data[feature].corr(data[dimension]))
                    for feature in self.music_features
                    if feature in data.columns
                }
        return correlations

    def _get_region_mhq_profile(self, data: pd.DataFrame) -> Dict:
        """Get MHQ profile for a specific region"""
        return {
            'dimensions': {
                str(dim): {
                    'mean': float(data[dim].mean()),
                    'std': float(data[dim].std())
                } for dim in self.mhq_dimensions
                if dim in data.columns
            },
            'categories': {
                str(cat): {
                    'mean': float(data[cat].mean()),
                    'std': float(data[cat].std())
                } for cat in self.mhq_categories
                if cat in data.columns
            }
        }

    def analyze_singapore_specific(self) -> Dict:
        """Analyze Singapore's music-MHQ relationships"""
        singapore = self.df[self.df['Country'] == 'Singapore']
        if len(singapore) == 0:
            return {'error': 'No data available for Singapore'}
            
        asia = self.df[self.df['region'] == 'Asia']
        
        return {
            'mhq_profile': {
                'dimensions': {
                    str(dim): {
                        'value': float(singapore[dim].iloc[0]),
                        'asia_percentile': float(stats.percentileofscore(
                            asia[dim].dropna(), 
                            singapore[dim].iloc[0]
                        ))
                    } for dim in self.mhq_dimensions
                    if dim in singapore.columns
                },
                'categories': {
                    str(cat): {
                        'value': float(singapore[cat].iloc[0]),
                        'asia_percentile': float(stats.percentileofscore(
                            asia[cat].dropna(), 
                            singapore[cat].iloc[0]
                        ))
                    } for cat in self.mhq_categories
                    if cat in singapore.columns
                }
            },
            'music_correlations': self._get_region_correlations(singapore),
            'regional_context': {
                'dimension_percentiles': {
                    str(dim): float(stats.percentileofscore(
                        asia[dim].dropna(), 
                        singapore[dim].iloc[0]
                    ))
                    for dim in self.mhq_dimensions
                    if dim in singapore.columns
                },
                'music_feature_percentiles': {
                    str(feature): float(stats.percentileofscore(
                        asia[feature].dropna(), 
                        singapore[feature].iloc[0]
                    ))
                    for feature in self.music_features
                    if feature in singapore.columns
                }
            }
        } 