from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import pandas as pd
import numpy as np
import io
import json
import plotly.express as px
import plotly.graph_objects as go
import plotly.io as pio
from datetime import datetime, timedelta
import random
from typing import Dict, Any, List, Optional
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import base64
import tempfile
import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')
from io import BytesIO
import pickle
from sqlalchemy.orm import Session
from database import get_db, create_tables, Dataset, SavedData

app = FastAPI(title="Easy AI Analytics API", version="1.0.0")

# Initialize database
create_tables()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",  # Allow Vercel deployments
        "https://*.railway.app",  # Allow Railway deployments
        "https://*.render.com",   # Allow Render deployments
        "https://eaapro.vercel.app",  # Your specific frontend URL
        "https://www.easyaianalytics.com",  # Production domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global data storage (in production, use a database)
current_data = None
current_cleaned_data = None

class DataProcessor:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self.original_df = df.copy()
    
    def get_basic_info(self) -> Dict[str, Any]:
        """Get basic data information"""
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
        """Get detailed column information"""
        columns_info = []
        for col in self.df.columns:
            col_info = {
                'name': col,
                'dtype': str(self.df[col].dtype),
                'missing_count': int(self.df[col].isnull().sum()),
                'unique_count': int(self.df[col].nunique())
            }
            
            # Add statistics based on data type
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
        """Get data preview with proper NaN handling"""
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
        """Clean missing values using various methods"""
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
        """Detect outliers using various methods"""
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
            iso_forest = IsolationForest(contamination=0.1, random_state=42)
            outlier_indices = iso_forest.fit_predict(col_data.values.reshape(-1, 1)) == -1
        
        # Get original indices
        outlier_rows = col_data[outlier_indices].index.tolist()
        return outlier_rows
    
    def remove_outliers(self, column: str, method: str = "zscore") -> pd.DataFrame:
        """Remove outliers from a specific column"""
        outlier_indices = self.detect_outliers(column, method)
        self.df = self.df.drop(outlier_indices)
        return self.df
    
    def convert_data_type(self, column: str, target_type: str) -> pd.DataFrame:
        """Convert column data type"""
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

