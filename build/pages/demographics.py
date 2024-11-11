import dash
from dash import html, dcc, callback, Input, Output, State
import dash_bootstrap_components as dbc
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from scipy.stats import pearsonr

# pages/demographics.py
def create_age_analysis(df):
    age_columns = ['18-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75+']
    
    fig = go.Figure()
    
    for region in df['region'].unique():
        region_data = df[df['region'] == region]
        fig.add_trace(go.Scatter(
            x=age_columns,
            y=region_data[age_columns].mean(),
            name=region,
            mode='lines+markers',
            line=dict(width=3),
            marker=dict(
                size=8,
                line=dict(width=2, color='white')
            ),
            hovertemplate=(
                "<b>%{x}</b><br>" +
                "Region: " + region + "<br>" +
                "MHQ Score: %{y:.1f}<br>" +
                "<extra></extra>"
            )
        ))
    
    fig.update_layout(
        title=dict(
            text='MHQ Scores Across Age Groups by Region',
            font=dict(size=24)
        ),
        xaxis=dict(
            title='Age Group',
            tickfont=dict(size=12),
            gridcolor='rgba(0,0,0,0.1)'
        ),
        yaxis=dict(
            title='Average MHQ Score',
            tickfont=dict(size=12),
            gridcolor='rgba(0,0,0,0.1)'
        ),
        height=500,
        margin=dict(t=50, l=0, r=0, b=0),
        hovermode='x unified',
        plot_bgcolor='white',
        legend=dict(
            orientation='h',
            yanchor='bottom',
            y=1.02,
            xanchor='right',
            x=1
        )
    )
    
    return fig

def create_education_impact(df):
    education_cols = [
        'Primary Education', 'Some High School', 'High School',
        "Associate's Degree", 'Vocational certification',
        "Bachelor's Degree", "Master's Degree", 'PhD or Doctorate'
    ]
    
    fig = go.Figure()
    
    for col in education_cols:
        fig.add_trace(go.Box(
            y=df[col],
            name=col.replace(' Education', ''),
            boxpoints='outliers',
            marker=dict(
                size=4,
                opacity=0.5
            ),
            line=dict(width=2),
            hovertemplate=(
                "<b>%{x}</b><br>" +
                "Median: %{median:.1f}<br>" +
                "Q1: %{q1:.1f}<br>" +
                "Q3: %{q3:.1f}<br>" +
                "<extra></extra>"
            )
        ))
    
    fig.update_layout(
        title=dict(
            text='MHQ Scores by Education Level',
            font=dict(size=24)
        ),
        yaxis=dict(
            title='MHQ Score',
            tickfont=dict(size=12),
            gridcolor='rgba(0,0,0,0.1)'
        ),
        height=500,
        margin=dict(t=50, l=0, r=0, b=0),
        plot_bgcolor='white',
        showlegend=False,
        xaxis=dict(
            tickangle=45,
            tickfont=dict(size=10)
        )
    )
    
    return fig

def create_layout(df):
    return dbc.Container([
        dbc.Row([
            dbc.Col([
                html.H2("Demographic Analysis", className="mb-4"),
                html.P(
                    "Understanding how age, education, and employment status "
                    "influence mental well-being and musical preferences.",
                    className="lead mb-4"
                )
            ])
        ]),
        
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H4("Age Group Analysis", className="mb-0"),
                        dbc.Button(
                            html.I(className="fas fa-info-circle"),
                            id="age-info-button",
                            color="link",
                            size="sm",
                            className="float-end"
                        )
                    ]),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=create_age_analysis(df),
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
                        html.H4("Education Level Impact", className="mb-0"),
                        dbc.Button(
                            html.I(className="fas fa-info-circle"),
                            id="education-info-button",
                            color="link",
                            size="sm",
                            className="float-end"
                        )
                    ]),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=create_education_impact(df),
                            config={'displayModeBar': False}
                        )
                    ])
                ], className="shadow-sm")
            ], width=12, className="mb-4")
        ]),
        
        dbc.Row([
            dbc.Col([
                dbc.Button(
                    [
                        html.I(className="fas fa-arrow-right me-2"),
                        "Continue to Exploration"
                    ],
                    href="/explore",
                    color="primary",
                    className="float-end"
                )
            ], width=12)
        ]),
        
        # Add modals for additional information
        dbc.Modal([
            dbc.ModalHeader("About Age Group Analysis"),
            dbc.ModalBody([
                html.P(
                    "This visualization shows how Mental Health Quotient (MHQ) "
                    "scores vary across different age groups and regions. The lines "
                    "represent the average MHQ score for each region, allowing for "
                    "easy comparison of age-related trends across different geographical areas."
                ),
                html.P(
                    "Key observations:",
                    className="mt-3 mb-2 fw-bold"
                ),
                html.Ul([
                    html.Li("MHQ scores tend to improve with age across most regions"),
                    html.Li("Different regions show distinct patterns of age-related changes"),
                    html.Li("The 65-74 age group often shows the highest MHQ scores")
                ])
            ])
        ], id="age-info-modal", is_open=False),
        
        dbc.Modal([
            dbc.ModalHeader("About Education Level Impact"),
            dbc.ModalBody([
                html.P(
                    "This box plot visualization shows the distribution of MHQ scores "
                    "across different education levels. The boxes show the quartiles "
                    "of the distribution, while the whiskers extend to show the rest "
                    "of the distribution."
                ),
                html.P(
                    "How to read the plot:",
                    className="mt-3 mb-2 fw-bold"
                ),
                html.Ul([
                    html.Li("The box represents the interquartile range (IQR)"),
                    html.Li("The line in the box is the median"),
                    html.Li("Points outside the whiskers are potential outliers"),
                    html.Li("Wider boxes indicate more variability in the scores")
                ])
            ])
        ], id="education-info-modal", is_open=False)
    ])

# Add callbacks for modals
@callback(
    Output("age-info-modal", "is_open"),
    Input("age-info-button", "n_clicks"),
    prevent_initial_call=True
)
def toggle_age_modal(n_clicks):
    return True

@callback(
    Output("education-info-modal", "is_open"),
    Input("education-info-button", "n_clicks"),
    prevent_initial_call=True
)
def toggle_education_modal(n_clicks):
    return True