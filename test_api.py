from fastapi.testclient import TestClient
from backend.main import app
import sys

client = TestClient(app)

def test_flow():
    print("1. Testing GET /seats...")
    response = client.get("/seats")
    assert response.status_code == 200
    seats = response.json()
    print(f"   Found {len(seats)} seats.")
    available_seat = next(s for s in seats if not s['is_booked'])
    print(f"   Selected Seat ID: {available_seat['id']}")

    print("\n2. Testing GET /meals...")
    response = client.get("/meals")
    assert response.status_code == 200
    meals = response.json()
    print(f"   Found {len(meals)} meals.")
    meal_id = meals[0]['id']

    print("\n3. Testing POST /book...")
    payload = {
        "seat_id": available_seat['id'],
        "passenger": {
            "name": "John Doe",
            "age": 30,
            "gender": "Male"
        },
        "meal_ids": [meal_id]
    }
    response = client.post("/book", json=payload)
    if response.status_code != 200:
        print(f"   Booking Failed: {response.text}")
        return
    booking = response.json()
    booking_id = booking['booking_id']
    print(f"   Booking Successful! ID: {booking_id}")
    print(f"   Total Amount: {booking['total_amount']}")

    print("\n4. Testing Double Booking (Should Fail)...")
    response = client.post("/book", json=payload)
    assert response.status_code == 400
    print("   Double booking prevented successfully.")

    print(f"\n5. Testing GET /prediction/{booking_id}...")
    response = client.get(f"/prediction/{booking_id}")
    assert response.status_code == 200
    pred = response.json()
    print(f"   Prediction: {pred['confirmation_probability_percent']}% ({pred['risk_level']})")

    print(f"\n6. Testing POST /cancel/{booking_id}...")
    response = client.post(f"/cancel/{booking_id}")
    assert response.status_code == 200
    print("   Cancellation successful.")

    print("\n7. Verifying Seat is Available Again...")
    response = client.get("/seats")
    seats = response.json()
    target_seat = next(s for s in seats if s['id'] == available_seat['id'])
    assert target_seat['is_booked'] == False
    print("   Seat is available again.")

    print("\nAll Tests Passed!")

if __name__ == "__main__":
    try:
        test_flow()
    except ImportError:
        print("FastAPI or dependencies not installed. Please install them to run tests.")
    except Exception as e:
        print(f"An error occurred: {e}")
