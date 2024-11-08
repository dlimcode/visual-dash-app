# pages/music_happiness.py
import dash
from dash import html, dcc, callback, Input, Output
import dash_bootstrap_components as dbc
import plotly.express as px
import plotly.graph_objects as go
import numpy as np
import pandas as pd
from scipy.stats import pearsonr

df = pd.read_csv('data/combined_data.csv')

def create_correlation_heatmap(df):
    music_features = ['valence', 'energy', 'danceability', 'tempo']
    well_being = ['Life Ladder', 'Average MHQ Score']
    
    corr_matrix = np.zeros((len(music_features), len(well_being)))
    
    for i, music_feat in enumerate(music_features):
        for j, well_feat in enumerate(well_being):
            corr, _ = pearsonr(df[music_feat], df[well_feat])
            corr_matrix[i, j] = corr
    
    fig = go.Figure(data=go.Heatmap(
        z=corr_matrix,
        x=well_being,
        y=music_features,
        colorscale='RdBu',
        zmid=0,
        text=np.round(corr_matrix, 2),
        texttemplate='%{text}',
        textfont={"size": 12},
        colorbar=dict(title='Correlation')
    ))
    
    fig.update_layout(
        title='Music Features vs Well-being Correlations',
        height=400,
        margin=dict(t=50, l=0, r=0, b=0)
    )
    
    return fig

def create_scatter_plot(df):
    fig = px.scatter(
        df,
        x='valence',
        y='Life Ladder',
        color='region',
        size='Average MHQ Score',
        hover_data=['Country', 'track_genre'],
        trendline="ols",
        title='Music Valence vs Happiness Score'
    )
    
    fig.update_layout(
        height=500,
        margin=dict(t=50, l=0, r=0, b=0)
    )
    
    return fig

def create_regional_music_box(df):
    fig = go.Figure()
    
    for feature in ['valence', 'energy', 'danceability']:
        fig.add_trace(go.Box(
            y=df[feature],
            x=df['region'],
            name=feature.capitalize(),
            boxpoints='outliers'
        ))
    
    fig.update_layout(
        title='Distribution of Music Features by Region',
        xaxis_title='Region',
        yaxis_title='Feature Value',
        height=500,
        boxmode='group',
        margin=dict(t=50, l=0, r=0, b=0)
    )
    
    return fig

def create_layout(df):
    return dbc.Container([
        dbc.Row([
            dbc.Col([
                html.H2("Music & Happiness Connection", className="mb-4"),
                html.P(
                    "Discover how musical preferences relate to happiness and mental well-being across cultures.",
                    className="lead mb-4"
                )
            ])
        ]),
        
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H4("Key Relationships", className="mb-0"),
                    ]),
                    dbc.CardBody([
                        dcc.Graph(figure=create_correlation_heatmap(df)),
                        html.Div([
                            html.I(className="fas fa-info-circle me-2"),
                            "Hover over the cells to see exact correlation values"
                        ], className="text-muted mt-2")
                    ])
                ])
            ], width=12)
        ], className="mb-4"),
        
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H4("Happiness vs Music Valence", className="mb-0"),
                        dbc.Button(
                            "About this chart",
                            id="valence-info-button",
                            color="link",
                            size="sm",
                            className="float-end"
                        )
                    ]),
                    dbc.CardBody([
                        dcc.Graph(
                            id='scatter-plot',
                            figure=create_scatter_plot(df)
                        )
                    ])
                ]),
                dbc.Modal([
                    dbc.ModalHeader("About Music Valence"),
                    dbc.ModalBody([
                        html.P(
                            "Music valence represents the musical positiveness conveyed by a track. "
                            "Tracks with high valence sound more positive (happy, cheerful, euphoric), "
                            "while tracks with low valence sound more negative (sad, depressed, angry)."
                        ),
                        html.P(
                            "The size of each point represents the country's average MHQ score, "
                            "and the line shows the overall trend."
                        )
                    ])
                ], id="valence-info-modal", is_open=False)
            ], width=12, className="mb-4")
        ]),
        
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Regional Music Characteristics"),
                    dbc.CardBody([
                        dcc.Graph(figure=create_regional_music_box(df)),
                        html.Div([
                            html.I(className="fas fa-lightbulb me-2"),
                            "Click on features in the legend to show/hide them"
                        ], className="text-muted mt-2")
                    ])
                ])
            ], width=12)
        ], className="mb-4"),
        
        dbc.Row([
            dbc.Col([
                dbc.Button(
                    [
                        html.I(className="fas fa-arrow-right me-2"),
                        "Continue to MHQ Analysis"
                    ],
                    href="/mhq-analysis",
                    color="primary",
                    className="float-end"
                )
            ], width=12)
        ])
    ])

@callback(
    Output("valence-info-modal", "is_open"),
    Input("valence-info-button", "n_clicks"),
    prevent_initial_call=True,
)
def toggle_modal(n_clicks):
    return True