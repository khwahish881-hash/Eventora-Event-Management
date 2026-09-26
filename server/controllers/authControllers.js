const db = require("../config/db");
const bcrypt = require("bcryptjs");

const generateToken = require("../utils/generateToken");
const { sendOTPEmail } = require("../utils/email");


// ========================================
// Generate 6 Digit OTP
// ========================================

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


// ========================================
// REGISTER USER
// ========================================

const RegisterUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide name, email and password"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Check existing user
        const [existingUsers] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const [result] = await db.query(
            `INSERT INTO users 
            (name, email, password, role, is_verified)
            VALUES (?, ?, ?, 'user', FALSE)`,
            [
                name,
                email,
                hashedPassword
            ]
        );

        const userId = result.insertId;

        // Generate OTP
        const otp = generateOTP();

        // Delete old OTP
        await db.query(
            `DELETE FROM otp
             WHERE email = ?
             AND action = 'account_verification'`,
            [email]
        );

        // Save OTP
        await db.query(
            `INSERT INTO otp
            (email, otp, action)
            VALUES (?, ?, 'account_verification')`,
            [email, otp]
        );

        // Send OTP
        await sendOTPEmail(email, otp);

        res.status(201).json({
            message: "Registration successful. OTP sent to your email.",
            userId: userId
        });

    } catch (error) {

        console.error("Register Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ========================================
// LOGIN USER
// ========================================

const LoginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        // Find user
        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // Check verification
        if (!user.is_verified) {
            return res.status(401).json({
                message: "Please verify your email first"
            });
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate JWT
        const token = generateToken(
            user.user_id,
            user.role
        );

        res.status(200).json({
            message: "Login successful",

            token: token,

            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        console.error("Login Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ========================================
// VERIFY OTP
// ========================================

const verifyOtp = async (req, res) => {
    try {

        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        // Find OTP
        const [otpRecords] = await db.query(
            `SELECT * FROM otp
             WHERE email = ?
             AND otp = ?
             AND action = 'account_verification'
             ORDER BY created_at DESC
             LIMIT 1`,
            [email, otp]
        );

        if (otpRecords.length === 0) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // Verify user
        await db.query(
            `UPDATE users
             SET is_verified = TRUE
             WHERE email = ?`,
            [email]
        );

        // Delete OTP
        await db.query(
            `DELETE FROM otp
             WHERE email = ?
             AND action = 'account_verification'`,
            [email]
        );

        // Get user
        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = users[0];

        // Generate token
        const token = generateToken(
            user.user_id,
            user.role
        );

        res.status(200).json({
            message: "Email verified successfully",

            token: token,

            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        console.error("Verify OTP Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ========================================
// FORGOT PASSWORD
// ========================================

const forgotPassword = async (req, res) => {
    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        // Find user
        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Generate OTP
        const otp = generateOTP();

        // Delete old reset OTP
        await db.query(
            `DELETE FROM otp
             WHERE email = ?
             AND action = 'password_reset'`,
            [email]
        );

        // Save reset OTP
        await db.query(
            `INSERT INTO otp
            (email, otp, action)
            VALUES (?, ?, 'password_reset')`,
            [email, otp]
        );

        // Send OTP
        await sendOTPEmail(email, otp);

        res.status(200).json({
            message: "Password reset OTP sent to your email"
        });

    } catch (error) {

        console.error("Forgot Password Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ========================================
// RESET PASSWORD
// ========================================

const resetPassword = async (req, res) => {
    try {

        const {
            email,
            otp,
            password,
            confirmPassword
        } = req.body;

        // Validation
        if (
            !email ||
            !otp ||
            !password ||
            !confirmPassword
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Check OTP
        const [otpRecords] = await db.query(
            `SELECT * FROM otp
             WHERE email = ?
             AND otp = ?
             AND action = 'password_reset'
             ORDER BY created_at DESC
             LIMIT 1`,
            [email, otp]
        );

        if (otpRecords.length === 0) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // Find user
        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // Update password
        await db.query(
            `UPDATE users
             SET password = ?
             WHERE email = ?`,
            [
                hashedPassword,
                email
            ]
        );

        // Delete OTP
        await db.query(
            `DELETE FROM otp
             WHERE email = ?
             AND action = 'password_reset'`,
            [email]
        );

        res.status(200).json({
            message: "Password reset successfully"
        });

    } catch (error) {

        console.error("Reset Password Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


module.exports = {
    RegisterUser,
    LoginUser,
    verifyOtp,
    forgotPassword,
    resetPassword
};