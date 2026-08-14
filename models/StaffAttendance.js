const { Schema, default: mongoose } = require("mongoose");

const staffAttendanceSchema = new Schema({
    staffId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    checkIn: {
        type: Date,
        default: null
    },
    checkOut: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'half_day', 'holiday'],
        default: 'absent'
    },
    workedHours: {
        type: Number,
        default: 0
    },
    remarks: {
        type: String,
        default: null
    },
    location: {
        type: String, // GPS coordinates or location name
        default: null
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('staffattendance', staffAttendanceSchema)