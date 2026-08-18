const { Schema, default: mongoose } = require("mongoose");

const auditLogSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    module: {
        type: String,
        required: true
    },
    details: {
        type: String,
        default: null
    },
    ipAddress: {
        type: String,
        default: null
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('auditlog', auditLogSchema)
