const { Schema, default: mongoose } = require("mongoose");

const noticeSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
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
        enum: ['normal', 'emergency', 'event', 'guideline'],
        default: 'normal'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    expiresAt: {
        type: Date,
        default: null
    },
    attachments: {
        type: [String], // array of image/file URLs
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