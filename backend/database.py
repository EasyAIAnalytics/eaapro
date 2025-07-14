from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database setup
DATABASE_URL = "sqlite:///./easy_ai_analytics.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database models
class Dataset(Base):
    __tablename__ = "datasets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    filename = Column(String)
    file_size = Column(Integer)
    rows = Column(Integer)
    columns = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    data_preview = Column(Text)  # JSON string of first 10 rows
    column_info = Column(Text)   # JSON string of column metadata

class SavedData(Base):
    __tablename__ = "saved_data"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, index=True)
    data_type = Column(String)  # 'cleaned', 'processed', 'original'
    data_content = Column(LargeBinary)  # Pickled pandas DataFrame
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 