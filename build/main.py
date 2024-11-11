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

# Helper function for progress bar
def create_progress_indicator(current_step, total_steps=4):
    return dbc.Progress(
        value=(current_step / total_steps) * 100,
        className="mb-3",
        style={"height": "4px"},
        color="primary",
        animated=True,
        striped=True
    )

# Navigation sidebar
sidebar = html.Div(
    [
        html.Div(
            [
                html.I(className="fas fa-brain fa-2x mb-3 text-white"),
                html.H4("Navigation", className="text-white mb-3"),
            ],
            className="sidebar-header",
        ),
        dbc.Nav(
            [
                dbc.NavLink(
                    [html.I(className="fas fa-home me-2"), "Introduction"],
                    href="/",
                    id="intro-link",
                    className="nav-link-custom"
                ),
                dbc.NavLink(
                    [html.I(className="fas fa-music me-2"), "Music & Happiness"],
                    href="/music-happiness",
                    id="music-happiness-link",
                    className="nav-link-custom"
                ),
                dbc.NavLink(
                    [html.I(className="fas fa-chart-line me-2"), "MHQ Analysis"],
                    href="/mhq-analysis",
                    id="mhq-link",
                    className="nav-link-custom"
                ),
                dbc.NavLink(
                    [html.I(className="fas fa-users me-2"), "Demographics"],
                    href="/demographics",
                    id="demographics-link",
                    className="nav-link-custom"
                ),
                dbc.NavLink(
                    [html.I(className="fas fa-globe me-2"), "Explore"],
                    href="/explore",
                    id="explore-link",
                    className="nav-link-custom"
                ),
            ],
            vertical=True,
            pills=True,
            className="nav-pills-custom"
        ),
        html.Div(
            [
                html.Hr(className="sidebar-hr"),
                html.P(
                    "Music & Well-being Dashboard",
                    className="text-center text-white-50 small"
                )
            ],
            className="sidebar-footer"
        )
    ],
    className="sidebar"
)

