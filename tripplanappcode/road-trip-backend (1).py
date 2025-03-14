from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    email = Column(String, unique=True)
    hashed_password = Column(String)
    full_name = Column(String)
    verification_status = Column(String)  # pending, verified, rejected
    interests = Column(String)  # stored as comma-separated strings
    rating = Column(Float, default=5.0)
    trips = relationship("Trip", back_populates="creator")

class Trip(Base):
    __tablename__ = "trips"
    id = Column(Integer, primary_key=True)
    creator_id = Column(Integer, ForeignKey("users.id"))
    start_point = Column(String)
    destination = Column(String)
    start_date = Column(String)
    duration = Column(Integer)  # in days
    max_participants = Column(Integer)
    estimated_cost = Column(Float)
    requirements = Column(String)  # stored as JSON string
    creator = relationship("User", back_populates="trips")
    participants = relationship("TripParticipant", back_populates="trip")

class TripParticipant(Base):
    __tablename__ = "trip_participants"
    id = Column(Integer, primary_key=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String)  # pending, accepted, rejected
    trip = relationship("Trip", back_populates="participants")

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = "your-secret-key"  # In production, use environment variable

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=1)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

# User Authentication and Verification
@app.post("/register")
async def register_user(user_data: dict):
    # Create new user with pending verification
    user = User(
        username=user_data["username"],
        email=user_data["email"],
        hashed_password=get_password_hash(user_data["password"]),
        verification_status="pending"
    )
    # Add to database
    db.add(user)
    db.commit()
    return {"message": "Registration successful, verification pending"}

@app.post("/verify-user/{user_id}")
async def verify_user(user_id: int, verification_data: dict):
    # Implement verification logic (background checks, ID verification, etc.)
    user = db.query(User).filter(User.id == user_id).first()
    if verification_data["status"] == "approved":
        user.verification_status = "verified"
        db.commit()
        return {"message": "User verified successfully"}
    return {"message": "Verification failed"}

# Trip Management
@app.post("/create-trip")
async def create_trip(trip_data: dict, current_user: User = Depends(get_current_user)):
    if current_user.verification_status != "verified":
        raise HTTPException(status_code=403, detail="Only verified users can create trips")
    
    new_trip = Trip(
        creator_id=current_user.id,
        start_point=trip_data["start_point"],
        destination=trip_data["destination"],
        start_date=trip_data["start_date"],
        duration=trip_data["duration"],
        max_participants=trip_data["max_participants"],
        estimated_cost=trip_data["estimated_cost"],
        requirements=trip_data["requirements"]
    )
    db.add(new_trip)
    db.commit()
    return {"message": "Trip created successfully", "trip_id": new_trip.id}

# AI Matching System
def calculate_user_compatibility(user1: User, user2: User):
    # Convert interests to vectors
    interests1 = set(user1.interests.split(','))
    interests2 = set(user2.interests.split(','))
    
    # Calculate similarity scores
    common_interests = len(interests1.intersection(interests2))
    rating_diff = abs(user1.rating - user2.rating)
    
    # Weighted scoring
    compatibility_score = (common_interests * 0.7) + ((5 - rating_diff) * 0.3)
    return compatibility_score

@app.get("/find-compatible-trips")
async def find_compatible_trips(current_user: User = Depends(get_current_user)):
    all_trips = db.query(Trip).filter(
        Trip.creator_id != current_user.id,
        Trip.start_date > datetime.now()
    ).all()
    
    compatible_trips = []
    for trip in all_trips:
        creator = trip.creator
        compatibility = calculate_user_compatibility(current_user, creator)
        if compatibility > 0.6:  # Threshold for compatibility
            compatible_trips.append({
                "trip": trip,
                "compatibility_score": compatibility,
                "creator_info": {
                    "username": creator.username,
                    "rating": creator.rating
                }
            })
    
    return sorted(compatible_trips, key=lambda x: x["compatibility_score"], reverse=True)

# Route Planning and Recommendations
@app.post("/generate-routes")
async def generate_routes(route_request: dict):
    start_point = route_request["start_point"]
    destination = route_request["destination"]
    preferences = route_request.get("preferences", {})
    
    # Here you would integrate with mapping APIs (Google Maps, MapBox, etc.)
    # For now, returning mock data
    routes = [
        {
            "name": "Scenic Route",
            "duration": "8 hours",
            "attractions": ["Grand Canyon", "Sedona Red Rocks"],
            "lodging": [
                {
                    "name": "Mountain Lodge",
                    "price": 150,
                    "rating": 4.5,
                    "affiliate_link": "http://booking.com/mountain-lodge"
                }
            ]
        }
    ]
    return routes
