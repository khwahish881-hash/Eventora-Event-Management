const db = require("../config/db");

const {
    sendOTPEmail,
    sendBookingEmail
} = require("../utils/email");


// =====================================================
// GENERATE OTP
// =====================================================

const generateOTP = () => {
    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();
};


// =====================================================
// SEND BOOKING OTP
// =====================================================

exports.sendBookingOTP = async (req, res) => {

    try {

        const otp = generateOTP();

        // Remove old booking OTP
        await db.query(
            `DELETE FROM otp
             WHERE email = ?
             AND action = 'event_booking'`,
            [req.user.email]
        );

        // Create new OTP
        await db.query(
            `INSERT INTO otp
             (email, otp, action)
             VALUES (?, ?, 'event_booking')`,
            [
                req.user.email,
                otp
            ]
        );

        // Send OTP
        await sendOTPEmail(
            req.user.email,
            otp,
            "event_booking"
        );

        res.json({
            message: "OTP sent to email"
        });

    } catch (error) {

        console.error(
            "Send Booking OTP Error:",
            error
        );

        res.status(500).json({
            error: error.message
        });
    }
};


// =====================================================
// CREATE BOOKING
// =====================================================

exports.bookEvent = async (req, res) => {

    try {

        const {
            eventId,
            otp
        } = req.body;


        // ==========================================
        // CHECK OTP
        // ==========================================

        const [otpRecords] = await db.query(
            `SELECT *
             FROM otp
             WHERE email = ?
             AND otp = ?
             AND action = 'event_booking'
             ORDER BY created_at DESC
             LIMIT 1`,
            [
                req.user.email,
                otp
            ]
        );

        if (otpRecords.length === 0) {

            return res.status(400).json({
                error: "Invalid or expired OTP"
            });
        }


        // ==========================================
        // FIND EVENT
        // ==========================================

        const [events] = await db.query(
            `SELECT *
             FROM events
             WHERE event_id = ?`,
            [eventId]
        );

        if (events.length === 0) {

            return res.status(404).json({
                error: "Event not found"
            });
        }

        const event = events[0];


        // ==========================================
        // CHECK SEATS
        // ==========================================

        if (event.available_seats <= 0) {

            return res.status(400).json({
                error: "No seats available"
            });
        }


        // ==========================================
        // CHECK EXISTING BOOKING
        // ==========================================

        const [existingBookings] = await db.query(
            `SELECT *
             FROM bookings
             WHERE user_id = ?
             AND event_id = ?
             AND status != 'cancelled'`,
            [
                req.user.user_id,
                eventId
            ]
        );

        if (existingBookings.length > 0) {

            return res.status(400).json({
                error: "You have already booked this event"
            });
        }


        // ==========================================
        // CREATE BOOKING
        // ==========================================

        const [result] = await db.query(
            `INSERT INTO bookings
             (
                 user_id,
                 event_id,
                 seats_booked,
                 status,
                 payment_status,
                 amount
             )
             VALUES (?, ?, 1, 'pending', 'non_paid', ?)`,
            [
                req.user.user_id,
                eventId,
                event.ticket_price || 0
            ]
        );

        const bookingId = result.insertId;


        // ==========================================
        // DELETE USED OTP
        // ==========================================

        await db.query(
            `DELETE FROM otp
             WHERE email = ?
             AND action = 'event_booking'`,
            [req.user.email]
        );


        // ==========================================
        // SEND BOOKING EMAIL
        // ==========================================

        await sendBookingEmail(
            req.user.email,
            event.title,
            bookingId
        );


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(201).json({

            message:
                "Booking created successfully",

            bookingId:
                bookingId,

            eventId:
                event.event_id,

            eventTitle:
                event.title,

            amount:
                event.ticket_price || 0,

            status:
                "pending",

            paymentStatus:
                "non_paid"
        });

    } catch (error) {

        console.error(
            "Book Event Error:",
            error
        );

        res.status(500).json({
            error: error.message
        });
    }
};


// =====================================================
// CONFIRM BOOKING
// =====================================================

exports.confirmBooking = async (req, res) => {

    const connection = await db.getConnection();

    try {

        const paymentStatus =
            req.body.paymentStatus;


        // ==========================================
        // CHECK PAYMENT STATUS
        // ==========================================

        if (
            !["paid", "non_paid"]
                .includes(paymentStatus)
        ) {

            return res.status(400).json({
                error: "Invalid payment status"
            });
        }


        await connection.beginTransaction();


        // ==========================================
        // FIND BOOKING
        // ==========================================

        const [bookings] = await connection.query(
            `SELECT *
             FROM bookings
             WHERE booking_id = ?`,
            [req.params.id]
        );


        if (bookings.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                error: "Booking not found"
            });
        }

        const booking = bookings[0];


        // ==========================================
        // SECURITY CHECK
        // ==========================================

        if (
            booking.user_id !==
            req.user.user_id
        ) {

            await connection.rollback();

            return res.status(403).json({
                error:
                    "You are not allowed to confirm this booking"
            });
        }


        // ==========================================
        // CHECK ALREADY CONFIRMED
        // ==========================================

        if (booking.status === "confirmed") {

            await connection.rollback();

            return res.status(400).json({
                error:
                    "Booking is already confirmed"
            });
        }


        // ==========================================
        // FIND EVENT
        // ==========================================

        const [events] = await connection.query(
            `SELECT *
             FROM events
             WHERE event_id = ?
             FOR UPDATE`,
            [booking.event_id]
        );


        if (events.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                error: "Event not found"
            });
        }

        const event = events[0];


        // ==========================================
        // CHECK AVAILABLE SEATS
        // ==========================================

        if (
            event.available_seats <
            booking.seats_booked
        ) {

            await connection.rollback();

            return res.status(400).json({
                error: "No seats available"
            });
        }


        // ==========================================
        // CONFIRM BOOKING
        // ==========================================

        await connection.query(
            `UPDATE bookings
             SET
                 status = 'confirmed',
                 payment_status = ?
             WHERE booking_id = ?`,
            [
                paymentStatus,
                booking.booking_id
            ]
        );


        // ==========================================
        // REDUCE AVAILABLE SEATS
        // ==========================================

        await connection.query(
            `UPDATE events
             SET available_seats =
                 available_seats - ?
             WHERE event_id = ?`,
            [
                booking.seats_booked,
                event.event_id
            ]
        );


        await connection.commit();


        // ==========================================
        // SEND CONFIRMATION EMAIL
        // ==========================================

        await sendBookingEmail(
            req.user.email,
            event.title,
            booking.booking_id
        );


        // ==========================================
        // RESPONSE
        // ==========================================

        res.json({

            message:
                "Booking confirmed successfully",

            bookingId:
                booking.booking_id,

            eventId:
                event.event_id,

            eventTitle:
                event.title,

            status:
                "confirmed",

            paymentStatus:
                paymentStatus,

            remainingSeats:
                event.available_seats -
                booking.seats_booked
        });


    } catch (error) {

        await connection.rollback();

        console.error(
            "Confirm Booking Error:",
            error
        );

        res.status(500).json({
            error: error.message
        });

    } finally {

        connection.release();
    }
};