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
            corr, p_value = pearsonr(df[music_feat], df[well_feat])
            corr_matrix[i, j] = corr
    
    fig = go.Figure(data=go.Heatmap(
        z=corr_matrix,
        x=well_being,
        y=music_features,
        colorscale='RdBu',
        zmid=0,
        text=np.round(corr_matrix, 2),
        texttemplate='%{text}',
        textfont={"size": 12, "color": "white"},
        hoverongaps=False,
        hovertemplate=(
            "<b>Music Feature:</b> %{y}<br>" +
            "<b>Well-being Measure:</b> %{x}<br>" +
            "<b>Correlation:</b> %{text}<br>" +
            "<extra></extra>"
        )
    ))
    
    fig.update_layout(
        title=dict(
            text='Music Features vs Well-being Correlations',
            font=dict(size=24)
        ),
        height=400,
        margin=dict(t=50, l=0, r=0, b=0),
        plot_bgcolor='white',
        paper_bgcolor='white'
    )
    
    return fig

def create_scatter_plot(df, selected_regions=None):
    if selected_regions is None:
        selected_regions = df['region'].unique()
        
    filtered_df = df[df['region'].isin(selected_regions)]
    
    fig = px.scatter(
        filtered_df,
        x='valence',
        y='Life Ladder',
        color='region',
        size='Average MHQ Score',
        hover_data=['Country', 'track_genre'],
        trendline="ols",
        title='Music Valence vs Happiness Score'
    )
    
    fig.update_traces(
        marker=dict(
            line=dict(width=1, color='white')
        ),
        hovertemplate=(
            "<b>%{customdata[0]}</b><br>" +
            "Region: %{customdata[1]}<br>" +
            "Genre: %{customdata[2]}<br>" +
            "Valence: %{x:.2f}<br>" +
            "Happiness: %{y:.2f}<br>" +
            "MHQ Score: %{marker.size:.1f}<br>" +
            "<extra></extra>"
        )
    )
    
    fig.update_layout(
        height=500,
        margin=dict(t=50, l=0, r=0, b=0),
        plot_bgcolor='white',
        paper_bgcolor='white',
        xaxis=dict(
            title='Music Valence',
            gridcolor='rgba(0,0,0,0.1)',
            zerolinecolor='rgba(0,0,0,0.2)'
        ),
        yaxis=dict(
            title='Life Satisfaction Score',
            gridcolor='rgba(0,0,0,0.1)',
            zerolinecolor='rgba(0,0,0,0.2)'
        ),
        legend=dict(
            orientation='h',
            yanchor='bottom',
            y=1.02,
            xanchor='right',
            x=1
        )
    )
    
    return fig

