const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const dotenv = require('dotenv')
const ConnectDB = require('./config/db')
const UserRoutes = require('./routes/UserRoutes')
const MaintenanceBillRoutes = require('./routes/MaintenanceBillRoutes')
const VisitorRoutes = require('./routes/VisitorRoutes')
const complaintRoutes = require('./routes/ComplaintRoutes')
const AmenityBookingRoutes = require('./routes/AmenityBookingRoutes')
const NoticeRoutes = require('./routes/NoticeRoutes')
const flatRoutes = require('./routes/FlatRoutes')
dotenv.config()
const app = express()
ConnectDB()
app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use("/api/user", UserRoutes)
app.use("/api/visitor", VisitorRoutes)
app.use("/api/maintenance", MaintenanceBillRoutes)
app.use("/api/complaint", complaintRoutes)
app.use("/api/amenity-booking", AmenityBookingRoutes)
app.use("/api/notice", NoticeRoutes)
app.use("flat", flatRoutes)







const port = process.env.PORT || 5000
app.listen (port, () => console.log(`Server is runnig on http://localhost:${port}`))