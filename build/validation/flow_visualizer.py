import graphviz
from typing import Dict, List

class AnalysisFlowVisualizer:
    def __init__(self):
        self.dot = graphviz.Digraph(comment='Analysis Data Flow')
        self.dot.attr(rankdir='LR')

    def generate_flow_diagram(self) -> None:
        """Generate complete analysis flow diagram"""
        # Data sources
        self.dot.node('data_sources', 'Data Sources')
        self.dot.node('happiness_data', 'World Happiness Report')
        self.dot.node('mental_data', 'Mental State Report')
        self.dot.node('music_data', 'Spotify Features')

        # Analysis components
        self.dot.node('foundation', 'Foundation Analysis')
        self.dot.node('relationships', 'Core Relationships')
        self.dot.node('singapore', 'Singapore Focus')
        self.dot.node('recommendations', 'Recommendations')

        # Connect nodes
        for source in ['happiness_data', 'mental_data', 'music_data']:
            self.dot.edge('data_sources', source)
            self.dot.edge(source, 'foundation')
        
        self.dot.edge('foundation', 'relationships')
        self.dot.edge('relationships', 'singapore')
        self.dot.edge('singapore', 'recommendations')

    def save_diagram(self, filename: str = 'analysis_flow') -> None:
        """Save the flow diagram"""
        self.dot.render(filename, view=True) 