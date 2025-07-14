from fastapi import APIRouter, HTTPException
from typing import Optional
from visualization import Visualizer
from shared_state import get_current_cleaned_data

router = APIRouter()

@router.get("/visualize/{chart_type}")
async def create_visualization(chart_type: str, column: Optional[str] = None, 
                             x_col: Optional[str] = None, y_col: Optional[str] = None,
                             color_col: Optional[str] = None):
    current_cleaned_data = get_current_cleaned_data()
    if current_cleaned_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    try:
        visualizer = Visualizer(current_cleaned_data)
        if chart_type == "missing":
            result = visualizer.plot_missing_values()
        elif chart_type == "correlation":
            result = visualizer.plot_correlation_matrix()
        elif chart_type == "distribution" and column:
            result = visualizer.plot_distribution(column)
        elif chart_type == "numeric_distribution" and column:
            result = visualizer.plot_numeric_distribution(column)
        elif chart_type == "categorical_distribution" and column:
            result = visualizer.plot_categorical_distribution(column)
        elif chart_type == "scatter" and x_col and y_col:
            result = visualizer.plot_scatter(x_col, y_col, color_col)
        elif chart_type == "line" and x_col and y_col:
            result = visualizer.plot_line(x_col, y_col)
        elif chart_type == "missing_heatmap":
            result = visualizer.plot_missing_heatmap()
        else:
            raise HTTPException(status_code=400, detail="Invalid chart type or missing parameters")
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Visualization error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error creating visualization: {str(e)}")

@router.get("/visualize/missing_heatmap")
async def missing_heatmap():
    current_cleaned_data = get_current_cleaned_data()
    if current_cleaned_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    try:
        visualizer = Visualizer(current_cleaned_data)
        result = visualizer.plot_missing_heatmap()
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Missing heatmap endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating missing heatmap: {str(e)}") 