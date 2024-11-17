from utils.test_utils import run_test
from analysis.integrated_analysis import IntegratedAnalyzer

@run_test
def test_music_demographic_patterns(df):
    analyzer = IntegratedAnalyzer(df)
    patterns = analyzer.analyze_music_demographic_patterns()
    
    assert 'age_music_patterns' in patterns
    assert 'education_music_patterns' in patterns
    assert 'wellbeing_music_patterns' in patterns
    return patterns

@run_test
def test_singapore_integrated(df):
    analyzer = IntegratedAnalyzer(df)
    analysis = analyzer.analyze_singapore_integrated()
    
    assert 'music_profile' in analysis
    assert 'wellbeing_context' in analysis
    return analysis

if __name__ == "__main__":
    print("Running integrated analysis tests...")
    patterns = test_music_demographic_patterns()
    singapore = test_singapore_integrated()
    
    if all(v is not None for v in [patterns, singapore]):
        print("\nKey Findings for Singapore:")
        
        # Music-Wellbeing Relationships
        print("\nMusic Features Impact on Life Ladder:")
        for feature, data in singapore['wellbeing_context']['life_ladder']['music_associations'].items():
            corr = data['correlation']
            print(f"{feature}: {corr:.3f}")
        
        # Age-Music Patterns
        print("\nStrongest Age-Music Correlations:")
        age_patterns = patterns['age_music_patterns']
        for feature, data in age_patterns.items():
            correlations = data['age_correlations']
            strongest = max(correlations.items(), key=lambda x: abs(x[1]))
            print(f"{feature}: strongest with {strongest[0]} (r={strongest[1]:.3f})") 