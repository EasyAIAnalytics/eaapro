from fastapi import APIRouter, HTTPException
from data_processing import DataProcessor
from shared_state import get_current_cleaned_data

router = APIRouter()

@router.get("/data-info")
async def get_data_info():
    current_cleaned_data = get_current_cleaned_data()
    if current_cleaned_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    processor = DataProcessor(current_cleaned_data)
    return {
        "basic_info": processor.get_basic_info(),
        "column_info": processor.get_column_info(),
        "preview": processor.get_preview()
    } 