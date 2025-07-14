import pandas as pd
import numpy as np
from typing import Dict, Any, Optional

class Visualizer:
    def __init__(self, data):
        self.data = data
        self.df = data
    def plot_missing_values(self) -> Dict[str, Any]:
        try:
            missing = self.data.isna().sum().reset_index()
            missing.columns = ['Column', 'Missing Count']
            missing['Missing Percentage'] = (missing['Missing Count'] / len(self.data) * 100).round(2)
            missing = missing.sort_values('Missing Count', ascending=False)
            missing = missing[missing['Missing Count'] > 0]
            if len(missing) == 0:
                return {
                    "title": "Missing Values Analysis",
                    "data": [{
                        "x": ["No Missing Values"],
                        "y": [0],
                        "type": "bar"
                    }]
                }
            columns = [str(col) for col in missing['Column'].values.tolist()]
            counts = [int(count) for count in missing['Missing Count'].values.tolist()]
            percentages = [float(pct) for pct in missing['Missing Percentage'].values.tolist()]
            return {
                "title": "Missing Values by Column",
                "data": [{
                    "x": columns,
                    "y": counts,
                    "percentages": percentages,
                    "type": "bar"
                }]
            }
        except Exception as e:
            print(f"Missing values plot error: {e}")
            return {"error": f"Could not create missing values plot: {str(e)}"}
    def plot_numeric_distribution(self, column: str) -> Dict[str, Any]:
        try:
            if column not in self.data.columns:
                return {"error": f"Column '{column}' not found in data"}
            if not pd.api.types.is_numeric_dtype(self.data[column]):
                try:
                    self.data[column] = pd.to_numeric(self.data[column], errors='coerce')
                except:
                    return {"error": f"Column '{column}' is not numeric and cannot be converted"}
            clean_data = self.data[column].dropna()
            if len(clean_data) == 0:
                return {"error": f"No valid numeric data in column {column}"}
            hist, bins = np.histogram(clean_data, bins=min(20, len(clean_data)//5))
            bin_centers = (bins[:-1] + bins[1:]) / 2
            q1 = float(clean_data.quantile(0.25))
            q3 = float(clean_data.quantile(0.75))
            median = float(clean_data.median())
            min_val = float(clean_data.min())
            max_val = float(clean_data.max())
            return {
                "title": f"Distribution of {column}",
                "data": [{
                    "x": [float(x) for x in bin_centers.tolist()],
                    "y": [int(y) for y in hist.tolist()],
                    "type": "bar"
                }],
                "boxplot": {
                    "q1": q1,
                    "q3": q3,
                    "median": median,
                    "min": min_val,
                    "max": max_val
                }
            }
        except Exception as e:
            print(f"Numeric distribution plot error: {e}")
            return {"error": f"Could not create numeric distribution plot: {str(e)}"}
    def plot_categorical_distribution(self, column: str) -> Dict[str, Any]:
        try:
            if column not in self.data.columns:
                return {"error": f"Column '{column}' not found in data"}
            value_counts = self.data[column].value_counts()
            if len(value_counts) == 0:
                return {"error": f"No data in column {column}"}
            if len(value_counts) > 10:
                top_values = value_counts.head(9)
                others = pd.Series({'Others': value_counts[9:].sum()})
                value_counts = pd.concat([top_values, others])
            labels = [str(label) for label in value_counts.index.values.tolist()]
            values = [int(val) for val in value_counts.values.tolist()]
            return {
                "title": f"Distribution of {column}",
                "data": [{
                    "labels": labels,
                    "values": values,
                    "type": "pie"
                }]
            }
        except Exception as e:
            print(f"Categorical distribution plot error: {e}")
            return {"error": f"Could not create categorical distribution plot: {str(e)}"}
    def plot_correlation_matrix(self) -> Dict[str, Any]:
        try:
            numeric_data = self.data.select_dtypes(include=['int64', 'float64'])
            if numeric_data.shape[1] < 2:
                for col in self.data.columns:
                    if col not in numeric_data.columns:
                        try:
                            self.data[col] = pd.to_numeric(self.data[col], errors='coerce')
                        except:
                            continue
                numeric_data = self.data.select_dtypes(include=['int64', 'float64'])
                if numeric_data.shape[1] < 2:
                    return {"error": "Not enough numeric columns for correlation"}
            numeric_data = numeric_data.fillna(0)
            corr = numeric_data.corr()
            columns = [str(col) for col in corr.columns.values.tolist()]
            correlation_values = []
            for i, row in enumerate(corr.values):
                row_values = []
                for j, value in enumerate(row):
                    row_values.append(float(value))
                correlation_values.append(row_values)
            return {
                "title": "Correlation Matrix",
                "data": [{
                    "x": columns,
                    "y": columns,
                    "z": correlation_values,
                    "type": "heatmap"
                }]
            }
        except Exception as e:
            print(f"Correlation matrix error: {e}")
            return {"error": f"Could not create correlation matrix: {str(e)}"}
    def plot_scatter(self, x_column: str, y_column: str, color_column: str = None) -> Dict[str, Any]:
        try:
            if x_column not in self.data.columns or y_column not in self.data.columns:
                return {"error": f"Columns '{x_column}' or '{y_column}' not found in data"}
            if x_column == y_column:
                return {"error": "X and Y columns must be different for scatter plot"}
            for col in [x_column, y_column]:
                if not pd.api.types.is_numeric_dtype(self.data[col]):
                    try:
                        self.data[col] = pd.to_numeric(self.data[col], errors='coerce')
                    except:
                        return {"error": f"Columns '{x_column}' and '{y_column}' must be numeric"}
            if color_column and color_column not in self.data.columns:
                return {"error": f"Column '{color_column}' not found in data"}
            clean_df = self.data[[x_column, y_column]].dropna()
            if len(clean_df) == 0:
                return {"error": "No valid data points for scatter plot"}
            if len(clean_df) > 100:
                clean_df = clean_df.sample(n=100, random_state=42)
            x_values = [float(x) for x in clean_df[x_column].values.tolist()]
            y_values = [float(y) for y in clean_df[y_column].values.tolist()]
            chart_data = {
                "x": x_values,
                "y": y_values,
                "type": "scatter"
            }
            if color_column:
                color_values = [str(val) for val in clean_df[color_column].values.tolist()]
                chart_data["color"] = color_values
            return {
                "title": f'{y_column} vs {x_column}',
                "data": [chart_data]
            }
        except Exception as e:
            print(f"Scatter plot error: {e}")
            return {"error": f"Could not create scatter plot: {str(e)}"}
    def plot_distribution(self, column: str) -> Dict[str, Any]:
        try:
            if column not in self.data.columns:
                return {"error": f"Column {column} not found"}
            if self.data[column].dtype not in ['int64', 'float64']:
                try:
                    self.data[column] = pd.to_numeric(self.data[column], errors='coerce')
                except:
                    pass
            if self.data[column].dtype in ['int64', 'float64']:
                return self.plot_numeric_distribution(column)
            else:
                return self.plot_categorical_distribution(column)
        except Exception as e:
            print(f"Distribution plot error: {e}")
            return {"error": f"Could not create distribution plot: {str(e)}"}
    def plot_line(self, x_col: str, y_col: str) -> Dict[str, Any]:
        try:
            if x_col not in self.data.columns or y_col not in self.data.columns:
                return {"error": "One or both columns not found"}
            if x_col == y_col:
                return {"error": "X and Y columns must be different for line plot"}
            for col in [x_col, y_col]:
                if self.data[col].dtype not in ['int64', 'float64']:
                    try:
                        self.data[col] = pd.to_numeric(self.data[col], errors='coerce')
                    except:
                        pass
            clean_df = self.data[[x_col, y_col]].dropna()
            if len(clean_df) == 0:
                return {"error": "No valid data points for line plot"}
            clean_df = clean_df.sort_values(x_col)
            if len(clean_df) > 100:
                clean_df = clean_df.sample(n=100, random_state=42).sort_values(x_col)
            return {
                "title": f"{x_col} vs {y_col}",
                "data": [{
                    "x": [float(x) for x in clean_df[x_col].values.tolist()],
                    "y": [float(y) for y in clean_df[y_col].values.tolist()],
                    "type": "line"
                }]
            }
        except Exception as e:
            print(f"Line plot error: {e}")
            return {"error": f"Could not create line plot: {str(e)}"}
    def plot_missing_heatmap(self) -> dict:
        import numpy as np
        try:
            if self.data.isnull().sum().sum() == 0:
                return {
                    'title': 'Missing Values Heatmap',
                    'data': [{
                        'x': list(self.data.columns),
                        'y': list(self.data.index.astype(str)),
                        'z': [],
                        'type': 'heatmap',
                        'no_missing': True
                    }]
                }
            mask = self.data.isnull().astype(int)
            z = mask.values.tolist()
            z = [[int(cell) for cell in row] for row in z]
            return {
                'title': 'Missing Values Heatmap',
                'data': [{
                    'x': list(self.data.columns),
                    'y': list(self.data.index.astype(str)),
                    'z': z,
                    'type': 'heatmap',
                    'no_missing': False
                }]
            }
        except Exception as e:
            print(f"Missing heatmap error: {e}")
            return {'error': f'Could not create missing values heatmap: {str(e)}'} 