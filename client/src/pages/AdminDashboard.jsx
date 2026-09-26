import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://eventora-backend-cpdf.onrender.com/api/events";

const AdminDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [editingEvent, setEditingEvent] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        location: "",
        category: "",
        totalSeats: "",
        availableSeats: "",
        ticketPrice: "",
        image: "",
    });

    const token = localStorage.getItem("token");

    // =========================
    // GET ALL EVENTS
    // =========================
    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(API_URL);

            console.log("Events API response:", response.data);

            if (Array.isArray(response.data)) {
                setEvents(response.data);
            } else if (Array.isArray(response.data.events)) {
                setEvents(response.data.events);
            } else {
                setEvents([]);
            }
        } catch (err) {
            console.error("Fetch events error:", err);

            setError(
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
    // INPUT CHANGE
    // =========================
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================
    // CREATE EVENT
    // =========================
    const handleCreateEvent = async (e) => {
        e.preventDefault();

        try {
            setMessage("");
            setError("");

            if (!token) {
                setError("Please login again. Authentication token not found.");
                return;
            }

            const eventData = {
                title: formData.title,
                description: formData.description,
                date: formData.date,
                location: formData.location,
                category: formData.category,
                totalSeats: Number(formData.totalSeats),
                availableSeats: Number(
                    formData.availableSeats || formData.totalSeats
                ),
                ticketPrice: Number(formData.ticketPrice),
                image: formData.image,
            };

            console.log("Creating event:", eventData);

            await axios.post(API_URL, eventData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage("Event created successfully!");

            resetForm();

            fetchEvents();
        } catch (err) {
            console.error("Create event error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to create event. Please try again."
            );
        }
    };

    // =========================
    // DELETE EVENT
    // =========================
    const handleDelete = async (eventId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this event?"
        );

        if (!confirmDelete) return;

        try {
            setMessage("");
            setError("");

            if (!token) {
                setError("Please login again.");
                return;
            }

            await axios.delete(`${API_URL}/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage("Event deleted successfully!");

            fetchEvents();
        } catch (err) {
            console.error("Delete event error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to delete event."
            );
        }
    };

    // =========================
    // EDIT EVENT
    // =========================
    const handleEdit = (event) => {
        setEditingEvent(event);

        setFormData({
            title: event.title || "",
            description: event.description || "",
            date: event.date
                ? new Date(event.date).toISOString().slice(0, 16)
                : "",
            location: event.location || "",
            category: event.category || "",
            totalSeats: event.totalSeats || "",
            availableSeats: event.availableSeats || "",
            ticketPrice: event.ticketPrice || "",
            image: event.image || "",
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // =========================
    // UPDATE EVENT
    // =========================
    const handleUpdateEvent = async (e) => {
        e.preventDefault();

        try {
            setMessage("");
            setError("");

            if (!token) {
                setError("Please login again.");
                return;
            }

            const updatedData = {
                title: formData.title,
                description: formData.description,
                date: formData.date,
                location: formData.location,
                category: formData.category,
                totalSeats: Number(formData.totalSeats),
                availableSeats: Number(formData.availableSeats),
                ticketPrice: Number(formData.ticketPrice),
                image: formData.image,
            };

            console.log("Updating event:", updatedData);

            await axios.put(
                `${API_URL}/${editingEvent._id}`,
                updatedData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage("Event updated successfully!");

            setEditingEvent(null);

            resetForm();

            fetchEvents();
        } catch (err) {
            console.error("Update event error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to update event."
            );
        }
    };

    // =========================
    // RESET FORM
    // =========================
    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            date: "",
            location: "",
            category: "",
            totalSeats: "",
            availableSeats: "",
            ticketPrice: "",
            image: "",
        });

        setEditingEvent(null);
    };

    // =========================
    // LOGOUT
    // =========================
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f5f7fb",
                paddingBottom: "40px",
            }}
        >
            {/* ================= HEADER ================= */}
            <div
                style={{
                    backgroundColor: "#111827",
                    color: "white",
                    padding: "18px 30px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div>
                    <h2 style={{ margin: 0 }}>EVENTORA Admin Dashboard</h2>
                    <p style={{ margin: "5px 0 0", opacity: 0.8 }}>
                        Manage your events
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    Logout
                </button>
            </div>

            <div
                style={{
                    maxWidth: "1200px",
                    margin: "30px auto",
                    padding: "0 20px",
                }}
            >
                {/* ================= MESSAGES ================= */}

                {message && (
                    <div
                        style={{
                            backgroundColor: "#dcfce7",
                            color: "#166534",
                            padding: "12px 15px",
                            borderRadius: "6px",
                            marginBottom: "20px",
                        }}
                    >
                        {message}
                    </div>
                )}

                {error && (
                    <div
                        style={{
                            backgroundColor: "#fee2e2",
                            color: "#991b1b",
                            padding: "12px 15px",
                            borderRadius: "6px",
                            marginBottom: "20px",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* ================= CREATE / EDIT FORM ================= */}

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "25px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                        marginBottom: "30px",
                    }}
                >
                    <h2 style={{ marginTop: 0 }}>
                        {editingEvent ? "Edit Event" : "Create New Event"}
                    </h2>

                    <form
                        onSubmit={
                            editingEvent
                                ? handleUpdateEvent
                                : handleCreateEvent
                        }
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(250px, 1fr))",
                                gap: "15px",
                            }}
                        >
                            {/* TITLE */}
                            <div>
                                <label>Event Title</label>

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter event title"
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            {/* DATE */}
                            <div>
                                <label>Date & Time</label>

                                <input
                                    type="datetime-local"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            {/* LOCATION */}
                            <div>
                                <label>Location</label>

                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Enter location"
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            {/* CATEGORY */}
                            <div>
                                <label>Category</label>

                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    placeholder="Technology, Music, Sports..."
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            {/* TOTAL SEATS */}
                            <div>
                                <label>Total Seats</label>

                                <input
                                    type="number"
                                    name="totalSeats"
                                    value={formData.totalSeats}
                                    onChange={handleChange}
                                    placeholder="100"
                                    min="1"
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            {/* AVAILABLE SEATS */}
                            <div>
                                <label>Available Seats</label>

                                <input
                                    type="number"
                                    name="availableSeats"
                                    value={formData.availableSeats}
                                    onChange={handleChange}
                                    placeholder="100"
                                    min="0"
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            {/* TICKET PRICE */}
                            <div>
                                <label>Ticket Price</label>

                                <input
                                    type="number"
                                    name="ticketPrice"
                                    value={formData.ticketPrice}
                                    onChange={handleChange}
                                    placeholder="500"
                                    min="0"
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            {/* IMAGE */}
                            <div>
                                <label>Image URL</label>

                                <input
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* DESCRIPTION */}

                        <div style={{ marginTop: "15px" }}>
                            <label>Description</label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter event description"
                                required
                                rows="4"
                                style={{
                                    ...inputStyle,
                                    resize: "vertical",
                                }}
                            />
                        </div>

                        {/* BUTTONS */}

                        <div
                            style={{
                                marginTop: "20px",
                                display: "flex",
                                gap: "10px",
                            }}
                        >
                            <button
                                type="submit"
                                style={{
                                    backgroundColor: "#2563eb",
                                    color: "white",
                                    border: "none",
                                    padding: "12px 22px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "15px",
                                }}
                            >
                                {editingEvent
                                    ? "Update Event"
                                    : "Create Event"}
                            </button>

                            {editingEvent && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{
                                        backgroundColor: "#6b7280",
                                        color: "white",
                                        border: "none",
                                        padding: "12px 22px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "15px",
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* ================= EVENTS ================= */}

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "25px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "20px",
                        }}
                    >
                        <h2 style={{ margin: 0 }}>Manage Events</h2>

                        <button
                            onClick={fetchEvents}
                            style={{
                                backgroundColor: "#111827",
                                color: "white",
                                border: "none",
                                padding: "9px 15px",
                                borderRadius: "6px",
                                cursor: "pointer",
                            }}
                        >
                            Refresh
                        </button>
                    </div>

                    {loading ? (
                        <p>Loading events...</p>
                    ) : events.length === 0 ? (
                        <p>No events available.</p>
                    ) : (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(280px, 1fr))",
                                gap: "20px",
                            }}
                        >
                            {events.map((event) => (
                                <div
                                    key={event._id}
                                    style={{
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "10px",
                                        overflow: "hidden",
                                        backgroundColor: "#fff",
                                    }}
                                >
                                    {event.image && (
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            style={{
                                                width: "100%",
                                                height: "180px",
                                                objectFit: "cover",
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                            }}
                                        />
                                    )}

                                    <div style={{ padding: "18px" }}>
                                        <h3 style={{ marginTop: 0 }}>
                                            {event.title}
                                        </h3>

                                        <p>
                                            <strong>Category:</strong>{" "}
                                            {event.category || "N/A"}
                                        </p>

                                        <p>
                                            <strong>Location:</strong>{" "}
                                            {event.location || "N/A"}
                                        </p>

                                        <p>
                                            <strong>Date:</strong>{" "}
                                            {event.date
                                                ? new Date(
                                                    event.date
                                                ).toLocaleString()
                                                : "N/A"}
                                        </p>

                                        <p>
                                            <strong>Total Seats:</strong>{" "}
                                            {event.totalSeats ?? "N/A"}
                                        </p>

                                        <p>
                                            <strong>Available Seats:</strong>{" "}
                                            {event.availableSeats ?? "N/A"}
                                        </p>

                                        <p>
                                            <strong>Ticket Price:</strong> ₹
                                            {event.ticketPrice ?? 0}
                                        </p>

                                        <p>
                                            {event.description || "No description"}
                                        </p>

                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "10px",
                                                marginTop: "15px",
                                            }}
                                        >
                                            <button
                                                onClick={() => handleEdit(event)}
                                                style={{
                                                    backgroundColor: "#f59e0b",
                                                    color: "white",
                                                    border: "none",
                                                    padding: "9px 15px",
                                                    borderRadius: "5px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDelete(event._id)
                                                }
                                                style={{
                                                    backgroundColor: "#dc2626",
                                                    color: "white",
                                                    border: "none",
                                                    padding: "9px 15px",
                                                    borderRadius: "5px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const inputStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    boxSizing: "border-box",
    fontSize: "14px",
};

export default AdminDashboard;