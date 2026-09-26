const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const db = require("./config/db.js");

dotenv.config();

const authRoutes = require("./routes/auth.js");
const eventRoutes = require("./routes/event.js");
const bookingRoutes = require("./routes/booking.js");

const app = express();

app.use(cors());
app.use(express.json());


// ===============================
// ROUTES
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);


// ===============================
// MYSQL CONNECTION
// ===============================

db.getConnection()
    .then((connection) => {
        console.log("Connected to MySQL");
        connection.release();
    })
    .catch((error) => {
        console.error("Error connecting to MySQL:", error);
    });

app.get("/test", (req, res) => {
    res.send("INDEX.JS IS WORKING");
});
// ===============================
// SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});