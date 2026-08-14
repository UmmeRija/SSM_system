const express = require("express")
const router = express.Router()

const authmiddleware = require("../middleware/authmiddleware")
const AmenityBookingController = require("../Controllers/AmenityBookingController")


// http://localhost:3000/api/amenity-booking/availability
router.post("/availability", authmiddleware, AmenityBookingController.checkAvailability)


// http://localhost:3000/api/amenity-booking/create
router.post("/create", authmiddleware, AmenityBookingController.create)


// http://localhost:3000/api/amenity-booking/my
router.get("/my", authmiddleware, AmenityBookingController.myBookings)


// http://localhost:3000/api/amenity-booking/all
router.get("/all", authmiddleware, AmenityBookingController.all)


// http://localhost:3000/api/amenity-booking/single/BOOKING_ID
router.get("/single/:id", authmiddleware, AmenityBookingController.getSingleBooking)


// http://localhost:3000/api/amenity-booking/approve/BOOKING_ID
router.put("/approve/:id", authmiddleware, AmenityBookingController.approve)


// http://localhost:3000/api/amenity-booking/cancel/BOOKING_ID
router.put( "/cancel/:id", authmiddleware, AmenityBookingController.cancel)


// http://localhost:3000/api/amenity-booking/complete/BOOKING_ID
router.put("/complete/:id", authmiddleware, AmenityBookingController.complete
)


module.exports = router
