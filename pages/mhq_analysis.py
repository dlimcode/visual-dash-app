# pages/mhq_analysis.py
import dash
from dash import html, dcc, callback, Input, Output
import dash_bootstrap_components as dbc
import plotly.graph_objects as go
import pandas as pd

df = pd.read_csv('data/combined_data.csv')

def create_radar_chart(df, selected_countries):
    dimensions = [
        'Average Cognition Score',
        'Average Adaptability & Resilence Score',
        'Average Drive & Motivation Score',
        'Average Mood & Outlook Score',
        'Average Social Self Score',
        'Average Mind-Body Connection Score'
    ]
    
    fig = go.Figure()
    
    for country in selected_countries:
        country_data = df[df['Country'] == country]
        fig.add_trace(go.Scatterpolar(
            r=[country_data[dim].iloc[0] for dim in dimensions],
            theta=[dim.replace('Average ', '').replace(' Score', '') 
                   for dim in dimensions],
            fill='toself',
            name=country
        ))
    
    fig.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 100]
            )),
        showlegend=True,
        height=500
    )
    
    return fig

def create_mhq_distribution(df):
    categories = ['% Distressed', '% Struggling', '% Enduring',
                 '% Managing', '% Succeeding', '% Thriving']
    
    fig = go.Figure()
    
    for category in categories:
        fig.add_trace(go.Bar(
            name=category.replace('%', '').strip(),
            x=df['region'],
            y=df.groupby('region')[category].mean(),
            text=df.groupby('region')[category].mean().round(1),
            textposition='auto',
        ))
    
    fig.update_layout(
        barmode='stack',
        title='MHQ Categories Distribution by Region',
        height=500,
        margin=dict(t=50, l=0, r=0, b=0)
    )
    
    return fig

def create_layout(df):
    return dbc.Container([
        dbc.Row([
            dbc.Col([
                html.H2("Mental Health Quotient Analysis", className="mb-4"),
                html.P(
                    "Explore the different dimensions of mental health and their relationships with music.",
                    className="lead mb-4"
                )
            ])
        ]),
        
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H4("MHQ Dimensions Comparison", className="mb-0")
                    ]),
                    dbc.CardBody([
                        html.P("Select countries to compare:"),
                        dcc.Dropdown(
                            id='country-selector',
                            options=[{'label': country, 'value': country} 
                                   for country in df['Country'].unique()],
                            value=df['Country'].unique()[:3].tolist(),
                            multi=True
                        ),
                        dcc.Graph(id='radar-chart')
                    ])
                ])
            ], width=12, className="mb-4")
        ]),
        
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Mental Health Categories by Region"),
                    dbc.CardBody([
                        dcc.Graph(figure=create_mhq_distribution(df))
                    ])
                ])
            ], width=12, className="mb-4")
        ]),
        
        dbc.Row([
            dbc.Col([
                dbc.Button(
                    [
                        html.I(className="fas fa-arrow-right me-2"),
                        "Continue to Demographics"
                    ],
                    href="/demographics",
                    color="primary",
                    className="float-end"
                )
            ], width=12)
        ])
    ])

@callback(
    Output('radar-chart', 'figure'),
    Input('country-selector', 'value')
)
def update_radar_chart(selected_countries):
    return create_radar_chart(df, selected_countries)