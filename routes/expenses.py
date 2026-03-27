from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from database.connection import get_db
from models.models import Expense, Donation, User
from schemas.schemas import ExpenseCreate, ExpenseResponse
from routes.auth import get_current_user

router = APIRouter(tags=["Expenses"])

@router.post("/expense", response_model=ExpenseResponse)
def create_expense(
    expense: ExpenseCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Calculate available funds to prevent over-expending (only verified donations count)
    total_donations = db.query(func.sum(Donation.amount)).filter(Donation.is_verified == True).scalar() or 0.0
    total_expenses = db.query(func.sum(Expense.amount)).scalar() or 0.0
    remaining_balance = total_donations - total_expenses
    
    if expense.amount > remaining_balance:
        raise HTTPException(status_code=400, detail="Insufficient funds for this expense.")
        
    new_expense = Expense(
        amount=expense.amount,
        description=expense.description
    )
    
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.get("/expenses", response_model=List[ExpenseResponse])
def get_expenses(db: Session = Depends(get_db)):
    return db.query(Expense).order_by(Expense.created_at.desc()).all()