def create_regional_music_box(df, selected_features=None):
    if selected_features is None:
        selected_features = ['valence', 'energy', 'danceability']
        
    fig = go.Figure()
    
    for feature in selected_features:
        fig.add_trace(go.Box(
            y=df[feature],
            x=df['region'],
            name=feature.capitalize(),
            boxpoints='outliers',
            marker=dict(size=4, opacity=0.5),
            line=dict(width=2),
            hovertemplate=(
                "<b>%{x}</b><br>" +
                f"{feature.capitalize()}<br>" +
                "Median: %{median:.2f}<br>" +
                "Q1: %{q1:.2f}<br>" +
                "Q3: %{q3:.2f}<br>" +
                "<extra></extra>"
            )
        ))
    
    fig.update_layout(
        title=dict(
            text='Distribution of Music Features by Region',
            font=dict(size=24)
        ),
        xaxis_title='Region',
        yaxis_title='Feature Value',
        height=500,
        boxmode='group',
        margin=dict(t=50, l=0, r=0, b=0),
        plot_bgcolor='white',
        paper_bgcolor='white',
        xaxis=dict(
            tickangle=45,
            gridcolor='rgba(0,0,0,0.1)'
        ),
        yaxis=dict(
            gridcolor='rgba(0,0,0,0.1)',
            zerolinecolor='rgba(0,0,0,0.2)'
        ),
        legend=dict(
            orientation='h',
            yanchor='bottom',
            y=1.02,
            xanchor='right',
            x=1
        )
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
                        dbc.Button(
                            html.I(className="fas fa-info-circle"),
                            id="correlation-info-button",
                            color="link",
                            size="sm",
                            className="float-end"
                        )
                    ]),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=create_correlation_heatmap(df),
                            config={'displayModeBar': False}
                        ),
                        html.Div([
                            html.I(className="fas fa-info-circle me-2"),
                            "Hover over the cells to see exact correlation values"
                        ], className="text-muted mt-2")
                    ])
                ], className="shadow-sm")
            ], width=12, className="mb-4")
        ]),
        
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H4("Happiness vs Music Valence", className="mb-0 d-inline-block"),
                        dbc.Button(
                            html.I(className="fas fa-info-circle"),
                            id="scatter-info-button",
                            color="link",
                            size="sm",
                            className="float-end"
                        )
                    ]),
                    dbc.CardBody([
                        dbc.Row([
                            dbc.Col([
                                html.Label("Select Regions:", className="mb-2"),
                                dcc.Dropdown(
                                    id='region-selector',
                                    options=[
                                        {'label': region, 'value': region}
                                        for region in sorted(df['region'].unique())
                                    ],
                                    value=df['region'].unique().tolist(),
                                    multi=True,
                                    className="mb-3"
                                )
                            ], width=12)
                        ]),
                        dcc.Graph(
                            id='scatter-plot',
                            config={'displayModeBar': False}
                        )
                    ])
                ], className="shadow-sm")
            ], width=12, className="mb-4")
        ]),
        
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H4("Regional Music Characteristics", className="mb-0"),
                        dbc.Button(
                            html.I(className="fas fa-info-circle"),
                            id="boxplot-info-button",
                            color="link",
                            size="sm",
                            className="float-end"
                        )
                    ]),
                    dbc.CardBody([
                        dbc.Row([
                            dbc.Col([
                                html.Label("Select Features:", className="mb-2"),
                                dcc.Dropdown(
                                    id='feature-selector',
                                    options=[
                                        {'label': feat.capitalize(), 'value': feat}
                                        for feat in ['valence', 'energy', 'danceability', 'tempo']
                                    ],
                                    value=['valence', 'energy', 'danceability'],
                                    multi=True,
                                    className="mb-3"
                                )
                            ], width=12)
                        ]),
                        dcc.Graph(
                            id='boxplot',
                            config={'displayModeBar': False}
                        )
                    ])
                ], className="shadow-sm")
            ], width=12, className="mb-4")
        ]),
        
        # Add modals
        dbc.Modal([
            dbc.ModalHeader("About Correlation Analysis"),
            dbc.ModalBody([
                html.P(
                    "This heatmap shows the correlation between musical features and well-being measures. "
                    "Positive correlations (blue) indicate that as one variable increases, the other tends "
                    "to increase as well. Negative correlations (red) indicate an inverse relationship."
                ),
                html.P("Key Features:", className="mt-3 mb-2 fw-bold"),
                html.Ul([
                    html.Li("Valence: Musical positiveness"),
                    html.Li("Energy: Intensity and activity"),
                    html.Li("Danceability: How suitable for dancing"),
                    html.Li("Tempo: Speed of the music")
                ])
            ])
        ], id="correlation-info-modal", is_open=False),
        
        dbc.Modal([
            dbc.ModalHeader("About Scatter Plot"),
            dbc.ModalBody([
                html.P(
                    "This scatter plot shows the relationship between music valence (musical positiveness) "
                    "and life satisfaction scores. Each point represents a country, with the size indicating "
                    "the average MHQ score."
                ),
                html.P(
                    "The trend line shows the overall relationship, while different colors represent "
                    "different regions, allowing for comparison of patterns across geographical areas."
                )
            ])
        ], id="scatter-info-modal", is_open=False),
        
        dbc.Modal([
            dbc.ModalHeader("About Box Plots"),
            dbc.ModalBody([
                html.P(
                    "These box plots show the distribution of musical features across different regions. "
                    "They provide insight into how musical preferences vary geographically."
                ),
                html.P("How to read the plot:", className="mt-3 mb-2 fw-bold"),
                html.Ul([
                    html.Li("Box: Shows the interquartile range (IQR)"),
                    html.Li("Line in box: Median value"),
                    html.Li("Whiskers: Extend to most extreme non-outlier points"),
                    html.Li("Points: Individual outliers")
                ])
            ])
        ], id="boxplot-info-modal", is_open=False)
    ])

# Add callbacks
@callback(
    Output("correlation-info-modal", "is_open"),
    Input("correlation-info-button", "n_clicks"),
    prevent_initial_call=True
)
def toggle_correlation_modal(n_clicks):
    return True

@callback(
    Output("scatter-info-modal", "is_open"),
    Input("scatter-info-button", "n_clicks"),
    prevent_initial_call=True
)
def toggle_scatter_modal(n_clicks):
    return True

@callback(
    Output("boxplot-info-modal", "is_open"),
    Input("boxplot-info-button", "n_clicks"),
    prevent_initial_call=True
)
def toggle_boxplot_modal(n_clicks):
    return True

@callback(
    Output('scatter-plot', 'figure'),
    Input('region-selector', 'value')
)
def update_scatter_plot(selected_regions):
    return create_scatter_plot(df, selected_regions)

@callback(
    Output('boxplot', 'figure'),
    Input('feature-selector', 'value')
)
def update_boxplot(selected_features):
    return create_regional_music_box(df, selected_features)