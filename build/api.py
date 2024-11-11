from flask import jsonify
from dash import Output, Input
import pandas as pd

def register_endpoints(app):
    @app.server.route('/api/data/overview')
    def get_data_overview():
        df = pd.read_csv('build/data/combined_data.csv')
        return jsonify({
            'countries': len(df['Country'].unique()),
            'regions': len(df['region'].unique()),
            'total_records': len(df),
            'features': {
                'music': ['valence', 'energy', 'danceability', 'tempo'],
                'wellbeing': ['Life Ladder', 'Average MHQ Score']
            }
        })

    @app.server.route('/api/data/correlations')
    def get_correlations():
        df = pd.read_csv('build/data/combined_data.csv')
        music_features = ['valence', 'energy', 'danceability', 'tempo']
        well_being = ['Life Ladder', 'Average MHQ Score']
        
        correlations = []
        for m in music_features:
            for w in well_being:
                corr = df[m].corr(df[w])
                correlations.append({
                    'music_feature': m,
                    'wellbeing_metric': w,
                    'correlation': round(corr, 3)
                })
                
        return jsonify(correlations)

    @app.server.route('/api/data/regional')
    def get_regional_data():
        df = pd.read_csv('build/data/combined_data.csv')
        regional_stats = df.groupby('region').agg({
            'Life Ladder': 'mean',
            'Average MHQ Score': 'mean',
            'valence': 'mean',
            'energy': 'mean'
        }).round(3).to_dict('index')
        
        return jsonify(regional_stats)