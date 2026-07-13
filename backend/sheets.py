import os
import json
from datetime import datetime
from typing import Dict, Any, Tuple
from fastapi import HTTPException, status
from dotenv import load_dotenv
import google.auth
from google.auth.exceptions import DefaultCredentialsError
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Load environment variables
load_dotenv()

# Default spreadsheet IDs per business type (override via env vars)
DEFAULT_SPREADSHEET_IDS = {
    "tailoring": "15rfnQg8XN1t-PA8Bhh4A-ohVDgqmOHFhZPUxxk9XuO8",
    "general": "1-06egJwvlOA9uq96buLZVyIultTbaOrvIKMSIqcC1g0",
    "retail": "1edQAFpksTNVMvfu8pyyEqA1uII2xI8OG8k8Sp0DQiWc",
    "cattlefeed": "1edQAFpksTNVMvfu8pyyEqA1uII2xI8OG8k8Sp0DQiWc",
}

BUSINESS_TYPE_ALIASES = {
    "tailor": "tailoring",
    "tailoring": "tailoring",
    "retail": "retail",
    "general": "general",
    "cattlefeed": "cattlefeed",
    "cattle feed": "cattlefeed",
}

ENV_SPREADSHEET_KEYS = {
    "tailoring": "TAILORING_SPREADSHEET_ID",
    "general": "GENERAL_SPREADSHEET_ID",
    "retail": "RETAIL_SPREADSHEET_ID",
    "cattlefeed": "CATTLEFEED_SPREADSHEET_ID",
}


def normalize_business_type(business_type: str) -> str:
    """Map frontend business type values to a supported internal key."""
    normalized = business_type.lower().strip()
    if normalized not in BUSINESS_TYPE_ALIASES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported business type: '{business_type}'. "
                "Expected 'tailoring', 'retail', or 'general'."
            ),
        )
    return BUSINESS_TYPE_ALIASES[normalized]


def get_spreadsheet_id_for_business(business_type: str) -> str:
    """Resolve the Google Spreadsheet ID for the given business type."""
    env_key = ENV_SPREADSHEET_KEYS[business_type]
    spreadsheet_id = os.getenv(env_key, "").strip()
    if spreadsheet_id:
        return spreadsheet_id

    # Legacy fallback: single SPREADSHEET_ID env var
    legacy_id = os.getenv("SPREADSHEET_ID", "").strip()
    if legacy_id:
        return legacy_id

    return DEFAULT_SPREADSHEET_IDS[business_type]


