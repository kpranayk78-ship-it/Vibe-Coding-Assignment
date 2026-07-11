import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [date, setDate] = useState("");

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const loadDashboard = async () => {
    try {
      const statsRes = await API.get("/admin/dashboard", config);
      setStats(statsRes.data);

      const reservationRes = await API.get("/admin/reservations", config);
      setReservations(reservationRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load dashboard");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const filterReservations = async () => {
    if (!date) {
      loadDashboard();
      return;
    }

    try {
      const res = await API.get(
        `/admin/reservations/date?date=${date}`,
        config
      );

      setReservations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const cancelReservation = async (id) => {
    if (!window.confirm("Cancel this reservation?")) return;

    try {
      await API.delete(`/admin/reservations/${id}`, config);

      alert("Reservation Cancelled");

      loadDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Admin Dashboard</h1>

      <h3>Welcome, {user?.name}</h3>

      <button onClick={handleLogout}>Logout</button>

      <hr />

      <h2>Statistics</h2>

      {stats && (
        <div>
          <p><b>Total Reservations:</b> {stats.totalReservations}</p>
          <p><b>Booked:</b> {stats.bookedReservations}</p>
          <p><b>Cancelled:</b> {stats.cancelledReservations}</p>
          <p><b>Today's Reservations:</b> {stats.todayReservations}</p>
          <p><b>Total Tables:</b> {stats.totalTables}</p>
        </div>
      )}

      <hr />

      <h2>Filter by Date</h2>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button onClick={filterReservations}>
        Search
      </button>

      <button
        onClick={() => {
          setDate("");
          loadDashboard();
        }}
      >
        Reset
      </button>

      <hr />

      <h2>Reservations</h2>

      {reservations.map((r) => (
        <div
          key={r._id}
          style={{
            border: "1px solid gray",
            padding: "12px",
            marginBottom: "10px",
          }}
        >
          <p><b>Customer:</b> {r.customer.name}</p>
          <p><b>Email:</b> {r.customer.email}</p>
          <p><b>Table:</b> {r.table.tableNumber}</p>
          <p><b>Guests:</b> {r.guests}</p>
          <p><b>Date:</b> {new Date(r.date).toLocaleDateString()}</p>
          <p><b>Time:</b> {r.timeSlot}</p>
          <p><b>Status:</b> {r.status}</p>

          {r.status === "booked" && (
            <button onClick={() => cancelReservation(r._id)}>
              Cancel Reservation
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;