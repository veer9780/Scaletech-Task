from fastapi import FastAPI, HTTPException, status
from fastapi.staticfiles import StaticFiles
from typing import List
import uuid
import random
from datetime import datetime, timedelta
import os

from .models import Seat, Meal, BookingRequest, Booking, PredictionResponse
from .database import SEATS_BY_DATE, get_seats_for_date, MEALS, BOOKINGS
from .prediction import predict_confirmation_chance, get_risk_level

app = FastAPI(
    title="Sleeper Bus Booking API",
    description="API for booking sleeper bus tickets from Ahmedabad to Mumbai with meal integration.",
    version="1.0.0"
)

@app.get("/api/health")
def read_root():
    return {"message": "Sleeper Bus Booking API is running."}

@app.get("/seats", response_model=List[Seat])
def get_seats(date: str):
    """List all seats and their availability status for a specific date."""
    return get_seats_for_date(date)

@app.get("/meals", response_model=List[Meal])
def get_meals():
    """List available meal options."""
    return MEALS

@app.post("/book", response_model=Booking)
def book_ticket(request: BookingRequest):
    """
    Book one or more seats with optional meals.
    """
    seats_on_date = get_seats_for_date(request.date)
    
    # 1. Validate Seats
    selected_seats = []
    total_seat_price = 0.0
    
    for s_id in request.seat_ids:
        seat = next((s for s in seats_on_date if s.id == s_id), None)
        if not seat:
            raise HTTPException(status_code=404, detail=f"Seat ID {s_id} not found")
        if seat.is_booked:
            raise HTTPException(status_code=400, detail=f"Seat {seat.number} is already booked")
        selected_seats.append(seat)
        total_seat_price += seat.price

    # 2. Validate Meals
    selected_meals = []
    meal_cost = 0.0
    for m_id in request.meal_ids:
        meal = next((m for m in MEALS if m.id == m_id), None)
        if meal:
            selected_meals.append(meal)
            meal_cost += meal.price

    # 3. Create Booking
    booking_id = str(uuid.uuid4())[:8]
    # Multiply meal cost by number of passengers? 
    # Usually meals are per booking or per person. Let's assume the meal selection applies to the group 
    # (or better, charge meal * number of seats). 
    # For simplicity, let's say the user selected X meals for the whole group.
    
    total_amount = total_seat_price + meal_cost
    
    new_booking = Booking(
        booking_id=booking_id,
        seat_ids=[s.id for s in selected_seats],
        date=request.date,
        passenger=request.passenger,
        meals=selected_meals,
        total_amount=total_amount,
        status="confirmed"
    )
    
    # 4. Update State
    for seat in selected_seats:
        seat.is_booked = True
        
    BOOKINGS[booking_id] = new_booking
    
    return new_booking

@app.post("/cancel/{booking_id}")
def cancel_booking(booking_id: str):
    """Cancel an existing booking and free up the seats."""
    booking = BOOKINGS.get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Free the seats
    seats_on_date = get_seats_for_date(booking.date)
    for seat_id in booking.seat_ids:
        seat = next((s for s in seats_on_date if s.id == seat_id), None)
        if seat:
            seat.is_booked = False
        
    del BOOKINGS[booking_id]
    
    return {"message": "Booking cancelled successfully", "booking_id": booking_id}

@app.get("/prediction/{booking_id}", response_model=PredictionResponse)
def get_prediction(booking_id: str):
    """
    Get the confirmation prediction for a booking.
    """
    booking = BOOKINGS.get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Calculate Mock Metrics for that specific date
    seats_on_date = get_seats_for_date(booking.date)
    booked_count = sum(1 for s in seats_on_date if s.is_booked)
    occupancy_rate = booked_count / len(seats_on_date)
    
    # Simulate days before departure based on date difference
    try:
        dep_date = datetime.strptime(booking.date, "%Y-%m-%d")
        days_before = (dep_date - datetime.now()).days
        if days_before < 0: days_before = 0
    except:
        days_before = random.randint(1, 10)
    
    prob = predict_confirmation_chance(days_before, occupancy_rate)
    risk = get_risk_level(prob)
    
    return PredictionResponse(
        booking_id=booking_id,
        confirmation_probability_percent=prob,
        risk_level=risk
    )

@app.get("/bookings")
def list_bookings():
    """List all active bookings (Admin view)."""
    return list(BOOKINGS.values())

# Mount static files (Frontend)
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