class Visualizer:
    """
    Class for creating visualizations from the data
    """
    
    def __init__(self, data):
        """
        Initialize the Visualizer with a pandas DataFrame
        
        Args:
            data (pd.DataFrame): The data to visualize
        """
        self.data = data
        self.df = data  # Keep both for compatibility
    
    def plot_missing_values(self) -> Dict[str, Any]:
        """
        Create a bar chart showing missing values by column
        
        Returns:
            Dict[str, Any]: Chart data for frontend
        """
        try:
            missing = self.data.isna().sum().reset_index()
            missing.columns = ['Column', 'Missing Count']
            missing['Missing Percentage'] = (missing['Missing Count'] / len(self.data) * 100).round(2)
            
            # Sort by missing count descending
            missing = missing.sort_values('Missing Count', ascending=False)
            
            # Only show columns with missing values
            missing = missing[missing['Missing Count'] > 0]
            
            if len(missing) == 0:
                # Create a simple chart with message if no missing values
                return {
                    "title": "Missing Values Analysis",
                    "data": [{
                        "x": ["No Missing Values"],
                        "y": [0],
                        "type": "bar"
                    }]
                }
            
            # Convert to native Python types for JSON serialization
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
        """
        Create a histogram for a numeric column
        
        Args:
            column (str): The column to visualize
        
        Returns:
            Dict[str, Any]: Chart data for frontend
        """
        try:
            if column not in self.data.columns:
                return {"error": f"Column '{column}' not found in data"}
            
            if not pd.api.types.is_numeric_dtype(self.data[column]):
                # Try to convert to numeric
                try:
                    self.data[column] = pd.to_numeric(self.data[column], errors='coerce')
                except:
                    return {"error": f"Column '{column}' is not numeric and cannot be converted"}
            
            # Clean data
            clean_data = self.data[column].dropna()
            if len(clean_data) == 0:
                return {"error": f"No valid numeric data in column {column}"}
            
            # Create histogram data
            hist, bins = np.histogram(clean_data, bins=min(20, len(clean_data)//5))
            bin_centers = (bins[:-1] + bins[1:]) / 2
            
            # Calculate statistics for box plot
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
        """
        Create a pie or bar chart for a categorical column
        
        Args:
            column (str): The column to visualize
        
        Returns:
            Dict[str, Any]: Chart data for frontend
        """
        try:
            if column not in self.data.columns:
                return {"error": f"Column '{column}' not found in data"}
            
            value_counts = self.data[column].value_counts()
            
            if len(value_counts) == 0:
                return {"error": f"No data in column {column}"}
            
            # If there are too many categories, limit to top 10 and group others
            if len(value_counts) > 10:
                top_values = value_counts.head(9)
                others = pd.Series({'Others': value_counts[9:].sum()})
                value_counts = pd.concat([top_values, others])
            
            # Convert to native Python types
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
        """
        Create a heatmap of the correlation matrix for numeric columns
        
        Returns:
            Dict[str, Any]: Chart data for frontend
        """
        try:
            numeric_data = self.data.select_dtypes(include=['int64', 'float64'])
            
            if numeric_data.shape[1] < 2:
                # Try to convert string columns to numeric
                for col in self.data.columns:
                    if col not in numeric_data.columns:
                        try:
                            self.data[col] = pd.to_numeric(self.data[col], errors='coerce')
                        except:
                            continue
                numeric_data = self.data.select_dtypes(include=['int64', 'float64'])
                
                if numeric_data.shape[1] < 2:
                    return {"error": "Not enough numeric columns for correlation"}
            
            # Fill NaN values and calculate correlation
            numeric_data = numeric_data.fillna(0)
            corr = numeric_data.corr()
            
            # Convert to native Python types
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
        """
        Create a scatter plot of two numeric columns
        
        Args:
            x_column (str): The column for the x-axis
            y_column (str): The column for the y-axis
            color_column (str, optional): The column to use for coloring points
        
        Returns:
            Dict[str, Any]: Chart data for frontend
        """
        try:
            if x_column not in self.data.columns or y_column not in self.data.columns:
                return {"error": f"Columns '{x_column}' or '{y_column}' not found in data"}
            
            # Check if same column is selected for both x and y
            if x_column == y_column:
                return {"error": "X and Y columns must be different for scatter plot"}
            
            # Try to convert to numeric
            for col in [x_column, y_column]:
                if not pd.api.types.is_numeric_dtype(self.data[col]):
                    try:
                        self.data[col] = pd.to_numeric(self.data[col], errors='coerce')
                    except:
                        return {"error": f"Columns '{x_column}' and '{y_column}' must be numeric"}
            
            if color_column and color_column not in self.data.columns:
                return {"error": f"Column '{color_column}' not found in data"}
            
            # Clean data
            clean_df = self.data[[x_column, y_column]].dropna()
            if len(clean_df) == 0:
                return {"error": "No valid data points for scatter plot"}
            
            # Limit data points for better visualization
            if len(clean_df) > 100:
                clean_df = clean_df.sample(n=100, random_state=42)
            
            # Convert to native Python types - handle pandas Series properly
            x_values = [float(x) for x in clean_df[x_column].values.tolist()]
            y_values = [float(y) for y in clean_df[y_column].values.tolist()]
            
            chart_data = {
                "x": x_values,
                "y": y_values,
                "type": "scatter"
            }
            
            # Add color if specified
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
        """
        Auto-detect column type and create appropriate distribution plot
        
        Args:
            column (str): The column to visualize
        
        Returns:
            Dict[str, Any]: Chart data for frontend
        """
        try:
            if column not in self.data.columns:
                return {"error": f"Column {column} not found"}
            
            # Try to convert to numeric first
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
        """
        Create line plot (alias for scatter with line type)
        
        Args:
            x_col (str): The column for the x-axis
            y_col (str): The column for the y-axis
        
        Returns:
            Dict[str, Any]: Chart data for frontend
        """
        try:
            if x_col not in self.data.columns or y_col not in self.data.columns:
                return {"error": "One or both columns not found"}
            
            # Check if same column is selected for both x and y
            if x_col == y_col:
                return {"error": "X and Y columns must be different for line plot"}
            
            # Try to convert to numeric
            for col in [x_col, y_col]:
                if self.data[col].dtype not in ['int64', 'float64']:
                    try:
                        self.data[col] = pd.to_numeric(self.data[col], errors='coerce')
                    except:
                        pass
            
            # Clean data
            clean_df = self.data[[x_col, y_col]].dropna()
            if len(clean_df) == 0:
                return {"error": "No valid data points for line plot"}
            
            # Sort by x values for line plot
            clean_df = clean_df.sort_values(x_col)
            
            # Limit data points for better visualization
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
        """
        Create a heatmap matrix for missing values (1=missing, 0=present)
        Returns:
            dict: { 'x': columns, 'y': row indices, 'z': 2D matrix, 'type': 'heatmap' }
        """
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
            # Ensure all values are 0 or 1 (no NaN)
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


class ReportGenerator:
    def __init__(self, data_processor: DataProcessor, visualizer: Visualizer):
        self.data_processor = data_processor
        self.visualizer = visualizer

    def _add_watermark(self, c, width, height, logo_path=None):
        c.saveState()
        c.setFont('Helvetica-Bold', 16)
        c.setFillColorRGB(0.32, 0.6, 0.97, alpha=0.12)
        c.drawString(width - 260, 40, 'Generated by EasyAIAanalytics')
        if logo_path:
            c.drawImage(logo_path, width - 120, 10, width=80, height=80, mask='auto')
        c.restoreState()

    def _plot_chart_to_png(self, chart_data):
        fig = None
        try:
            if chart_data['type'] == 'bar':
                fig, ax = plt.subplots(figsize=(5, 3))
                ax.bar(chart_data['x'], chart_data['y'], color='#275EFE')
                ax.set_title(chart_data.get('title', 'Bar Chart'))
            elif chart_data['type'] == 'line':
                fig, ax = plt.subplots(figsize=(5, 3))
                ax.plot(chart_data['x'], chart_data['y'], color='#275EFE')
                ax.set_title(chart_data.get('title', 'Line Chart'))
            elif chart_data['type'] == 'scatter':
                fig, ax = plt.subplots(figsize=(5, 3))
                ax.scatter(chart_data['x'], chart_data['y'], color='#275EFE')
                ax.set_title(chart_data.get('title', 'Scatter Plot'))
            elif chart_data['type'] == 'pie':
                fig, ax = plt.subplots(figsize=(4, 4))
                ax.pie(chart_data['values'], labels=chart_data['labels'], autopct='%1.1f%%', colors=['#275EFE', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'])
                ax.set_title(chart_data.get('title', 'Pie Chart'))
            elif chart_data['type'] == 'heatmap':
                fig, ax = plt.subplots(figsize=(5, 3))
                cax = ax.imshow(chart_data['z'], cmap='Blues', aspect='auto')
                fig.colorbar(cax)
                ax.set_title(chart_data.get('title', 'Heatmap'))
                ax.set_xticks(range(len(chart_data['x'])))
                ax.set_xticklabels(chart_data['x'], rotation=45, ha='right', fontsize=8)
                ax.set_yticks(range(len(chart_data['y'])))
                ax.set_yticklabels(chart_data['y'], fontsize=8)
            else:
                return None
            buf = BytesIO()
            plt.tight_layout()
            fig.savefig(buf, format='png', dpi=150)
            plt.close(fig)
            buf.seek(0)
            return buf
        except Exception as e:
            if fig:
                plt.close(fig)
            return None

    def generate_pdf_report(self, title: str, company: str, charts: list) -> bytes:
        try:
            import uuid
            temp_filename = f"report_{uuid.uuid4().hex}.pdf"
            temp_path = os.path.join(tempfile.gettempdir(), temp_filename)

            doc = SimpleDocTemplate(temp_path, pagesize=letter)
            story = []

            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=26,
                spaceAfter=24,
                alignment=1,
                fontName='Helvetica-Bold',
                textColor=colors.HexColor('#275EFE')
            )
            section_style = ParagraphStyle(
                'SectionHeader',
                parent=styles['Heading2'],
                fontSize=18,
                spaceAfter=12,
                textColor=colors.HexColor('#275EFE'),
                fontName='Helvetica-Bold'
            )
            normal_style = ParagraphStyle(
                'Normal',
                parent=styles['Normal'],
                fontSize=12,
                spaceAfter=8,
                fontName='Helvetica'
            )

            # Logo SVG as PNG (for now, use a placeholder path or skip if not available)
            logo_path = None  # Set to your logo PNG path if available

            # Title and branding
            story.append(Paragraph(title, title_style))
            story.append(Spacer(1, 10))
            story.append(Paragraph(f"<b>Company:</b> {company}", normal_style))
            story.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", normal_style))
            story.append(Spacer(1, 18))

            # Data summary
            basic_info = self.data_processor.get_basic_info()
            summary_data = [
                ['Metric', 'Value'],
                ['Total Rows', str(basic_info['rows'])],
                ['Total Columns', str(basic_info['columns'])],
                ['File Size', basic_info['file_size']],
                ['Missing Values', str(basic_info['missing_values'])]
            ]
            summary_table = Table(summary_data)
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#275EFE')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#e5eafe')),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#275EFE'))
            ]))
            story.append(Paragraph("Data Summary", section_style))
            story.append(summary_table)
            story.append(Spacer(1, 18))

            # Column info
            column_info = self.data_processor.get_column_info()
            col_table_data = [['Column', 'Type', 'Missing', 'Unique']]
            for col in column_info:
                col_table_data.append([
                    col['name'],
                    col['dtype'],
                    str(col['missing_count']),
                    str(col['unique_count'])
                ])
            col_table = Table(col_table_data)
            col_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#275EFE')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f3f4f6')),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#275EFE'))
            ]))
            story.append(Paragraph("Column Information", section_style))
            story.append(col_table)
            story.append(Spacer(1, 18))

            # Charts/Diagrams
            if charts:
                story.append(Paragraph("Charts & Diagrams", section_style))
                for chart_obj in charts:
                    chart_type = chart_obj.get('type')
                    chart_title = chart_obj.get('title', chart_type)
                    chart_data = None
                    try:
                        if chart_type == 'bar':
                            chart_data = self.visualizer.plot_distribution(chart_obj.get('column', chart_title))
                        elif chart_type == 'line':
                            chart_data = self.visualizer.plot_line(chart_obj.get('x'), chart_obj.get('y'))
                        elif chart_type == 'scatter':
                            chart_data = self.visualizer.plot_scatter(chart_obj.get('x'), chart_obj.get('y'))
                        elif chart_type == 'pie':
                            chart_data = self.visualizer.plot_categorical_distribution(chart_obj.get('column', chart_title))
                        elif chart_type == 'heatmap':
                            chart_data = self.visualizer.plot_correlation_matrix()
                    except Exception:
                        continue
                    if chart_data and 'data' in chart_data and chart_data['data']:
                        chart = chart_data['data'][0]
                        buf = self._plot_chart_to_png(chart)
                        if buf:
                            story.append(Spacer(1, 10))
                            story.append(Paragraph(chart_title, normal_style))
                            story.append(Image(buf, width=350, height=210))
                            story.append(Spacer(1, 10))
            story.append(Spacer(1, 18))

            # Build PDF with watermark on every page
            def add_watermark(canvas_obj, doc_obj):
                self._add_watermark(canvas_obj, letter[0], letter[1], logo_path)
            doc.build(story, onFirstPage=add_watermark, onLaterPages=add_watermark)

            with open(temp_path, 'rb') as f:
                pdf_bytes = f.read()
            try:
                os.unlink(temp_path)
            except Exception as cleanup_error:
                print(f"Warning: Could not delete temp file {temp_path}: {cleanup_error}")
            return pdf_bytes
        except Exception as e:
            print(f"PDF generation error: {str(e)}")
            return self._generate_simple_pdf(title, company)
    
    def _generate_simple_pdf(self, title: str, company: str) -> bytes:
        """Generate a simple text-based PDF as fallback"""
        try:
            import uuid
            temp_filename = f"simple_report_{uuid.uuid4().hex}.pdf"
            temp_path = os.path.join(tempfile.gettempdir(), temp_filename)
            
            doc = SimpleDocTemplate(temp_path, pagesize=letter)
            story = []
            
            styles = getSampleStyleSheet()
            
            # Simple content
            story.append(Paragraph(title, styles['Heading1']))
            story.append(Paragraph(f"Company: {company}", styles['Normal']))
            story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
            story.append(Spacer(1, 20))
            story.append(Paragraph("Data Analysis Report", styles['Heading2']))
            story.append(Paragraph("This report contains the analysis of your uploaded dataset.", styles['Normal']))
            
            doc.build(story)
            
            with open(temp_path, 'rb') as f:
                pdf_bytes = f.read()
            
            try:
                os.unlink(temp_path)
            except Exception as cleanup_error:
                print(f"Warning: Could not delete temp file {temp_path}: {cleanup_error}")
            
            return pdf_bytes
        except Exception as e:
            print(f"Simple PDF generation also failed: {str(e)}")
            # Return empty bytes if all else fails
            return b''

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Easy AI Analytics API", "version": "1.0.0"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload CSV or Excel file and return data analysis"""
    global current_data, current_cleaned_data
    
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Read file content
        content = await file.read()
        
        if not content:
            raise HTTPException(status_code=400, detail="Empty file")
        
        # Determine file type and read with pandas
        try:
            if file.filename.lower().endswith('.csv'):
                df = pd.read_csv(io.BytesIO(content))
            elif file.filename.lower().endswith(('.xlsx', '.xls')):
                df = pd.read_excel(io.BytesIO(content))
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported file format: {file.filename}")
        except Exception as pandas_error:
            raise HTTPException(status_code=400, detail=f"Error reading file: {str(pandas_error)}")
        
        # Validate DataFrame
        if df.empty:
            raise HTTPException(status_code=400, detail="File contains no data")
        
        # Store data globally
        current_data = df
        current_cleaned_data = df.copy()
        
        # Process data
        processor = DataProcessor(df)
        basic_info = processor.get_basic_info()
        column_info = processor.get_column_info()
        preview = processor.get_preview()
        
        # Save to database
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
        
        # Save original data
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

