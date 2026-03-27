from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.connection import get_db
from models.models import Donation, Expense
from schemas.schemas import DashboardResponse

router = APIRouter(tags=["Dashboard"])

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    # Only calculate total funds from verified donations
    total_donations = db.query(func.sum(Donation.amount)).filter(Donation.is_verified == True).scalar() or 0.0
    total_expenses = db.query(func.sum(Expense.amount)).scalar() or 0.0
    remaining_balance = total_donations - total_expenses
    
    return DashboardResponse(
        totalFunds=total_donations,
        totalExpenses=total_expenses,
        remainingBalance=remaining_balance
    )
