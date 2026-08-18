const { Schema, default: mongoose } = require("mongoose");

const noticeSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['General', 'Maintenance', 'Event', 'Security', 'Urgent', 'Emergency', 'Other'],
        default: 'General'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    type: {
        type: String,
        enum: ['normal', 'emergency', 'event', 'guideline', 'General', 'Maintenance', 'Security', 'Urgent', 'Other'],
        default: 'normal'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    pinned: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        default: null
    },
    attachments: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('Notice', noticeSchema)