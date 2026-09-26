import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const sendOtp = async () => {
        setError("");
        setSuccess("");

        if (!email) {
            setError("Please enter your email.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/auth/forgot-password",
                {
                    email: email
                }
            );

            setOtpSent(true);

            setSuccess(
                response.data.message ||
                "OTP sent to your email."
            );

        } catch (error) {
            console.error("Send OTP Error:", error);

            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Unable to send OTP."
            );
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            !email ||
            !otp ||
            !password ||
            !confirmPassword
        ) {
            setError("Please fill all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError(
                "Password must be at least 6 characters."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/auth/reset-password",
                {
                    email: email,
                    otp: otp,
                    password: password,
                    confirmPassword: confirmPassword
                }
            );

            alert(
                response.data.message ||
                "Password reset successfully."
            );

            navigate("/login");

        } catch (error) {
            console.error(
                "Reset Password Error:",
                error
            );

            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Unable to reset password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-header">

                    <div className="auth-logo">
                        🔐
                    </div>

                    <h1>
                        Reset Password
                    </h1>

                    <p>
                        Reset your Eventora password
                        securely.
                    </p>

                </div>

                {error && (
                    <div className="error-box">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-box">
                        {success}
                    </div>
                )}

                <form
                    onSubmit={resetPassword}
                    className="auth-form"
                >

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />

                    {!otpSent && (
                        <button
                            type="button"
                            className="auth-submit"
                            onClick={sendOtp}
                            disabled={loading}
                        >
                            {loading
                                ? "Sending..."
                                : "Send OTP"}
                        </button>
                    )}

                    {otpSent && (
                        <>
                            <label>
                                OTP
                            </label>

                            <input
                                type="text"
                                maxLength={6}
                                placeholder="Enter 6 digit OTP"
                                value={otp}
                                onChange={(e) =>
                                    setOtp(e.target.value)
                                }
                            />

                            <label>
                                New Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                            />

                            <label>
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                            />

                            <button
                                type="submit"
                                className="auth-submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Resetting..."
                                    : "Reset Password"}
                            </button>
                        </>
                    )}

                </form>

                <div className="auth-footer">

                    <Link to="/login">
                        Back to Login
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default ForgotPassword;