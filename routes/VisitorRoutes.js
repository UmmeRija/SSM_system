const express = require("express")
const router = express.Router()

const authmiddleware = require("../middleware/authmiddleware")
const VisitorController = require("../Controllers/VisitorController")


// http://localhost:3000/api/visitor/create
router.post("/create", authmiddleware, VisitorController.create)


// http://localhost:3000/api/visitor/all
router.get("/all", authmiddleware, VisitorController.all)


// http://localhost:3000/api/visitor/approved
router.get("/approved", authmiddleware, VisitorController.approvedVisitors)


// http://localhost:3000/api/visitor/flat/FLAT_ID
router.get("/flat/:flatId", authmiddleware, VisitorController.flatVisitors)


// http://localhost:3000/api/visitor/single/VISITOR_ID
router.get("/single/:id", authmiddleware, VisitorController.getSingleVisitor)


// http://localhost:3000/api/visitor/approve/VISITOR_ID
router.put("/approve/:id", authmiddleware, VisitorController.approve)


// http://localhost:3000/api/visitor/reject/VISITOR_ID
router.put("/reject/:id", authmiddleware, VisitorController.reject)


// http://localhost:3000/api/visitor/verify-qr
router.post("/verify-qr", authmiddleware, VisitorController.verifyQR)


// http://localhost:3000/api/visitor/exit/VISITOR_ID
router.put("/exit/:id", authmiddleware, VisitorController.exitVisitor)


module.exports = router
