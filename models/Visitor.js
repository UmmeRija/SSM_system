const { Schema, default: mongoose } = require("mongoose");

const visitorSchema = new Schema({
    flatId: {
        type: Schema.Types.ObjectId,
        ref: 'flat',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    vehicleNo: {
        type: String,
        default: null
    },
    entryTime: {
        type: Date,
        default: Date.now
    },
    exitTime: {
        type: Date,
        default: null
    },
    purpose: {
        type: String,
        default: null
    },
    qrCode: {
        type: String,
        unique: true,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'exited'],
        default: 'pending'
    },
    generatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    photo: {
        type: String, 
        default: null
    },
    overstayAlert: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('visitor', visitorSchema)