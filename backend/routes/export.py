from fastapi import APIRouter, HTTPException
import io

from backend.shared_state import get_current_cleaned_data

router = APIRouter()

@router.get("/export-data")
async def export_data():
    current_cleaned_data = get_current_cleaned_data()
    if current_cleaned_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    try:
        csv_buffer = io.StringIO()
        current_cleaned_data.to_csv(csv_buffer, index=False)
        csv_content = csv_buffer.getvalue()
        csv_buffer.close()
        return {
            "csv_data": csv_content,
            "filename": "exported_data.csv"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting data: {str(e)}") 