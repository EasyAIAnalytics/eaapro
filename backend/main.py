from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables
from database import get_db, Dataset, SavedData
from routes.upload import router as upload_router
from routes.data import router as data_router
from routes.visualize import router as visualize_router
from routes.report import router as report_router
from routes.export import router as export_router
from routes.sample import router as sample_router
from routes.data_info import router as data_info_router
from routes.lookup_tables import router as lookup_tables_router
from routes.formulas import router as formulas_router
from routes.statistics import router as statistics_router

app = FastAPI(title="Easy AI Analytics API", version="1.0.0")

# Initialize database
def startup():
    create_tables()

startup()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        "https://*.railway.app",
        "https://*.render.com",
        "https://eaapro.vercel.app",
        "https://www.easyaianalytics.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Easy AI Analytics API", "version": "1.0.0"}

# Include routers
app.include_router(upload_router)
app.include_router(data_router)
app.include_router(visualize_router)
app.include_router(report_router)
app.include_router(export_router)
app.include_router(sample_router)
app.include_router(data_info_router)
app.include_router(lookup_tables_router)
app.include_router(formulas_router)
app.include_router(statistics_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 