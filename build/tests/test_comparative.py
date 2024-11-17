from utils.test_utils import run_test
from analysis.singapore_focus.comparative import SingaporeComparative

@run_test
def test_demographic_position(df):
    analyzer = SingaporeComparative(df)
    position = analyzer.analyze_demographic_position()
    
    print("\nSingapore Demographic Position:")
    for category in ['age', 'employment', 'education']:
        print(f"\n{category.title()} Percentiles (Global):")
        for metric, value in position[category]['global_percentiles'].items():
            print(f"{metric}: {value:.1f}%")
    
    return position

@run_test
def test_wellbeing_position(df):
    analyzer = SingaporeComparative(df)
    position = analyzer.analyze_wellbeing_position()
    
    print("\nSingapore Well-being Position:")
    print("\nMHQ Scores (Asia Percentiles):")
    for metric, value in position['mhq_scores']['percentiles']['asia'].items():
        print(f"{metric}: {value:.1f}%")
    
    return position

@run_test
def test_music_characteristics(df):
    analyzer = SingaporeComparative(df)
    characteristics = analyzer.analyze_music_characteristics()
    
    print("\nSingapore Music Characteristics:")
    print("\nFeature Percentiles (Global):")
    for feature, value in characteristics['feature_percentiles'].items():
        print(f"{feature}: {value:.1f}%")
    
    return characteristics

if __name__ == "__main__":
    print("Running Singapore comparative analysis tests...")
    demographic = test_demographic_position()
    wellbeing = test_wellbeing_position()
    music = test_music_characteristics() 