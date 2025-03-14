from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from datetime import datetime
import stripe
import uuid

# Virtual Wallet Model
class VirtualWallet(Base):
    __tablename__ = "virtual_wallets"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    balance = Column(Float, default=0.0)
    card_number = Column(String, unique=True)  # Virtual card number
    status = Column(String)  # active, frozen, closed
    created_at = Column(DateTime, default=datetime.utcnow)

# Transaction History
class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"
    id = Column(Integer, primary_key=True)
    wallet_id = Column(Integer, ForeignKey("virtual_wallets.id"))
    amount = Column(Float)
    transaction_type = Column(String)  # deposit, withdrawal, transfer, payment
    description = Column(String)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# Rewards System
class WalletRewards(Base):
    __tablename__ = "wallet_rewards"
    id = Column(Integer, primary_key=True)
    wallet_id = Column(Integer, ForeignKey("virtual_wallets.id"))
    points = Column(Float, default=0.0)
    level = Column(String)  # bronze, silver, gold
    last_updated = Column(DateTime, default=datetime.utcnow)

async def create_virtual_wallet(user_id: int):
    # Generate unique virtual card number
    card_number = f"4242-TRIP-{uuid.uuid4().hex[:8].upper()}"
    
    wallet = VirtualWallet(
        user_id=user_id,
        card_number=card_number,
        status="active"
    )
    db.add(wallet)
    db.commit()
    return wallet

@app.post("/api/wallet/add-funds")
async def add_funds(data: dict, current_user: User = Depends(get_current_user)):
    try:
        wallet = db.query(VirtualWallet).filter(
            VirtualWallet.user_id == current_user.id
        ).first()
        
        # Create Stripe payment intent for funding
        payment_intent = stripe.PaymentIntent.create(
            amount=int(data["amount"] * 100),
            currency="usd",
            metadata={"wallet_id": wallet.id}
        )
        
        # Record transaction
        transaction = WalletTransaction(
            wallet_id=wallet.id,
            amount=data["amount"],
            transaction_type="deposit",
            status="pending"
        )
        db.add(transaction)
        db.commit()
        
        return {"client_secret": payment_intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/wallet/transfer")
async def transfer_funds(data: dict, current_user: User = Depends(get_current_user)):
    sender_wallet = db.query(VirtualWallet).filter(
        VirtualWallet.user_id == current_user.id
    ).first()
    
    if sender_wallet.balance < data["amount"]:
        raise HTTPException(status_code=400, detail="Insufficient funds")
    
    # Process transfer
    sender_wallet.balance -= data["amount"]
    
    recipient_wallet = db.query(VirtualWallet).filter(
        VirtualWallet.user_id == data["recipient_id"]
    ).first()
    recipient_wallet.balance += data["amount"]
    
    # Record transactions
    transaction = WalletTransaction(
        wallet_id=sender_wallet.id,
        amount=-data["amount"],
        transaction_type="transfer",
        description=f"Transfer to {recipient_wallet.card_number[-4:]}"
    )
    db.add(transaction)
    db.commit()
    
    return {"message": "Transfer successful"}

@app.get("/api/wallet/rewards")
async def get_rewards(current_user: User = Depends(get_current_user)):
    wallet = db.query(VirtualWallet).filter(
        VirtualWallet.user_id == current_user.id
    ).first()
    
    rewards = db.query(WalletRewards).filter(
        WalletRewards.wallet_id == wallet.id
    ).first()
    
    return {
        "points": rewards.points,
        "level": rewards.level,
        "cash_value": rewards.points * 0.01  # 1 point = $0.01
    }
