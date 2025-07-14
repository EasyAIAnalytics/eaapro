import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional

class DataProcessor:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self.original_df = df.copy()
    
    def get_basic_info(self) -> Dict[str, Any]:
        rows, cols = self.df.shape
        file_size = f"{self.df.memory_usage(deep=True).sum() / 1024:.1f} KB"
        missing_values = int(self.df.isnull().sum().sum())
        return {
            'rows': int(rows),
            'columns': int(cols),
            'file_size': file_size,
            'missing_values': missing_values
        }
    def get_column_info(self) -> List[Dict[str, Any]]:
        columns_info = []
        for col in self.df.columns:
            col_info = {
                'name': col,
                'dtype': str(self.df[col].dtype),
                'missing_count': int(self.df[col].isnull().sum()),
                'unique_count': int(self.df[col].nunique())
            }
            if self.df[col].dtype in ['int64', 'float64']:
                mean_val = self.df[col].mean()
                std_val = self.df[col].std()
                min_val = self.df[col].min()
                max_val = self.df[col].max()
                col_info.update({
                    'mean': float(mean_val) if pd.notna(mean_val) else None,
                    'std': float(std_val) if pd.notna(std_val) else None,
                    'min': float(min_val) if pd.notna(min_val) else None,
                    'max': float(max_val) if pd.notna(max_val) else None
                })
            else:
                mode_result = self.df[col].mode()
                col_info['top_value'] = str(mode_result.iloc[0]) if not mode_result.empty else None
            columns_info.append(col_info)
        return columns_info
    def get_preview(self, rows: int = 10) -> List[Dict[str, Any]]:
        preview_data = self.df.head(rows).copy()
        preview = []
        for _, row in preview_data.iterrows():
            row_dict = {}
            for col, value in row.items():
                if pd.isna(value):
                    row_dict[col] = None
                elif pd.api.types.is_numeric_dtype(self.df[col]):
                    row_dict[col] = float(value) if pd.notna(value) else None
                else:
                    row_dict[col] = str(value) if pd.notna(value) else None
            preview.append(row_dict)
        return preview
    def clean_missing_values(self, method: str = "drop", fill_value: Optional[Any] = None) -> pd.DataFrame:
        if method == "drop":
            self.df = self.df.dropna()
        elif method == "mean":
            numeric_cols = self.df.select_dtypes(include=[np.number]).columns
            self.df[numeric_cols] = self.df[numeric_cols].fillna(self.df[numeric_cols].mean())
        elif method == "median":
            numeric_cols = self.df.select_dtypes(include=[np.number]).columns
            self.df[numeric_cols] = self.df[numeric_cols].fillna(self.df[numeric_cols].median())
        elif method == "mode":
            for col in self.df.columns:
                mode_val = self.df[col].mode()
                if not mode_val.empty:
                    self.df[col] = self.df[col].fillna(mode_val.iloc[0])
        elif method == "zero":
            numeric_cols = self.df.select_dtypes(include=[np.number]).columns
            self.df[numeric_cols] = self.df[numeric_cols].fillna(0)
        elif method == "custom" and fill_value is not None:
            self.df = self.df.fillna(fill_value)
        return self.df
    def detect_outliers(self, column: str, method: str = "zscore", threshold: float = 3.0) -> List[int]:
        if column not in self.df.columns:
            return []
        col_data = self.df[column].dropna()
        if method == "zscore":
            z_scores = np.abs((col_data - col_data.mean()) / col_data.std())
            outlier_indices = z_scores > threshold
        elif method == "iqr":
            Q1 = col_data.quantile(0.25)
            Q3 = col_data.quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            outlier_indices = (col_data < lower_bound) | (col_data > upper_bound)
        elif method == "isolation_forest":
            if len(col_data) < 10:
                return []
            from sklearn.ensemble import IsolationForest
            iso_forest = IsolationForest(contamination=0.1, random_state=42)
            outlier_indices = iso_forest.fit_predict(col_data.values.reshape(-1, 1)) == -1
        outlier_rows = col_data[outlier_indices].index.tolist()
        return outlier_rows
    def remove_outliers(self, column: str, method: str = "zscore") -> pd.DataFrame:
        outlier_indices = self.detect_outliers(column, method)
        self.df = self.df.drop(outlier_indices)
        return self.df
    def convert_data_type(self, column: str, target_type: str) -> pd.DataFrame:
        try:
            if target_type == "string":
                self.df[column] = self.df[column].astype(str)
            elif target_type == "numeric":
                self.df[column] = pd.to_numeric(self.df[column], errors='coerce')
            elif target_type == "datetime":
                self.df[column] = pd.to_datetime(self.df[column], errors='coerce')
            elif target_type == "categorical":
                self.df[column] = self.df[column].astype('category')
            return self.df
        except Exception as e:
            raise ValueError(f"Error converting {column} to {target_type}: {str(e)}") 