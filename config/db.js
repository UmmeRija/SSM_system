const mongoose = require("mongoose")
require("dotenv").config()

async function ConnectDB() {
    try {
        await mongoose.connect(process.env.DBURI)
            .then(() => console.log('MongoDB Connected!'))
            .catch((err) => console.log('Connection Failed:', err.message))
    } catch (error) {
        console.log('DB Error:', error.message)
    }
}

module.exports = ConnectDB