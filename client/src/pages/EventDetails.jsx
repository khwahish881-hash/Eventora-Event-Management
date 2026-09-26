import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    useNavigate,
    useParams
} from "react-router-dom";

function EventDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const token = localStorage.getItem("token");

    // =========================
    // BACKEND API
    // =========================

    const API_URL =
        "https://eventora-backend-cpdf.onrender.com/api/events";


    // =========================
    // FETCH SINGLE EVENT
    // =========================

    const fetchEvent = async () => {

        try {

            setLoading(true);
            setError("");

            console.log(
                "Fetching event:",
                `${API_URL}/${id}`
            );

            const response = await axios.get(
                `${API_URL}/${id}`
            );

            console.log(
                "Event details response:",
                response.data
            );

            /*
             * Backend can return either:
             *
             * { event: {...} }
             *
             * OR
             *
             * {...}
             */

            const eventData =
                response.data?.event ||
                response.data;

            if (!eventData || !eventData._id) {

                setError(
                    "Event data was not found."
                );

                setEvent(null);

                return;
            }

            setEvent(eventData);

        } catch (err) {

            console.error(
                "Event details error:",
                err
            );

            console.error(
                "Response:",
                err.response?.data
            );

            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Unable to load event."
            );

        } finally {

            setLoading(false);

        }
    };


    // =========================
    // LOAD EVENT
    // =========================

    useEffect(() => {

        if (id) {
            fetchEvent();
        }

    }, [id]);


    // =========================
    // DELETE EVENT
    // =========================

    const handleDelete = async () => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this event?"
            );

        if (!confirmDelete) {
            return;
        }

        try {

            if (!token) {

                alert(
                    "Please login again."
                );

                navigate("/login");

                return;
            }

            await axios.delete(
                `${API_URL}/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            alert(
                "Event deleted successfully!"
            );

            navigate("/events");

        } catch (err) {

            console.error(
                "Delete event error:",
                err
            );

            alert(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Unable to delete event."
            );

        }
    };


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <div className="page-container">

                <div className="loading-box">

                    <div className="loader"></div>

                    <h2>
                        Loading Event...
                    </h2>

                    <p>
                        Please wait while event
                        details are loading.
                    </p>

                </div>

            </div>
        );
    }


    // =========================
    // ERROR
    // =========================

    if (error || !event) {

        return (
            <div className="page-container">

                <div className="empty-state">

                    <div className="empty-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to Load Event
                    </h2>

                    <p>
                        {error ||
                            "This event does not exist."}
                    </p>

                    <button
                        className="primary-btn"
                        onClick={() =>
                            navigate("/events")
                        }
                    >
                        ← Back to Events
                    </button>

                </div>

            </div>
        );
    }


    // =========================
    // BOOK EVENT
    // =========================

    const handleBooking = () => {

        if (!token) {

            navigate(
                "/login",
                {
                    state: {
                        from:
                            `/events/${event._id}`
                    }
                }
            );

            return;
        }

        navigate(
            `/booking/${event._id}`
        );
    };


    // =========================
    // PAGE
    // =========================

    return (
        <div className="page-container">

            {/* BACK BUTTON */}

            <button
                className="back-btn"
                onClick={() =>
                    navigate("/events")
                }
            >
                ← Back to Events
            </button>


            {/* EVENT CARD */}

            <div className="event-details-card">


                {/* IMAGE */}

                <div className="event-details-image">

                    <img
                        src={
                            event.image ||
                            event.imageUrl ||
                            "https://via.placeholder.com/800x500?text=EVENTORA"
                        }
                        alt={
                            event.title ||
                            "Event"
                        }

                        onError={(e) => {

                            e.target.src =
                                "https://via.placeholder.com/800x500?text=EVENTORA";

                        }}
                    />

                </div>


                {/* CONTENT */}

                <div className="event-details-content">


                    {/* CATEGORY */}

                    <span className="category-badge">

                        {event.category ||
                            "Event"}

                    </span>


                    {/* TITLE */}

                    <h1>
                        {event.title}
                    </h1>


                    {/* DESCRIPTION */}

                    <p className="event-details-description">

                        {event.description ||
                            "No description available."}

                    </p>


                    {/* DETAILS */}

                    <div className="details-list">


                        {/* DATE */}

                        <div>

                            <span>
                                📅
                            </span>

                            <div>

                                <small>
                                    Date & Time
                                </small>

                                <strong>

                                    {event.date
                                        ? new Date(
                                            event.date
                                        ).toLocaleString()
                                        : "Not available"}

                                </strong>

                            </div>

                        </div>


                        {/* LOCATION */}

                        <div>

                            <span>
                                📍
                            </span>

                            <div>

                                <small>
                                    Location
                                </small>

                                <strong>

                                    {event.location ||
                                        "Not available"}

                                </strong>

                            </div>

                        </div>


                        {/* AVAILABLE SEATS */}

                        <div>

                            <span>
                                🎟️
                            </span>

                            <div>

                                <small>
                                    Available Seats
                                </small>

                                <strong>

                                    {event.availableSeats ??
                                        0}

                                </strong>

                            </div>

                        </div>


                        {/* TICKET PRICE */}

                        <div>

                            <span>
                                💰
                            </span>

                            <div>

                                <small>
                                    Ticket Price
                                </small>

                                <strong>

                                    ₹
                                    {event.ticketPrice ??
                                        0}

                                </strong>

                            </div>

                        </div>


                    </div>


                    {/* =========================
                        ADMIN CONTROLS
                    ========================= */}

                    {user?.role === "admin" ? (

                        <div className="admin-actions">

                            <button
                                className="primary-btn"
                                onClick={() =>
                                    navigate(
                                        `/edit-event/${event._id}`
                                    )
                                }
                            >
                                ✏️ Edit Event
                            </button>


                            <button
                                className="delete-btn"
                                onClick={handleDelete}
                            >
                                🗑️ Delete Event
                            </button>

                        </div>

                    ) : (

                        /* =========================
                           USER BOOKING
                        ========================= */

                        <button
                            className="primary-btn book-main-btn"

                            disabled={
                                Number(
                                    event.availableSeats
                                ) <= 0
                            }

                            onClick={
                                handleBooking
                            }
                        >

                            {Number(
                                event.availableSeats
                            ) <= 0

                                ? "Sold Out"

                                : "Book This Event →"}

                        </button>

                    )}

                </div>

            </div>

        </div>
    );
}

export default EventDetails;