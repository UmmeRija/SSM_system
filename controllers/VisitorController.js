const Visitor = require("../models/Visitor")
const QRCode = require("qrcode")
const { safeFindWithPopulate, safeFindByIdWithPopulate, isValidObjectId } = require('../utils/safeQuery')

function mapVisitorToFrontend(visitor) {
    if (!visitor) return null
    const obj = typeof visitor.toObject === 'function' ? visitor.toObject() : { ...visitor }
    return {
        ...obj,
        vehicleNumber: obj.vehicleNumber || obj.vehicleNo || '—',
        validFrom: obj.validFrom || obj.entryTime,
        validTo: obj.validTo || obj.exitTime,
        passCode: obj.passCode || obj.qrCode || '',
        status: obj.status === 'approved' ? 'Active' : obj.status || 'Active',
    }
}

function generatePassCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const VisitorController = {

    // Create visitor pre-approval
    create: async (req, res) => {
        let {
            flatId,
            name,
            phone,
            vehicleNo,
            vehicleNumber,
            entryTime,
            validFrom,
            exitTime,
            validTo,
            purpose
        } = req.body

        try {

            // Map frontend field names to backend model fields (accept both conventions)
            const resolvedVehicleNo = vehicleNo || vehicleNumber || null
            const resolvedEntryTime = entryTime || validFrom
            const resolvedExitTime = exitTime || validTo
            const passCode = generatePassCode()

            if (!flatId || !name || !phone || !resolvedEntryTime || !resolvedExitTime) {
                return res.json({
                    message: "Required fields are missing",
                    status: false
                })
            }

            const qrData = `VISITOR-${passCode}-${Date.now()}`
            const qrCode = await QRCode.toDataURL(qrData)

            let visitor = await Visitor.create({
                flatId,
                name,
                phone,
                vehicleNo: resolvedVehicleNo,
                entryTime: resolvedEntryTime,
                exitTime: resolvedExitTime,
                purpose,
                passCode,
                qrCode,
                generatedBy: req.user.id,
                status: "approved"
            })

            return res.json({
                message: "Visitor pass generated successfully",
                status: true,
                visitor: mapVisitorToFrontend(visitor)
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Approve visitor and generate QR gate pass
    approve: async (req, res) => {
        let visitorId = req.params.id

        try {

            let visitor = await safeFindByIdWithPopulate(Visitor, visitorId, [])

            if (!visitor) {
                return res.json({
                    message: "Visitor not found",
                    status: false
                })
            }

            if (visitor.status === "approved") {
                return res.json({
                    message: "Visitor is already approved",
                    status: false
                })
            }

            if (visitor.status === "rejected") {
                return res.json({
                    message: "Rejected visitor cannot be approved",
                    status: false
                })
            }

            // Generate unique QR data
            let qrData = `VISITOR-${visitor._id}-${Date.now()}`

            let qrCode = await QRCode.toDataURL(qrData)

            visitor.status = "approved"
            visitor.verifiedBy = req.user.id
            visitor.qrCode = qrCode

            await visitor.save()

            return res.json({
                message: "Visitor approved and QR gate pass generated successfully",
                status: true,
                visitor: mapVisitorToFrontend(visitor)
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Reject visitor
    reject: async (req, res) => {
        let visitorId = req.params.id

        try {

            let visitor = await safeFindByIdWithPopulate(Visitor, visitorId, [])

            if (!visitor) {
                return res.json({
                    message: "Visitor not found",
                    status: false
                })
            }

            if (visitor.status === "approved") {
                return res.json({
                    message: "Approved visitor cannot be rejected",
                    status: false
                })
            }

            visitor.status = "rejected"
            visitor.verifiedBy = req.user.id

            await visitor.save()

            return res.json({
                message: "Visitor rejected successfully",
                status: true,
                visitor: mapVisitorToFrontend(visitor)
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Get all approved visitors / gate passes
    approvedVisitors: async (req, res) => {
        try {

            let visitors = await safeFindWithPopulate(Visitor, {
                status: "approved"
            }, ['flatId', 'generatedBy', 'verifiedBy'])

            if (visitors.length > 0) {
                return res.json({
                    message: "Approved visitors get successfully",
                    status: true,
                    visitors: visitors.map(mapVisitorToFrontend)
                })
            } else {
                return res.json({
                    message: "No approved visitors found",
                    status: false
                })
            }

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Get visitors of a specific flat
    flatVisitors: async (req, res) => {
        let flatId = req.params.flatId

        try {

            let visitors = await safeFindWithPopulate(Visitor, {
                flatId
            }, ['flatId', 'generatedBy', 'verifiedBy'])

            if (visitors.length > 0) {
                return res.json({
                    message: "Flat visitors get successfully",
                    status: true,
                    visitors: visitors.map(mapVisitorToFrontend)
                })
            } else {
                return res.json({
                    message: "No visitors found",
                    status: false
                })
            }

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Get single visitor / gate pass
    getSingleVisitor: async (req, res) => {
        let visitorId = req.params.id

        try {

            let visitor = await safeFindByIdWithPopulate(Visitor, visitorId, ['flatId', 'generatedBy', 'verifiedBy'])

            if (visitor) {
                return res.json({
                    message: "Visitor get successfully",
                    status: true,
                    visitor: mapVisitorToFrontend(visitor)
                })
            } else {
                return res.json({
                    message: "No visitor found",
                    status: false
                })
            }

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Verify QR gate pass
    verifyQR: async (req, res) => {
        let { qrCode } = req.body

        try {

            if (!qrCode) {
                return res.json({
                    message: "QR code is required",
                    status: false
                })
            }

            let visitor = await safeFindWithPopulate(Visitor, {
                $or: [
                    { passCode: qrCode },
                    { qrCode }
                ]
            }, ['flatId'])

            if (!visitor || visitor.length === 0) {
                return res.json({
                    message: "Invalid QR gate pass",
                    status: false
                })
            }

            visitor = visitor[0]

            if (visitor.status !== "approved") {
                return res.json({
                    message: "Gate pass is not approved",
                    status: false
                })
            }

            let currentTime = new Date()

            if (currentTime < visitor.entryTime) {
                return res.json({
                    message: "Visitor entry time has not started yet",
                    status: true,
                    visitor: mapVisitorToFrontend(visitor)
                })
            }

            if (currentTime > visitor.exitTime) {

                visitor.overstayAlert = true
                await visitor.save()

                return res.json({
                    message: "Gate pass has expired",
                    status: false,
                    overstayAlert: true,
                    visitor: mapVisitorToFrontend(visitor)
                })
            }

            return res.json({
                message: "QR gate pass verified successfully",
                status: true,
                visitor: mapVisitorToFrontend(visitor)
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Mark visitor as exited
    exitVisitor: async (req, res) => {
        let visitorId = req.params.id

        try {

            let visitor = await safeFindByIdWithPopulate(Visitor, visitorId, [])

            if (!visitor) {
                return res.json({
                    message: "Visitor not found",
                    status: false
                })
            }

            if (visitor.status === "exited") {
                return res.json({
                    message: "Visitor already exited",
                    status: false
                })
            }

            visitor.status = "exited"
            visitor.exitTime = new Date()

            await visitor.save()

            return res.json({
                message: "Visitor exit recorded successfully",
                status: true,
                visitor: mapVisitorToFrontend(visitor)
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Get all visitors
    all: async (req, res) => {
        try {

            let visitors = await safeFindWithPopulate(Visitor, {}, ['flatId', 'generatedBy', 'verifiedBy'])

            if (visitors.length > 0) {
                return res.json({
                    message: "All visitors get successfully",
                    status: true,
                    visitors: visitors.map(mapVisitorToFrontend)
                })
            } else {
                return res.json({
                    message: "No visitors found",
                    status: false
                })
            }

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    }

}

module.exports = VisitorController
