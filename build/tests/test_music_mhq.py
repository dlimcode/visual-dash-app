from utils.test_utils import run_test
from analysis.relationships.music_mhq import MusicMHQAnalyzer

@run_test
def test_global_correlations(df):
    analyzer = MusicMHQAnalyzer(df)
    correlations = analyzer.analyze_global_correlations()
    
    print("\nGlobal MHQ Dimension Correlations:")
    for dimension, features in correlations['dimensions'].items():
        print(f"\n{dimension}:")
        for feature, corr in features.items():
            print(f"{feature}: {corr:.3f}")
    
    return correlations

@run_test
def test_regional_variations(df):
    analyzer = MusicMHQAnalyzer(df)
    variations = analyzer.analyze_regional_variations()
    
    print("\nAsia Region MHQ Patterns:")
    asia_patterns = variations['Asia']
    print("\nTop Dimension Correlations:")
    for dimension, features in asia_patterns['dimension_correlations'].items():
        top_feature = max(features.items(), key=lambda x: abs(x[1]))
        print(f"{dimension}: {top_feature[0]} (r={top_feature[1]:.3f})")
    
    return variations

@run_test
def test_singapore_specific(df):
    analyzer = MusicMHQAnalyzer(df)
    singapore = analyzer.analyze_singapore_specific()
    
    print("\nSingapore MHQ Profile:")
    for dimension, data in singapore['mhq_profile']['dimensions'].items():
        print(f"{dimension}: {data['value']:.2f} "
              f"(Asia percentile: {data['asia_percentile']:.1f}%)")
    
    return singapore

if __name__ == "__main__":
    print("Running music-MHQ analysis tests...")
    correlations = test_global_correlations()
    variations = test_regional_variations()
    singapore = test_singapore_specific() 