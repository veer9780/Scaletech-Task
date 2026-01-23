from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class SeatType(str, Enum):
    LOWER = "lower"
    UPPER = "upper"

class MealType(str, Enum):
    VEG = "veg"
    NON_VEG = "non_veg"
    SNACK = "snack"

class Seat(BaseModel):
    id: int
    number: str
    type: SeatType
    price: float
    is_booked: bool = False

class Meal(BaseModel):
    id: int
    name: str
    type: MealType
    price: float

class Passenger(BaseModel):
    name: str
    age: int = Field(..., gt=0, le=100, description="Age must be between 1 and 100")
    gender: str

class BookingRequest(BaseModel):
    seat_ids: List[int]
    date: str # YYYY-MM-DD
    passenger: Passenger
    meal_ids: List[int] = []

class Booking(BaseModel):
    booking_id: str
    seat_ids: List[int]
    date: str
    passenger: Passenger
    meals: List[Meal]
    total_amount: float
    status: str = "confirmed"
    
class PredictionResponse(BaseModel):
    booking_id: str
    confirmation_probability_percent: float
    risk_level: str
