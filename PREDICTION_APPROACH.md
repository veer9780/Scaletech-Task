# Booking Confirmation Prediction Approach

## 1. Prediction Logic
The goal is to predict the probability of a ticket being confirmed or remaining confirmed based on historical demand and current booking parameters.

For this assignment, we implement a **mock logic** that simulates a trained Machine Learning model. The logic considers the following factors:
*   **Days until departure**: Closer dates have higher demand.
*   **Current Occupancy**: Higher occupancy reduces confirmation chances for new waitlisted requests (or implies higher stability for booked ones).
*   **Day of Week**: Weekends (Fri-Sun) have higher traffic.
*   **Time of Booking**: Evening bookings might have different patterns.

## 2. Model Choice (Proposed)
If implementing a real model, we would use a **Random Forest Classifier** or **XGBoost**.
*   **Why?**: These models handle non-linear relationships well (e.g., interaction between 'Day of Week' and 'Route Popularity') and offer feature importance scores.
*   **Input Features**: `days_to_departure`, `is_weekend`, `current_occupancy_rate`, `passenger_count`.
*   **Target Variable**: `is_confirmed` (1 or 0).

## 3. Mock Dataset Structure
We simulate training on a dataset like this:

| booking_id | days_to_dep | is_weekend | occupancy_rate | meals_ordered | is_confirmed |
|------------|-------------|------------|----------------|---------------|--------------|
| 101        | 5           | 0          | 0.2            | 1             | 1            |
| 102        | 1           | 1          | 0.9            | 0             | 0            |
| ...        | ...         | ...        | ...            | ...           | ...          |

## 4. Implemented Mock Logic
In `backend/prediction.py`, the function `predict_confirmation_chance(days_before, occupancy)` uses a heuristic formula:

```python
base_chance = 95.0 # Base high chance

# Penalty for late bookings (less than 2 days)
if days_before < 2:
    base_chance -= 15

# Penalty for high occupancy
if occupancy > 0.8:
    base_chance -= 20

# Random noise to simulate model variance
chance = base_chance - random.uniform(0, 5)
return max(0, min(100, chance))
```

## 5. Final Prediction Output
The API returns a JSON object:
```json
{
  "booking_id": "12345",
  "confirmation_probability_percent": 87.5,
  "status": "High Chance"
}
```