@app.get("/saved-data")
async def get_saved_data(db: Session = Depends(get_db)):
    """Return saved datasets from database"""
    try:
        datasets = db.query(Dataset).order_by(Dataset.created_at.desc()).all()
        
        if not datasets:
            return {"message": "No saved data available", "data": None}
        
        # Return the most recent dataset
        latest_dataset = datasets[0]
        
        # Load the actual data
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

@app.get("/sample-data")
async def get_sample_data():
    """Generate and return sample sales data"""
    global current_data, current_cleaned_data
    
    # Generate better sample sales data for visualization
    np.random.seed(42)
    dates = pd.date_range(start='2023-01-01', periods=100, freq='D')
    products = ['Laptop', 'Phone', 'Tablet', 'Monitor', 'Keyboard']
    regions = ['North', 'South', 'East', 'West']
    
    data = []
    for i in range(100):
        # Create more realistic and visualizable data with trends
        base_units = 50
        trend_factor = 1 + (i / 100) * 0.5  # Upward trend
        seasonal_factor = 1 + 0.3 * np.sin(i * 2 * np.pi / 30)  # Monthly seasonality
        
        units_sold = int(base_units * trend_factor * seasonal_factor + np.random.normal(0, 10))
        units_sold = max(10, min(150, units_sold))  # Keep in reasonable range
        
        # Add some missing values for demonstration
        if random.random() < 0.05:  # 5% missing values
            units_sold = np.nan
            
        unit_price = 100 + 50 * np.sin(i * np.pi / 20) + np.random.normal(0, 15)
        unit_price = max(20, min(300, unit_price))
        
        total_sales = units_sold * unit_price if not pd.isna(units_sold) else np.nan
        satisfaction = np.random.randint(1, 6) if random.random() > 0.03 else np.nan
        
        data.append({
            'Date': dates[i],
            'Product': random.choice(products),
            'Region': random.choice(regions),
            'Units_Sold': units_sold,
            'Unit_Price': round(unit_price, 2),
            'Total_Sales': round(total_sales, 2) if not pd.isna(total_sales) else np.nan,
            'Customer_Satisfaction': satisfaction
        })
    
    df = pd.DataFrame(data)
    current_data = df
    current_cleaned_data = df.copy()
    
    # Process data
    processor = DataProcessor(df)
    
    return {
        "message": "Sample data loaded successfully",
        "basic_info": processor.get_basic_info(),
        "column_info": processor.get_column_info(),
        "preview": processor.get_preview()
    }

