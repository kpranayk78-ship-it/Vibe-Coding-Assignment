# 🍽️ Restaurant Reservation Management System

A full-stack Restaurant Reservation Management System built using **React**, **Node.js**, **Express**, and **MongoDB**. The application allows customers to reserve restaurant tables while providing administrators with tools to manage reservations efficiently.

---

## ✨ Features

### 👤 Customer

- User Registration
- User Login using JWT Authentication
- Book a table reservation
- View personal reservations
- Cancel reservations
- Automatic table allocation based on guest count and availability

### 👨‍💼 Administrator

- Secure Admin Login
- Dashboard with reservation statistics
- View all reservations
- Filter reservations by date
- Update reservation details
- Cancel any reservation

---

## 🛠️ Tech Stack

### Frontend

- React
- React Router DOM
- Axios
- Vite

### Backend

- Node.js
- Express.js
- JWT Authentication
- bcryptjs

### Database

- MongoDB Atlas
- Mongoose

### Deployment

- Frontend: Vercel
- Backend: Render

---

# 📂 Project Structure

```text
Restaurant-Reservation-System
│
├── client
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   ├── routes
│   │   └── App.jsx
│   └── package.json
│
├── server
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── seed
│   ├── app.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# 🚀 Installation

## 1. Clone Repository

```bash
git clone https://github.com/kpranayk78-ship-it/OA.git
```

---

## 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the backend:

```bash
npm run dev
```

---

## 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

# 🔐 Authentication

Authentication is implemented using **JSON Web Tokens (JWT)**.

After a successful login:

- JWT token is generated.
- Token is stored on the client.
- Protected routes require a valid token.
- Role-based middleware authorizes Customer and Admin access.

---

# 👥 User Roles

## Customer

Customers can:

- Register
- Login
- Create reservations
- View their own reservations
- Cancel their reservations

---

## Administrator

Administrators can:

- View all reservations
- View reservations by date
- Update reservations
- Cancel any reservation
- View dashboard statistics

---

# 🍽️ Reservation & Availability Logic

The reservation system automatically assigns tables using the following logic:

1. Find tables with sufficient seating capacity.
2. Sort suitable tables by smallest capacity first.
3. Check whether the table is already booked for the selected date and time slot.
4. Assign the first available table.
5. If no suitable table is available, return an appropriate error message.

This approach:

- Prevents double booking.
- Optimizes table utilization.
- Ensures seating capacity is sufficient for the requested number of guests.

---

# 📊 Database Models

## User

- Name
- Email
- Password (hashed using bcrypt)
- Role (Customer/Admin)

## Table

- Table Number
- Seating Capacity

## Reservation

- Customer
- Assigned Table
- Reservation Date
- Time Slot
- Number of Guests
- Status

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Register User |
| POST | `/api/auth/login` | Login User |

### Customer

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/reservations` | Create Reservation |
| GET | `/api/reservations` | Get My Reservations |
| DELETE | `/api/reservations/:id` | Cancel Reservation |

### Admin

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard Statistics |
| GET | `/api/admin/reservations` | View All Reservations |
| GET | `/api/admin/reservations/date` | Filter by Date |
| PUT | `/api/admin/reservations/:id` | Update Reservation |
| DELETE | `/api/admin/reservations/:id` | Cancel Reservation |

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing using bcrypt
- Role-based Authorization
- Environment Variables
- Input Validation
- Centralized Error Handling

---

# 📋 Assumptions Made

- Single restaurant.
- Fixed number of tables.
- Tables are seeded into the database.
- One reservation occupies an entire table during the selected time slot.
- Reservations can only have the status **booked** or **cancelled**.

---

# ⚠️ Known Limitations

- No email notifications.
- No payment integration.
- No real-time reservation updates.
- Restaurant tables are seeded programmatically rather than managed through the UI.

---

# 🚀 Future Improvements

- Real-time table availability.
- Email confirmations.
- Reservation reminders.
- Admin table management interface.
- Pagination and search.
- Customer profile management.
- Responsive UI improvements.
- Unit and integration testing.

---

# 🌐 Live Demo

### Frontend

https://oa-delta.vercel.app

### Backend

https://oa-wutv.onrender.com

---

# 👨‍💻 Author

**Pranay Kumar**

Developed as part of a Full-Stack Developer Internship Assignment with the assistance of AI tools.

---

# 📄 License

This project was developed for educational and internship evaluation purposes.
