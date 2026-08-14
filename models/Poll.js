const { Schema, default: mongoose } = require("mongoose");

const pollSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    options: {
        type: [String], // ["Yes", "No", "Maybe"]
        required: true
    },
    votes: {
        type: Map,
        of: Number,
        default: {}
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    totalVotes: {
        type: Number,
        default: 0
    },
    // Track who voted to prevent multiple votes
    votedBy: {
        type: [Schema.Types.ObjectId],
        ref: 'user',
        default: []
    },
    category: {
        type: String,
        enum: ['general', 'maintenance', 'event', 'security', 'other'],
        default: 'general'
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('poll', pollSchema)