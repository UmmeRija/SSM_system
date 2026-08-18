const { Schema, default: mongoose } = require("mongoose");

const amenityBookingSchema = new Schema({
    residentId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    flatId: {
        type: Schema.Types.ObjectId,
        ref: 'flat',
        required: true
    },
    amenity: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String, // "10:00 AM" format
        required: true
    },
    endTime: {
        type: String, // "12:00 PM" format
        required: true
    },
    purpose: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'cancelled', 'completed'],
        default: 'pending'
    },
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    guests: {
        type: Number,
        default: 0
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('amenitybooking', amenityBookingSchema)