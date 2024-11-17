from utils.test_utils import run_test
from analysis.foundation.wellbeing_landscape import WellbeingAnalyzer

@run_test
def test_mhq_profile(df):
    analyzer = WellbeingAnalyzer(df)
    profile = analyzer.get_mhq_profile()
    
    # Validation
    assert 'dimensions' in profile
    assert 'categories' in profile
    assert len(profile['dimensions']) == 6
    assert len(profile['categories']) == 6
    
    return profile

@run_test
def test_singapore_wellbeing(df):
    analyzer = WellbeingAnalyzer(df)
    singapore_profile = analyzer.analyze_singapore_wellbeing()
    
    # Validation
    assert 'mhq_dimensions' in singapore_profile
    assert 'mhq_categories' in singapore_profile
    assert 'happiness_metrics' in singapore_profile
    
    return singapore_profile

@run_test
def test_wellbeing_correlations(df):
    analyzer = WellbeingAnalyzer(df)
    correlations = analyzer.find_wellbeing_correlations()
    
    # Validation
    assert 'correlation_matrix' in correlations
    assert 'key_correlations' in correlations
    assert 'life_ladder' in correlations['key_correlations']
    assert 'mhq_dimensions' in correlations['key_correlations']
    
    # Print correlations for verification
    print("\nCorrelations with Life Ladder:")
    for metric, corr in correlations['key_correlations']['life_ladder'].items():
        print(f"{metric}: {corr:.3f}")
    
    return correlations

@run_test
def test_regional_patterns(df):
    analyzer = WellbeingAnalyzer(df)
    patterns = analyzer.analyze_regional_patterns()
    
    # Validation
    assert 'regional_profiles' in patterns
    assert 'regional_rankings' in patterns
    
    return patterns

if __name__ == "__main__":
    print("Running wellbeing landscape tests...")
    profile = test_mhq_profile()
    singapore = test_singapore_wellbeing()
    correlations = test_wellbeing_correlations()
    patterns = test_regional_patterns()
    
    if all(v is not None for v in [profile, singapore, correlations, patterns]):
        print("\nSample results:")
        print("\nSingapore's MHQ Dimensions (percentiles):")
        for dim, data in singapore['mhq_dimensions'].items():
            print(f"{dim.replace('Average ', '').replace(' Score', '')}: "
                  f"Global: {data['global_percentile']:.1f}%, "
                  f"Asia: {data['asia_percentile']:.1f}%")
        
        if correlations and 'key_correlations' in correlations:
            print("\nTop MHQ correlations with Life Ladder:")
            mhq_corrs = correlations['key_correlations']['mhq_dimensions']
            sorted_corrs = sorted(mhq_corrs.items(), key=lambda x: abs(x[1]), reverse=True)[:3]
            for metric, corr in sorted_corrs:
                print(f"{metric.replace('Average ', '').replace(' Score', '')}: {corr:.3f}")