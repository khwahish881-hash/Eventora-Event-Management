const express = require("express");
const db = require("../config/db");

const router = express.Router();

const {
    RegisterUser,
    LoginUser,
    verifyOtp,
    forgotPassword,
    resetPassword
} = require("../controllers/authControllers");

router.post("/register", RegisterUser);
router.post("/login", LoginUser);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


// MySQL TEST
router.get("/test-mysql", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT user_id, name, email, role, is_verified FROM users"
        );

        res.json({
            message: "MySQL is working",
            users: rows
        });

    } catch (error) {
        console.error("MySQL Test Error:", error);

        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;