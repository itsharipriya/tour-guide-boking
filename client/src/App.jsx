import { useState, useEffect } from "react";
import "./App.css";

const API = "http://localhost:5000/api/bookings";

const tours = [
  { id: 1, name: "Hyderabad Heritage Walk", place: "Hyderabad", price: 799, emoji: "🏰" },
  { id: 2, name: "Goa Beach Escape", place: "Goa", price: 1499, emoji: "🏝️" },
  { id: 3, name: "Manali Mountain Tour", place: "Manali", price: 1999, emoji: "🏔️" },
  { id: 4, name: "Jaipur Royal Tour", place: "Jaipur", price: 1199, emoji: "🕌" },
  { id: 5, name: "Kerala Nature Trails", place: "Munnar", price: 1699, emoji: "🌿" },
  { id: 6, name: "Agra Taj Mahal Tour", place: "Agra", price: 999, emoji: "✨" }
];

export default function App() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState("");
  const [people, setPeople] = useState(2);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadBookings() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Could not load bookings");
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      setMessage("Cannot connect to the booking server. Please check that the backend is running.");
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const filtered = tours.filter(t =>
    (t.name + " " + t.place).toLowerCase().includes(search.toLowerCase())
  );

  async function bookTour(e) {
    e.preventDefault();
    if (!selected || loading) return;

    setLoading(true);
    setMessage("");

    const booking = {
      tourName: selected.name,
      destination: selected.place,
      travelDate: date,
      travellers: people,
      totalPrice: selected.price * people
    };

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Booking failed");
      }

      setMessage("Booking saved successfully! Reference: " + result._id);
      setSelected(null);
      setDate("");
      setPeople(2);
      await loadBookings();
    } catch (error) {
      setMessage("Booking failed: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <nav className="navbar">
        <a className="brand" href="#home">✈️ TourMate</a>
        <div className="navlinks">
          <a href="#home">Home</a>
          <a href="#tours">Explore Tours</a>
          <a href="#bookings">My Bookings ({bookings.length})</a>
        </div>
      </nav>

      <header className="hero" id="home">
        <div>
          <p className="eyebrow">YOUR JOURNEY STARTS HERE</p>
          <h1>Explore the world.<br />Meet local guides.</h1>
          <p>Discover beautiful destinations and plan your next unforgettable adventure.</p>
          <a className="primary" href="#tours">Explore Destinations →</a>
        </div>
        <div className="hero-art">
          <span>🏔️</span><span>🌍</span><span>🏝️</span>
          <p>Discover. Experience. Remember.</p>
        </div>
      </header>

      <main>
        <section className="searchbar">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search destinations..."
          />
          <a className="primary" href="#tours">Find Tours</a>
        </section>

        <section className="section" id="tours">
          <p className="eyebrow">HANDPICKED EXPERIENCES</p>
          <h2>Popular Tour Packages</h2>
          <div className="tour-grid">
            {filtered.map(t => (
              <article className="tour-card" key={t.id}>
                <div className="tour-art">{t.emoji}</div>
                <div className="tour-info">
                  <p>📍 {t.place}, India</p>
                  <h3>{t.name}</h3>
                  <div className="tour-bottom">
                    <strong>₹{t.price} <small>/ person</small></strong>
                    <button onClick={() => {
                      setSelected(t);
                      setMessage("");
                    }}>Book Now</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {filtered.length === 0 && <p>No matching tours found.</p>}
        </section>

        {selected && (
          <div className="modal">
            <form className="booking-form" onSubmit={bookTour}>
              <button
                type="button"
                className="close"
                onClick={() => setSelected(null)}
              >✕</button>

              <p className="eyebrow">RESERVE YOUR EXPERIENCE</p>
              <h2>{selected.name}</h2>

              <label>Travel date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={date}
                onChange={e => setDate(e.target.value)}
              />

              <label>Number of travellers</label>
              <select
                value={people}
                onChange={e => setPeople(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map(n =>
                  <option key={n} value={n}>{n} traveller(s)</option>
                )}
              </select>

              <h3>Total: ₹{selected.price * people}</h3>
              <button className="primary" type="submit" disabled={loading}>
                {loading ? "Saving Booking..." : "Confirm Booking Request"}
              </button>
            </form>
          </div>
        )}

        {message && <p className="notice">{message}</p>}

        <section className="section" id="bookings">
          <p className="eyebrow">YOUR TRAVEL PLANS</p>
          <h2>My Bookings</h2>

          {bookings.length === 0 && (
            <p>No saved bookings yet. Choose a tour to get started.</p>
          )}

          {bookings.map(b => (
            <article className="booking-row" key={b._id}>
              <span>
                {tours.find(t => t.name === b.tourName)?.emoji || "✈️"}
              </span>
              <div>
                <strong>{b.tourName}</strong>
                <p>
                  {b.travelDate} · {b.travellers} traveller(s) ·
                  {" "}{b._id}
                </p>
              </div>
              <strong>₹{b.totalPrice}</strong>
            </article>
          ))}
        </section>
      </main>

      <footer>TourMate — Explore more. Travel better.</footer>
    </div>
  );
}