# Introduction page
intro_layout = dbc.Container([
    dbc.Row([
        dbc.Col([
            html.H1(
                "Music, Happiness, and Mental Well-being",
                className="text-center mb-4 display-4 fw-bold"
            ),
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
                html.H4("Global Reach", className="card-title"),
                html.P(
                    f"{len(df['Country'].unique())} Countries Analyzed",
                    className="card-text"
                )
            ], body=True, className="text-center shadow-sm highlight-card")
        ], width=12, md=4, className="mb-4"),
        
        dbc.Col([
            dbc.Card([
                html.I(className="fas fa-brain fa-3x text-success mb-3"),
                html.H4("Mental Well-being", className="card-title"),
                html.P(
                    "6 MHQ Dimensions Explored",
                    className="card-text"
                )
            ], body=True, className="text-center shadow-sm highlight-card")
        ], width=12, md=4, className="mb-4"),
        
        dbc.Col([
            dbc.Card([
                html.I(className="fas fa-music fa-3x text-info mb-3"),
                html.H4("Music Features", className="card-title"),
                html.P(
                    "8 Musical Attributes Analyzed",
                    className="card-text"
                )
            ], body=True, className="text-center shadow-sm highlight-card")
        ], width=12, md=4, className="mb-4"),
    ], className="mb-5"),
    
    dbc.Row([
        dbc.Col([
            html.H3("Key Insights", className="mb-4"),
            dbc.Card([
                dbc.CardBody([
                    html.H5(
                        "Musical Happiness Connection",
                        className="card-title"
                    ),
                    html.P(
                        "Discover how musical preferences correlate with happiness "
                        "levels across different cultures.",
                        className="card-text"
                    ),
                    dbc.Button(
                        [
                            html.I(className="fas fa-chart-line me-2"),
                            "Explore Music & Happiness"
                        ],
                        href="/music-happiness",
                        color="primary",
                        className="mt-3"
                    )
                ])
            ], className="mb-4 shadow-sm hover-card"),
            
            dbc.Card([
                dbc.CardBody([
                    html.H5(
                        "Mental Well-being Patterns",
                        className="card-title"
                    ),
                    html.P(
                        "Explore how different aspects of mental health relate to "
                        "musical preferences and cultural factors.",
                        className="card-text"
                    ),
                    dbc.Button(
                        [
                            html.I(className="fas fa-brain me-2"),
                            "Explore MHQ Analysis"
                        ],
                        href="/mhq-analysis",
                        color="success",
                        className="mt-3"
                    )
                ])
            ], className="mb-4 shadow-sm hover-card"),
            
            dbc.Card([
                dbc.CardBody([
                    html.H5(
                        "Demographic Influences",
                        className="card-title"
                    ),
                    html.P(
                        "Understand how age, employment, and education affect "
                        "musical preferences and well-being.",
                        className="card-text"
                    ),
                    dbc.Button(
                        [
                            html.I(className="fas fa-users me-2"),
                            "Explore Demographics"
                        ],
                        href="/demographics",
                        color="info",
                        className="mt-3"
                    )
                ])
            ], className="shadow-sm hover-card"),
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
            className="sidebar-container p-0"
        ),
        dbc.Col(
            [
                dcc.Loading(
                    html.Div(
                        id='page-content',
                        className="content-wrapper"
                    ),
                    type="circle",
                    color="#4361ee"
                )
            ],
            width=10,
            className="content-container p-0"
        )
    ], className="g-0 h-100")
], className="app-wrapper")

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
        return html.Div([
            html.H1(
                "404: Page not found",
                className="text-center text-muted mt-5"
            ),
            html.P(
                "The page you're looking for doesn't exist.",
                className="text-center"
            ),
            dbc.Button(
                [
                    html.I(className="fas fa-home me-2"),
                    "Return Home"
                ],
                href="/",
                color="primary",
                className="d-block mx-auto mt-4"
            )
        ])

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
            
            body {
                background-color: var(--background-color);
                color: var(--text-color);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
            }
            
            /* Sidebar styles */
            .sidebar {
                height: 100vh;
                position: fixed;
                width: inherit;
                padding: 2rem;
                background: linear-gradient(180deg, var(--primary-color), var(--secondary-color));
                box-shadow: 2px 0 5px rgba(0,0,0,0.1);
                overflow-y: auto;
            }
            
            .sidebar-container {
                position: sticky;
                top: 0;
                height: 100vh;
                z-index: 1000;
            }
            
            .content-container {
                height: 100vh;
                overflow-y: auto;
            }
            
            .nav-link-custom {
                color: rgba(255, 255, 255, 0.8) !important;
                border-radius: 10px !important;
                margin-bottom: 0.5rem;
                transition: all 0.2s ease;
            }
            
            .nav-link-custom:hover {
                color: var(--white) !important;
                background-color: rgba(255, 255, 255, 0.1) !important;
                transform: translateX(5px);
            }
            
            .nav-link-custom.active {
                color: var(--white) !important;
                background-color: rgba(255, 255, 255, 0.2) !important;
                font-weight: 500;
            }
            
            /* Card styles */
            .highlight-card {
                transition: all 0.3s ease;
                border: none;
                height: 100%;
            }
            
            .highlight-card:hover {
                transform: translateY(-5px);
            }
            
            .hover-card {
                transition: all 0.3s ease;
                border: none;
            }
            
            .hover-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.1) !important;
            }
            
            /* Progress bar */
            .progress {
                border-radius: 0;
                height: 4px !important;
            }
            
            /* Sidebar footer */
            .sidebar-hr {
                border-color: rgba(255, 255, 255, 0.1);
                margin: 2rem 0;
            }
            
            .sidebar-footer {
                position: absolute;
                bottom: 2rem;
                left: 0;
                right: 0;
                padding: 0 2rem;
            }
            
            /* Loading spinner */
            ._dash-loading {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                z-index: 1000;
            }
            
            /* Custom scrollbar */
            ::-webkit-scrollbar {
                width: 8px;
            }
            
            ::-webkit-scrollbar-track {
                background: #f1f1f1;
            }
            
            ::-webkit-scrollbar-thumb {
                background: var(--text-muted);
                border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background: var(--text-color);
            }
            
            /* Layout fixes */
            .app-wrapper {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }
            
            .content-wrapper {
                padding: 2rem;
                height: 100%;
                overflow-y: auto;
            }
            
            .content-container {
                height: 100vh;
                overflow-y: auto;
            }
            
            /* Update sidebar styles */
            .sidebar {
                height: 100vh;
                position: fixed;
                width: inherit;
                padding: 2rem;
                background: linear-gradient(180deg, var(--primary-color), var(--secondary-color));
                box-shadow: 2px 0 5px rgba(0,0,0,0.1);
                overflow-y: auto;
            }
            
            .sidebar-container {
                position: sticky;
                top: 0;
                height: 100vh;
                z-index: 1000;
            }
            
            /* Loading spinner positioning */
            ._dash-loading {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                z-index: 1000;
            }
            
            /* Adjust container max-width for better readability */
            .container {
                max-width: 1400px !important;
                margin: 0 auto;
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