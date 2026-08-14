const { Schema, default: mongoose } = require("mongoose");

const flatSchema = new Schema({
    flatNumber: {
        type: String,
        required: true,
        unique: true
    },
    tower: {
        type: String,
        required: true
    },
    occupancyStatus: {
        type: String,
        enum: ['occupied', 'vacant'],
        default: 'vacant'
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    tenantId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    floor: {
        type: Number,
        default: null
    },
    size: {
        type: String, // e.g., "2 BHK", "3 BHK"
        default: null
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('flat', flatSchema)