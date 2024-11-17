from utils.test_utils import run_test
from analysis.relationships.music_happiness import MusicHappinessAnalyzer

@run_test
def test_global_correlations(df):
    analyzer = MusicHappinessAnalyzer(df)
    correlations = analyzer.analyze_global_correlations()
    
    assert 'Life Ladder' in correlations
    print("\nGlobal Correlations with Life Ladder:")
    for feature, corr in correlations['Life Ladder'].items():
        print(f"{feature}: {corr:.3f}")
    
    return correlations

@run_test
def test_regional_patterns(df):
    analyzer = MusicHappinessAnalyzer(df)
    patterns = analyzer.analyze_regional_patterns()
    
    assert 'Asia' in patterns
    print("\nAsia Region Patterns:")
    asia_patterns = patterns['Asia']
    print("\nLife Ladder Correlations:")
    for feature, corr in asia_patterns['correlations']['Life Ladder'].items():
        print(f"{feature}: {corr:.3f}")
    
    return patterns

if __name__ == "__main__":
    print("Running music-happiness analysis tests...")
    correlations = test_global_correlations()
    patterns = test_regional_patterns() 