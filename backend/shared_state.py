"""
Shared state module for managing global data across routers
"""
import pandas as pd
from typing import Optional

# Global data storage
current_data: Optional[pd.DataFrame] = None
current_cleaned_data: Optional[pd.DataFrame] = None

def set_current_data(df: pd.DataFrame) -> None:
    """Set the current main dataset"""
    global current_data
    current_data = df

def get_current_data() -> Optional[pd.DataFrame]:
    """Get the current main dataset"""
    return current_data

def set_current_cleaned_data(df: pd.DataFrame) -> None:
    """Set the current cleaned dataset"""
    global current_cleaned_data
    current_cleaned_data = df

def get_current_cleaned_data() -> Optional[pd.DataFrame]:
    """Get the current cleaned dataset"""
    return current_cleaned_data

def clear_data() -> None:
    """Clear all stored data"""
    global current_data, current_cleaned_data
    current_data = None
    current_cleaned_data = None 