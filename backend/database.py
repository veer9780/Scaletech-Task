from typing import List, Dict
import copy
from .models import Seat, Meal, SeatType, MealType, Booking

# Mock Data
# SEATS_BY_DATE: { "2023-10-27": [Seat, Seat...] }
SEATS_BY_DATE: Dict[str, List[Seat]] = {} 
MEALS: List[Meal] = []
BOOKINGS: Dict[str, Booking] = {}

def create_seats_for_date(date: str) -> List[Seat]:
    """Generate fresh seats for a new date."""
    seats = []
    # Initialize 20 seats (10 lower, 10 upper)
    for i in range(1, 11):
        seats.append(Seat(id=i, number=f"L{i}", type=SeatType.LOWER, price=800.0, is_booked=False))
        seats.append(Seat(id=i+10, number=f"U{i}", type=SeatType.UPPER, price=650.0, is_booked=False))
    return seats

def get_seats_for_date(date: str) -> List[Seat]:
    if date not in SEATS_BY_DATE:
        SEATS_BY_DATE[date] = create_seats_for_date(date)
    return SEATS_BY_DATE[date]

def init_db():
    # Initialize Meals
    MEALS.append(Meal(id=1, name="Veg Thali", type=MealType.VEG, price=150.0))
    MEALS.append(Meal(id=2, name="Chicken Biryani", type=MealType.NON_VEG, price=250.0))
    MEALS.append(Meal(id=3, name="Sandwich & Chips", type=MealType.SNACK, price=100.0))

# Initialize on module load
init_db()
