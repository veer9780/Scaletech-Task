# Sleeper Bus Ticket Booking System (Ahmedabad → Mumbai)

## Project Overview
This project is a web-based flow for a sleeper bus booking service operating between Ahmedabad and Mumbai. It features a unique integration of meal booking during the checkout process and a booking confirmation prediction model.

## Features
1.  **Bus Availability & Search**: View the single bus operating between Ahmedabad and Mumbai with intermediate stops (e.g., Vadodara, Surat).
2.  **Interactive Seat Selection**: View available sleeper berths and select specific seats.
3.  **Integrated Meal Booking**: Add meals (Veg/Non-Veg/Snacks) directly to the ticket during the booking flow.
4.  **Booking Confirmation Prediction**: AI-powered estimation of booking confirmation chances for waitlisted or high-demand scenarios.
5.  **Booking Management**: Book tickets and cancel existing bookings.
6.  **Real-time Availability**: Immediate updates on seat status to prevent double bookings.
7.  **Passenger Details Management**: Capture name, age, gender, and contact info for each passenger.

## SaaS Admin Dashboard
The project includes a fully functional, premium-styled Admin Dashboard for managing the bus system.

### Features
1.  **SaaS-Style UI**: Modern, clean, and responsive design with sidebar navigation and light/dark theme compatibility.
2.  **Dashboard Overview**: Real-time KPI cards for **Total Revenue**, **Total Bookings**, and **Occupancy Rate**, along with a visual "Recent Activity" feed.
3.  **Booking Management**: Comprehensive table view to search, filter, and manage all bookings.
4.  **Admin Actions**: Ability to **Cancel Bookings** directly from the admin panel with instant updates.

### Access & Credentials
*   **URL**: `http://localhost:8000/admin/login.html`
*   **Email**: `admin@sleeper.com`
*   **Password**: `admin123`

## Test Cases

### Functional Test Cases
1.  **Search**: Verify bus details (Departure/Arrival time) are correct for Ahmedabad -> Mumbai.
2.  **Booking**: Successfully book an available seat and verify the status updates to 'Booked'.
3.  **Meal Integration**: Verify selected meal is correctly associated with the booking ID.
4.  **Cancellation**: Cancel a booking and verify the seat becomes available again.
5.  **Prediction**: Verify the prediction endpoint returns a percentage value between 0-100.

### Edge Cases
1.  **Double Booking**: Try to book a seat that is already booked (should return error).
2.  **Invalid Seat**: Try to book a seat number that doesn't exist (e.g., Seat 99).
3.  **Cancellation of Invalid ID**: Try to cancel a non-existent booking ID.
4.  **Empty Passenger Details**: Submit booking without passenger name (should fail validation).

### UI/UX Validation Cases (For Frontend)
1.  **Responsive Design**: Verify flow works on Mobile (375px) and Desktop (1440px).
2.  **Loading States**: Ensure spinners appear during API calls (booking/prediction).
3.  **Error Feedback**: Verify clear error messages are shown for failed transactions.
4.  **Meal Selection Visibility**: Ensure meal options are prominent and easy to toggle.

## Prototype Link
*   **Design Prototype**: [Insert Figma/Adobe XD Link Here]
    *   *Note: Since I am an AI, I cannot generate a hosted Figma file, but the flow follows standard e-commerce checkout principles: Search -> Select Seat -> Add Add-ons (Meals) -> Passenger Info -> Payment -> Success.*

## Tech Stack
*   **Backend**: Python (FastAPI)
*   **Data Science**: Python (Scikit-learn mock logic)
*   **Database**: In-memory (Mock)

## Setup & Run
1.  Install dependencies:
    ```bash
    pip install fastapi uvicorn pydantic scikit-learn pandas
    ```
2.  Run the server:
    ```bash
    cd backend
    python -m uvicorn main:app --reload
    ```
3.  Access API Docs: `http://localhost:8000/docs`
