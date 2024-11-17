import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List, Tuple

class RecommendationEngine:
    def __init__(self, df):
        self.df = df
        self.singapore_data = df[df['Country'] == 'Singapore']
        self.asia_data = df[df['region'] == 'Asia']
        
        self.music_features = [
            'tempo', 'energy', 'valence', 'danceability',
            'loudness', 'speechiness', 'acousticness',
            'instrumentalness', 'liveness'
        ]
        
        self.wellbeing_metrics = [
            'Average MHQ Score', 'Average Cognition Score',
            'Average Adaptability & Resilence Score',
            'Average Drive & Motivation Score',
            'Average Mood & Outlook Score',
            'Average Social Self Score',
            'Average Mind-Body Connection Score'
        ]

    def generate_recommendations(self) -> Dict:
        """Generate comprehensive recommendations"""
        try:
            return {
                'music_interventions': self._music_based_recommendations(),
                'demographic_targeting': self._demographic_recommendations(),
                'wellbeing_focus': self._wellbeing_recommendations(),
                'implementation_strategy': self._implementation_recommendations()
            }
        except Exception as e:
            return {'error': str(e)}

    def _music_based_recommendations(self) -> Dict:
        """Generate music-based intervention recommendations"""
        feature_impacts = {}
        for feature in self.music_features:
            if feature in self.df.columns:
                correlations = {
                    str(metric): float(stats.pearsonr(
                        self.df[feature].fillna(0),
                        self.df[metric].fillna(0)
                    )[0]) for metric in self.wellbeing_metrics
                    if metric in self.df.columns
                }
                feature_impacts[str(feature)] = correlations
        
        return {
            'optimal_features': feature_impacts,
            'genre_recommendations': self._analyze_genre_effectiveness(),
            'feature_targets': self._calculate_feature_targets()
        }

    def _analyze_genre_effectiveness(self) -> Dict:
        """Analyze effectiveness of different music genres"""
        genre_impacts = {}
        for metric in self.wellbeing_metrics:
            if metric in self.df.columns:
                genre_means = self.df.groupby('track_genre')[metric].mean()
                genre_impacts[str(metric)] = {
                    str(genre): float(mean)
                    for genre, mean in genre_means.items()
                }
        
        return {
            'optimal_genres': genre_impacts,
            'regional_preferences': self._analyze_regional_preferences(),
            'cultural_fit': self._assess_cultural_fit()
        }

    def _calculate_feature_targets(self) -> Dict:
        """Calculate optimal targets for music features"""
        targets = {}
        for feature in self.music_features:
            if feature in self.df.columns:
                high_wellbeing = self.df[
                    self.df['Average MHQ Score'] > self.df['Average MHQ Score'].mean()
                ]
                targets[str(feature)] = {
                    'optimal_range': {
                        'min': float(high_wellbeing[feature].quantile(0.25)),
                        'max': float(high_wellbeing[feature].quantile(0.75))
                    },
                    'current_singapore': float(self.singapore_data[feature].iloc[0]),
                    'asia_average': float(self.asia_data[feature].mean())
                }
        return targets

    def _demographic_recommendations(self) -> Dict:
        """Generate demographic-specific recommendations"""
        demographic_groups = {
            'age': ['18-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75+'],
            'education': [
                'Primary Education', 'Some High School', 'High School',
                "Associate's Degree", 'Vocational certification',
                "Bachelor's Degree", "Master's Degree", 'PhD or Doctorate'
            ]
        }

        recommendations = {}
        for category, groups in demographic_groups.items():
            group_scores = {}
            for group in groups:
                if group in self.singapore_data.columns:
                    group_scores[str(group)] = {
                        'current_level': float(self.singapore_data[group].iloc[0]),
                        'asia_benchmark': float(self.asia_data[group].mean()),
                        'global_benchmark': float(self.df[group].mean()),
                        'priority_score': float(self._calculate_priority_score(group))
                    }
            recommendations[str(category)] = group_scores
        return recommendations

    def _wellbeing_recommendations(self) -> Dict:
        """Generate well-being focused recommendations"""
        return {
            'priority_dimensions': self._identify_priority_dimensions(),
            'intervention_targets': self._calculate_intervention_targets(),
            'success_metrics': self._define_success_metrics()
        }

    def _implementation_recommendations(self) -> Dict:
        """Generate implementation strategy recommendations"""
        return {
            'phasing': [
                {
                    'phase': str(phase['phase']),
                    'duration': str(phase['duration']),
                    'focus': str(phase['focus']),
                    'metrics': [str(metric) for metric in phase['metrics']]
                }
                for phase in self._recommend_implementation_phases()
            ],
            'stakeholders': [
                {
                    'group': str(stakeholder['group']),
                    'role': str(stakeholder['role'])
                }
                for stakeholder in self._identify_key_stakeholders()
            ],
            'monitoring': self._define_monitoring_framework()
        }

    def _calculate_priority_score(self, group: str) -> float:
        """Calculate priority score for demographic group"""
        if group not in self.singapore_data.columns:
            return 0.0
            
        singapore_value = self.singapore_data[group].iloc[0]
        asia_mean = self.asia_data[group].mean()
        global_mean = self.df[group].mean()
        
        deviation_from_asia = abs(singapore_value - asia_mean) / asia_mean
        deviation_from_global = abs(singapore_value - global_mean) / global_mean
        
        return float((deviation_from_asia + deviation_from_global) / 2)

    def _analyze_regional_preferences(self) -> Dict:
        """Analyze regional music preferences"""
        try:
            regional_prefs = {}
            for region in self.df['region'].unique():
                region_data = self.df[self.df['region'] == region]
                regional_prefs[str(region)] = {
                    'genres': {
                        str(genre): int(count)
                        for genre, count in region_data['track_genre'].value_counts().items()
                    },
                    'features': {
                        str(feature): {
                            'mean': float(region_data[feature].mean()),
                            'std': float(region_data[feature].std())
                        }
                        for feature in self.music_features
                        if feature in region_data.columns
                    }
                }
            return regional_prefs
        except Exception as e:
            return {'error': str(e)}

    def _assess_cultural_fit(self) -> Dict:
        """Assess cultural fit of music preferences"""
        try:
            asia_data = self.df[self.df['region'] == 'Asia']
            return {
                'genre_alignment': {
                    str(genre): float(count / len(asia_data))
                    for genre, count in asia_data['track_genre'].value_counts().items()
                },
                'feature_similarity': {
                    str(feature): {
                        'singapore_value': float(self.singapore_data[feature].iloc[0]),
                        'asia_mean': float(asia_data[feature].mean()),
                        'similarity_score': float(1 - abs(
                            self.singapore_data[feature].iloc[0] - asia_data[feature].mean()
                        ) / asia_data[feature].std())
                    }
                    for feature in self.music_features
                    if feature in self.singapore_data.columns
                }
            }
        except Exception as e:
            return {'error': str(e)}

    def _identify_priority_dimensions(self) -> Dict:
        """Identify priority dimensions for intervention"""
        try:
            singapore = self.df[self.df['Country'] == 'Singapore']
            asia = self.df[self.df['region'] == 'Asia']
            
            priority_scores = {}
            for dimension in self.wellbeing_metrics:
                if dimension in singapore.columns:
                    sg_value = float(singapore[dimension].iloc[0])
                    asia_mean = float(asia[dimension].mean())
                    global_mean = float(self.df[dimension].mean())
                    
                    # Calculate gap from regional and global means
                    asia_gap = (asia_mean - sg_value) / asia_mean
                    global_gap = (global_mean - sg_value) / global_mean
                    
                    priority_scores[str(dimension)] = {
                        'current_value': sg_value,
                        'asia_mean': asia_mean,
                        'global_mean': global_mean,
                        'gap_score': float((asia_gap + global_gap) / 2),
                        'priority_level': 'high' if abs(asia_gap) > 0.1 else 'medium' if abs(asia_gap) > 0.05 else 'low'
                    }
            
            return priority_scores
        except Exception as e:
            return {'error': str(e)}

    def _calculate_intervention_targets(self) -> Dict:
        """Calculate specific intervention targets"""
        try:
            targets = {}
            for metric in self.wellbeing_metrics:
                if metric in self.df.columns:
                    high_performing = self.df[self.df[metric] > self.df[metric].quantile(0.75)]
                    
                    targets[str(metric)] = {
                        'target_value': float(high_performing[metric].mean()),
                        'current_value': float(self.singapore_data[metric].iloc[0]),
                        'improvement_required': float(
                            high_performing[metric].mean() - self.singapore_data[metric].iloc[0]
                        ),
                        'associated_features': self._identify_associated_features(metric)
                    }
            
            return targets
        except Exception as e:
            return {'error': str(e)}

    def _identify_associated_features(self, metric: str) -> Dict:
        """Identify music features most associated with a wellbeing metric"""
        try:
            correlations = {}
            for feature in self.music_features:
                if feature in self.df.columns:
                    correlation = float(stats.pearsonr(
                        self.df[feature].fillna(0),
                        self.df[metric].fillna(0)
                    )[0])
                    
                    correlations[str(feature)] = {
                        'correlation': correlation,
                        'impact_level': 'high' if abs(correlation) > 0.5 else 
                                      'medium' if abs(correlation) > 0.3 else 'low'
                    }
            
            return correlations
        except Exception as e:
            return {'error': str(e)}

    def _define_success_metrics(self) -> Dict:
        """Define metrics to measure intervention success"""
        try:
            return {
                'primary_metrics': {
                    str(metric): {
                        'baseline': float(self.singapore_data[metric].iloc[0]),
                        'target': float(self.df[metric].quantile(0.75)),
                        'measurement_frequency': 'quarterly'
                    }
                    for metric in self.wellbeing_metrics
                    if metric in self.singapore_data.columns
                },
                'secondary_metrics': {
                    str(feature): {
                        'baseline': float(self.singapore_data[feature].iloc[0]),
                        'optimal_range': {
                            'min': float(self.df[feature].quantile(0.25)),
                            'max': float(self.df[feature].quantile(0.75))
                        }
                    }
                    for feature in self.music_features
                    if feature in self.singapore_data.columns
                }
            }
        except Exception as e:
            return {'error': str(e)}

    def _recommend_implementation_phases(self) -> List[Dict]:
        """Recommend implementation phases"""
        try:
            return [
                {
                    'phase': 'Initial Assessment',
                    'duration': '3 months',
                    'focus': 'Baseline measurement and pilot interventions',
                    'metrics': ['Average MHQ Score', 'Life Ladder']
                },
                {
                    'phase': 'Core Implementation',
                    'duration': '6 months',
                    'focus': 'Full-scale music intervention program',
                    'metrics': self.wellbeing_metrics
                },
                {
                    'phase': 'Optimization',
                    'duration': '3 months',
                    'focus': 'Program refinement based on data',
                    'metrics': self.wellbeing_metrics + self.music_features
                }
            ]
        except Exception as e:
            return [{'error': str(e)}]

    def _identify_key_stakeholders(self) -> List[Dict]:
        """Identify key stakeholders for implementation"""
        try:
            return [
                {
                    'group': 'Healthcare Providers',
                    'role': 'Program implementation and monitoring'
                },
                {
                    'group': 'Music Therapists',
                    'role': 'Intervention design and delivery'
                },
                {
                    'group': 'Mental Health Professionals',
                    'role': 'Assessment and evaluation'
                },
                {
                    'group': 'Community Leaders',
                    'role': 'Local engagement and cultural adaptation'
                }
            ]
        except Exception as e:
            return [{'error': str(e)}]

    def _define_monitoring_framework(self) -> Dict:
        """Define framework for monitoring implementation"""
        try:
            return {
                'data_collection': {
                    'frequency': 'monthly',
                    'methods': ['surveys', 'clinical assessments', 'music usage data'],
                    'key_indicators': self.wellbeing_metrics
                },
                'evaluation_points': {
                    'baseline': 'pre-implementation',
                    'intermediate': '3 months',
                    'final': '12 months'
                },
                'success_criteria': {
                    'primary': {
                        'mhq_improvement': '10%',
                        'participation_rate': '70%'
                    },
                    'secondary': {
                        'engagement_level': '60%',
                        'satisfaction_rate': '75%'
                    }
                }
            }
        except Exception as e:
            return {'error': str(e)}

    # Helper methods with proper return type hints and error handling...
    # (Additional helper methods follow the same pattern of proper type conversion and error handling) 