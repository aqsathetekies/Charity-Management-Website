from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from database.connection import get_db
from models.models import Donation, User
from schemas.schemas import DonationCreate, DonationResponse
from routes.auth import get_current_user
import shutil
import os
import uuid

router = APIRouter(tags=["Donations"])

@router.post("/donate", response_model=DonationResponse)
def create_donation(
    donor_name: Optional[str] = Form(None),
    is_anonymous: bool = Form(False),
    location_id: Optional[int] = Form(None),
    screenshot: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")

    # Handle file upload saving
    screenshot_url = None
    if screenshot:
        # Create a unique filename securely
        file_extension = screenshot.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        os.makedirs("uploads", exist_ok=True)
        file_path = os.path.join("uploads", unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(screenshot.file, buffer)
            
        screenshot_url = f"/uploads/{unique_filename}"
        
    final_donor_name = "Anonymous" if is_anonymous else (donor_name or "Anonymous")
    
    new_donation = Donation(
        amount=amount,
        donor_name=final_donor_name,
        is_anonymous=is_anonymous,
        is_verified=False,  # default is unverified
        screenshot_url=screenshot_url,
        location_id=location_id
    )
    
    db.add(new_donation)
    db.commit()
    db.refresh(new_donation)
    return new_donation

@router.get("/donations", response_model=List[DonationResponse])
def get_public_donations(db: Session = Depends(get_db)):
    # Only return verified donations for the public platform
    return db.query(Donation).filter(Donation.is_verified == True).order_by(desc(Donation.created_at)).all()

@router.get("/admin/donations", response_model=List[DonationResponse])
def get_all_donations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Admin route to see both verified and unverified donations
    return db.query(Donation).order_by(desc(Donation.created_at)).all()

@router.put("/admin/donations/{donation_id}/verify", response_model=DonationResponse)
def verify_donation(donation_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
        
    donation.is_verified = True
    db.commit()
    db.refresh(donation)
    return donation

@router.post("/admin/donations", response_model=DonationResponse)
def create_manual_donation(
    donation: DonationCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Admins adding manual donations are verified automatically.
    final_donor_name = "Anonymous" if donation.is_anonymous else (donation.donor_name or "Anonymous")
    
    new_donation = Donation(
        amount=donation.amount,
        donor_name=final_donor_name,
        is_anonymous=donation.is_anonymous,
        is_verified=True,
        screenshot_url=None,
        location_id=donation.location_id
    )
    
    db.add(new_donation)
    db.commit()
    db.refresh(new_donation)
    return new_donation
