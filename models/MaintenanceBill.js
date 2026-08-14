const { Schema, default: mongoose } = require("mongoose");

const maintenanceBillSchema = new Schema({
    flatId: {
        type: Schema.Types.ObjectId,
        ref: 'flat',
        required: true
    },
    month: {
        type: String, // "2026-08" format
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    breakdown: {
        water: {
            type: Number,
            default: 0
        },
        security: {
            type: Number,
            default: 0
        },
        repairs: {
            type: Number,
            default: 0
        },
        other: {
            type: Number,
            default: 0
        }
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending'
    },
    penalty: {
        type: Number,
        default: 0
    },
    paidAt: {
        type: Date,
        default: null
    },
    receiptUrl: {
        type: String,
        default: null
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('maintenancebill', maintenanceBillSchema)