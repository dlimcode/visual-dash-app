import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List

class WellbeingAnalyzer:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.mhq_dimensions = [
            'Average MHQ Score',
            'Average Cognition Score',
            'Average Drive & Motivation Score',
            'Average Social Self Score',
            'Average Mind-Body Connection Score',
            'Average Adaptability & Resilence Score',
            'Average Mood & Outlook Score'
        ]
        self.mhq_categories = [
            '% Distressed', '% Struggling', '% Enduring',
            '% Managing', '% Succeeding', '% Thriving'
        ]

    def get_mhq_profile(self) -> Dict:
        """Get MHQ profile with proper formatting"""
        dimensions = {}
        for dim in self.mhq_dimensions:
            if dim in self.df.columns:
                stats = self.df[dim].describe()
                regional_means = self.df.groupby('region')[dim].mean()
                
                dimensions[str(dim)] = {
                    'global_stats': {
                        'mean': float(stats['mean']),
                        'std': float(stats['std']),
                        'min': float(stats['min']),
                        'max': float(stats['max'])
                    },
                    'regional_means': {
                        str(region): float(mean)
                        for region, mean in regional_means.items()
                    }
                }

        categories = {}
        for cat in self.mhq_categories:
            if cat in self.df.columns:
                stats = self.df[cat].describe()
                regional_means = self.df.groupby('region')[cat].mean()
                
                categories[str(cat)] = {
                    'global_stats': {
                        'mean': float(stats['mean']),
                        'std': float(stats['std']),
                        'min': float(stats['min']),
                        'max': float(stats['max'])
                    },
                    'regional_means': {
                        str(region): float(mean)
                        for region, mean in regional_means.items()
                    }
                }

        return {
            'dimensions': dimensions,
            'categories': categories
        }

    def analyze_singapore_wellbeing(self) -> Dict:
        """Analyze Singapore's wellbeing metrics"""
        singapore = self.df[self.df['Country'] == 'Singapore']
        if len(singapore) == 0:
            return {
                'error': 'No data available for Singapore'
            }

        asia = self.df[self.df['region'] == 'Asia']
        
        mhq_analysis = {}
        for dim in self.mhq_dimensions:
            if dim in singapore.columns:
                mhq_analysis[str(dim)] = {
                    'value': float(singapore[dim].iloc[0]),
                    'global_percentile': float(stats.percentileofscore(
                        self.df[dim].dropna(), 
                        singapore[dim].iloc[0]
                    )),
                    'asia_percentile': float(stats.percentileofscore(
                        asia[dim].dropna(), 
                        singapore[dim].iloc[0]
                    ))
                }

        return {
            'mhq_dimensions': mhq_analysis
        }

    def find_wellbeing_correlations(self) -> Dict:
        """Calculate correlations between wellbeing metrics"""
        # Get available dimensions
        available_dims = [dim for dim in self.mhq_dimensions if dim in self.df.columns]
        
        # Calculate correlation matrix
        correlation_matrix = self.df[available_dims].corr().round(3)
        
        # Convert to nested dictionary with proper formatting
        formatted_correlations = {
            str(dim1): {
                str(dim2): float(correlation_matrix.loc[dim1, dim2])
                for dim2 in correlation_matrix.columns
            }
            for dim1 in correlation_matrix.index
        }

        return {
            'correlation_matrix': formatted_correlations
        } 