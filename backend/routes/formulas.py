from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import pandas as pd
import json
import pickle
from backend.database import get_db, Dataset, SavedData
from backend.data_processing import DataProcessor
from backend.shared_state import get_current_cleaned_data, set_current_cleaned_data

router = APIRouter()

@router.post("/apply-vlookup")
async def apply_vlookup(request: dict, db: Session = Depends(get_db)):
    """Apply VLOOKUP formula to the current dataset"""
    current_cleaned_data = get_current_cleaned_data()
    
    if current_cleaned_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    
    try:
        # Get lookup table
        lookup_table = db.query(Dataset).filter(Dataset.id == request['lookupTableId']).first()
        if not lookup_table:
            raise HTTPException(status_code=404, detail="Lookup table not found")
        
        saved_data = db.query(SavedData).filter(
            SavedData.dataset_id == lookup_table.id,
            SavedData.data_type == 'lookup_table'
        ).first()
        
        if not saved_data:
            raise HTTPException(status_code=404, detail="Lookup table data not found")
        
        lookup_df = pickle.loads(saved_data.data_content)
        
        # Validate columns exist
        if request['lookupColumn'] not in current_cleaned_data.columns:
            raise HTTPException(status_code=400, detail=f"Lookup column '{request['lookupColumn']}' not found in main dataset")
        
        if request['returnColumn'] not in lookup_df.columns:
            raise HTTPException(status_code=400, detail=f"Return column '{request['returnColumn']}' not found in lookup table")
        
        # Apply VLOOKUP
        result_df = current_cleaned_data.copy()
        
        # Create lookup dictionary for better performance
        lookup_dict = dict(zip(lookup_df.iloc[:, 0], lookup_df[request['returnColumn']]))
        
        # Apply lookup
        def vlookup(value):
            if pd.isna(value):
                return request.get('ifNotFound', '')
            
            if request.get('exactMatch', True):
                # Exact match
                return lookup_dict.get(value, request.get('ifNotFound', ''))
            else:
                # Approximate match (find closest value)
                if value in lookup_dict:
                    return lookup_dict[value]
                
                # Find closest value
                lookup_values = list(lookup_dict.keys())
                if not lookup_values:
                    return request.get('ifNotFound', '')
                
                # Sort values and find closest
                lookup_values.sort()
                for i, lv in enumerate(lookup_values):
                    if value <= lv:
                        if i == 0:
                            return lookup_dict[lv]
                        else:
                            # Return the closest value
                            prev_val = lookup_values[i-1]
                            if abs(value - prev_val) <= abs(value - lv):
                                return lookup_dict[prev_val]
                            else:
                                return lookup_dict[lv]
                
                # If value is greater than all lookup values, return the last one
                return lookup_dict[lookup_values[-1]]
        
        result_df[request['resultColumnName']] = result_df[request['lookupColumn']].apply(vlookup)
        
        # Update global data
        set_current_cleaned_data(result_df)
        
        # Process results
        processor = DataProcessor(result_df)
        
        return {
            "message": "VLOOKUP applied successfully",
            "basic_info": processor.get_basic_info(),
            "column_info": processor.get_column_info(),
            "preview": processor.get_preview()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"VLOOKUP error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error applying VLOOKUP: {str(e)}")

