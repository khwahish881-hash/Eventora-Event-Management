import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Render backend API
    const API_URL =
        "https://eventora-backend-cpdf.onrender.com/api/events";

    // =========================
    // FETCH EVENTS
    // =========================
    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError("");

            console.log("Fetching events from:", API_URL);

            const response = await axios.get(API_URL);

            console.log("Events response:", response.data);

            const eventData = Array.isArray(response.data)
                ? response.data
                : response.data.events || [];

            setEvents(eventData);

        } catch (err) {
            console.error("Fetch events error:", err);

            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Unable to load events. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // LOAD EVENTS
    // =========================
    useEffect(() => {
        fetchEvents();
    }, []);

    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-box">
                    <div className="loader"></div>

                    <h2>Loading Events...</h2>

                    <p>
                        Please wait while we find
                        available events.
                    </p>
                </div>
            </div>
        );
    }

    // =========================
    // MAIN PAGE
    // =========================
    return (
        <div className="page-container">

            {/* PAGE HEADING */}
            <section className="page-heading">

                <p className="small-heading">
                    DISCOVER
                </p>

                <h1>
                    Explore Events
                </h1>

                <p>
                    Find exciting events and book your
                    seat today.
                </p>

            </section>


            {/* ERROR */}
            {error && (
                <div className="error-box event-error">

                    <p>{error}</p>

                    <button
                        onClick={fetchEvents}
                        className="retry-btn"
                    >
                        Try Again
                    </button>

                </div>
            )}


            {/* NO EVENTS */}
            {!error && events.length === 0 && (
                <div className="empty-state">

                    <div className="empty-icon">
                        📅
                    </div>

                    <h2>
                        No Events Available
                    </h2>

                    <p>
                        There are currently no events
                        available.
                    </p>

                </div>
            )}


            {/* EVENTS */}
            {events.length > 0 && (
                <div className="events-grid">

                    {events.map((event) => (

                        <div
                            className="event-card-large"
                            key={event._id}
                        >

                            {/* IMAGE */}
                            <div className="event-image-wrapper">

                                <img
                                    src={
                                        event.image ||
                                        event.imageUrl ||
                                        "https://via.placeholder.com/600x350?text=EVENTORA"
                                    }
                                    alt={event.title || "Event"}
                                    className="event-image"

                                    onError={(e) => {
                                        e.target.src =
                                            "https://via.placeholder.com/600x350?text=EVENTORA";
                                    }}
                                />

                                <span className="category-badge">
                                    {event.category || "Event"}
                                </span>

                            </div>


                            {/* CONTENT */}
                            <div className="event-card-content">

                                <h2>
                                    {event.title}
                                </h2>


                                <p className="event-description">
                                    {event.description ||
                                        "Join us for this exciting event."}
                                </p>


                                {/* EVENT INFO */}
                                <div className="event-info">

                                    <span>
                                        📅{" "}
                                        {event.date
                                            ? new Date(
                                                event.date
                                            ).toLocaleDateString()
                                            : "Date not available"}
                                    </span>


                                    <span>
                                        📍{" "}
                                        {event.location ||
                                            "Location not available"}
                                    </span>


                                    <span>
                                        🎟️{" "}
                                        {event.availableSeats ??
                                            0}{" "}
                                        seats
                                    </span>

                                </div>


                                {/* BOTTOM */}
                                <div className="event-card-bottom">

                                    <strong>
                                        ₹{event.ticketPrice ?? 0}
                                    </strong>


                                    <Link
                                        to={`/events/${event._id}`}
                                        className="view-event-btn"
                                    >
                                        View Event →
                                    </Link>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>
            )}

        </div>
    );
}

export default Events;