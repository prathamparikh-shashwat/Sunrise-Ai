import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DB_URL = os.getenv("DB_URL") or os.getenv("DATABASE_URL")

engine = None
SessionLocal = None
Base = declarative_base()

class BusinessDiagnostic(Base):
    __tablename__ = "business_diagnostics"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    business_type = Column(String(50), nullable=False)
    answers = Column(JSON, nullable=False)
    suggestions = Column(JSON, nullable=True)
    ai_source = Column(String(50), nullable=True)

def init_db():
    global engine, SessionLocal
    if not DB_URL:
        print("DATABASE_URL / DB_URL environment variable is not configured. Database storage is disabled.")
        return
    try:
        url = DB_URL.strip()
        # Clean quotes
        if url.startswith('"') and url.endswith('"'):
            url = url[1:-1]
        elif url.startswith("'") and url.endswith("'"):
            url = url[1:-1]
            
        # SQLAlchemy expects postgresql:// instead of postgres://
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
            
        print("Initializing connection to PostgreSQL database...")
        # pool_pre_ping=True makes the pool check if connections are still alive before handing them out
        engine = create_engine(url, pool_pre_ping=True)
        Base.metadata.create_all(bind=engine)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        print("Database connection initialized and table 'business_diagnostics' verified/created.")
        
        # Check and dynamically add suggestions/ai_source columns if they don't exist
        from sqlalchemy import text
        with engine.connect() as conn:
            # Check for suggestions column
            res_suggestions = conn.execute(text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name='business_diagnostics' AND column_name='suggestions';"
            ))
            if not res_suggestions.fetchone():
                print("Adding 'suggestions' column to table 'business_diagnostics'...")
                conn.execute(text("ALTER TABLE business_diagnostics ADD COLUMN suggestions JSON;"))
                conn.commit()
                
            # Check for ai_source column
            res_ai_source = conn.execute(text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name='business_diagnostics' AND column_name='ai_source';"
            ))
            if not res_ai_source.fetchone():
                print("Adding 'ai_source' column to table 'business_diagnostics'...")
                conn.execute(text("ALTER TABLE business_diagnostics ADD COLUMN ai_source VARCHAR(50);"))
                conn.commit()
    except Exception as e:
        print(f"Error during database initialization: {e}")

def save_diagnostic_to_db(business_type: str, answers: dict, suggestions: dict = None, ai_source: str = None):
    if not SessionLocal:
        print("Database session maker is not initialized. Skipping database insertion.")
        return None
    
    session = SessionLocal()
    try:
        db_entry = BusinessDiagnostic(
            business_type=business_type,
            answers=answers,
            suggestions=suggestions,
            ai_source=ai_source,
            timestamp=datetime.utcnow()
        )
        session.add(db_entry)
        session.commit()
        session.refresh(db_entry)
        print(f"Successfully saved diagnostic data to PostgreSQL database (Entry ID: {db_entry.id}).")
        return db_entry.id
    except Exception as e:
        session.rollback()
        print(f"Error saving diagnostic data to database: {e}")
        return None
    finally:
        session.close()

