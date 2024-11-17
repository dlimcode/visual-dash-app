from utils.test_utils import run_test
from visualizations.integrated_insights import IntegratedVisualizer

@run_test
def test_visualizations(df):
    visualizer = IntegratedVisualizer(df)
    dashboard = visualizer.create_demographic_insight_dashboard()
    
    assert 'music_wellbeing' in dashboard
    assert 'age_patterns' in dashboard
    assert 'singapore_comparison' in dashboard
    
    print("\nKey Visualization Insights:")
    print("1. Created music-wellbeing correlation heatmap")
    print("2. Generated age-music pattern trends")
    print("3. Produced Singapore comparison dashboard")
    
    return dashboard

if __name__ == "__main__":
    print("Running visualization tests...")
    dashboard = test_visualizations() 