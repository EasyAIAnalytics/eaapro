from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from sqlalchemy.orm import Session
import pandas as pd
import io
import json
import pickle
from backend.database import get_db, Dataset, SavedData
from backend.data_processing import DataProcessor

router = APIRouter()

@router.post("/upload-lookup-table")
async def upload_lookup_table(file: UploadFile = File(...), table_name: str = Form(...), db: Session = Depends(get_db)):
    """Upload a lookup table"""
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
        
        # Process data
        processor = DataProcessor(df)
        basic_info = processor.get_basic_info()
        column_info = processor.get_column_info()
        preview = processor.get_preview()
        
        # Save to database as lookup table
        dataset = Dataset(
            name=table_name,
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
        
        # Save original data
        saved_data = SavedData(
            dataset_id=dataset.id,
            data_type='lookup_table',
            data_content=pickle.dumps(df)
        )
        db.add(saved_data)
        db.commit()
        
        return {
            "id": dataset.id,
            "name": table_name,
            "rows": basic_info['rows'],
            "columns": basic_info['columns'],
            "column_info": column_info,
            "preview": preview
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Lookup table upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@router.get("/lookup-tables")
async def get_lookup_tables(db: Session = Depends(get_db)):
    """Get all lookup tables"""
    try:
        # Get datasets that have lookup table data
        lookup_datasets = db.query(Dataset).join(SavedData).filter(
            SavedData.data_type == 'lookup_table'
        ).all()
        
        tables = []
        for dataset in lookup_datasets:
            saved_data = db.query(SavedData).filter(
                SavedData.dataset_id == dataset.id,
                SavedData.data_type == 'lookup_table'
            ).first()
            
            if saved_data:
                df = pickle.loads(saved_data.data_content)
                processor = DataProcessor(df)
                
                tables.append({
                    "id": dataset.id,
                    "name": dataset.name,
                    "rows": dataset.rows,
                    "columns": dataset.columns,
                    "column_info": json.loads(dataset.column_info),
                    "preview": json.loads(dataset.data_preview)
                })
        
        return tables
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading lookup tables: {str(e)}")

@router.get("/lookup-table/{table_id}")
async def get_lookup_table(table_id: int, db: Session = Depends(get_db)):
    """Get specific lookup table"""
    try:
        dataset = db.query(Dataset).filter(Dataset.id == table_id).first()
        if not dataset:
            raise HTTPException(status_code=404, detail="Lookup table not found")
        
        saved_data = db.query(SavedData).filter(
            SavedData.dataset_id == dataset.id,
            SavedData.data_type == 'lookup_table'
        ).first()
        
        if not saved_data:
            raise HTTPException(status_code=404, detail="Lookup table data not found")
        
        df = pickle.loads(saved_data.data_content)
        processor = DataProcessor(df)
        
        return {
            "id": dataset.id,
            "name": dataset.name,
            "rows": dataset.rows,
            "columns": dataset.columns,
            "column_info": json.loads(dataset.column_info),
            "preview": json.loads(dataset.data_preview),
            "basic_info": processor.get_basic_info()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading lookup table: {str(e)}")

@router.delete("/delete-lookup-table/{table_id}")
async def delete_lookup_table(table_id: int, db: Session = Depends(get_db)):
    """Delete a lookup table"""
    try:
        dataset = db.query(Dataset).filter(Dataset.id == table_id).first()
        if not dataset:
            raise HTTPException(status_code=404, detail="Lookup table not found")
        
        # Delete saved data first
        saved_data = db.query(SavedData).filter(
            SavedData.dataset_id == dataset.id,
            SavedData.data_type == 'lookup_table'
        ).all()
        
        for data in saved_data:
            db.delete(data)
        
        # Delete dataset
        db.delete(dataset)
        db.commit()
        
        return {"message": "Lookup table deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting lookup table: {str(e)}") 