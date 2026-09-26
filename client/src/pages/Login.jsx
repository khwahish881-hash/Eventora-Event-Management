import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const API_URL =
        "https://eventora-backend-cpdf.onrender.com";


    // ==========================================
    // HANDLE LOGIN
    // ==========================================

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");

        // Check empty fields
        if (!email.trim() || !password) {
            setError(
                "Please enter email and password."
            );
            return;
        }

        try {

            setLoading(true);

            console.log("Attempting login...");
            console.log("Email:", email);


            // ==========================================
            // LOGIN API
            // ==========================================

            const response = await axios.post(
                `${API_URL}/api/auth/login`,
                {
                    email: email.trim(),
                    password: password
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    timeout: 30000
                }
            );


            console.log(
                "Login response:",
                response.data
            );


            // ==========================================
            // GET TOKEN
            // ==========================================

            const token = response.data?.token;

            if (!token) {

                console.error(
                    "Token missing from response:",
                    response.data
                );

                setError(
                    "Login successful, but authentication token was not received."
                );

                return;
            }


            // ==========================================
            // SAVE TOKEN
            // ==========================================

            localStorage.setItem(
                "token",
                token
            );


            // ==========================================
            // SAVE USER INFORMATION
            // ==========================================

            const userData = {
                _id:
                    response.data?._id ||
                    response.data?.user?._id ||
                    "",

                name:
                    response.data?.name ||
                    response.data?.user?.name ||
                    "",

                email:
                    response.data?.email ||
                    response.data?.user?.email ||
                    email.trim(),

                role:
                    response.data?.role ||
                    response.data?.user?.role ||
                    "user"
            };


            localStorage.setItem(
                "user",
                JSON.stringify(userData)
            );


            // ==========================================
            // AUTH CHANGE EVENT
            // ==========================================

            window.dispatchEvent(
                new Event("eventora-auth-change")
            );


            // ==========================================
            // LOGIN SUCCESS
            // ==========================================

            console.log(
                "Login successful"
            );

            console.log(
                "User:",
                userData
            );


            // Go to events page
            navigate(
                "/events",
                {
                    replace: true
                }
            );

        } catch (error) {

            // ==========================================
            // LOGIN ERROR
            // ==========================================

            console.error(
                "LOGIN ERROR:",
                error
            );

            console.error(
                "STATUS:",
                error.response?.status
            );

            console.error(
                "RESPONSE:",
                error.response?.data
            );


            // Backend error message
            if (error.response) {

                const status =
                    error.response.status;

                const backendMessage =
                    error.response.data?.error ||
                    error.response.data?.message;


                if (backendMessage) {

                    setError(
                        backendMessage
                    );

                } else if (status === 400) {

                    setError(
                        "Invalid login request. Please check your email and password."
                    );

                } else if (status === 401) {

                    setError(
                        "Invalid email or password."
                    );

                } else if (status === 404) {

                    setError(
                        "Login API not found. Please check the backend server."
                    );

                } else if (status === 500) {

                    setError(
                        "Server error. Please try again later."
                    );

                } else {

                    setError(
                        `Login failed. Server returned status ${status}.`
                    );
                }

            } else if (error.request) {

                setError(
                    "Unable to connect to the server. Please check your internet connection or backend deployment."
                );

            } else {

                setError(
                    error.message ||
                    "Login failed. Please try again."
                );
            }

        } finally {

            setLoading(false);

        }
    };


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="auth-page">

            <div className="auth-card">

                {/* ============================== */}
                {/* HEADER */}
                {/* ============================== */}

                <div className="auth-header">

                    <div className="auth-logo">
                        E
                    </div>

                    <h1>
                        Welcome Back
                    </h1>

                    <p>
                        Login to continue your Eventora
                        experience.
                    </p>

                </div>


                {/* ============================== */}
                {/* ERROR MESSAGE */}
                {/* ============================== */}

                {error && (

                    <div className="error-box">
                        {error}
                    </div>

                )}


                {/* ============================== */}
                {/* LOGIN FORM */}
                {/* ============================== */}

                <form
                    onSubmit={handleLogin}
                    className="auth-form"
                >

                    {/* EMAIL */}

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
                        disabled={loading}
                        autoComplete="email"
                    />


                    {/* PASSWORD */}

                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        disabled={loading}
                        autoComplete="current-password"
                    />


                    {/* FORGOT PASSWORD */}

                    <div className="forgot-row">

                        <Link to="/forgot-password">
                            Forgot Password?
                        </Link>

                    </div>


                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Logging in..."
                            : "Login"}

                    </button>

                </form>


                {/* ============================== */}
                {/* REGISTER */}
                {/* ============================== */}

                <div className="auth-footer">

                    <p>
                        Don't have an account?
                    </p>

                    <Link to="/register">
                        Create Account
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default Login;