const { Schema, default: mongoose } = require("mongoose");

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'resident', 'security', 'guard', 'staff'],
        default: 'resident'
    },
    flatId: {
        type: Schema.Types.ObjectId,
        ref: 'flat',
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    vehicleNo: {
        type: String,
        default: null
    },
    emergencyContact: {
        type: String,
        default: null
    },
    imgUrl: {
        type: String,
        default: "https://img.magnific.com/free-vector/user-circles-set_78370-4704.jpg?semt=ais_hybrid&w=740&q=80"
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('user', userSchema)