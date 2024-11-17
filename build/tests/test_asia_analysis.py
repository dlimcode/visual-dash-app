from utils.test_utils import run_test
from analysis.regional.asia_analysis import AsiaAnalyzer

@run_test
def test_asia_analysis(df):
    analyzer = AsiaAnalyzer(df)
    patterns = analyzer.analyze_asian_patterns()
    
    print("\nMusic Patterns in Asia:")
    for genre, count in patterns['music_patterns']['genre_distribution'].items():
        print(f"{genre}: {count}")
    
    print("\nWell-being Landscape:")
    print("\nMHQ Dimensions (Asian Average):")
    for dimension, data in patterns['wellbeing_landscape']['mhq_dimensions'].items():
        print(f"{dimension}: {data['mean']:.2f}")
    
    print("\nDemographic Insights:")
    print("\nAge Distribution (Singapore vs Asia Average):")
    for age_group, data in patterns['demographics']['age_groups'].items():
        sg_value = data['by_country']['Singapore']
        asia_avg = data['mean']
        print(f"{age_group}: {sg_value:.1f} vs {asia_avg:.1f}")
    
    print("\nEducation Levels (Singapore):")
    for edu, data in patterns['demographics']['education'].items():
        sg_value = data['by_country']['Singapore']
        print(f"{edu}: {sg_value:.1f}")
    
    print("\nHappiness Metrics Comparison:")
    happiness = patterns['wellbeing_landscape']['happiness_metrics']
    for metric in ['Life Ladder', 'Social support', 'Positive affect']:
        data = happiness[metric]
        print(f"{metric}: {data['mean']:.3f}")
    
    return patterns

if __name__ == "__main__":
    print("Running Asia analysis tests...")
    asia_patterns = test_asia_analysis()