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
            mode='lines+markers'
        ))
    
    fig.update_layout(
        title='MHQ Scores Across Age Groups by Region',
        xaxis_title='Age Group',
        yaxis_title='Average MHQ Score',
        height=500,
        margin=dict(t=50, l=0, r=0, b=0)
    )
    
    return fig

def create_education_impact(df):
    education_cols = [
        'Primary Education', 'Some High School', 'High School',
        "Associate’s Degree", 'Vocational certification',
        "Bachelor's Degree", "Master's Degree", 'PhD or Doctorate'
    ]
    
    fig = go.Figure(data=[
        go.Box(
            y=df[col],
            name=col.replace(' Education', ''),
            boxpoints='outliers'
        ) for col in education_cols
    ])
    
    fig.update_layout(
        title='MHQ Scores by Education Level',
        yaxis_title='MHQ Score',
        height=500,
        margin=dict(t=50, l=0, r=0, b=0)
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
                    dbc.CardHeader("Age Group Analysis"),
                    dbc.CardBody([
                        dcc.Graph(figure=create_age_analysis(df))
                    ])
                ])
            ], width=12, className="mb-4")
        ]),
        
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Education Level Impact"),
                    dbc.CardBody([
                        dcc.Graph(figure=create_education_impact(df))
                    ])
                ])
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
        ])
    ])