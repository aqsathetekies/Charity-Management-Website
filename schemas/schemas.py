from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class LocationCreate(BaseModel):
    name: str

class LocationResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class DonationCreate(BaseModel):
    amount: float = Field(..., gt=0)
    donor_name: Optional[str] = None
    is_anonymous: bool = False
    location_id: Optional[int] = None

class DonationResponse(BaseModel):
    id: int
    amount: float
    donor_name: str
    is_anonymous: bool
    is_verified: bool
    screenshot_url: Optional[str]
    location_id: Optional[int] = None
    location: Optional[LocationResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ExpenseCreate(BaseModel):
    amount: float = Field(..., gt=0)
    description: str = Field(..., min_length=1)

class ExpenseResponse(BaseModel):
    id: int
    amount: float
    description: str
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardResponse(BaseModel):
    totalFunds: float
    totalExpenses: float
    remainingBalance: float
