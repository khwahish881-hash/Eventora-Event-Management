const express = require("express");

const router = express.Router();

const {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} = require("../controllers/eventControllers");

const {
    protect,
    admin
} = require("../middleware/auth");


// =====================================================
// GET ALL EVENTS
// =====================================================

router.get(
    "/",
    getAllEvents
);


// =====================================================
// GET SINGLE EVENT
// =====================================================

router.get(
    "/:id",
    getEventById
);


// =====================================================
// CREATE EVENT - ADMIN ONLY
// =====================================================

router.post(
    "/",
    protect,
    admin,
    createEvent
);


// =====================================================
// UPDATE EVENT - ADMIN ONLY
// =====================================================

router.put(
    "/:id",
    protect,
    admin,
    updateEvent
);


// =====================================================
// DELETE EVENT - ADMIN ONLY
// =====================================================

router.delete(
    "/:id",
    protect,
    admin,
    deleteEvent
);


module.exports = router;