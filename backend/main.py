from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import create_tables, get_db, Dataset, SavedData, User
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
from passlib.context import CryptContext
import jwt
import datetime

app = FastAPI(title="Easy AI Analytics API", version="1.0.0")

SECRET_KEY = "supersecretkey"  # Change this in production
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Initialize database
def startup():
    create_tables()
    # Create default admin user if not exists
    from database import SessionLocal, User
    db = SessionLocal()
    if not db.query(User).filter(User.email == "123@mail.com").first():
        user = User(email="123@mail.com", hashed_password=get_password_hash("123"))
        db.add(user)
        db.commit()
        db.refresh(user)
    db.close()

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

class SignupRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
async def root():
    return {"message": "Easy AI Analytics API", "version": "1.0.0"}

@app.post("/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=req.email, hashed_password=get_password_hash(req.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"msg": "User created"}

@app.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

# Protect all endpoints except /signup and /login
def protected_route(user: User = Depends(get_current_user)):
    return user

@app.get("/protected")
def protected(user: User = Depends(get_current_user)):
    return {"email": user.email}

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