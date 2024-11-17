from typing import Dict, List
import pandas as pd
import numpy as np
from scipy import stats

class CrossRegionalAnalyzer:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.regions = df['region'].unique()
        self.music_features = ['tempo', 'energy', 'valence', 'danceability', 
                             'loudness', 'speechiness', 'acousticness', 
                             'instrumentalness', 'liveness']
        self.wellbeing_metrics = [col for col in df.columns 
                                 if 'Average' in col or '%' in col]
        self.happiness_metrics = ['Life Ladder', 'Social support', 
                                'Positive affect', 'Negative affect']

    def analyze_cross_regional_patterns(self) -> Dict:
        """Analyze patterns across different regions"""
        return {
            'music_comparisons': self._analyze_music_differences(),
            'wellbeing_comparisons': self._analyze_wellbeing_differences(),
            'regional_correlations': self._analyze_regional_correlations(),
            'cultural_patterns': self._analyze_cultural_patterns()
        }

    def _analyze_music_differences(self) -> Dict:
        """Compare music features across regions"""
        music_diff = {
            'feature_by_region': {},
            'genre_distribution': {},
            'significant_differences': {}
        }
        
        # Analyze each music feature across regions
        for feature in self.music_features:
            if feature in self.df.columns:
                regional_stats = self.df.groupby('region')[feature].agg(['mean', 'std'])
                music_diff['feature_by_region'][str(feature)] = {
                    str(region): {
                        'mean': float(stats['mean']),
                        'std': float(stats['std'])
                    } for region, stats in regional_stats.iterrows()
                }
                
                # ANOVA test for significant differences
                groups = [group[feature].values for name, group 
                         in self.df.groupby('region')]
                f_stat, p_val = stats.f_oneway(*groups)
                music_diff['significant_differences'][str(feature)] = {
                    'f_statistic': float(f_stat),
                    'p_value': float(p_val)
                }
        
        # Genre distribution by region
        genre_dist = self.df.groupby(['region', 'track_genre']).size().unstack(fill_value=0)
        music_diff['genre_distribution'] = {
            str(region): {
                str(genre): int(count)
                for genre, count in row.items()
            } for region, row in genre_dist.iterrows()
        }
        
        return music_diff

    def _analyze_wellbeing_differences(self) -> Dict:
        """Compare well-being metrics across regions"""
        wellbeing_diff = {
            'mhq_by_region': {},
            'happiness_by_region': {},
            'regional_rankings': {},
            'statistical_tests': {}
        }
        
        # MHQ metrics comparison
        for metric in self.wellbeing_metrics:
            if metric in self.df.columns:
                regional_stats = self.df.groupby('region')[metric].agg(['mean', 'std', 'count'])
                wellbeing_diff['mhq_by_region'][str(metric)] = {
                    str(region): {
                        'mean': float(stats['mean']),
                        'std': float(stats['std']),
                        'count': int(stats['count'])
                    } for region, stats in regional_stats.iterrows()
                }
        
        return wellbeing_diff

    def _analyze_regional_correlations(self) -> Dict:
        """Analyze correlations between music and well-being by region"""
        correlations = {
            'music_wellbeing': {},
            'music_happiness': {},
            'regional_patterns': {}
        }
        
        for region in self.regions:
            region_data = self.df[self.df['region'] == region]
            if len(region_data) >= 5:  # Minimum samples for correlation
                correlations['regional_patterns'][str(region)] = {
                    str(feature): {
                        str(metric): float(region_data[feature].corr(region_data[metric]))
                        for metric in self.wellbeing_metrics
                        if metric in region_data.columns
                    }
                    for feature in self.music_features
                    if feature in region_data.columns
                }
        
        return correlations

    def _analyze_cultural_patterns(self) -> Dict:
        """Analyze cultural patterns across regions"""
        return {
            'genre_preferences': self._analyze_genre_preferences(),
            'musical_characteristics': self._analyze_musical_characteristics(),
            'wellbeing_profiles': self._analyze_wellbeing_profiles()
        }

    def _analyze_genre_preferences(self) -> Dict:
        """Analyze genre preferences by region"""
        preferences = {}
        for region in self.regions:
            region_data = self.df[self.df['region'] == region]
            genre_counts = region_data['track_genre'].value_counts()
            preferences[str(region)] = {
                str(genre): int(count)
                for genre, count in genre_counts.items()
            }
        return preferences

    def _analyze_musical_characteristics(self) -> Dict:
        """Analyze distinct musical characteristics by region"""
        characteristics = {
            'feature_profiles': {},
            'distinctive_features': {}
        }
        
        for region in self.regions:
            region_data = self.df[self.df['region'] == region]
            feature_means = region_data[self.music_features].mean()
            characteristics['feature_profiles'][str(region)] = {
                str(feature): float(mean)
                for feature, mean in feature_means.items()
            }
            
            # Calculate distinctive features
            global_means = self.df[self.music_features].mean()
            differences = feature_means - global_means
            distinctive = differences[abs(differences) > differences.std()]
            characteristics['distinctive_features'][str(region)] = {
                str(feature): float(diff)
                for feature, diff in distinctive.items()
            }
        
        return characteristics

    def _analyze_wellbeing_profiles(self) -> Dict:
        """Analyze wellbeing profiles across regions"""
        profiles = {
            'mhq_profiles': {},
            'happiness_profiles': {},
            'regional_characteristics': {}
        }
        
        for region in self.regions:
            region_data = self.df[self.df['region'] == region]
            
            # MHQ dimensions profile
            mhq_means = region_data[self.wellbeing_metrics].mean()
            profiles['mhq_profiles'][str(region)] = {
                str(metric): float(mean)
                for metric, mean in mhq_means.items()
            }
            
            # Happiness metrics profile
            happiness_means = region_data[self.happiness_metrics].mean()
            profiles['happiness_profiles'][str(region)] = {
                str(metric): float(mean)
                for metric, mean in happiness_means.items()
            }
            
            # Characteristic patterns
            profiles['regional_characteristics'][str(region)] = {
                'top_mhq_dimensions': [
                    str(dim) for dim in mhq_means.nlargest(3).index.tolist()
                ],
                'top_happiness_metrics': [
                    str(metric) for metric in happiness_means.nlargest(2).index.tolist()
                ]
            }
        
        return profiles