const Visitor = require("../models/Visitor")
const QRCode = require("qrcode")

const VisitorController = {

    // Create visitor pre-approval
    create: async (req, res) => {
        let {
            flatId,
            name,
            phone,
            vehicleNo,
            entryTime,
            exitTime,
            purpose
        } = req.body

        try {

            if (!flatId || !name || !phone || !entryTime || !exitTime) {
                return res.json({
                    message: "Required fields are missing",
                    status: false
                })
            }

            let visitor = await Visitor.create({
                flatId,
                name,
                phone,
                vehicleNo,
                entryTime,
                exitTime,
                purpose,
                generatedBy: req.user.id,
                status: "pending"
            })

            return res.json({
                message: "Visitor pre-approval request created successfully",
                status: true,
                visitor
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

            let visitor = await Visitor.findById(visitorId)

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
                visitor
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

            let visitor = await Visitor.findById(visitorId)

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
                visitor
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

            let visitors = await Visitor.find({
                status: "approved"
            })
                .populate("flatId")
                .populate("generatedBy")
                .populate("verifiedBy")
                .sort({ createdAt: -1 })

            if (visitors.length > 0) {
                return res.json({
                    message: "Approved visitors get successfully",
                    status: true,
                    visitors
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

            let visitors = await Visitor.find({
                flatId
            })
                .populate("flatId")
                .populate("generatedBy")
                .populate("verifiedBy")
                .sort({ createdAt: -1 })

            if (visitors.length > 0) {
                return res.json({
                    message: "Flat visitors get successfully",
                    status: true,
                    visitors
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

            let visitor = await Visitor.findById(visitorId)
                .populate("flatId")
                .populate("generatedBy")
                .populate("verifiedBy")

            if (visitor) {
                return res.json({
                    message: "Visitor get successfully",
                    status: true,
                    visitor
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

            let visitor = await Visitor.findOne({
                qrCode
            })
                .populate("flatId")

            if (!visitor) {
                return res.json({
                    message: "Invalid QR gate pass",
                    status: false
                })
            }

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
                    status: false,
                    visitor
                })
            }

            if (currentTime > visitor.exitTime) {

                visitor.overstayAlert = true
                await visitor.save()

                return res.json({
                    message: "Gate pass has expired",
                    status: false,
                    overstayAlert: true,
                    visitor
                })
            }

            return res.json({
                message: "QR gate pass verified successfully",
                status: true,
                visitor
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

            let visitor = await Visitor.findById(visitorId)

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
                visitor
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

            let visitors = await Visitor.find({})
                .populate("flatId")
                .populate("generatedBy")
                .populate("verifiedBy")
                .sort({ createdAt: -1 })

            if (visitors.length > 0) {
                return res.json({
                    message: "All visitors get successfully",
                    status: true,
                    visitors
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
