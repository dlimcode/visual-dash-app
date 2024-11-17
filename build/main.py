import dash
from dash import html, dcc, callback, Input, Output
import dash_bootstrap_components as dbc
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from flask import jsonify
from flask_cors import CORS
from scipy import stats

# Import analysis modules
from analysis.foundation.music_patterns import MusicPatternAnalyzer
from analysis.foundation.wellbeing_landscape import WellbeingAnalyzer
from analysis.foundation.global_metrics import GlobalMetricsAnalyzer
from analysis.relationships.music_happiness import MusicHappinessAnalyzer
from analysis.relationships.music_mhq import MusicMHQAnalyzer
from analysis.regional.asia_analysis import AsiaAnalyzer
from analysis.regional.cross_regional import CrossRegionalAnalyzer
from analysis.singapore_focus.recommendations import RecommendationEngine
from analysis.singapore_focus.comparative import SingaporeComparative
from analysis.singapore_focus.cultural_context import CulturalContextAnalyzer

# Initialize the Dash app
app = dash.Dash(
    __name__,
    external_stylesheets=[
        dbc.themes.LITERA,
        "https://use.fontawesome.com/releases/v6.1.1/css/all.css",
    ],
    suppress_callback_exceptions=True
)

# Add this near the top of the file after initializing the app
app.layout = html.Div([
    dcc.Location(id='url', refresh=False),
    html.Div(id='page-content')
])

# Enable CORS
CORS(app.server)

# Load the data
df = pd.read_csv('data/combined_data.csv')

# Initialize analyzers
music_pattern_analyzer = MusicPatternAnalyzer(df)
wellbeing_analyzer = WellbeingAnalyzer(df)
global_metrics_analyzer = GlobalMetricsAnalyzer(df)
music_happiness_analyzer = MusicHappinessAnalyzer(df)
music_mhq_analyzer = MusicMHQAnalyzer(df)
asia_analyzer = AsiaAnalyzer(df)
cross_regional_analyzer = CrossRegionalAnalyzer(df)
recommendation_engine = RecommendationEngine(df)
singapore_comparative = SingaporeComparative(df)
cultural_context_analyzer = CulturalContextAnalyzer(df)

# Feature categories (existing code...)
MUSIC_FEATURES = [
    'valence', 'energy', 'danceability', 'tempo', 
    'speechiness', 'acousticness', 'instrumentalness', 
    'liveness', 'key', 'mode', 'time_signature'
]

WELLBEING_METRICS = [
    'Life Ladder', 'Average MHQ Score',
    'Average Cognition Score', 'Average Drive & Motivation Score',
    'Average Social Self Score', 'Average Mind-Body Connection Score',
    'Average Adaptability & Resilence Score', 'Average Mood & Outlook Score'
]

DEMOGRAPHIC_METRICS = [
    '18-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75+',
    'Primary Education', 'Some High School', 'High School',
    "Associate's Degree", 'Vocational certification',
    "Bachelor's Degree", "Master's Degree", 'PhD or Doctorate'
]


@app.server.route('/api/countries')
def get_all_countries():
    """
    Returns data for all countries in a single JSON response.
    """
    countries_data = {}
    
    for country in df['Country'].unique():
        # Get country data
        country_data = df[df['Country'] == country].iloc[0]
        region_data = df[df['region'] == country_data['region']]
        
        # Calculate rankings
        mhq_global_rank = int(df['Average MHQ Score'].rank(ascending=False)[country_data.name])
        happiness_global_rank = int(df['Life Ladder'].rank(ascending=False)[country_data.name])
        mhq_regional_rank = int(region_data['Average MHQ Score'].rank(ascending=False)[country_data.name])
        happiness_regional_rank = int(region_data['Life Ladder'].rank(ascending=False)[country_data.name])

        countries_data[country] = {
            'region': country_data['region'],
            
            # Overview tab data
            'overview': {
                'happiness_rank': {
                    'global': happiness_global_rank,
                    'regional': happiness_regional_rank
                },
                'mhq_rank': {
                    'global': mhq_global_rank,
                    'regional': mhq_regional_rank
                },
                'mental_health_distribution': {
                    'Distressed': round(float(country_data['% Distressed'])),
                    'Struggling': round(float(country_data['% Struggling'])),
                    'Enduring': round(float(country_data['% Enduring'])),
                    'Managing': round(float(country_data['% Managing'])),
                    'Succeeding': round(float(country_data['% Succeeding'])),
                    'Thriving': round(float(country_data['% Thriving']))
                }
            },
            
            # Music tab data
            'music': {
                'dominant_genre': country_data['track_genre'],
                'audio_features': {
                    'acousticness': float(country_data['acousticness']),
                    'danceability': float(country_data['danceability']),
                    'energy': float(country_data['energy']),
                    'instrumentalness': float(country_data['instrumentalness']),
                    'liveness': float(country_data['liveness']),
                    'loudness': float(country_data['loudness']),
                    'speechiness': float(country_data['speechiness']),
                    'tempo': float(country_data['tempo']),
                    'valence': float(country_data['valence'])
                }
            },
            
            # Well-being tab data
            'wellbeing': {
                'metrics': {
                    'Adaptability & Resilence Score': round(float(country_data['Average Adaptability & Resilence Score']), 1),
                    'Cognition Score': round(float(country_data['Average Cognition Score']), 1),
                    'Drive & Motivation Score': round(float(country_data['Average Drive & Motivation Score']), 1),
                    'MHQ Score': round(float(country_data['Average MHQ Score']), 1),
                    'Mind-Body Connection Score': round(float(country_data['Average Mind-Body Connection Score']), 1),
                    'Mood & Outlook Score': round(float(country_data['Average Mood & Outlook Score']), 1),
                    'Social Self Score': round(float(country_data['Average Social Self Score']), 1)
                }
            }
        }
    
    # Add summary statistics
    summary = {
        'total_countries': len(df['Country'].unique()),
        'regions': sorted(df['region'].unique().tolist()),
        'genres': sorted(df['track_genre'].unique().tolist()),
        'global_averages': {
            'mhq_score': float(df['Average MHQ Score'].mean()),
            'life_ladder': float(df['Life Ladder'].mean())
        },
        'regional_averages': df.groupby('region')['Average MHQ Score'].mean().to_dict()
    }
    
    return jsonify({
        'countries': countries_data,
        'summary': summary
    })


