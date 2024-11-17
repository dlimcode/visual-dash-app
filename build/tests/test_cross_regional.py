from utils.test_utils import run_test
from analysis.regional.cross_regional import CrossRegionalAnalyzer
import numpy as np
from scipy import stats

@run_test
def test_cross_regional_analysis(df):
    analyzer = CrossRegionalAnalyzer(df)
    patterns = analyzer.analyze_cross_regional_patterns()
    
    # Validation assertions
    assert 'music_comparisons' in patterns
    assert 'wellbeing_comparisons' in patterns
    assert 'regional_correlations' in patterns
    assert 'cultural_patterns' in patterns
    
    # Test music feature comparisons
    print("\nRegional Music Feature Comparisons:")
    for feature in ['valence', 'energy']:
        print(f"\n{feature.title()} by Region:")
        for region, stats in patterns['music_comparisons']['feature_by_region'][feature].items():
            # Validate statistics
            assert 0 <= stats['mean'] <= 1, f"Invalid mean for {feature} in {region}"
            assert stats['std'] >= 0, f"Invalid std for {feature} in {region}"
            print(f"{region}: {stats['mean']:.3f} ± {stats['std']:.3f}")
            
        # Check ANOVA results
        f_stat = patterns['music_comparisons']['significant_differences'][feature]['f_statistic']
        p_val = patterns['music_comparisons']['significant_differences'][feature]['p_value']
        print(f"ANOVA test: F={f_stat:.2f}, p={p_val:.3f}")
    
    # Test well-being rankings with proper validation
    print("\nRegional Well-being Rankings (Average MHQ Score):")
    wellbeing_data = patterns['wellbeing_comparisons']['mhq_by_region']['Average MHQ Score']
    
    # Sort regions by mean MHQ score
    sorted_regions = sorted(wellbeing_data.items(), 
                          key=lambda x: x[1]['mean'],
                          reverse=True)
    
    for region, stats in sorted_regions:
        mean = stats['mean']
        std = stats['std']
        n = stats['count']
        ci_95 = 1.96 * std / np.sqrt(n)  # 95% confidence interval
        print(f"{region}: {mean:.1f} ± {ci_95:.1f} (n={n})")
    
    # Test correlations with proper validation
    print("\nSignificant Music-Wellbeing Correlations by Region:")
    for region, correlations in patterns['regional_correlations']['music_wellbeing'].items():
        if not correlations:  # Skip if no significant correlations
            continue
            
        significant_correlations = {
            feature: corr for feature, corr in correlations.items()
            if corr['p_value'] < 0.05 and corr['sample_size'] >= 5
        }
        
        if significant_correlations:
            top_feature = max(significant_correlations.items(), 
                            key=lambda x: abs(x[1]['correlation']))
            print(f"{region}: {top_feature[0]} "
                  f"(r={top_feature[1]['correlation']:.3f}, "
                  f"p={top_feature[1]['p_value']:.3f}, "
                  f"n={top_feature[1]['sample_size']})")
    
    return patterns

if __name__ == "__main__":
    print("Running cross-regional analysis tests...")
    patterns = test_cross_regional_analysis()
    print("\nTest completed successfully!") 