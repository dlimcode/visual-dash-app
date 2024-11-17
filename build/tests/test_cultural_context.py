from utils.test_utils import run_test
from analysis.singapore_focus.cultural_context import CulturalContextAnalyzer

@run_test
def test_cultural_influences(df):
    analyzer = CulturalContextAnalyzer(df)
    influences = analyzer.analyze_cultural_influences()
    
    print("\nCultural Metrics:")
    for indicator, metrics in influences['cultural_metrics'].items():
        print(f"\n{indicator}:")
        print(f"Singapore: {metrics['singapore']:.3f}")
        print(f"Asia Percentile: {metrics['percentile_asia']:.1f}%")
        print(f"Global Percentile: {metrics['percentile_global']:.1f}%")
    
    print("\nMusic Cultural Patterns:")
    patterns = influences['music_cultural_patterns']
    print(f"\nGenre Context:")
    print(f"Singapore: {patterns['genre_context']['singapore_genre']}")
    print(f"Asia Popular: {patterns['genre_context']['asia_popular']}")
    
    print("\nWell-being Cultural Context:")
    context = influences['wellbeing_cultural_context']
    for category in ['% Thriving', '% Struggling']:
        dist = context['category_distributions'][category]
        print(f"\n{category}:")
        print(f"Singapore: {dist['singapore']:.1f}%")
        print(f"Asia Mean: {dist['asia_mean']:.1f}%")
    
    return influences

if __name__ == "__main__":
    print("Running cultural context analysis tests...")
    cultural_influences = test_cultural_influences() 