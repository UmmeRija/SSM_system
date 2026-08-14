const { Schema, default: mongoose } = require("mongoose");

const emergencyAlertSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    type: {
        type: String,
        enum: ['fire', 'medical', 'security', 'natural_disaster', 'other'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'high'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    resolvedAt: {
        type: Date,
        default: null
    },
    resolvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    affectedAreas: {
        type: [String],
        default: []
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('emergencyalert', emergencyAlertSchema)