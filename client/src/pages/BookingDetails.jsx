import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    useNavigate,
    useParams
} from "react-router-dom";

function BookingDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    // Render backend URL
    const API_URL = "https://eventora-backend-cpdf.onrender.com";

    const [event, setEvent] = useState(null);

    const [otp, setOtp] = useState("");

    const [loading, setLoading] = useState(true);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const [paymentStatus, setPaymentStatus] =
        useState("non_paid");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // ==============================
    // FETCH EVENT DETAILS
    // ==============================

    useEffect(() => {

        if (!token) {
            navigate("/login");
            return;
        }

        const fetchEvent = async () => {

            try {

                console.log("Fetching event:", id);

                const response = await axios.get(
                    `${API_URL}/api/events/${id}`
                );

                console.log(
                    "Event response:",
                    response.data
                );

                // Supports both:
                // { event: {...} }
                // OR
                // {...}

                const eventData =
                    response.data?.event ||
                    response.data;

                setEvent(eventData);

            } catch (error) {

                console.error(
                    "Fetch Event Error:",
                    error
                );

                setError(
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    "Unable to load event."
                );

            } finally {

                setLoading(false);

            }
        };

        fetchEvent();

    }, [id, token, navigate]);


    // ==============================
    // SEND BOOKING OTP
    // ==============================

    const sendOtp = async () => {

        try {

            setSendingOtp(true);
            setError("");
            setSuccess("");

            const response = await axios.post(
                `${API_URL}/api/bookings/send-otp`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSuccess(
                response.data.message ||
                "OTP sent to your email."
            );

        } catch (error) {

            console.error(
                "Send OTP Error:",
                error
            );

            setError(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Unable to send OTP."
            );

        } finally {

            setSendingOtp(false);

        }
    };


    // ==============================
    // CONFIRM BOOKING
    // ==============================

    const confirmBooking = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (!otp) {

            setError(
                "Please enter OTP."
            );

            return;
        }

        if (otp.length !== 6) {

            setError(
                "Please enter a valid 6 digit OTP."
            );

            return;
        }

        try {

            setConfirming(true);

            // ==============================
            // STEP 1: CREATE BOOKING
            // ==============================

            const response = await axios.post(
                `${API_URL}/api/bookings/book`,
                {
                    eventId: id,
                    otp: otp
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(
                "Booking response:",
                response.data
            );

            const bookingId =
                response.data.bookingId;

            // ==============================
            // STEP 2: CONFIRM BOOKING
            // ==============================

            const confirmResponse =
                await axios.put(
                    `${API_URL}/api/bookings/confirm/${bookingId}`,
                    {
                        paymentStatus: paymentStatus
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

            alert(
                confirmResponse.data.message ||
                "Booking confirmed successfully!"
            );

            navigate("/bookings");

        } catch (error) {

            console.error(
                "Confirm Booking Error:",
                error
            );

            setError(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Unable to confirm booking."
            );

        } finally {

            setConfirming(false);

        }
    };


    // ==============================
    // LOADING SCREEN
    // ==============================

    if (loading) {

        return (
            <div className="page-container">

                <div className="loading-box">

                    <div className="loader"></div>

                    <h2>
                        Loading...
                    </h2>

                </div>

            </div>
        );
    }


    // ==============================
    // PAGE
    // ==============================

    return (
        <div className="page-container">

            <div className="booking-page-card">

                {/* EVENT PREVIEW */}

                <div className="booking-event-preview">

                    <img
                        src={
                            event?.image ||
                            event?.imageUrl ||
                            "https://via.placeholder.com/500x300"
                        }
                        alt={
                            event?.title ||
                            "Event"
                        }
                    />

                    <h1>
                        {event?.title}
                    </h1>

                    <p>
                        📍 {event?.location}
                    </p>

                    <p>
                        💰 ₹{event?.ticketPrice || 0}
                    </p>

                </div>


                {/* BOOKING FORM */}

                <div className="booking-form-section">

                    <p className="small-heading">
                        SECURE BOOKING
                    </p>

                    <h2>
                        Confirm Your Booking
                    </h2>

                    <p>
                        Verify your email using OTP
                        before booking.
                    </p>


                    {/* ERROR */}

                    {error && (
                        <div className="error-box">
                            {error}
                        </div>
                    )}


                    {/* SUCCESS */}

                    {success && (
                        <div className="success-box">
                            {success}
                        </div>
                    )}


                    {/* SEND OTP BUTTON */}

                    <button
                        type="button"
                        className="secondary-btn full-btn"
                        onClick={sendOtp}
                        disabled={sendingOtp}
                    >

                        {sendingOtp
                            ? "Sending OTP..."
                            : "Send OTP"}

                    </button>


                    {/* BOOKING FORM */}

                    <form
                        onSubmit={confirmBooking}
                    >

                        {/* OTP */}

                        <label>
                            Enter OTP
                        </label>

                        <input
                            type="text"
                            maxLength={6}
                            placeholder="6 digit OTP"
                            value={otp}
                            onChange={(e) =>
                                setOtp(
                                    e.target.value.replace(
                                        /\D/g,
                                        ""
                                    )
                                )
                            }
                        />


                        {/* PAYMENT STATUS */}

                        <label>
                            Payment Status
                        </label>

                        <select
                            value={paymentStatus}
                            onChange={(e) =>
                                setPaymentStatus(
                                    e.target.value
                                )
                            }
                        >

                            <option value="non_paid">
                                Non Paid
                            </option>

                            <option value="paid">
                                Paid
                            </option>

                        </select>


                        {/* CONFIRM */}

                        <button
                            type="submit"
                            className="primary-btn full-btn"
                            disabled={confirming}
                        >

                            {confirming
                                ? "Confirming..."
                                : "Confirm Booking"}

                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default BookingDetails;