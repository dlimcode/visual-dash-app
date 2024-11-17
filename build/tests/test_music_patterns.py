from utils.test_utils import run_test
from analysis.foundation.music_patterns import MusicPatternAnalyzer

@run_test
def test_feature_distributions(df):
    analyzer = MusicPatternAnalyzer(df)
    distributions = analyzer.get_feature_distributions()
    
    # Basic validation
    assert len(distributions) == 9, "Should have 9 music features"
    assert all(metric in distributions['tempo'] 
              for metric in ['mean', 'std', 'median', 'skew', 'kurtosis'])
    
    return distributions

@run_test
def test_regional_preferences(df):
    analyzer = MusicPatternAnalyzer(df)
    preferences = analyzer.analyze_regional_preferences()
    
    # Basic validation
    assert 'features_by_region' in preferences
    assert 'genre_distribution' in preferences
    assert 'Asia' in preferences['features_by_region'].index
    
    return preferences

@run_test
def test_singapore_profile(df):
    analyzer = MusicPatternAnalyzer(df)
    profile = analyzer.get_singapore_profile()
    
    # Basic validation
    assert 'features' in profile
    assert 'genre' in profile
    assert len(profile['features']) == 9
    
    return profile

@run_test
def test_similar_countries(df):
    analyzer = MusicPatternAnalyzer(df)
    similar = analyzer.find_similar_countries()
    
    # Basic validation
    assert len(similar) == 5
    assert isinstance(similar, dict)
    assert all(isinstance(v, (int, float)) for v in similar.values())
    
    return similar

if __name__ == "__main__":
    # Run all tests
    print("Running music patterns tests...")
    distributions = test_feature_distributions()
    preferences = test_regional_preferences()
    profile = test_singapore_profile()
    similar = test_similar_countries()
    
    # Print some results
    if all(v is not None for v in [distributions, preferences, profile, similar]):
        print("\nSample results:")
        print("\nSingapore's music profile:")
        for feature, values in profile['features'].items():
            print(f"{feature}: {values['percentile']:.2f}th percentile")
        
        print("\nMost similar countries to Singapore:")
        for country, distance in similar.items():
            print(f"{country}: {distance:.3f}") 