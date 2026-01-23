import random

def predict_confirmation_chance(days_before: int, occupancy_rate: float) -> float:
    """
    Mock prediction logic for booking confirmation.
    
    Args:
        days_before: Number of days remaining until departure.
        occupancy_rate: Current bus occupancy (0.0 to 1.0).
        
    Returns:
        float: Probability percentage (0.0 to 100.0)
    """
    base_chance = 95.0 

    # Penalty for late bookings (less than 2 days)
    if days_before < 2:
        base_chance -= 15.0

    # Penalty for high occupancy
    if occupancy_rate > 0.8:
        base_chance -= 20.0
    elif occupancy_rate > 0.5:
        base_chance -= 5.0

    # Random noise to simulate model variance
    noise = random.uniform(0, 5)
    chance = base_chance - noise
    
    return round(max(0.0, min(100.0, chance)), 2)

def get_risk_level(probability: float) -> str:
    if probability >= 80:
        return "Low Risk"
    elif probability >= 50:
        return "Medium Risk"
    else:
        return "High Risk"
