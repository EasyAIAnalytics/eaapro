from fastapi import APIRouter
import numpy as np
import pandas as pd
import random
from backend.data_processing import DataProcessor
from backend.shared_state import set_current_data, set_current_cleaned_data

router = APIRouter()

@router.get("/sample-data")
async def get_sample_data():
    global current_data, current_cleaned_data
    np.random.seed(42)
    dates = pd.date_range(start='2023-01-01', periods=100, freq='D')
    products = ['Laptop', 'Phone', 'Tablet', 'Monitor', 'Keyboard']
    regions = ['North', 'South', 'East', 'West']
    data = []
    for i in range(100):
        base_units = 50
        trend_factor = 1 + (i / 100) * 0.5
        seasonal_factor = 1 + 0.3 * np.sin(i * 2 * np.pi / 30)
        units_sold = int(base_units * trend_factor * seasonal_factor + np.random.normal(0, 10))
        units_sold = max(10, min(150, units_sold))
        if random.random() < 0.05:
            units_sold = np.nan
        unit_price = 100 + 50 * np.sin(i * np.pi / 20) + np.random.normal(0, 15)
        unit_price = max(20, min(300, unit_price))
        total_sales = units_sold * unit_price if not pd.isna(units_sold) else np.nan
        satisfaction = np.random.randint(1, 6) if random.random() > 0.03 else np.nan
        data.append({
            'Date': dates[i],
            'Product': random.choice(products),
            'Region': random.choice(regions),
            'Units_Sold': units_sold,
            'Unit_Price': round(unit_price, 2),
            'Total_Sales': round(total_sales, 2) if not pd.isna(total_sales) else np.nan,
            'Customer_Satisfaction': satisfaction
        })
    df = pd.DataFrame(data)
    set_current_data(df)
    set_current_cleaned_data(df.copy())
    processor = DataProcessor(df)
    return {
        "message": "Sample data loaded successfully",
        "basic_info": processor.get_basic_info(),
        "column_info": processor.get_column_info(),
        "preview": processor.get_preview()
    } 