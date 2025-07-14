from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import pandas as pd
import io
import json
import pickle
from database import get_db, Dataset, SavedData
from data_processing import DataProcessor
from shared_state import set_current_data, set_current_cleaned_data

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    global current_data, current_cleaned_data
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file")
        try:
            if file.filename.lower().endswith('.csv'):
                df = pd.read_csv(io.BytesIO(content))
            elif file.filename.lower().endswith(('.xlsx', '.xls')):
                df = pd.read_excel(io.BytesIO(content))
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported file format: {file.filename}")
        except Exception as pandas_error:
            raise HTTPException(status_code=400, detail=f"Error reading file: {str(pandas_error)}")
        if df.empty:
            raise HTTPException(status_code=400, detail="File contains no data")
        set_current_data(df)
        set_current_cleaned_data(df.copy())
        processor = DataProcessor(df)
        basic_info = processor.get_basic_info()
        column_info = processor.get_column_info()
        preview = processor.get_preview()
        dataset = Dataset(
            name=file.filename,
            filename=file.filename,
            file_size=int(basic_info['file_size'].replace(' KB', '').replace(' MB', '')),
            rows=basic_info['rows'],
            columns=basic_info['columns'],
            data_preview=json.dumps(preview),
            column_info=json.dumps(column_info)
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        saved_data = SavedData(
            dataset_id=dataset.id,
            data_type='original',
            data_content=pickle.dumps(df)
        )
        db.add(saved_data)
        db.commit()
        return {
            "message": "File uploaded and saved successfully",
            "dataset_id": dataset.id,
            "basic_info": basic_info,
            "column_info": column_info,
            "preview": preview
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@router.get("/saved-data")
async def get_saved_data(db: Session = Depends(get_db)):
    try:
        datasets = db.query(Dataset).order_by(Dataset.created_at.desc()).all()
        if not datasets:
            return {"message": "No saved data available", "data": None}
        latest_dataset = datasets[0]
        saved_data = db.query(SavedData).filter(
            SavedData.dataset_id == latest_dataset.id,
            SavedData.data_type == 'original'
        ).first()
        if saved_data:
            df = pickle.loads(saved_data.data_content)
            processor = DataProcessor(df)
            return {
                "message": "Saved data loaded successfully",
                "basic_info": processor.get_basic_info(),
                "column_info": processor.get_column_info(),
                "preview": processor.get_preview()
            }
        else:
            return {"message": "No saved data available", "data": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading saved data: {str(e)}") 