@router.post("/apply-xlookup")
async def apply_xlookup(request: dict, db: Session = Depends(get_db)):
    """Apply XLOOKUP formula to the current dataset"""
    current_cleaned_data = get_current_cleaned_data()
    
    if current_cleaned_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    
    try:
        # Get lookup table
        lookup_table = db.query(Dataset).filter(Dataset.id == request['lookupTableId']).first()
        if not lookup_table:
            raise HTTPException(status_code=404, detail="Lookup table not found")
        
        saved_data = db.query(SavedData).filter(
            SavedData.dataset_id == lookup_table.id,
            SavedData.data_type == 'lookup_table'
        ).first()
        
        if not saved_data:
            raise HTTPException(status_code=404, detail="Lookup table data not found")
        
        lookup_df = pickle.loads(saved_data.data_content)
        
        # Validate columns exist
        if request['lookupColumn'] not in current_cleaned_data.columns:
            raise HTTPException(status_code=400, detail=f"Lookup column '{request['lookupColumn']}' not found in main dataset")
        
        if request['returnColumn'] not in lookup_df.columns:
            raise HTTPException(status_code=400, detail=f"Return column '{request['returnColumn']}' not found in lookup table")
        
        # Apply XLOOKUP
        result_df = current_cleaned_data.copy()
        
        # Create lookup dictionary
        lookup_dict = dict(zip(lookup_df.iloc[:, 0], lookup_df[request['returnColumn']]))
        
        # Apply lookup based on search mode
        def xlookup(value):
            if pd.isna(value):
                return request.get('ifNotFound', '')
            
            search_mode = request.get('searchMode', 'exact')
            
            if search_mode == 'exact':
                return lookup_dict.get(value, request.get('ifNotFound', ''))
            
            elif search_mode == 'exact_or_next':
                if value in lookup_dict:
                    return lookup_dict[value]
                
                # Find next value
                lookup_values = sorted(lookup_dict.keys())
                for lv in lookup_values:
                    if lv >= value:
                        return lookup_dict[lv]
                
                return request.get('ifNotFound', '')
            
            elif search_mode == 'exact_or_previous':
                if value in lookup_dict:
                    return lookup_dict[value]
                
                # Find previous value
                lookup_values = sorted(lookup_dict.keys(), reverse=True)
                for lv in lookup_values:
                    if lv <= value:
                        return lookup_dict[lv]
                
                return request.get('ifNotFound', '')
            
            elif search_mode == 'wildcard':
                # Simple wildcard matching
                if value in lookup_dict:
                    return lookup_dict[value]
                
                # Try partial matches
                for k, v in lookup_dict.items():
                    if str(value).lower() in str(k).lower() or str(k).lower() in str(value).lower():
                        return v
                
                return request.get('ifNotFound', '')
            
            else:
                return request.get('ifNotFound', '')
        
        result_df[request['resultColumnName']] = result_df[request['lookupColumn']].apply(xlookup)
        
        # Update global data
        set_current_cleaned_data(result_df)
        
        # Process results
        processor = DataProcessor(result_df)
        
        return {
            "message": "XLOOKUP applied successfully",
            "basic_info": processor.get_basic_info(),
            "column_info": processor.get_column_info(),
            "preview": processor.get_preview()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"XLOOKUP error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error applying XLOOKUP: {str(e)}")

@router.post("/apply-dax-lookup")
async def apply_dax_lookup(request: dict, db: Session = Depends(get_db)):
    """Apply DAX LOOKUPVALUE formula to the current dataset"""
    current_cleaned_data = get_current_cleaned_data()
    
    if current_cleaned_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    
    try:
        # Get lookup table
        lookup_table = db.query(Dataset).filter(Dataset.id == request['lookupTableId']).first()
        if not lookup_table:
            raise HTTPException(status_code=404, detail="Lookup table not found")
        
        saved_data = db.query(SavedData).filter(
            SavedData.dataset_id == lookup_table.id,
            SavedData.data_type == 'lookup_table'
        ).first()
        
        if not saved_data:
            raise HTTPException(status_code=404, detail="Lookup table data not found")
        
        lookup_df = pickle.loads(saved_data.data_content)
        
        # Validate return column exists
        if request['returnColumn'] not in lookup_df.columns:
            raise HTTPException(status_code=400, detail=f"Return column '{request['returnColumn']}' not found in lookup table")
        
        # Validate filter columns exist
        for filter_condition in request['filters']:
            if filter_condition['column'] not in lookup_df.columns:
                raise HTTPException(status_code=400, detail=f"Filter column '{filter_condition['column']}' not found in lookup table")
        
        # Apply DAX LOOKUPVALUE
        result_df = current_cleaned_data.copy()
        
        # Create filter mask
        filter_mask = pd.Series([True] * len(lookup_df), index=lookup_df.index)
        
        for filter_condition in request['filters']:
            column = filter_condition['column']
            value = filter_condition['value']
            
            # Apply filter
            if pd.api.types.is_numeric_dtype(lookup_df[column]):
                try:
                    value = float(value)
                    filter_mask &= (lookup_df[column] == value)
                except ValueError:
                    filter_mask &= (lookup_df[column] == value)
            else:
                filter_mask &= (lookup_df[column] == value)
        
        # Get filtered results
        filtered_df = lookup_df[filter_mask]
        
        # Apply lookup for each row in main dataset
        def dax_lookup(row_index):
            # For DAX LOOKUPVALUE, we return the first matching value
            # In a real implementation, you might want to handle multiple matches differently
            if len(filtered_df) == 0:
                return ''
            
            # Return the first value from the return column
            return filtered_df.iloc[0][request['returnColumn']]
        
        # Apply to each row (this is a simplified implementation)
        # In practice, you might want to apply this differently based on your specific use case
        result_df[request['resultColumnName']] = [dax_lookup(i) for i in range(len(result_df))]
        
        # Update global data
        set_current_cleaned_data(result_df)
        
        # Process results
        processor = DataProcessor(result_df)
        
        return {
            "message": "DAX LOOKUPVALUE applied successfully",
            "basic_info": processor.get_basic_info(),
            "column_info": processor.get_column_info(),
            "preview": processor.get_preview()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DAX LOOKUPVALUE error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error applying DAX LOOKUPVALUE: {str(e)}") 