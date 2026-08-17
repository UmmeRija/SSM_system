const express = require("express")
const router = express.Router()

const authmiddleware = require("../middleware/authmiddleware")
const MaintenanceBillController = require("../controllers/MaintenanceBillController")


// http://localhost:3000/api/maintenance/all
router.get("/all", authmiddleware, MaintenanceBillController.all)


// http://localhost:3000/api/maintenance/current/FLAT_ID
router.get("/current/:flatId", authmiddleware, MaintenanceBillController.currentBills)


// http://localhost:3000/api/maintenance/history/FLAT_ID
router.get("/history/:flatId", authmiddleware, MaintenanceBillController.historicalBills)


// http://localhost:3000/api/maintenance/single/BILL_ID
router.get("/single/:id", authmiddleware, MaintenanceBillController.getSingleBill)


// http://localhost:3000/api/maintenance/pay/BILL_ID
router.put("/pay/:id", authmiddleware, MaintenanceBillController.payBill)


// http://localhost:3000/api/maintenance/receipt/BILL_ID
router.get("/receipt/:id", authmiddleware, MaintenanceBillController.downloadReceipt)


module.exports = router
