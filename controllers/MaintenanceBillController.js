const MaintenanceBill = require("../models/MaintenanceBill")
const PDFDocument = require("pdfkit")
const fs = require("fs")
const path = require("path")
const { safeFindWithPopulate, safeFindByIdWithPopulate, isValidObjectId } = require('../utils/safeQuery')

const MaintenanceBillController = {

    // Get current maintenance bills
    currentBills: async (req, res) => {
        try {
            let bills = await safeFindWithPopulate(MaintenanceBill, {
                flatId: req.params.flatId
            }, ['flatId'])

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
            let bills = await safeFindWithPopulate(MaintenanceBill, {
                flatId: req.params.flatId,
                status: { $in: ["paid", "overdue"] }
            }, ['flatId'], { sort: { month: -1 } })

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
            let bill = await safeFindByIdWithPopulate(MaintenanceBill, billId, ['flatId'])

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

            if (!billId || !isValidObjectId(billId)) {
                return res.json({
                    message: "Invalid ID",
                    status: false
                })
            }

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
            let bill = await safeFindByIdWithPopulate(MaintenanceBill, billId, ['flatId'])

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


    // Admin: Generate monthly bills for all occupied flats (or single flat if flatId provided)
    generateBills: async (req, res) => {
        const { month, year, breakdown, flatId } = req.body;
        try {
            let monthStr;
            if (month && month.includes('-')) {
                const [parsedYear, parsedMonth] = month.split('-');
                monthStr = `${parsedYear}-${parsedMonth}`;
            } else if (month && year) {
                monthStr = `${year}-${month}`;
            }

            if (!monthStr) {
                return res.json({
                    message: "Month and Year are required",
                    status: false
                });
            }

            const Flat = require('../models/Flat');
            let flatsToBill = [];
            if (flatId) {
                const flat = await Flat.findById(flatId);
                if (!flat) {
                    return res.json({
                        message: "Flat not found",
                        status: false
                    });
                }
                flatsToBill = [flat];
            } else {
                flatsToBill = await Flat.find({});
            }

            if (flatsToBill.length === 0) {
                return res.json({
                    message: "No occupied flats found to bill",
                    status: false
                });
            }

            const water = breakdown?.water ?? 1200;
            const security = breakdown?.security ?? 3000;
            const repairs = breakdown?.repairs ?? 1500;
            const other = breakdown?.other ?? 2500;
            const totalAmount = water + security + repairs + other;

            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14);

            let count = 0;
            for (const flat of flatsToBill) {
                // Check if bill already generated for this month
                const existing = await MaintenanceBill.findOne({
                    flatId: flat._id,
                    month: monthStr
                });

                if (!existing) {
                    await MaintenanceBill.create({
                        flatId: flat._id,
                        month: monthStr,
                        amount: totalAmount,
                        breakdown: { water, security, repairs, other },
                        dueDate,
                        status: 'pending'
                    });
                    count++;
                }
            }

            return res.json({
                message: `Successfully generated ${count} bills for ${monthStr}`,
                status: true
            });
        } catch (error) {
            return res.json({
                message: error.message,
                status: false
            });
        }
    },


    // Admin: Apply penalty fee to overdue bills
    applyPenalties: async (req, res) => {
        const { penaltyPercentage } = req.body;
        try {
            const pct = penaltyPercentage || 5; // default 5%
            const today = new Date();

            // Find all pending bills that are past due date
            const overdueBills = await MaintenanceBill.find({
                status: 'pending',
                dueDate: { $lt: today }
            });

            let count = 0;
            for (const bill of overdueBills) {
                bill.status = 'overdue';
                bill.penalty = Math.round(bill.amount * (pct / 100));
                await bill.save();
                count++;
            }

            return res.json({
                message: `Identified and updated ${count} overdue bills with a ${pct}% penalty`,
                status: true
            });
        } catch (error) {
            return res.json({
                message: error.message,
                status: false
            });
        }
    },


    // Admin: Get aggregate billing collection statistics
    collectionReport: async (req, res) => {
        try {
            const bills = await MaintenanceBill.find({});
            const totalDue = bills.reduce((sum, b) => sum + b.amount + b.penalty, 0);
            const collected = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount + b.penalty, 0);
            const overdue = bills.filter(b => b.status === 'overdue').reduce((sum, b) => sum + b.amount + b.penalty, 0);
            const pending = bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0);

            return res.json({
                status: true,
                summary: {
                    totalDue,
                    collected,
                    overdue,
                    pending
                }
            });
        } catch (error) {
            return res.json({
                message: error.message,
                status: false
            });
        }
    },

    // Get all maintenance bills
    all: async (req, res) => {
        try {
            let bills = await safeFindWithPopulate(MaintenanceBill, {}, ['flatId'], { sort: { month: -1 } })

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
