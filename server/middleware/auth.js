const jwt = require("jsonwebtoken");
const db = require("../config/db");


// =====================================================
// PROTECT ROUTE
// =====================================================

const protect = async (req, res, next) => {

    let token = null;

    // Get token from Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }


    // No token
    if (!token) {
        return res.status(401).json({
            message: "Not authorized, no token"
        });
    }


    try {

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        // Find user from MySQL
        const [users] = await db.query(
            `
            SELECT
                user_id,
                name,
                email,
                role,
                is_verified,
                created_at
            FROM users
            WHERE user_id = ?
            `,
            [decoded.id]
        );


        // User not found
        if (users.length === 0) {
            return res.status(401).json({
                message: "Not authorized, user not found"
            });
        }


        // Attach user to request
        req.user = users[0];


        next();

    } catch (error) {

        console.error("Authentication Error:", error);

        return res.status(401).json({
            message: "Not authorized, token failed"
        });
    }
};


// =====================================================
// ADMIN MIDDLEWARE
// =====================================================

const admin = (req, res, next) => {

    if (
        req.user &&
        req.user.role === "admin"
    ) {
        next();

    } else {

        return res.status(403).json({
            message: "Forbidden, admin access required"
        });
    }
};


module.exports = {
    protect,
    admin
};