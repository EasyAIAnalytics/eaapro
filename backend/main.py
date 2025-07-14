from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import create_tables
from backend.routes.upload import router as upload_router
from backend.routes.data import router as data_router
from backend.routes.visualize import router as visualize_router
from backend.routes.report import router as report_router
from backend.routes.export import router as export_router
from backend.routes.sample import router as sample_router
from backend.routes.data_info import router as data_info_router
from backend.routes.lookup_tables import router as lookup_tables_router
from backend.routes.formulas import router as formulas_router

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 