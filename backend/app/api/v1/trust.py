from fastapi import APIRouter, HTTPException, status
from app.schemas import ContactSubmission, DataDeletionRequest
from datetime import datetime, timezone

router = APIRouter(prefix="/trust", tags=["Trust, Contact & Privacy"])

@router.post("/contact")
def submit_contact_form(form: ContactSubmission):
    # Store or log contact submission securely
    return {
        "status": "success",
        "message": f"Thank you, {form.name}. Your inquiry regarding '{form.subject}' has been received. Our operations team will respond to {form.email} within 1 business day.",
        "received_at": datetime.now(timezone.utc).isoformat()
    }

@router.post("/privacy/deletion-request")
def submit_deletion_request(req: DataDeletionRequest):
    if not req.confirm_audit_retention:
        raise HTTPException(
            status_code=400,
            detail="To process an account deletion request, you must acknowledge that historical inventory movement records in the Stock Movement Ledger cannot be deleted due to audit and financial compliance regulations."
        )

    return {
        "status": "received",
        "ticket_id": f"DEL-{int(datetime.now().timestamp())}",
        "message": f"Deletion request registered for {req.email}. User profile credentials and non-essential personal identifiers will be purged within 30 days. Historical ledger audit movements are pseudonymized to preserve warehouse reconciliation integrity.",
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }
