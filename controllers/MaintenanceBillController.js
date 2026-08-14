const MaintenanceBill = require("../models/MaintenanceBill")
const PDFDocument = require("pdfkit")
const fs = require("fs")
const path = require("path")

const MaintenanceBillController = {

    // Get current maintenance bills
    currentBills: async (req, res) => {
        try {
            let bills = await MaintenanceBill.find({
                flatId: req.params.flatId
            }).populate("flatId")

            if (bills.length > 0) {
                return res.json({
                    message: "Current maintenance bills get successfully",
                    status: true,
                    bills
                })
            } else {
                return res.json({
                    message: "No maintenance bills found",
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


    // Get historical maintenance bills
    historicalBills: async (req, res) => {
        try {
            let bills = await MaintenanceBill.find({
                flatId: req.params.flatId,
                status: { $in: ["paid", "overdue"] }
            }).sort({ month: -1 }).populate("flatId")

            if (bills.length > 0) {
                return res.json({
                    message: "Historical maintenance bills get successfully",
                    status: true,
                    bills
                })
            } else {
                return res.json({
                    message: "No historical bills found",
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


    // Get single maintenance bill with breakdown
    getSingleBill: async (req, res) => {
        let billId = req.params.id

        try {
            let bill = await MaintenanceBill.findById(billId)
                .populate("flatId")

            if (bill) {
                return res.json({
                    message: "Maintenance bill get successfully",
                    status: true,
                    bill
                })
            } else {
                return res.json({
                    message: "No maintenance bill found",
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


    // Simulate digital fee payment
    payBill: async (req, res) => {
        let billId = req.params.id

        try {
            let bill = await MaintenanceBill.findById(billId)

            if (!bill) {
                return res.json({
                    message: "Maintenance bill not found",
                    status: false
                })
            }

            if (bill.status === "paid") {
                return res.json({
                    message: "Bill is already paid",
                    status: false
                })
            }

            let totalAmount = bill.amount + bill.penalty

            bill.status = "paid"
            bill.paidAt = new Date()

            await bill.save()

            return res.json({
                message: "Digital payment simulated successfully",
                status: true,
                payment: {
                    billId: bill._id,
                    amount: bill.amount,
                    penalty: bill.penalty,
                    totalAmount: totalAmount,
                    paidAt: bill.paidAt,
                    paymentStatus: "paid"
                },
                bill
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Generate and download PDF receipt
    downloadReceipt: async (req, res) => {
        let billId = req.params.id

        try {
            let bill = await MaintenanceBill.findById(billId)
                .populate("flatId")

            if (!bill) {
                return res.json({
                    message: "Maintenance bill not found",
                    status: false
                })
            }

            if (bill.status !== "paid") {
                return res.json({
                    message: "Receipt is available only for paid bills",
                    status: false
                })
            }

            let receiptsFolder = path.join(__dirname, "../receipts")

            if (!fs.existsSync(receiptsFolder)) {
                fs.mkdirSync(receiptsFolder, { recursive: true })
            }

            let fileName = `receipt-${bill._id}.pdf`
            let filePath = path.join(receiptsFolder, fileName)

            let doc = new PDFDocument()

            let writeStream = fs.createWriteStream(filePath)

            doc.pipe(writeStream)

            doc.fontSize(20)
                .text("Maintenance Fee Payment Receipt", {
                    align: "center"
                })

            doc.moveDown()

            doc.fontSize(12)
                .text(`Bill ID: ${bill._id}`)
                .text(`Month: ${bill.month}`)
                .text(`Flat ID: ${bill.flatId?._id || bill.flatId}`)
                .text(`Amount: ${bill.amount}`)
                .text(`Penalty: ${bill.penalty}`)
                .text(`Total Paid: ${bill.amount + bill.penalty}`)
                .text(`Status: ${bill.status}`)
                .text(`Paid At: ${bill.paidAt}`)

            doc.moveDown()

            doc.fontSize(15)
                .text("Charge Breakdown")

            doc.moveDown()

            doc.fontSize(12)
                .text(`Water: ${bill.breakdown.water}`)
                .text(`Security: ${bill.breakdown.security}`)
                .text(`Repairs: ${bill.breakdown.repairs}`)
                .text(`Other: ${bill.breakdown.other}`)

            doc.end()

            writeStream.on("finish", async () => {

                bill.receiptUrl = `/receipts/${fileName}`

                await bill.save()

                return res.download(
                    filePath,
                    fileName
                )
            })

        } catch (error) {
            res.json({
                message: error.message,
                status: false
            })
        }
    },


    // Get all maintenance bills
    all: async (req, res) => {
        try {
            let bills = await MaintenanceBill.find({})
                .sort({ month: -1 })
                .populate("flatId")

            if (bills.length > 0) {
                return res.json({
                    message: "All maintenance bills get successfully",
                    status: true,
                    bills
                })
            } else {
                return res.json({
                    message: "No maintenance bills found",
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

module.exports = MaintenanceBillController
