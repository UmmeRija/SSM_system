const AmenityBooking = require("../models/AmenityBooking")
const { safeFindWithPopulate, safeFindByIdWithPopulate, isValidObjectId } = require('../utils/safeQuery')

function parseTimeToMinutes(value) {
    if (!value) return 0;
    const match = String(value).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return 0;

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const meridiem = (match[3] || '').toUpperCase();

    if (meridiem === 'AM' && hours === 12) hours = 0;
    if (meridiem === 'PM' && hours !== 12) hours += 12;

    return hours * 60 + minutes;
}

function hasTimeOverlap(startA, endA, startB, endB) {
    const startAT = parseTimeToMinutes(startA);
    const endAT = parseTimeToMinutes(endA);
    const startBT = parseTimeToMinutes(startB);
    const endBT = parseTimeToMinutes(endB);

    return startAT < endBT && endAT > startBT;
}

const AmenityBookingController = {

    // Check amenity availability
    checkAvailability: async (req, res) => {
        let {
            amenity,
            date,
            startTime,
            endTime
        } = req.body

        try {

            if (!amenity || !date || !startTime || !endTime) {
                return res.json({
                    message: "Required fields are missing",
                    status: false
                })
            }

            const sameDayBookings = await AmenityBooking.find({
                amenity,
                date: new Date(date),
                status: { $in: ["pending", "approved"] }
            })

            const existingBooking = sameDayBookings.find((booking) =>
                hasTimeOverlap(startTime, endTime, booking.startTime, booking.endTime)
            )

            if (existingBooking) {
                return res.json({
                    message: "Amenity is not available for the selected time",
                    status: false,
                    available: false,
                    booking: existingBooking
                })
            }

            return res.json({
                message: "Amenity is available for the selected time",
                status: true,
                available: true
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Create amenity booking
    create: async (req, res) => {
        let {
            flatId,
            amenity,
            date,
            startTime,
            endTime,
            purpose,
            guests
        } = req.body

        try {

            if (!flatId || !amenity || !date || !startTime || !endTime) {
                return res.json({
                    message: "Required fields are missing",
                    status: false
                })
            }

            const sameDayBookings = await AmenityBooking.find({
                amenity,
                date: new Date(date),
                status: { $in: ["pending", "approved"] }
            })

            const existingBooking = sameDayBookings.find((booking) =>
                hasTimeOverlap(startTime, endTime, booking.startTime, booking.endTime)
            )

            if (existingBooking) {
                return res.json({
                    message: "Amenity is already booked for the selected time",
                    status: false
                })
            }

            let booking = await AmenityBooking.create({
                residentId: req.user.id,
                flatId,
                amenity,
                date,
                startTime,
                endTime,
                purpose,
                guests
            })

            return res.json({
                message: "Amenity booking created successfully",
                status: true,
                booking
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Get current user's bookings
    myBookings: async (req, res) => {
        try {

            let bookings = await safeFindWithPopulate(AmenityBooking, {
                residentId: req.user.id
            }, ['flatId', 'approvedBy'])

            if (bookings.length > 0) {
                return res.json({
                    message: "Your amenity bookings get successfully",
                    status: true,
                    bookings
                })
            } else {
                return res.json({
                    message: "No amenity bookings found",
                    status: false
                })
            }

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Get all bookings
    all: async (req, res) => {
        try {

            let bookings = await safeFindWithPopulate(AmenityBooking, {}, ['residentId', 'flatId', 'approvedBy'])

            if (bookings.length > 0) {
                return res.json({
                    message: "All amenity bookings get successfully",
                    status: true,
                    bookings
                })
            } else {
                return res.json({
                    message: "No amenity bookings found",
                    status: false
                })
            }

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Get single booking
    getSingleBooking: async (req, res) => {
        let bookingId = req.params.id

        try {

            let booking = await safeFindByIdWithPopulate(AmenityBooking, bookingId, ['residentId', 'flatId', 'approvedBy'])

            if (booking) {
                return res.json({
                    message: "Amenity booking get successfully",
                    status: true,
                    booking
                })
            } else {
                return res.json({
                    message: "No amenity booking found",
                    status: false
                })
            }

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Approve booking
    approve: async (req, res) => {
        let bookingId = req.params.id

        try {

            let booking = await safeFindByIdWithPopulate(AmenityBooking, bookingId, [])

            if (!booking) {
                return res.json({
                    message: "Amenity booking not found",
                    status: false
                })
            }

            if (booking.status === "cancelled") {
                return res.json({
                    message: "Cancelled booking cannot be approved",
                    status: false
                })
            }

            if (booking.status === "approved") {
                return res.json({
                    message: "Booking is already approved",
                    status: false
                })
            }

            // Check availability again before approval
            let existingBooking = await AmenityBooking.findOne({
                _id: { $ne: bookingId },
                amenity: booking.amenity,
                date: booking.date,
                status: "approved",
                $or: [
                    {
                        startTime: { $lt: booking.endTime },
                        endTime: { $gt: booking.startTime }
                    }
                ]
            })

            if (existingBooking) {
                return res.json({
                    message: "Amenity is already booked for this time",
                    status: false
                })
            }

            booking.status = "approved"
            booking.approvedBy = req.user.id

            await booking.save()

            return res.json({
                message: "Amenity booking approved successfully",
                status: true,
                booking
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Cancel booking
    cancel: async (req, res) => {
        let bookingId = req.params.id

        try {

            let booking = await safeFindByIdWithPopulate(AmenityBooking, bookingId, [])

            if (!booking) {
                return res.json({
                    message: "Amenity booking not found",
                    status: false
                })
            }

            if (booking.status === "completed") {
                return res.json({
                    message: "Completed booking cannot be cancelled",
                    status: false
                })
            }

            if (booking.status === "cancelled") {
                return res.json({
                    message: "Booking is already cancelled",
                    status: false
                })
            }

            booking.status = "cancelled"

            await booking.save()

            return res.json({
                message: "Amenity booking cancelled successfully",
                status: true,
                booking
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Mark booking as completed
    complete: async (req, res) => {
        let bookingId = req.params.id

        try {

            let booking = await safeFindByIdWithPopulate(AmenityBooking, bookingId, [])

            if (!booking) {
                return res.json({
                    message: "Amenity booking not found",
                    status: false
                })
            }

            if (booking.status !== "approved") {
                return res.json({
                    message: "Only approved bookings can be completed",
                    status: false
                })
            }

            booking.status = "completed"

            await booking.save()

            return res.json({
                message: "Amenity booking completed successfully",
                status: true,
                booking
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    }

}

module.exports = AmenityBookingController