@app.post("/clean-data")
async def clean_data(method: str = Form(...), fill_value: Optional[str] = Form(None)):
    """Clean missing values in the data"""
    global current_data, current_cleaned_data
    
    if current_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    
    try:
        processor = DataProcessor(current_cleaned_data)
        cleaned_df = processor.clean_missing_values(method, fill_value)
        current_cleaned_data = cleaned_df
        
        return {
            "message": f"Data cleaned using {method} method",
            "basic_info": processor.get_basic_info(),
            "preview": processor.get_preview()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cleaning data: {str(e)}")

@app.post("/detect-outliers")
async def detect_outliers(column: str = Form(...), method: str = Form("zscore")):
    """Detect outliers in a specific column"""
    global current_cleaned_data
    
    if current_cleaned_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    
    try:
        processor = DataProcessor(current_cleaned_data)
        outlier_indices = processor.detect_outliers(column, method)
        
        return {
            "column": column,
            "method": method,
            "outlier_count": len(outlier_indices),
            "outlier_indices": outlier_indices[:10]  # Return first 10 indices
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting outliers: {str(e)}")

@app.post("/remove-outliers")
async def remove_outliers(column: str = Form(...), method: str = Form("zscore")):
    """Remove outliers from a specific column"""
    global current_cleaned_data
    
    if current_cleaned_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    
    try:
        processor = DataProcessor(current_cleaned_data)
        cleaned_df = processor.remove_outliers(column, method)
        current_cleaned_data = cleaned_df
        
        return {
            "message": f"Outliers removed from {column} using {method} method",
            "basic_info": processor.get_basic_info(),
            "preview": processor.get_preview()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing outliers: {str(e)}")

@app.post("/convert-type")
async def convert_data_type(column: str = Form(...), target_type: str = Form(...)):
    """Convert column data type"""
    global current_cleaned_data
    
    if current_cleaned_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    
    try:
        processor = DataProcessor(current_cleaned_data)
        converted_df = processor.convert_data_type(column, target_type)
        current_cleaned_data = converted_df
        
        return {
            "message": f"Converted {column} to {target_type}",
            "basic_info": processor.get_basic_info(),
            "preview": processor.get_preview()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error converting data type: {str(e)}")

@app.get("/visualize/{chart_type}")
async def create_visualization(chart_type: str, column: Optional[str] = None, 
                             x_col: Optional[str] = None, y_col: Optional[str] = None,
                             color_col: Optional[str] = None):
    """Create various visualizations"""
    global current_cleaned_data
    
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
        
        # Check if result has error
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

@app.post("/generate-report")
async def generate_report(title: str = Form(...), company: str = Form(...), 
                         charts: str = Form("[]")):
    """Generate PDF report"""
    global current_cleaned_data
    
    if current_cleaned_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    
    try:
        data_processor = DataProcessor(current_cleaned_data)
        visualizer = Visualizer(current_cleaned_data)
        report_gen = ReportGenerator(data_processor, visualizer)
        
        charts_list = json.loads(charts)
        pdf_bytes = report_gen.generate_pdf_report(title, company, charts_list)
        
        # Return PDF as base64
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

@app.get("/data-info")
async def get_data_info():
    """Get current data information"""
    global current_cleaned_data
    
    if current_cleaned_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    
    processor = DataProcessor(current_cleaned_data)
    
    return {
        "basic_info": processor.get_basic_info(),
        "column_info": processor.get_column_info(),
        "preview": processor.get_preview()
    }

@app.get("/export-data")
async def export_data():
    """Export current data as CSV"""
    global current_cleaned_data
    
    if current_cleaned_data is None:
        raise HTTPException(status_code=404, detail="No data loaded")
    
    try:
        # Convert DataFrame to CSV
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

@app.get("/visualize/missing_heatmap")
async def missing_heatmap():
    global current_cleaned_data
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 