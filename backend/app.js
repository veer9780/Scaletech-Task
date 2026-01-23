// State
let selectedSeats = []; // Array of seat objects
let selectedMeals = [];
let seatsData = [];
let mealsData = [];
let currentDate = new Date().toISOString().split('T')[0];

// DOM Elements
const lowerDeck = document.getElementById('lower-deck');
const upperDeck = document.getElementById('upper-deck');
const emptyState = document.getElementById('empty-state');
const bookingForm = document.getElementById('booking-form');
const successView = document.getElementById('success-view');
const seatDisplay = document.getElementById('selected-seat-display');
const seatPriceEl = document.getElementById('seat-price');
const mealPriceEl = document.getElementById('meal-price');
const totalPriceEl = document.getElementById('total-price');
const mealList = document.getElementById('meal-list');
const toast = document.getElementById('toast');
const dateInput = document.getElementById('travel-date');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Set default date to today
    dateInput.value = currentDate;
    
    // Date Change Listener
    dateInput.addEventListener('change', (e) => {
        currentDate = e.target.value;
        // Reset selection on date change
        selectedSeats = [];
        updateUIState();
        fetchSeats();
    });

    await fetchMeals();
    await fetchSeats();
});

// Fetch Data
async function fetchSeats() {
    try {
        const res = await fetch(`/seats?date=${currentDate}`);
        seatsData = await res.json();
        renderSeats();
    } catch (err) {
        showToast('Failed to load seats', 'error');
    }
}

async function fetchMeals() {
    try {
        const res = await fetch('/meals');
        mealsData = await res.json();
        renderMeals();
    } catch (err) {
        console.error("Meals load error", err);
    }
}

// Render Logic
function renderSeats() {
    lowerDeck.innerHTML = '';
    upperDeck.innerHTML = '';

    seatsData.forEach(seat => {
        const el = document.createElement('div');
        const isSelected = selectedSeats.some(s => s.id === seat.id);
        
        el.className = `seat ${seat.is_booked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`;
        el.innerHTML = `
            <div class="seat-pillow"></div>
            ${seat.number}
        `;
        
        if (!seat.is_booked) {
            el.onclick = () => toggleSeatSelection(seat);
        }

        if (seat.type === 'lower') {
            lowerDeck.appendChild(el);
        } else {
            upperDeck.appendChild(el);
        }
    });
}

function renderMeals() {
    mealList.innerHTML = '';
    mealsData.forEach(meal => {
        const el = document.createElement('label');
        el.className = 'meal-option';
        el.innerHTML = `
            <input type="checkbox" value="${meal.id}" onchange="toggleMeal(this, ${meal.price})">
            <div style="flex-grow: 1;">
                <div style="font-weight: 500;">${meal.name}</div>
                <div style="font-size: 0.8rem; color: #6b7280;">${meal.type.toUpperCase()} • ₹${meal.price}</div>
            </div>
        `;
        mealList.appendChild(el);
    });
}

// Interaction Logic
function toggleSeatSelection(seat) {
    const index = selectedSeats.findIndex(s => s.id === seat.id);
    
    if (index > -1) {
        // Deselect
        selectedSeats.splice(index, 1);
    } else {
        // Select
        selectedSeats.push(seat);
    }
    
    updateUIState();
    updatePricing();
    renderSeats(); // Re-render to update classes
}

function updateUIState() {
    if (selectedSeats.length === 0) {
        emptyState.style.display = 'block';
        bookingForm.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        bookingForm.style.display = 'block';
        successView.style.display = 'none';
        
        // Update Form Display
        const names = selectedSeats.map(s => s.number).join(', ');
        seatDisplay.innerText = `${names} (${selectedSeats.length} Seats)`;
    }
}

function toggleMeal(checkbox, price) {
    const parent = checkbox.closest('.meal-option');
    if (checkbox.checked) {
        parent.classList.add('active');
        selectedMeals.push(parseInt(checkbox.value));
    } else {
        parent.classList.remove('active');
        selectedMeals = selectedMeals.filter(id => id !== parseInt(checkbox.value));
    }
    updatePricing();
}

function updatePricing() {
    if (selectedSeats.length === 0) return;

    const seatPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const mealPrice = selectedMeals.reduce((total, id) => {
        const m = mealsData.find(m => m.id === id);
        return total + (m ? m.price : 0);
    }, 0);

    seatPriceEl.innerText = `₹${seatPrice}`;
    mealPriceEl.innerText = `₹${mealPrice}`;
    totalPriceEl.innerText = `₹${seatPrice + mealPrice}`;
}

// Booking Logic
bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (selectedSeats.length === 0) return;

    const btn = document.getElementById('book-btn');
    const loader = document.getElementById('btn-loader');
    
    // UI Loading State
    btn.disabled = true;
    btn.childNodes[0].textContent = ''; // Hide text
    loader.style.display = 'block';

    const payload = {
        seat_ids: selectedSeats.map(s => s.id),
        date: currentDate,
        passenger: {
            name: document.getElementById('p-name').value,
            age: parseInt(document.getElementById('p-age').value),
            gender: document.getElementById('p-gender').value
        },
        meal_ids: selectedMeals
    };

    try {
        // 1. Book
        const res = await fetch('/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error((await res.json()).detail || 'Booking failed');

        const booking = await res.json();

        // 2. Get Prediction
        const predRes = await fetch(`/prediction/${booking.booking_id}`);
        const prediction = await predRes.json();

        // 3. Show Success
        showSuccess(booking, prediction);
        
        // Reset Selection
        selectedSeats = [];
        updateUIState();
        
        // Refresh seats in background
        fetchSeats();

    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.childNodes[0].textContent = 'Confirm Booking';
        loader.style.display = 'none';
    }
});

function showSuccess(booking, prediction) {
    bookingForm.style.display = 'none';
    successView.style.display = 'block';
    
    document.getElementById('success-id').innerText = booking.booking_id;
    document.getElementById('pred-chance').innerText = prediction.confirmation_probability_percent;
    document.getElementById('pred-risk').innerText = prediction.risk_level;
}

// Utilities
function showToast(msg, type = 'success') {
    toast.innerText = msg;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}
