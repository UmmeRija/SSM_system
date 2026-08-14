const { Schema, default: mongoose } = require("mongoose");

const gateLogSchema = new Schema({
    flatId: {
        type: Schema.Types.ObjectId,
        ref: 'flat',
        required: true
    },
    visitorId: {
        type: Schema.Types.ObjectId,
        ref: 'visitor',
        required: true
    },
    guardId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    action: {
        type: String,
        enum: ['entry', 'exit', 'verified', 'rejected'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    gateNumber: {
        type: String,
        default: 'Main Gate'
    },
    remarks: {
        type: String,
        default: null
    },
    deviceInfo: {
        type: String, // e.g., "Tablet-01", "Mobile"
        default: null
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('gatelog', gateLogSchema)