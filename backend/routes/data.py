from fastapi import APIRouter, HTTPException, Form
from typing import Optional
from data_processing import DataProcessor
from shared_state import get_current_data, get_current_cleaned_data, set_current_cleaned_data

router = APIRouter()

@router.post("/clean-data")
async def clean_data(method: str = Form(...), fill_value: Optional[str] = Form(None)):
    current_data = get_current_data()
    current_cleaned_data = get_current_cleaned_data()
    if current_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    try:
        processor = DataProcessor(current_cleaned_data)
        cleaned_df = processor.clean_missing_values(method, fill_value)
        set_current_cleaned_data(cleaned_df)
        return {
            "message": f"Data cleaned using {method} method",
            "basic_info": processor.get_basic_info(),
            "preview": processor.get_preview()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cleaning data: {str(e)}")

@router.post("/detect-outliers")
async def detect_outliers(column: str = Form(...), method: str = Form("zscore")):
    current_cleaned_data = get_current_cleaned_data()
    if current_cleaned_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    try:
        processor = DataProcessor(current_cleaned_data)
        outlier_indices = processor.detect_outliers(column, method)
        return {
            "column": column,
            "method": method,
            "outlier_count": len(outlier_indices),
            "outlier_indices": outlier_indices[:10]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting outliers: {str(e)}")

@router.post("/remove-outliers")
async def remove_outliers(column: str = Form(...), method: str = Form("zscore")):
    current_cleaned_data = get_current_cleaned_data()
    if current_cleaned_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    try:
        processor = DataProcessor(current_cleaned_data)
        cleaned_df = processor.remove_outliers(column, method)
        set_current_cleaned_data(cleaned_df)
        return {
            "message": f"Outliers removed from {column} using {method} method",
            "basic_info": processor.get_basic_info(),
            "preview": processor.get_preview()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing outliers: {str(e)}")

@router.post("/convert-type")
async def convert_data_type(column: str = Form(...), target_type: str = Form(...)):
    current_cleaned_data = get_current_cleaned_data()
    if current_cleaned_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    try:
        processor = DataProcessor(current_cleaned_data)
        converted_df = processor.convert_data_type(column, target_type)
        set_current_cleaned_data(converted_df)
        return {
            "message": f"Converted {column} to {target_type}",
            "basic_info": processor.get_basic_info(),
            "preview": processor.get_preview()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error converting data type: {str(e)}") 