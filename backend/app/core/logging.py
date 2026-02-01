import logging
import sys
from app.core.config import ENV

def setup_logging():
    """Configure structured logging based on environment"""
    
    # Set log level based on environment
    log_level = logging.DEBUG if ENV == "development" else logging.INFO
    
    # Create formatter
    if ENV == "development":
        # Colored, human-readable format for development
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    else:
        # JSON-like structured format for production
        formatter = logging.Formatter(
            '{"time": "%(asctime)s", "name": "%(name)s", "level": "%(levelname)s", "message": "%(message)s"}',
            datefmt='%Y-%m-%dT%H:%M:%S'
        )
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove existing handlers
    root_logger.handlers.clear()
    
    # Add console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    return root_logger

# Initialize logging on module import
logger = setup_logging()
