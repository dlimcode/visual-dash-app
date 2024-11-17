import pandas as pd
from validation.analysis_validator import AnalysisValidator
from validation.flow_visualizer import AnalysisFlowVisualizer
from validation.error_handler import AnalysisErrorHandler
from analysis.singapore_focus.recommendations import RecommendationEngine

def run_validation_pipeline():
    # Initialize error handler
    error_handler = AnalysisErrorHandler()
    
    @error_handler.handle_errors
    def execute_validation():
        # 1. Load Data
        df = pd.read_csv('data/combined_data.csv')
        
        # 2. Initialize Validator
        validator = AnalysisValidator(df)
        
        # 3. Initialize RecommendationEngine
        engine = RecommendationEngine(df)
        
        # 4. Validate Data Structure
        data_validation = validator.validate_data_consistency()
        print("Data Validation Results:", data_validation)
        
        # 5. Generate and Validate Recommendations
        recommendations = engine.generate_recommendations()
        
        # 6. Validate Output Structure
        output_validations = {
            'music_recommendations': validator.validate_output_structure(
                recommendations['music_interventions'], 
                'music_recommendations'
            ),
            'implementation': validator.validate_output_structure(
                recommendations['implementation_strategy'], 
                'implementation_strategy'
            )
        }
        print("Output Structure Validation:", output_validations)
        
        # 7. Generate Flow Diagram
        visualizer = AnalysisFlowVisualizer()
        visualizer.generate_flow_diagram()
        visualizer.save_diagram('analysis_flow')
        
        return {
            'data_validation': data_validation,
            'output_validation': output_validations,
            'recommendations': recommendations
        }
    
    return execute_validation()

if __name__ == "__main__":
    results = run_validation_pipeline() 