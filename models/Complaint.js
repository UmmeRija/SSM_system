const { Schema, default: mongoose } = require("mongoose");

const complaintSchema = new Schema({
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
    category: {
        type: String,
        enum: ['plumbing', 'electrical', 'elevator', 'cleaning', 'pest_control', 'other'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved', 'rejected'],
        default: 'pending'
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'emergency'],
        default: 'medium'
    },
    resolvedAt: {
        type: Date,
        default: null
    },
    resolutionNotes: {
        type: String,
        default: null
    },
    slaDeadline: {
        type: Date,
        default: null
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('complaint', complaintSchema)