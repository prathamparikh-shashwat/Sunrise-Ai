import os
from datetime import datetime
from typing import Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Import our custom local spreadsheet integration helper
from local_sheets import sync_answers_to_local_sheet

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Sunrise AI Consultant Google Sheets Sync Service")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Payload structure matching frontend submission
class SubmitAnswersRequest(BaseModel):
    business_type: str  # 'tailoring', 'retail', or 'general'
    answers: Dict[str, Any]

@app.post("/api/submit-answers")
async def submit_answers(request: SubmitAnswersRequest):
    """
    Exposes a POST endpoint to submit questionnaire responses.
    Delegates operations to the local Excel sheets module.
    """
    try:
        return sync_answers_to_local_sheet(request.business_type, request.answers)
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "The local Excel file 'consultant_data.xlsx' is currently open "
                "in Microsoft Excel or another program. Please close it and submit again."
            )
        )

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
