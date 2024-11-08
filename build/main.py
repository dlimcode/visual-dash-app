# app.py
import dash
from dash import html, dcc, callback, Input, Output, State
import dash_bootstrap_components as dbc
import plotly.express as px
import plotly.graph_objects as go
import plotly.figure_factory as ff
import pandas as pd
import numpy as np
from scipy.stats import pearsonr

# Initialize Dash app with modern theme and Font Awesome
app = dash.Dash(
    __name__,
    external_stylesheets=[
        dbc.themes.LITERA,
        "https://use.fontawesome.com/releases/v6.1.1/css/all.css",
    ],
    suppress_callback_exceptions=True
)

# Load and preprocess data
df = pd.read_csv('data/combined_data.csv')

# Calculate correlations for heatmap
music_features = ['valence', 'energy', 'danceability', 'tempo']
mhq_dimensions = ['Average Cognition Score', 'Average Adaptability & Resilence Score',
                 'Average Drive & Motivation Score', 'Average Mood & Outlook Score',
                 'Average Social Self Score', 'Average Mind-Body Connection Score']

# Helper function for progress bar
def create_progress_indicator(current_step, total_steps=4):
    return dbc.Progress(
        value=(current_step / total_steps) * 100,
        className="mb-3",
        style={"height": "4px"}
    )

# Navigation sidebar
sidebar = html.Div(
    [
        html.Div(
            [
                html.I(className="fas fa-brain fa-2x mb-3"),
                html.H4("Navigation", className="mb-3"),
            ],
            className="sidebar-header",
        ),
        dbc.Nav(
            [
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
        ),
    ],
    className="sidebar",
)

# Introduction page
intro_layout = dbc.Container([
    dbc.Row([
        dbc.Col([
            html.H1("Music, Happiness, and Mental Well-being",
                   className="text-center mb-4 gradient-text"),
            html.H5(
                "Exploring the intricate relationships between musical preferences, "
                "happiness levels, and mental well-being across different cultures.",
                className="text-center mb-5 text-muted"
            ),
        ], width=12)
    ]),
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                html.I(className="fas fa-globe-americas fa-3x text-primary mb-3"),
                html.H4("Global Reach"),
                html.P(f"{len(df['Country'].unique())} Countries Analyzed")
            ], body=True, className="text-center highlight-card")
        ], width=12, md=4),
        dbc.Col([
            dbc.Card([
                html.I(className="fas fa-brain fa-3x text-success mb-3"),
                html.H4("Mental Well-being"),
                html.P("6 MHQ Dimensions Explored")
            ], body=True, className="text-center highlight-card")
        ], width=12, md=4),
        dbc.Col([
            dbc.Card([
                html.I(className="fas fa-music fa-3x text-info mb-3"),
                html.H4("Music Features"),
                html.P("8 Musical Attributes Analyzed")
            ], body=True, className="text-center highlight-card")
        ], width=12, md=4),
    ], className="mb-5"),
    
    dbc.Row([
        dbc.Col([
            html.H3("Key Insights", className="mb-4"),
            dbc.Card([
                dbc.CardBody([
                    html.H5("Musical Happiness Connection", className="card-title"),
                    html.P(
                        "Discover how musical preferences correlate with happiness "
                        "levels across different cultures.",
                        className="card-text"
                    ),
                    dbc.Button(
                        "Explore Music & Happiness",
                        href="/music-happiness",
                        color="primary",
                        className="mt-3"
                    )
                ])
            ], className="mb-3 insight-card"),
            
            dbc.Card([
                dbc.CardBody([
                    html.H5("Mental Well-being Patterns", className="card-title"),
                    html.P(
                        "Explore how different aspects of mental health relate to "
                        "musical preferences and cultural factors.",
                        className="card-text"
                    ),
                    dbc.Button(
                        "Explore MHQ Analysis",
                        href="/mhq-analysis",
                        color="success",
                        className="mt-3"
                    )
                ])
            ], className="mb-3 insight-card"),
            
            dbc.Card([
                dbc.CardBody([
                    html.H5("Demographic Influences", className="card-title"),
                    html.P(
                        "Understand how age, employment, and education affect "
                        "musical preferences and well-being.",
                        className="card-text"
                    ),
                    dbc.Button(
                        "Explore Demographics",
                        href="/demographics",
                        color="info",
                        className="mt-3"
                    )
                ])
            ], className="insight-card"),
        ], width=12)
    ])
])

# Import page layouts
from pages.demographics import create_layout as demographics_layout
from pages.explore import create_layout as explore_layout
from pages.mhq_analysis import create_layout as mhq_analysis_layout
from pages.music_happiness import create_layout as music_happiness_layout

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