@app.server.route('/api/viz/global-rankings')
def get_rankings_viz_data():
    """
    Returns data formatted for global rankings visualizations.
    Supports:
    1. Global MHQ & Happiness Rankings Bar Chart
    2. MHQ vs Happiness Scatter Plot
    3. Regional Comparisons
    """
    try:
        # Prepare rankings data
        rankings_df = df[['Country', 'region', 'Average MHQ Score', 'Life Ladder']].copy()
        
        # Calculate ranks
        rankings_df['mhq_rank'] = rankings_df['Average MHQ Score'].rank(ascending=False)
        rankings_df['happiness_rank'] = rankings_df['Life Ladder'].rank(ascending=False)
        
        # Sort by MHQ Score
        rankings_df = rankings_df.sort_values('Average MHQ Score', ascending=False)

        response = {
            # Bar Chart Data
            'rankings': {
                'countries': rankings_df['Country'].tolist(),
                'mhq_scores': rankings_df['Average MHQ Score'].round(2).tolist(),
                'happiness_scores': rankings_df['Life Ladder'].round(2).tolist(),
                'regions': rankings_df['region'].tolist(),
                'mhq_ranks': rankings_df['mhq_rank'].astype(int).tolist(),
                'happiness_ranks': rankings_df['happiness_rank'].astype(int).tolist()
            },
            
            # Regional Averages for Comparisons
            'regional_averages': {
                'mhq': df.groupby('region')['Average MHQ Score'].mean().round(2).to_dict(),
                'happiness': df.groupby('region')['Life Ladder'].mean().round(2).to_dict()
            },
            
            # Summary Statistics
            'summary': {
                'global_mhq_avg': float(df['Average MHQ Score'].mean().round(2)),
                'global_happiness_avg': float(df['Life Ladder'].mean().round(2)),
                'total_countries': len(df['Country'].unique()),
                'regions': sorted(df['region'].unique().tolist())
            }
        }

        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.server.route('/api/viz/wellbeing-dimensions')
def get_wellbeing_dimensions_data():
    """
    Returns data for wellbeing dimensions comparison.
    Supports radar charts and parallel coordinates plots.
    """
    try:
        # Get wellbeing dimension columns
        dimension_cols = [col for col in df.columns if 'Average' in col and 'Score' in col]
        
        # Prepare data by country
        country_data = {}
        for country in df['Country'].unique():
            country_df = df[df['Country'] == country]
            country_data[country] = {
                'dimensions': {col: float(country_df[col].iloc[0].round(2)) 
                             for col in dimension_cols},
                'region': country_df['region'].iloc[0]
            }

        # Calculate regional averages
        regional_averages = df.groupby('region')[dimension_cols].mean().round(2).to_dict('index')

        response = {
            'country_data': country_data,
            'regional_averages': regional_averages,
            'dimension_names': [col.replace('Average ', '').replace(' Score', '') 
                              for col in dimension_cols],
            'regions': sorted(df['region'].unique().tolist())
        }

        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.server.route('/api/viz/mhq-distribution')
