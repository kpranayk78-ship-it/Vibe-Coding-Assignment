import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function CustomerDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    date: "",
    timeSlot: "",
    guests: "",
  });

  const [reservations, setReservations] = useState([]);

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Load reservations
  const fetchReservations = async () => {
    try {
      const res = await API.get("/reservations", config);
      setReservations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleBook = async (e) => {
    e.preventDefault();

    try {
      await API.post("/reservations", form, config);

      alert("Reservation Booked!");

      setForm({
        date: "",
        timeSlot: "",
        guests: "",
      });

      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  const cancelReservation = async (id) => {
    if (!window.confirm("Cancel this reservation?")) return;

    try {
      await API.delete(`/reservations/${id}`, config);

      alert("Reservation Cancelled");

      fetchReservations();
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
      <h1>Customer Dashboard</h1>

      <h3>Welcome, {user?.name}</h3>

      <button onClick={handleLogout}>Logout</button>

      <hr />

      <h2>Book Reservation</h2>

      <form onSubmit={handleBook}>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          type="time"
          name="timeSlot"
          value={form.timeSlot}
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          type="number"
          name="guests"
          placeholder="Guests"
          value={form.guests}
          onChange={handleChange}
          required
        />

        <br /><br />

        <button>Book Table</button>
      </form>

      <hr />

      <h2>My Reservations</h2>

      {reservations.length === 0 ? (
        <p>No Reservations</p>
      ) : (
        reservations.map((r) => (
          <div
            key={r._id}
            style={{
              border: "1px solid gray",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <p>
              <b>Date:</b>{" "}
              {new Date(r.date).toLocaleDateString()}
            </p>

            <p>
              <b>Time:</b> {r.timeSlot}
            </p>

            <p>
              <b>Guests:</b> {r.guests}
            </p>

            <p>
              <b>Table:</b> {r.table.tableNumber}
            </p>

            <p>
              <b>Status:</b> {r.status}
            </p>

            {r.status === "booked" && (
              <button
                onClick={() => cancelReservation(r._id)}
              >
                Cancel Reservation
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default CustomerDashboard;