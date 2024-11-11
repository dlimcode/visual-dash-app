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
            name=country,
            hovertemplate=(
                "<b>" + country + "</b><br>" +
                "%{theta}: %{r:.1f}<br>" +
                "<extra></extra>"
            )
        ))
    
    fig.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 100],
                gridcolor='rgba(0,0,0,0.1)',
                tickfont=dict(size=10)
            ),
            angularaxis=dict(
                gridcolor='rgba(0,0,0,0.1)',
                tickfont=dict(size=10)
            )
        ),
        showlegend=True,
        legend=dict(
            orientation='h',
            yanchor='bottom',
            y=1.02,
            xanchor='right',
            x=1
        ),
        height=500,
        margin=dict(t=50, l=20, r=20, b=20),
        paper_bgcolor='white'
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
            hovertemplate=(
                "<b>%{x}</b><br>" +
                f"{category}: " + "%{y:.1f}%<br>" +
                "<extra></extra>"
            )
        ))
    
    fig.update_layout(
        barmode='stack',
        title=dict(
            text='MHQ Categories Distribution by Region',
            font=dict(size=24)
        ),
        height=500,
        margin=dict(t=50, l=0, r=0, b=0),
        plot_bgcolor='white',
        paper_bgcolor='white',
        xaxis=dict(
            title='Region',
            tickangle=45,
            gridcolor='rgba(0,0,0,0.1)'
        ),
        yaxis=dict(
            title='Percentage',
            gridcolor='rgba(0,0,0,0.1)',
            tickformat=',.0%'
        ),
        legend=dict(
            orientation='h',
            yanchor='bottom',
            y=1.02,
            xanchor='right',
            x=1
        ),
        hoverlabel=dict(
            bgcolor='white'
        )
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
                        html.H4("MHQ Dimensions Comparison", className="mb-0"),
                        dbc.Button(
                            html.I(className="fas fa-info-circle"),
                            id="radar-info-button",
                            color="link",
                            size="sm",
                            className="float-end"
                        )
                    ]),
                    dbc.CardBody([
                        html.P("Select countries to compare:", className="mb-2"),
                        dcc.Dropdown(
                            id='country-selector',
                            options=[
                                {'label': country, 'value': country} 
                                for country in sorted(df['Country'].unique())
                            ],
                            value=df['Country'].unique()[:3].tolist(),
                            multi=True,
                            className="mb-3"
                        ),
                        dcc.Graph(
                            id='radar-chart',
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
                        html.H4("Mental Health Categories by Region", className="mb-0"),
                        dbc.Button(
                            html.I(className="fas fa-info-circle"),
                            id="distribution-info-button",
                            color="link",
                            size="sm",
                            className="float-end"
                        )
                    ]),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=create_mhq_distribution(df),
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
                        "Continue to Demographics"
                    ],
                    href="/demographics",
                    color="primary",
                    className="float-end"
                )
            ], width=12)
        ]),
        
        # Add modals
        dbc.Modal([
            dbc.ModalHeader("About MHQ Dimensions"),
            dbc.ModalBody([
                html.P(
                    "The radar chart shows different dimensions of mental health for selected countries. "
                    "Each axis represents a different aspect of mental well-being, allowing for easy "
                    "comparison across multiple dimensions."
                ),
                html.P("Dimensions Explained:", className="mt-3 mb-2 fw-bold"),
                html.Ul([
                    html.Li("Cognition: Mental clarity, focus, and decision-making"),
                    html.Li("Adaptability: Ability to cope with change and stress"),
                    html.Li("Drive: Motivation and goal-oriented behavior"),
                    html.Li("Mood: Emotional state and stability"),
                    html.Li("Social Self: Interpersonal relationships and social comfort"),
                    html.Li("Mind-Body: Physical and mental health connection")
                ])
            ])
        ], id="radar-info-modal", is_open=False),
        
        dbc.Modal([
            dbc.ModalHeader("About MHQ Categories"),
            dbc.ModalBody([
                html.P(
                    "This stacked bar chart shows the distribution of mental health categories "
                    "across different regions. Each category represents a different level of "
                    "mental well-being."
                ),
                html.P("Categories Explained:", className="mt-3 mb-2 fw-bold"),
                html.Ul([
                    html.Li("Thriving: Excellent mental health (85-100)"),
                    html.Li("Succeeding: Good mental health (70-84)"),
                    html.Li("Managing: Moderate mental health (55-69)"),
                    html.Li("Enduring: Below average mental health (40-54)"),
                    html.Li("Struggling: Poor mental health (25-39)"),
                    html.Li("Distressed: Very poor mental health (0-24)")
                ])
            ])
        ], id="distribution-info-modal", is_open=False)
    ])

# Add callbacks
@callback(
    Output("radar-info-modal", "is_open"),
    Input("radar-info-button", "n_clicks"),
    prevent_initial_call=True
)
def toggle_radar_modal(n_clicks):
    return True

@callback(
    Output("distribution-info-modal", "is_open"),
    Input("distribution-info-button", "n_clicks"),
    prevent_initial_call=True
)
def toggle_distribution_modal(n_clicks):
    return True

@callback(
    Output('radar-chart', 'figure'),
    Input('country-selector', 'value')
)
def update_radar_chart(selected_countries):
    return create_radar_chart(df, selected_countries)