def get_business_sheet_config(business_type: str, answers: Dict[str, Any]) -> Tuple[list, list]:
    """Return column headers and row values for the given business type."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if business_type == "tailoring":
        headers = [
            "Timestamp",
            "Submitted Business Type",
            "Employees (TQ1)",
            "Avg Monthly Orders (TQ2)",
            "Staff Challenge (TQ3)",
            "Inventory Challenge (TQ4)",
            "Operational Challenge (TQ5)",
            "Management Tool (TQ6)",
            "Business Goal (TQ7)",
        ]
        row_data = [
            timestamp,
            answers.get("business_type", "Tailoring Business"),
            answers.get("TQ1", ""),
            answers.get("TQ2", ""),
            answers.get("TQ3", ""),
            answers.get("TQ4", ""),
            answers.get("TQ5", ""),
            answers.get("TQ6", ""),
            answers.get("TQ7", ""),
        ]
    elif business_type == "retail":
        headers = [
            "Timestamp",
            "Submitted Business Type",
            "Employees (RQ1)",
            "Daily Customers (RQ2)",
            "Staff Challenge (RQ3)",
            "Inventory Challenge (RQ4)",
            "Management Tool (RQ5)",
            "Sales Challenge (RQ6)",
            "Business Goal (RQ7)",
        ]
        row_data = [
            timestamp,
            answers.get("business_type", "Retail Shop"),
            answers.get("RQ1", ""),
            answers.get("RQ2", ""),
            answers.get("RQ3", ""),
            answers.get("RQ4", ""),
            answers.get("RQ5", ""),
            answers.get("RQ6", ""),
            answers.get("RQ7", ""),
        ]
    elif business_type == "cattlefeed":
        headers = [
            "Timestamp",
            "Submitted Business Type",
            "Employees (CFQ1)",
            "Avg Monthly Volume (CFQ2)",
            "Manufacturing Challenge (CFQ3)",
            "Raw Material Challenge (CFQ4)",
            "Sales Challenge (CFQ5)",
            "Management Tool (CFQ6)",
            "Business Goal (CFQ7)",
        ]
        row_data = [
            timestamp,
            answers.get("business_type", "Cattle Feed Business"),
            answers.get("CFQ1", ""),
            answers.get("CFQ2", ""),
            answers.get("CFQ3", ""),
            answers.get("CFQ4", ""),
            answers.get("CFQ5", ""),
            answers.get("CFQ6", ""),
            answers.get("CFQ7", ""),
        ]
    else:
        headers = [
            "Timestamp",
            "Submitted Business Type",
            "Employees (GQ1)",
            "Avg Monthly Transactions (GQ2)",
            "Operational/Admin Challenge (GQ3)",
            "Management Tool (GQ4)",
            "Business Goal (GQ5)",
        ]
        row_data = [
            timestamp,
            answers.get("business_type", "General Business"),
            answers.get("GQ1", ""),
            answers.get("GQ2", ""),
            answers.get("GQ3", ""),
            answers.get("GQ4", ""),
            answers.get("GQ5", ""),
        ]

    return headers, row_data


def get_sheets_service():
    """
    Authenticate with Google and build the Sheets API service.
    Supports:
    1. Individual environment variables (GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, etc.)
    2. GOOGLE_CREDENTIALS_JSON env var (raw JSON string of service account key).
    3. GOOGLE_APPLICATION_CREDENTIALS env var (path to JSON file).
    4. Local ADC (Application Default Credentials).
    """
    # 1. Try loading from individual env variables
    client_email = os.getenv("GOOGLE_CLIENT_EMAIL")
    private_key = os.getenv("GOOGLE_PRIVATE_KEY")
    if client_email and private_key:
        try:
            # Reconstruct service account credentials from individual env variables
            creds_info = {
                "type": os.getenv("GOOGLE_TYPE", "service_account"),
                "project_id": os.getenv("GOOGLE_PROJECT_ID"),
                "private_key_id": os.getenv("GOOGLE_PRIVATE_KEY_ID"),
                "private_key": private_key.replace("\\n", "\n"),
                "client_email": client_email,
                "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                "auth_uri": os.getenv("GOOGLE_AUTH_URI", "https://accounts.google.com/o/oauth2/auth"),
                "token_uri": os.getenv("GOOGLE_TOKEN_URI", "https://oauth2.googleapis.com/token"),
                "auth_provider_x509_cert_url": os.getenv("GOOGLE_AUTH_PROVIDER_X509_CERT_URL", "https://www.googleapis.com/oauth2/v1/certs"),
                "client_x509_cert_url": os.getenv("GOOGLE_CLIENT_X509_CERT_URL"),
                "universe_domain": os.getenv("GOOGLE_UNIVERSE_DOMAIN", "googleapis.com")
            }
            creds = Credentials.from_service_account_info(
                creds_info,
                scopes=["https://www.googleapis.com/auth/spreadsheets"]
            )
            return build("sheets", "v4", credentials=creds)
        except Exception as e:
            print(f"Error loading credentials from individual env variables: {e}")

    # 2. Try loading from raw JSON string (secure production env vars)
    creds_json_str = os.getenv("GOOGLE_CREDENTIALS_JSON")
    if creds_json_str:
        try:
            creds_info = json.loads(creds_json_str)
            creds = Credentials.from_service_account_info(
                creds_info,
                scopes=["https://www.googleapis.com/auth/spreadsheets"]
            )
            return build("sheets", "v4", credentials=creds)
        except Exception as e:
            print(f"Error loading credentials from GOOGLE_CREDENTIALS_JSON: {e}")

    # 3. Try loading from file path
    credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if credentials_path:
        if not os.path.isabs(credentials_path):
            backend_dir = os.path.dirname(os.path.abspath(__file__))
            full_path = os.path.join(backend_dir, credentials_path)
            if os.path.exists(full_path):
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = full_path

    try:
        creds, _ = google.auth.default(
            scopes=["https://www.googleapis.com/auth/spreadsheets"]
        )
        service = build("sheets", "v4", credentials=creds)
        return service
    except DefaultCredentialsError as e:
        print(f"Google Credentials Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Google credentials not configured. Please configure environment variables "
                "(GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY) or GOOGLE_APPLICATION_CREDENTIALS "
                "or configure Application Default Credentials (ADC)."
            ),
        )
    except Exception as e:
        print(f"Error initializing Sheets service: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize Google Sheets service: {str(e)}",
        )


def get_default_sheet_name(service, spreadsheet_id: str) -> str:
    """Return the title of the first tab in the spreadsheet."""
    try:
        spreadsheet_metadata = (
            service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
        )
        sheets = spreadsheet_metadata.get("sheets", [])
        if not sheets:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Spreadsheet '{spreadsheet_id}' has no tabs.",
            )
        return sheets[0].get("properties", {}).get("title", "Sheet1")
    except HttpError as error:
        print(f"Error reading spreadsheet metadata: {error}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to access Google Spreadsheet '{spreadsheet_id}': {str(error)}",
        )


def ensure_headers_exist(service, spreadsheet_id: str, sheet_name: str, headers: list):
    """Write header row only when the sheet is empty."""
    try:
        range_name = f"'{sheet_name}'!A1:Z1"
        result = (
            service.spreadsheets()
            .values()
            .get(spreadsheetId=spreadsheet_id, range=range_name)
            .execute()
        )
        existing_values = result.get("values", [])
        if not existing_values or not any(cell.strip() for cell in existing_values[0] if cell):
            service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=f"'{sheet_name}'!A1",
                valueInputOption="RAW",
                body={"values": [headers]},
            ).execute()
            print(f"Wrote headers to sheet '{sheet_name}' in spreadsheet '{spreadsheet_id}'")
    except HttpError as error:
        print(f"Error ensuring headers exist: {error}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify or write headers for sheet '{sheet_name}': {str(error)}",
        )


def sync_answers_to_sheet(business_type: str, answers: Dict[str, Any]) -> Dict[str, Any]:
    """
    Route questionnaire answers to the Google Spreadsheet configured for the business type.
    """
    normalized_type = normalize_business_type(business_type)
    spreadsheet_id = get_spreadsheet_id_for_business(normalized_type)
    headers, row_data = get_business_sheet_config(normalized_type, answers)

    service = get_sheets_service()
    sheet_name = get_default_sheet_name(service, spreadsheet_id)
    ensure_headers_exist(service, spreadsheet_id, sheet_name, headers)

    try:
        range_name = f"'{sheet_name}'!A1"
        body = {"values": [row_data]}
        result = (
            service.spreadsheets()
            .values()
            .append(
                spreadsheetId=spreadsheet_id,
                range=range_name,
                valueInputOption="RAW",
                insertDataOption="INSERT_ROWS",
                body=body,
            )
            .execute()
        )

        spreadsheet_url = f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit"

        return {
            "status": "success",
            "message": (
                f"Successfully saved {normalized_type} questionnaire data "
                f"to the dedicated Google Spreadsheet."
            ),
            "business_type": normalized_type,
            "spreadsheet_id": spreadsheet_id,
            "spreadsheet_url": spreadsheet_url,
            "updates": result,
        }
    except HttpError as error:
        print(f"Error appending data to sheet: {error}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to append data to Google Sheet: {str(error)}",
        )
