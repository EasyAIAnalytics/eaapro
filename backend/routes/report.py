from fastapi import APIRouter, HTTPException, Form
import json
import base64
from backend.data_processing import DataProcessor
from backend.visualization import Visualizer
from backend.reporting import ReportGenerator
from backend.shared_state import get_current_cleaned_data

router = APIRouter()

@router.post("/generate-report")
async def generate_report(title: str = Form(...), company: str = Form(...), charts: str = Form("[]")):
    current_cleaned_data = get_current_cleaned_data()
    if current_cleaned_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    try:
        data_processor = DataProcessor(current_cleaned_data)
        visualizer = Visualizer(current_cleaned_data)
        report_gen = ReportGenerator(data_processor, visualizer)
        charts_list = json.loads(charts)
        pdf_bytes = report_gen.generate_pdf_report(title, company, charts_list)
        pdf_base64 = base64.b64encode(pdf_bytes).decode()
        return {
            "message": "Report generated successfully",
            "pdf_base64": pdf_base64,
            "filename": f"{title.replace(' ', '_')}.pdf"
        }
    except Exception as e:
        print(f"Report generation error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}") 