# Callback to update page content
@callback(
    Output('page-content', 'children'),
    Input('url', 'pathname')
)
def display_page(pathname):
    if pathname == '/':
        return intro_layout
    elif pathname == '/music-happiness':
        return music_happiness_layout(df)
    elif pathname == '/mhq-analysis':
        return mhq_analysis_layout(df)
    elif pathname == '/demographics':
        return demographics_layout(df)
    elif pathname == '/explore':
        return explore_layout(df)
    else:
        return html.H1("404: Page not found", className="text-center")

# Add custom CSS
app.index_string = '''
<!DOCTYPE html>
<html>
    <head>
        {%metas%}
        <title>Music & Well-being Dashboard</title>
        {%favicon%}
        {%css%}
        <style>
            /* Root variables */
            :root {
                --primary-color: #4361ee;
                --secondary-color: #3f37c9;
                --accent-color: #4895ef;
                --success-color: #4cc9f0;
                --text-color: #2b2d42;
                --text-muted: #6c757d;
                --background-color: #f8f9fa;
                --white: #ffffff;
            }
            
            /* Base styles */
            body {
                background-color: var(--background-color);
                color: var(--text-color);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            /* Sidebar styles */
            .sidebar {
                height: 100vh;
                position: fixed;
                padding: 2rem;
                background: linear-gradient(180deg, var(--primary-color), var(--secondary-color));
            }
            
            .sidebar .nav-link {
                color: rgba(255, 255, 255, 0.8);
                border-radius: 10px;
                margin-bottom: 0.5rem;
                transition: all 0.2s;
            }
            
            .sidebar .nav-link:hover {
                color: var(--white);
                background-color: rgba(255, 255, 255, 0.1);
            }
            
            .sidebar .nav-link.active {
                color: var(--white);
                background-color: rgba(255, 255, 255, 0.2);
            }
            
            /* Control panel styles */
            .control-panel {
                background-color: var(--white);
                border-radius: 8px;
                padding: 1.5rem;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            
            .control-panel label {
                color: var(--text-color);
                font-size: 0.95rem;
                font-weight: 500;
            }
            
            .control-panel .help-text {
                color: var(--text-muted);
                font-size: 0.85rem;
                margin-top: 0.5rem;
            }
            
            /* Tab styling */
            .nav-tabs {
                border-bottom: 2px solid #e9ecef;
                margin-bottom: 1rem;
            }
            
            .nav-tabs .nav-link {
                border: none;
                color: var(--text-muted);
                padding: 0.75rem 1.5rem;
                font-weight: 500;
                transition: all 0.2s ease;
                position: relative;
            }
            
            .nav-tabs .nav-link:hover {
                color: var(--primary-color);
                border: none;
                background: transparent;
            }
            
            .nav-tabs .nav-link.active {
                color: var(--primary-color);
                border: none;
                background: transparent;
                font-weight: 600;
            }
            
            .nav-tabs .nav-link.active::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                width: 100%;
                height: 2px;
                background-color: var(--primary-color);
            }
            
            /* Chart type selector */
            .chart-type-selector .form-check {
                padding: 0.75rem 1rem;
                margin: 0.25rem;
                border-radius: 8px;
                background-color: var(--background-color);
                transition: all 0.2s ease;
                cursor: pointer;
            }
            
            .chart-type-selector .form-check:hover {
                background-color: #e9ecef;
                transform: translateY(-1px);
            }
            
            .chart-type-selector .form-check-label {
                color: var(--text-color);
            }
            
            .chart-type-selector .form-check-input:checked + .form-check-label {
                color: var(--primary-color);
                font-weight: 600;
            }
            
            /* Dropdown styling */
            .Select-control {
                border-radius: 6px;
                border: 1px solid #e9ecef;
            }
            
            .Select-control:hover {
                border-color: var(--primary-color);
            }
            
            .Select-value-label {
                color: var(--text-color);
            }
            
            .Select-placeholder {
                color: var(--text-muted);
            }
            
            /* Card styling */
            .card {
                border: none;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            
            .card-header {
                background-color: var(--white);
                border-bottom: 1px solid #e9ecef;
                color: var(--text-color);
            }
            
            /* Info icon */
            .info-icon {
                color: var(--text-muted);
            }
            
            /* Switch styling */
            .custom-switch .custom-control-label::before {
                background-color: #e9ecef;
            }
            
            .custom-switch .custom-control-input:checked ~ .custom-control-label::before {
                background-color: var(--primary-color);
            }
        </style>
    </head>
    <body>
        {%app_entry%}
        <footer>
            {%config%}
            {%scripts%}
            {%renderer%}
        </footer>
    </body>
</html>
'''

if __name__ == '__main__':
    app.run_server(debug=True)