# Easy AI Analytics

A powerful web application for data analysis, visualization, and report generation built with Next.js and FastAPI.

## Features

- **Data Upload**: Support for CSV and Excel files
- **Data Exploration**: Comprehensive data analysis and statistics
- **Data Cleaning**: Handle missing values, outliers, and data type conversion
- **Data Visualization**: Interactive charts and graphs
- **Report Generation**: Create professional PDF reports
- **Sample Data**: Built-in sample sales dataset for demonstration

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Chart.js
- **Backend**: FastAPI (Python), Pandas, Plotly
- **Database**: SQLite (planned for future)
- **Authentication**: JWT (planned for future)

## Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.8+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd easy-ai-analytics
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   python main.py
   ```
   The API will be available at `http://localhost:8000`

2. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

3. **Open your browser**
   Navigate to `http://localhost:3000` to start using the application

## Usage

### 1. Data Upload
- Upload your CSV or Excel files
- Load the built-in sample sales data
- View data preview and statistics

### 2. Data Exploration
- Analyze column information and data types
- View missing value statistics
- Explore data distributions

### 3. Data Cleaning
- Handle missing values with various strategies
- Detect and manage outliers
- Convert data types as needed

### 4. Data Visualization
- Create interactive charts and graphs
- Choose from multiple chart types
- Customize chart parameters

### 5. Report Generation
- Configure report settings
- Select charts to include
- Generate professional PDF reports

## API Endpoints

- `GET /` - API health check
- `POST /upload` - Upload CSV/Excel file
- `GET /sample-data` - Load sample sales data
- `GET /saved-data` - Load saved datasets
- `GET /data-info` - Get current data information

## Sample Data

The application includes a sample sales dataset with:
- 500 sales transaction records
- 7 columns: Date, Product, Region, Units Sold, Unit Price, Total Sales, Customer Satisfaction
- Realistic business data with missing values and outliers for demonstration

## Development

### Project Structure
```
easy-ai-analytics/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── DataUpload.tsx     # File upload component
│   ├── DataExploration.tsx # Data analysis component
│   ├── DataVisualization.tsx # Charts component
│   └── ReportGeneration.tsx # Report generation component
├── backend/               # FastAPI backend
│   └── main.py           # Main API application
├── package.json          # Frontend dependencies
├── requirements.txt      # Backend dependencies
└── README.md            # This file
```

### Adding New Features

1. **Frontend**: Add new components in the `components/` directory
2. **Backend**: Add new endpoints in `backend/main.py`
3. **Styling**: Use Tailwind CSS classes for consistent design

## Future Enhancements

- [ ] Database integration (SQLite/PostgreSQL)
- [ ] User authentication and authorization
- [ ] Advanced machine learning features
- [ ] Real-time data processing
- [ ] Cloud deployment support
- [ ] Mobile responsive design improvements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 