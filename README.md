# Easy AI Analytics (EAA)

**Turn data into decisions** - A modern web app for data analysis, visualization, and AI-powered insights.

## 🎯 Goal
Build an intuitive platform that makes data analysis accessible to everyone, from basic data cleaning to advanced AI-powered insights.

## 📁 Project Structure

### Frontend (Next.js)
- **`app/`** - Main pages and layouts
  - `page.tsx` - Homepage with data upload and overview
  - `globals.css` - Global styles and animations
  - `layout.tsx` - Root layout with navigation
- **`components/`** - Reusable UI components
  - `DataUpload.tsx` - File upload interface
  - `DataExploration.tsx` - Data preview and basic stats
  - `DataVisualization.tsx` - Charts and graphs
  - `ReportGeneration.tsx` - AI-powered report creation
  - `AdvancedFormulas.tsx` - VLOOKUP, XLOOKUP, DAX formulas
- **`lib/`** - Utilities and configuration
- **`types/`** - TypeScript type definitions

### Backend (FastAPI)
- **`backend/`** - Python API server
  - `main.py` - Main API entry point
  - `routes/` - API endpoints organized by feature
    - `upload.py` - File upload handling
    - `data_processing.py` - Data cleaning and transformation
    - `visualization.py` - Chart generation
    - `reporting.py` - AI report creation
    - `formulas.py` - Advanced lookup formulas
  - `database.py` - Simple file-based data storage
  - `requirements.txt` - Python dependencies

### Data & Config
- **`data/`** - Sample datasets and uploaded files
- **`public/`** - Static assets
- **`package.json`** - Frontend dependencies
- **`vercel.json`** - Deployment configuration

## 🚀 Current Features

### Data Management
- Upload CSV/Excel files
- Data preview and exploration
- Basic statistics and column info
- Data cleaning and transformation

### Visualization
- Interactive charts (bar, line, scatter, heatmap)
- Customizable chart options
- Export charts as images

### AI-Powered Reports
- Automated insights generation
- Trend analysis
- Anomaly detection
- Professional report formatting

### Advanced Formulas
- VLOOKUP functionality
- XLOOKUP with multiple criteria
- DAX LOOKUPVALUE formulas
- Lookup table management

## 🔮 Future Roadmap

### Short Term
- [ ] User authentication and data persistence
- [ ] More chart types (pie, radar, 3D)
- [ ] Real-time data streaming
- [ ] Mobile-responsive design

### Medium Term
- [ ] Machine learning model integration
- [ ] Predictive analytics
- [ ] Natural language query interface
- [ ] Collaborative workspaces

### Long Term
- [ ] Enterprise features (SSO, RBAC)
- [ ] Advanced AI models (GPT-4, Claude)
- [ ] Real-time collaboration
- [ ] API marketplace for integrations

## 🛠 Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python, Pandas, NumPy
- **AI/ML**: OpenAI API, scikit-learn
- **Deployment**: Vercel (frontend), Railway (backend)
- **Database**: File-based (upgradable to PostgreSQL/MongoDB)

## 🚀 Quick Start
```bash
# Frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
python main.py
```

Visit `http://localhost:3000` to start analyzing data! 