from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.models import Location, User
from schemas.schemas import LocationCreate, LocationResponse
from routes.auth import get_current_user

router = APIRouter(tags=["Locations"])

@router.get("/locations", response_model=List[LocationResponse])
def get_locations(db: Session = Depends(get_db)):
    """Fetch all available locations for the dropdown."""
    return db.query(Location).order_by(Location.name).all()

@router.post("/admin/locations", response_model=LocationResponse)
def create_location(
    location: LocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin route to add a new location option."""
    existing_location = db.query(Location).filter(Location.name == location.name).first()
    if existing_location:
        raise HTTPException(status_code=400, detail="Location already exists")
        
    new_location = Location(name=location.name)
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    return new_location
