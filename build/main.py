import dash
from dash import html, dcc, callback, Input, Output
import dash_bootstrap_components as dbc
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from flask import jsonify
from flask_cors import CORS

# Initialize the Dash app
app = dash.Dash(
    __name__,
    external_stylesheets=[
        dbc.themes.LITERA,
        "https://use.fontawesome.com/releases/v6.1.1/css/all.css",
    ],
    suppress_callback_exceptions=True
)

# Enable CORS
CORS(app.server)

# Load the data
df = pd.read_csv('data/combined_data.csv')

# Define feature categories
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

# Navigation sidebar
sidebar = html.Div([
    html.Div([
        html.I(className="fas fa-brain fa-2x mb-3"),
        html.H4("Navigation", className="mb-3"),
    ], className="sidebar-header"),
    dbc.Nav([
        dbc.NavLink(
            [html.I(className="fas fa-home me-2"), "Introduction"],
            href="/",
            id="intro-link",
        ),
        dbc.NavLink(
            [html.I(className="fas fa-music me-2"), "Music & Happiness"],
            href="/music-happiness",
            id="music-happiness-link",
        ),
        dbc.NavLink(
            [html.I(className="fas fa-chart-line me-2"), "MHQ Analysis"],
            href="/mhq-analysis",
            id="mhq-link",
        ),
        dbc.NavLink(
            [html.I(className="fas fa-users me-2"), "Demographics"],
            href="/demographics",
            id="demographics-link",
        ),
        dbc.NavLink(
            [html.I(className="fas fa-globe me-2"), "Explore"],
            href="/explore",
            id="explore-link",
        ),
    ],
    vertical=True,
    pills=True,
    )
], className="sidebar")

# Main layout
app.layout = html.Div([
    dcc.Location(id='url', refresh=False),
    dbc.Row([
        dbc.Col(
            sidebar,
            width=2,
            className="sidebar-container"
        ),
        dbc.Col(
            html.Div(id='page-content'),
            width=10,
            className="content-container"
        )
    ])
])

# API Routes
@app.server.route('/api/metadata')
def get_metadata():
    return jsonify({
        'music_features': MUSIC_FEATURES,
        'wellbeing_metrics': WELLBEING_METRICS,
        'demographic_metrics': DEMOGRAPHIC_METRICS,
        'regions': sorted(df['region'].unique().tolist()),
        'genres': sorted(df['track_genre'].unique().tolist()),
        'countries': sorted(df['Country'].unique().tolist())
    })

@app.server.route('/api/stats')
def get_stats():
    return jsonify({
        'total_countries': len(df['Country'].unique()),
        'total_regions': len(df['region'].unique()),
        'total_genres': len(df['track_genre'].unique()),
        'music_features': len(MUSIC_FEATURES),
        'wellbeing_metrics': len(WELLBEING_METRICS),
        'demographic_metrics': len(DEMOGRAPHIC_METRICS),
        'average_mhq': df['Average MHQ Score'].mean().round(2),
        'average_happiness': df['Life Ladder'].mean().round(2)
    })

@app.server.route('/api/overview_data')
def get_overview_data():
    # Calculate regional averages for key metrics
    regional_data = df.groupby('region').agg({
        'Life Ladder': 'mean',
        'Average MHQ Score': 'mean',
        **{feat: 'mean' for feat in MUSIC_FEATURES if feat in df.columns}
    }).round(3)
    
    # Calculate correlations between music features and well-being
    correlations = {}
    for feature in MUSIC_FEATURES:
        if feature in df.columns:
            for metric in WELLBEING_METRICS:
                if metric in df.columns:
                    key = f"{feature}__{metric}"
                    correlations[key] = df[feature].corr(df[metric]).round(3)
    
    return jsonify({
        'regional_averages': regional_data.to_dict('index'),
        'correlations': correlations
    })

@app.server.route('/api/feature_data')
def get_feature_data():
    data = {
        'music_features': {
            feature: {
                'mean': df[feature].mean().round(3),
                'std': df[feature].std().round(3),
                'min': df[feature].min().round(3),
                'max': df[feature].max().round(3)
            } for feature in MUSIC_FEATURES if feature in df.columns
        },
        'wellbeing_metrics': {
            metric: {
                'mean': df[metric].mean().round(3),
                'std': df[metric].std().round(3),
                'min': df[metric].min().round(3),
                'max': df[metric].max().round(3)
            } for metric in WELLBEING_METRICS if metric in df.columns
        }
    }
    return jsonify(data)

# Page routing callback
@callback(
    Output('page-content', 'children'),
    Input('url', 'pathname')
)
def display_page(pathname):
    if pathname == '/':
        return html.Div([
            html.H1("Welcome to Music & Well-being Analysis"),
            html.P("Select a section from the sidebar to begin exploring the data.")
        ])
    elif pathname == '/music-happiness':
        return html.Div([
            html.H1("Music & Happiness Analysis"),
            # Add your music happiness content here
        ])
    elif pathname == '/mhq-analysis':
        return html.Div([
            html.H1("MHQ Analysis"),
            # Add your MHQ analysis content here
        ])
    elif pathname == '/demographics':
        return html.Div([
            html.H1("Demographics Analysis"),
            # Add your demographics content here
        ])
    elif pathname == '/explore':
        return html.Div([
            html.H1("Data Exploration"),
            # Add your exploration content here
        ])
    else:
        return html.H1("404: Page not found", className="text-center")

if __name__ == '__main__':
    app.run_server(debug=True, port=8050)