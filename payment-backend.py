from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import stripe
from datetime import datetime
from typing import List

# Initialize Stripe
stripe.api_key = "your_stripe_secret_key"  # In production, use environment variable

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    status = Column(String)
    payment_method = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    description = Column(String)
    amount = Column(Float)
    paid_by = Column(Integer, ForeignKey("users.id"))
    split_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

@app.post("/api/payments/create-intent")
async def create_payment_intent(payment_data: dict, current_user: User = Depends(get_current_user)):
    try:
        # Create Stripe PaymentIntent
        intent = stripe.PaymentIntent.create(
            amount=int(payment_data["amount"] * 100),  # Convert to cents
            currency="usd",
            metadata={
                "trip_id": payment_data["trip_id"],
                "user_id": current_user.id
            }
        )
        
        # Record payment attempt in database
        payment = Payment(
            trip_id=payment_data["trip_id"],
            user_id=current_user.id,
            amount=payment_data["amount"],
            status="pending",
            payment_method=payment_data["payment_method"]
        )
        db.add(payment)
        db.commit()
        
        return {"client_secret": intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/expenses/create")
async def create_expense(expense_data: dict, current_user: User = Depends(get_current_user)):
    try:
        expense = Expense(
            trip_id=expense_data["trip_id"],
            description=expense_data["description"],
            amount=expense_data["amount"],
            paid_by=current_user.id,
            split_type=expense_data["split_type"]
        )
        db.add(expense)
        db.commit()
        
        # Calculate and update shares for all participants
        trip = db.query(Trip).filter(Trip.id == expense_data["trip_id"]).first()
        participants = trip.participants
        share_amount = expense_data["amount"] / len(participants)
        
        for participant in participants:
            if participant.user_id != current_user.id:
                create_payment_request(
                    user_id=participant.user_id,
                    amount=share_amount,
                    expense_id=expense.id
                )
        
        return {"message": "Expense created successfully", "expense_id": expense.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def create_payment_request(user_id: int, amount: float, expense_id: int):
    payment_request = PaymentRequest(
        user_id=user_id,
        amount=amount,
        expense_id=expense_id,
        status="pending"
    )
    db.add(payment_request)
    db.commit()

@app.get("/api/expenses/{trip_id}")
async def get_trip_expenses(trip_id: int, current_user: User = Depends(get_current_user)):
    expenses = db.query(Expense).filter(Expense.trip_id == trip_id).all()
    return expenses

@app.get("/api/payments/balance/{trip_id}")
async def get_trip_balance(trip_id: int, current_user: User = Depends(get_current_user)):
    expenses = db.query(Expense).filter(
        Expense.trip_id == trip_id,
        Expense.paid_by == current_user.id
    ).all()
    
    paid = sum(expense.amount for expense in expenses)
    owed = calculate_user_share(trip_id, current_user.id)
    
    return {
        "paid": paid,
        "owed": owed,
        "balance": paid - owed
    }
