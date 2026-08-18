const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const ConnectDB = require('./config/db')

const UserRoutes = require('./routes/UserRoutes')
const MaintenanceBillRoutes = require('./routes/MaintenanceBillRoutes')
const VisitorRoutes = require('./routes/VisitorRoutes')
const complaintRoutes = require('./routes/ComplaintRoutes')
const AmenityBookingRoutes = require('./routes/AmenityBookingRoutes')
const NoticeRoutes = require('./routes/NoticeRoutes')
const flatRoutes = require('./routes/FlatRoutes')
const GateLogRoutes = require('./routes/GateLogRoutes')
const PollRoutes = require('./routes/PollRoutes')
const EmergencyAlertRouter = require('./routes/EmergencyAlertRouter')
const StaffAttendanceRoutes = require('./routes/StaffAttendanceRoutes')
const AuditLogRoutes = require('./routes/AuditLogRoutes')

dotenv.config()
const app = express()
ConnectDB()

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://ssm-system-dxih.vercel.app',
    'https://ssms-frontend-pearl.vercel.app'
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "SmartSociety Backend API is running...",
        version: "1.0.0"
    });
});
// Serve receipts static directory
app.use('/receipts', express.static(path.join(__dirname, 'receipts')))


app.use("/api/user", UserRoutes)
app.use("/api/visitor", VisitorRoutes)
app.use("/api/maintenance", MaintenanceBillRoutes)
app.use("/api/complaint", complaintRoutes)
app.use("/api/amenity-booking", AmenityBookingRoutes)
app.use("/api/notice", NoticeRoutes)
app.use("/api/flat", flatRoutes)
app.use("/api/gate-log", GateLogRoutes)
app.use("/api/poll", PollRoutes)
app.use("/api/emergency", EmergencyAlertRouter)
app.use("/api/staff-attendance", StaffAttendanceRoutes)
app.use("/api/audit-log", AuditLogRoutes)

const port = process.env.PORT || 5000
app.listen (port, () => console.log(`Server is running on http://localhost:${port}`))