def get_mhq_distribution_data():
    """
    Returns data for MHQ score distribution visualizations.
    Supports histograms and box plots.
    """
    try:
        distribution_data = {
            'by_region': {},
            'global': {
                'mean': float(df['Average MHQ Score'].mean().round(2)),
                'median': float(df['Average MHQ Score'].median().round(2)),
                'std': float(df['Average MHQ Score'].std().round(2)),
                'min': float(df['Average MHQ Score'].min().round(2)),
                'max': float(df['Average MHQ Score'].max().round(2)),
                'q1': float(df['Average MHQ Score'].quantile(0.25).round(2)),
                'q3': float(df['Average MHQ Score'].quantile(0.75).round(2))
            }
        }

        # Calculate distribution stats by region
        for region in df['region'].unique():
            region_df = df[df['region'] == region]
            distribution_data['by_region'][region] = {
                'mean': float(region_df['Average MHQ Score'].mean().round(2)),
                'median': float(region_df['Average MHQ Score'].median().round(2)),
                'std': float(region_df['Average MHQ Score'].std().round(2)),
                'min': float(region_df['Average MHQ Score'].min().round(2)),
                'max': float(region_df['Average MHQ Score'].max().round(2)),
                'q1': float(region_df['Average MHQ Score'].quantile(0.25).round(2)),
                'q3': float(region_df['Average MHQ Score'].quantile(0.75).round(2)),
                'countries': region_df[['Country', 'Average MHQ Score']].to_dict('records')
            }

        return jsonify(distribution_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.server.route('/api/viz/music-features')
def get_music_features_data():
    """
    Returns data for music features visualizations.
    Supports radar charts and feature comparisons.
    """
    try:
        # Define music features
        features = ['tempo', 'energy', 'valence', 'danceability', 'loudness',
                   'speechiness', 'acousticness', 'instrumentalness', 'liveness']

        # Get data by country
        country_features = {}
        for country in df['Country'].unique():
            country_df = df[df['Country'] == country]
            country_features[country] = {
                'features': {feature: float(country_df[feature].iloc[0]) 
                           for feature in features},
                'genre': country_df['track_genre'].iloc[0],
                'region': country_df['region'].iloc[0]
            }

        # Calculate regional averages
        regional_features = {}
        for region in df['region'].unique():
            region_df = df[df['region'] == region]
            regional_features[region] = {
                'features': {feature: float(region_df[feature].mean().round(3)) 
                           for feature in features},
                'dominant_genre': region_df['track_genre'].mode().iloc[0]
            }

        response = {
            'country_features': country_features,
            'regional_features': regional_features,
            'feature_ranges': {
                feature: {
                    'min': float(df[feature].min().round(3)),
                    'max': float(df[feature].max().round(3)),
                    'mean': float(df[feature].mean().round(3)),
                    'std': float(df[feature].std().round(3))
                } for feature in features
            }
        }

        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.server.route('/api/viz/genre-analysis')
def get_genre_analysis_data():
    """
    Returns data for genre analysis visualizations.
    Supports genre distribution and correlation with wellbeing.
    """
    try:
        # Genre distribution by region
        genre_dist = df.groupby(['region', 'track_genre']).size().unstack(fill_value=0)
        
        # Average MHQ score by genre
        genre_mhq = df.groupby('track_genre')['Average MHQ Score'].agg(['mean', 'std', 'count']).round(2)

        # Genre correlations with wellbeing metrics
        wellbeing_cols = [col for col in df.columns if 'Average' in col and 'Score' in col]
        genre_dummies = pd.get_dummies(df['track_genre'])
        correlations = {}
        
        for metric in wellbeing_cols:
            correlations[metric] = {
                genre: float(df[metric].corr(genre_dummies[genre]).round(3))
                for genre in genre_dummies.columns
            }

        response = {
            'distribution': {
                'by_region': genre_dist.to_dict('index'),
                'global_counts': df['track_genre'].value_counts().to_dict()
            },
            'wellbeing_relationship': {
                'average_mhq': genre_mhq.to_dict('index'),
                'correlations': correlations
            },
            'genres': sorted(df['track_genre'].unique().tolist()),
            'regions': sorted(df['region'].unique().tolist())
        }

        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.server.route('/api/viz/music-wellbeing-correlation')
def get_music_wellbeing_correlation_data():
    """
    Returns correlation data between music features and wellbeing metrics.
    Supports heatmaps and scatter plots.
    """
    try:
        # Define features and metrics
        music_features = ['tempo', 'energy', 'valence', 'danceability', 'loudness',
                         'speechiness', 'acousticness', 'instrumentalness', 'liveness']
        wellbeing_metrics = [col for col in df.columns if 'Average' in col and 'Score' in col]

        # Calculate correlations
        correlations = {}
        for feature in music_features:
            correlations[feature] = {
                metric: float(df[feature].corr(df[metric]).round(3))
                for metric in wellbeing_metrics
            }

        # Get scatter plot data for each feature-metric pair
        scatter_data = {}
        for feature in music_features:
            scatter_data[feature] = {
                metric: {
                    'x': df[feature].tolist(),
                    'y': df[metric].tolist(),
                    'countries': df['Country'].tolist(),
                    'regions': df['region'].tolist()
                }
                for metric in wellbeing_metrics
            }

        response = {
            'correlations': correlations,
            'scatter_data': scatter_data,
            'features': music_features,
            'metrics': [metric.replace('Average ', '').replace(' Score', '') 
                       for metric in wellbeing_metrics]
        }

        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.server.route('/api/viz/mental-health')
def get_mental_health_data():
    """
    Returns mental health distribution data.
    Supports stacked bar charts and distribution analysis.
    """
    try:
        # Mental health categories
        mh_categories = ['% Distressed', '% Struggling', '% Enduring',
                        '% Managing', '% Succeeding', '% Thriving']

        # Get distribution by country
        country_distribution = {}
        for country in df['Country'].unique():
            country_df = df[df['Country'] == country]
            country_distribution[country] = {
                'distribution': {cat: float(country_df[cat].iloc[0].round(2)) 
                               for cat in mh_categories},
                'region': country_df['region'].iloc[0],
                'mhq_score': float(country_df['Average MHQ Score'].iloc[0].round(2))
            }

        # Calculate regional distributions
        regional_distribution = {}
        for region in df['region'].unique():
            region_df = df[df['region'] == region]
            regional_distribution[region] = {
                'distribution': {cat: float(region_df[cat].mean().round(2)) 
                               for cat in mh_categories},
                'mhq_score': float(region_df['Average MHQ Score'].mean().round(2)),
                'country_count': len(region_df)
            }

        # Global statistics
        global_stats = {
            'distribution': {cat: float(df[cat].mean().round(2)) 
                           for cat in mh_categories},
            'correlations': {
                cat: {
                    'mhq': float(df[cat].corr(df['Average MHQ Score']).round(3)),
                    'happiness': float(df[cat].corr(df['Life Ladder']).round(3))
                } for cat in mh_categories
            }
        }

        response = {
            'country_distribution': country_distribution,
            'regional_distribution': regional_distribution,
            'global_stats': global_stats,
            'categories': [cat.replace('% ', '') for cat in mh_categories],
            'category_colors': {
                'Distressed': '#FF6B6B',
                'Struggling': '#FFA07A',
                'Enduring': '#FFD93D',
                'Managing': '#98D8AA',
                'Succeeding': '#4CAF50',
                'Thriving': '#2196F3'
            }
        }

        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Add summary endpoint for the exploration page
@app.server.route('/api/viz/exploration-summary')
def get_exploration_summary():
    """
    Returns summary statistics and highlights for the exploration page.
    """
    try:
        summary = {
            'global_stats': {
                'total_countries': len(df['Country'].unique()),
                'regions': len(df['region'].unique()),
                'genres': len(df['track_genre'].unique()),
                'avg_mhq': float(df['Average MHQ Score'].mean().round(2)),
                'avg_happiness': float(df['Life Ladder'].mean().round(2))
            },
            'top_performers': {
                'mhq': {
                    'country': df.nlargest(1, 'Average MHQ Score')['Country'].iloc[0],
                    'score': float(df.nlargest(1, 'Average MHQ Score')['Average MHQ Score'].iloc[0].round(2))
                },
                'happiness': {
                    'country': df.nlargest(1, 'Life Ladder')['Country'].iloc[0],
                    'score': float(df.nlargest(1, 'Life Ladder')['Life Ladder'].iloc[0].round(2))
                }
            },
            'music_insights': {
                'top_genres': df['track_genre'].value_counts().head(3).to_dict(),
                'avg_features': {
                    feature: float(df[feature].mean().round(3))
                    for feature in ['energy', 'valence', 'danceability']
                }
            },
            'wellbeing_insights': {
                'thriving_rate': float(df['% Thriving'].mean().round(2)),
                'distressed_rate': float(df['% Distressed'].mean().round(2)),
                'regional_leaders': {
                    region: {
                        'country': region_df.nlargest(1, 'Average MHQ Score')['Country'].iloc[0],
                        'score': float(region_df.nlargest(1, 'Average MHQ Score')['Average MHQ Score'].iloc[0].round(2))
                    }
                    for region, region_df in df.groupby('region')
                }
            }
        }

        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

if __name__ == '__main__':
    app.run_server(debug=True, port=8050)