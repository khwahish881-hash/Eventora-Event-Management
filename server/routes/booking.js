const express = require("express");

const router = express.Router();

const {
    protect
} = require("../middleware/auth");

const {
    sendBookingOTP,
    bookEvent,
    confirmBooking
} = require("../controllers/bookingControllers");

const db = require("../config/db");


// =====================================================
// SEND BOOKING OTP
// =====================================================

router.post(
    "/send-otp",
    protect,
    sendBookingOTP
);


// =====================================================
// CREATE BOOKING
// =====================================================

router.post(
    "/book",
    protect,
    bookEvent
);


// =====================================================
// CONFIRM BOOKING
// =====================================================

router.put(
    "/confirm/:id",
    protect,
    confirmBooking
);


// =====================================================
// MY BOOKINGS
// =====================================================

router.get(
    "/my",
    protect,
    async (req, res) => {

        try {

            const [bookings] = await db.query(
                `
                SELECT
                    b.booking_id AS _id,
                    b.user_id AS userId,
                    b.event_id AS eventId,
                    b.seats_booked AS seatsBooked,
                    b.booking_date AS createdAt,
                    b.status,
                    b.payment_status AS paymentStatus,
                    b.amount,

                    e.event_id AS event_id,
                    e.title AS eventTitle,
                    e.description,
                    e.category,
                    e.event_date AS date,
                    e.event_time AS time,
                    e.location,
                    e.total_seats AS totalSeats,
                    e.available_seats AS availableSeats,
                    e.ticket_price AS ticketPrice,
                    e.image_url AS imageUrl

                FROM bookings b

                JOIN events e
                    ON b.event_id = e.event_id

                WHERE b.user_id = ?

                ORDER BY b.booking_date DESC
                `,
                [req.user.user_id]
            );


            res.json(bookings);

        } catch (error) {

            console.error(
                "My Bookings Error:",
                error
            );

            res.status(500).json({
                error: error.message
            });
        }
    }
);


// =====================================================
// SINGLE BOOKING
// =====================================================

router.get(
    "/:id",
    protect,
    async (req, res) => {

        try {

            const [bookings] = await db.query(
                `
                SELECT
                    b.booking_id AS _id,
                    b.user_id AS userId,
                    b.event_id AS eventId,
                    b.seats_booked AS seatsBooked,
                    b.booking_date AS createdAt,
                    b.status,
                    b.payment_status AS paymentStatus,
                    b.amount,

                    e.event_id AS event_id,
                    e.title AS eventTitle,
                    e.description,
                    e.category,
                    e.event_date AS date,
                    e.event_time AS time,
                    e.location,
                    e.total_seats AS totalSeats,
                    e.available_seats AS availableSeats,
                    e.ticket_price AS ticketPrice,
                    e.image_url AS imageUrl

                FROM bookings b

                JOIN events e
                    ON b.event_id = e.event_id

                WHERE b.booking_id = ?
                `,
                [req.params.id]
            );


            if (bookings.length === 0) {

                return res.status(404).json({
                    error: "Booking not found"
                });
            }


            const booking = bookings[0];


            // Security check
            if (
                booking.userId !==
                req.user.user_id
            ) {

                return res.status(403).json({
                    error: "Not allowed"
                });
            }


            res.json(booking);

        } catch (error) {

            console.error(
                "Single Booking Error:",
                error
            );

            res.status(500).json({
                error: error.message
            });
        }
    }
);


module.exports = router;