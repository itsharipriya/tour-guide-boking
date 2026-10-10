const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Tour Guide Booking API is running!");
});

const bookingSchema = new mongoose.Schema({
  tourName: { type: String, required: true },
  destination: { type: String, required: true },
  travelDate: { type: String, required: true },
  travellers: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model("Booking", bookingSchema);

app.post("/api/bookings", async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    res.json(await Booking.find().sort({ createdAt: -1 }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(error => console.log("MongoDB error:", error.message));

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});