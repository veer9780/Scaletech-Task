// Admin Dashboard Logic

const API_BASE = ''; // Init relative to current origin

// Auth
function checkAuth() {
    const token = localStorage.getItem('admin_token');
    if (!token && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
    }
}

function login(email, password) {
    // Mock Auth
    if (email === 'admin@sleeper.com' && password === 'admin123') {
        localStorage.setItem('admin_token', 'mock-jwt-token');
        window.location.href = 'dashboard.html';
        return true;
    }
    return false;
}

function logout() {
    localStorage.removeItem('admin_token');
    window.location.href = 'login.html';
}

// Login Page Logic
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target[0].value;
        const password = e.target[1].value;
        if (!login(email, password)) {
            alert('Invalid credentials');
        }
    });
}

// Data Fetching
async function fetchBookings() {
    try {
        const res = await fetch('/bookings');
        if (!res.ok) throw new Error('Failed to fetch data');
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

// Dashboard Logic
async function loadDashboardData() {
    const bookings = await fetchBookings();

    // KPI Updates
    const kpiBookings = document.getElementById('kpi-bookings');
    if (kpiBookings) kpiBookings.innerText = bookings.length;

    // Recent Activity Table (Last 5)
    const tableBody = document.getElementById('activity-table-body');
    if (tableBody) {
        tableBody.innerHTML = '';
        bookings.slice(-5).reverse().forEach(b => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="font-family: monospace; font-weight: 600;">#${b.booking_id}</td>
                <td>
                    <div style="font-weight: 500;">${b.passenger.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${b.passenger.gender}, ${b.passenger.age}</div>
                </td>
                <td>${b.date}</td>
                <td>₹${b.total_amount}</td>
                <td><span class="status-badge ${getStatusClass(b.status)}">${b.status}</span></td>
             `;
            tableBody.appendChild(row);
        });
    }
}

// Bookings Page Logic
async function loadBookingsPage() {
    const bookings = await fetchBookings();
    const tableBody = document.getElementById('bookings-table-body');

    if (tableBody) {
        tableBody.innerHTML = '';
        if (bookings.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">No bookings found</td></tr>';
            return;
        }

        bookings.reverse().forEach(b => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="font-family: monospace; font-weight: 600; color: var(--primary);">#${b.booking_id}</td>
                <td>
                    <div style="font-weight: 500;">${b.passenger.name}</div>
                </td>
                <td>${b.date}</td>
                <td>${b.seat_ids.length} Seats</td>
                <td>₹${b.total_amount}</td>
                <td><span class="status-badge ${getStatusClass(b.status)}">${b.status}</span></td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn" style="padding: 4px 8px;" title="Edit"><i class="ri-pencil-line"></i></button>
                        <button class="btn" style="padding: 4px 8px; color: var(--danger); border-color: #fee2e2;" onclick="deleteBooking('${b.booking_id}')" title="Delete"><i class="ri-delete-bin-line"></i></button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

async function deleteBooking(id) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
        const res = await fetch(`/cancel/${id}`, { method: 'POST' });
        if (res.ok) {
            // Reload table
            loadBookingsPage();
        } else {
            alert('Failed to delete booking');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

function getStatusClass(status) {
    if (status === 'confirmed') return 'status-confirmed';
    if (status === 'cancelled') return 'status-canceled';
    return 'status-pending';
}
