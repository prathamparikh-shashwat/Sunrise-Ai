import os
from datetime import datetime
from typing import Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Import our custom local spreadsheet integration helper and database module
from local_sheets import sync_answers_to_local_sheet
from sheets import sync_answers_to_sheet
from gemini_service import get_gemini_suggestions
from database import init_db, save_diagnostic_to_db

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Sunrise AI Consultant Google Sheets Sync Service")

# Enable CORS for frontend integration
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Payload structure matching frontend submission
class SubmitAnswersRequest(BaseModel):
    business_type: str  # 'tailoring', 'retail', or 'general'
    answers: Dict[str, Any]

@app.on_event("startup")
async def startup_event():
    """
    FastAPI startup event to initialize the database connection.
    """
    init_db()

@app.post("/api/submit-answers")
async def submit_answers(request: SubmitAnswersRequest):
    """
    Exposes a POST endpoint to submit questionnaire responses.
    Delegates operations to the local Excel sheets module and the PostgreSQL database.
    """
    # 1. Fetch AI Suggestions first using Gemini / Fallback
    gemini_result = get_gemini_suggestions(request.business_type, request.answers)
    suggestions = gemini_result.get("suggestions", {})
    ai_source = gemini_result.get("source", "offline_fallback")
    ai_message = gemini_result.get("message", "")

    # 2. Save both user answers and Gemini suggestions in a single PostgreSQL database table
    db_id = save_diagnostic_to_db(
        business_type=request.business_type,
        answers=request.answers,
        suggestions=suggestions,
        ai_source=ai_source
    )

    # 3. Safely sync to Google Sheets (primary) and local Excel sheet (secondary, non-blocking)
    sheets_status = "skipped"
    sheets_message = "No Google Sheets sync attempted."
    spreadsheet_url = ""
    
    try:
        sheets_sync_res = sync_answers_to_sheet(request.business_type, request.answers)
        sheets_status = "success"
        sheets_message = sheets_sync_res.get("message", "Google Sheets sync successful.")
        spreadsheet_url = sheets_sync_res.get("spreadsheet_url", "")
    except Exception as e:
        sheets_status = "failed"
        sheets_message = f"Google Sheets sync failed: {str(e)}"
        print(f"Google Sheets sync failed: {sheets_message}")

    excel_status = "skipped"
    excel_message = "No local excel sync attempted."
    excel_path = None
    
    try:
        excel_sync_res = sync_answers_to_local_sheet(request.business_type, request.answers)
        excel_status = "success"
        excel_message = excel_sync_res.get("message", "Excel sheet sync successful.")
        excel_path = excel_sync_res.get("relative_path", "")
    except PermissionError:
        excel_status = "failed"
        excel_message = "Excel file is currently locked/open in another program."
        print(f"Excel sync failed: {excel_message}")
    except Exception as e:
        excel_status = "failed"
        excel_message = f"Excel sync failed: {str(e)}"
        print(f"Excel sync failed: {excel_message}")

    # 4. Construct unified user-friendly response that maintains compatibility
    db_message = f"Saved to PostgreSQL DB (ID: {db_id})." if db_id else "Skipped/Failed DB save."
    
    response_msg = f"{db_message} Sheets sync: {sheets_message}. Excel sync: {excel_message}"
    
    return {
        "status": "success" if db_id else "partial_success",
        "message": response_msg,
        "business_type": request.business_type,
        "db_entry_id": db_id,
        "suggestions": suggestions,
        "ai_source": ai_source,
        "ai_message": ai_message,
        "excel_status": excel_status,
        "excel_message": excel_message,
        "excel_path": excel_path,
        "sheets_status": sheets_status,
        "sheets_message": sheets_message,
        "spreadsheet_url": spreadsheet_url
    }

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint to verify backend status.
    """
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    # Read host and port from environment config
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=True)

