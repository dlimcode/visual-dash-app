from utils.test_utils import run_test
from analysis.singapore_focus.recommendations import RecommendationEngine

@run_test
def test_recommendations(df):
    engine = RecommendationEngine(df)
    recommendations = engine.generate_recommendations()
    
    print("\nMusic-Based Interventions:")
    for feature, impacts in recommendations['music_interventions']['optimal_features'].items():
        print(f"\n{feature.title()} impacts:")
        for metric, correlation in impacts.items():
            if abs(correlation) > 0.3:  # Show meaningful correlations
                print(f"{metric}: {correlation:.3f}")
    
    print("\nDemographic Priorities:")
    for category, groups in recommendations['demographic_targeting'].items():
        print(f"\n{category.title()}:")
        for group, data in groups.items():
            if data['priority_score'] > 0.5:  # Show high-priority groups
                print(f"{group}: Priority {data['priority_score']:.2f}")
    
    print("\nWell-being Focus Areas:")
    for dimension, score in recommendations['wellbeing_focus']['priority_dimensions'].items():
        print(f"{dimension}: {score:.2f}")
    
    return recommendations

if __name__ == "__main__":
    print("Running recommendation engine tests...")
    recommendations = test_recommendations() 