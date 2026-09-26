const db = require("../config/db");


// =====================================================
// GET ALL EVENTS
// =====================================================

exports.getAllEvents = async (req, res) => {
    try {

        let query = `
            SELECT
                event_id AS _id,
                title,
                description,
                category,
                event_date AS date,
                event_time AS time,
                location,
                total_seats AS totalSeats,
                available_seats AS availableSeats,
                ticket_price AS ticketPrice,
                image_url AS imageUrl,
                created_by AS createdBy,
                created_at AS createdAt
            FROM events
            WHERE 1 = 1
        `;

        const values = [];

        // Category filter
        if (req.query.category) {
            query += " AND category = ?";
            values.push(req.query.category);
        }

        // Location filter
        if (req.query.location) {
            query += " AND location = ?";
            values.push(req.query.location);
        }

        // Sort by date
        query += " ORDER BY event_date ASC";

        const [events] = await db.query(query, values);

        res.json(events);

    } catch (error) {

        console.error("Get Events Error:", error);

        res.status(500).json({
            error: error.message
        });
    }
};


// =====================================================
// GET SINGLE EVENT
// =====================================================

exports.getEventById = async (req, res) => {
    try {

        const [events] = await db.query(
            `
            SELECT
                event_id AS _id,
                title,
                description,
                category,
                event_date AS date,
                event_time AS time,
                location,
                total_seats AS totalSeats,
                available_seats AS availableSeats,
                ticket_price AS ticketPrice,
                image_url AS imageUrl,
                created_by AS createdBy,
                created_at AS createdAt
            FROM events
            WHERE event_id = ?
            `,
            [req.params.id]
        );

        if (events.length === 0) {
            return res.status(404).json({
                error: "Event not found"
            });
        }

        res.json(events[0]);

    } catch (error) {

        console.error("Get Event Error:", error);

        res.status(500).json({
            error: error.message
        });
    }
};


// =====================================================
// CREATE EVENT - ADMIN ONLY
// =====================================================

exports.createEvent = async (req, res) => {
    try {

        const {
            title,
            description,
            date,
            time,
            location,
            category,
            totalSeats,
            availableSeats,
            ticketPrice,
            imageUrl
        } = req.body;


        // Validation
        if (
            !title ||
            !date ||
            !location ||
            !category ||
            !totalSeats
        ) {
            return res.status(400).json({
                error: "Please provide all required event details"
            });
        }


        // If availableSeats is not provided,
        // use totalSeats
        const seatsAvailable =
            availableSeats !== undefined
                ? availableSeats
                : totalSeats;


        // Get logged-in admin ID
        const createdBy =
            req.user?.user_id ||
            req.user?.id ||
            null;


        const [result] = await db.query(
            `
            INSERT INTO events
            (
                title,
                description,
                category,
                event_date,
                event_time,
                location,
                total_seats,
                available_seats,
                ticket_price,
                image_url,
                created_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                title,
                description || null,
                category,
                date,
                time || null,
                location,
                totalSeats,
                seatsAvailable,
                ticketPrice || 0,
                imageUrl || null,
                createdBy
            ]
        );


        // Get newly created event
        const [events] = await db.query(
            `
            SELECT
                event_id AS _id,
                title,
                description,
                category,
                event_date AS date,
                event_time AS time,
                location,
                total_seats AS totalSeats,
                available_seats AS availableSeats,
                ticket_price AS ticketPrice,
                image_url AS imageUrl,
                created_by AS createdBy,
                created_at AS createdAt
            FROM events
            WHERE event_id = ?
            `,
            [result.insertId]
        );


        res.status(201).json(events[0]);

    } catch (error) {

        console.error("Create Event Error:", error);

        res.status(500).json({
            error: error.message
        });
    }
};


// =====================================================
// UPDATE EVENT - ADMIN ONLY
// =====================================================

exports.updateEvent = async (req, res) => {
    try {

        const eventId = req.params.id;

        const {
            title,
            description,
            date,
            time,
            location,
            category,
            totalSeats,
            availableSeats,
            ticketPrice,
            imageUrl
        } = req.body;


        // Check event exists
        const [existingEvents] = await db.query(
            "SELECT * FROM events WHERE event_id = ?",
            [eventId]
        );


        if (existingEvents.length === 0) {
            return res.status(404).json({
                error: "Event not found"
            });
        }


        const existingEvent = existingEvents[0];


        // Keep old values if fields are not provided
        const updatedTitle =
            title !== undefined
                ? title
                : existingEvent.title;

        const updatedDescription =
            description !== undefined
                ? description
                : existingEvent.description;

        const updatedCategory =
            category !== undefined
                ? category
                : existingEvent.category;

        const updatedDate =
            date !== undefined
                ? date
                : existingEvent.event_date;

        const updatedTime =
            time !== undefined
                ? time
                : existingEvent.event_time;

        const updatedLocation =
            location !== undefined
                ? location
                : existingEvent.location;

        const updatedTotalSeats =
            totalSeats !== undefined
                ? totalSeats
                : existingEvent.total_seats;

        const updatedAvailableSeats =
            availableSeats !== undefined
                ? availableSeats
                : existingEvent.available_seats;

        const updatedTicketPrice =
            ticketPrice !== undefined
                ? ticketPrice
                : existingEvent.ticket_price;

        const updatedImageUrl =
            imageUrl !== undefined
                ? imageUrl
                : existingEvent.image_url;


        // Update event
        await db.query(
            `
            UPDATE events
            SET
                title = ?,
                description = ?,
                category = ?,
                event_date = ?,
                event_time = ?,
                location = ?,
                total_seats = ?,
                available_seats = ?,
                ticket_price = ?,
                image_url = ?
            WHERE event_id = ?
            `,
            [
                updatedTitle,
                updatedDescription,
                updatedCategory,
                updatedDate,
                updatedTime,
                updatedLocation,
                updatedTotalSeats,
                updatedAvailableSeats,
                updatedTicketPrice,
                updatedImageUrl,
                eventId
            ]
        );


        // Get updated event
        const [events] = await db.query(
            `
            SELECT
                event_id AS _id,
                title,
                description,
                category,
                event_date AS date,
                event_time AS time,
                location,
                total_seats AS totalSeats,
                available_seats AS availableSeats,
                ticket_price AS ticketPrice,
                image_url AS imageUrl,
                created_by AS createdBy,
                created_at AS createdAt
            FROM events
            WHERE event_id = ?
            `,
            [eventId]
        );


        res.json(events[0]);

    } catch (error) {

        console.error("Update Event Error:", error);

        res.status(500).json({
            error: error.message
        });
    }
};


// =====================================================
// DELETE EVENT - ADMIN ONLY
// =====================================================

exports.deleteEvent = async (req, res) => {
    try {

        const eventId = req.params.id;


        const [result] = await db.query(
            "DELETE FROM events WHERE event_id = ?",
            [eventId]
        );


        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Event not found"
            });
        }


        res.json({
            message: "Event deleted successfully"
        });

    } catch (error) {

        console.error("Delete Event Error:", error);

        res.status(500).json({
            error: error.message
        });
    }
};