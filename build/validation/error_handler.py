import functools
import logging
from typing import Callable, Any

class AnalysisErrorHandler:
    def __init__(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger('analysis_validator')

    @staticmethod
    def handle_errors(func: Callable) -> Callable:
        """Decorator for handling analysis errors"""
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logging.error(f"Error in {func.__name__}: {str(e)}")
                raise
        return wrapper 