const express = require("express")
const router = express.Router()
const complaintCntroller = require("../controllers/ComplaintContrpller")
const authmiddleware = require("../middleware/authmiddleware")
const upload = require("../middleware/upload")


// http://localhost:3000/api/complaint/create
router.post("/create", authmiddleware, complaintCntroller.create)


// http://localhost:3000/api/complaint/all
router.get("/all", authmiddleware, complaintCntroller.all)


// http://localhost:3000/api/complaint/my
router.get("/my", authmiddleware, complaintCntroller.myComplaints)


// http://localhost:3000/api/complaint/single/COMPLAINT_ID
router.get("/single/:id", authmiddleware, complaintCntroller.getSingleComplaint)


// http://localhost:3000/api/complaint/upload-photo/COMPLAINT_ID
router.put(
    "/upload-photo/:id", authmiddleware,upload.single("photo"), complaintCntroller.uploadPhoto)


// http://localhost:3000/api/complaint/assign/COMPLAINT_ID
router.put("/assign/:id",authmiddleware,complaintCntroller.assignComplaint)


// http://localhost:3000/api/complaint/status/COMPLAINT_ID
router.put("/status/:id", authmiddleware,complaintCntroller.updateStatus)


// http://localhost:3000/api/complaint/priority/COMPLAINT_ID
router.put("/priority/:id", authmiddleware, complaintCntroller.updatePriority)


// http://localhost:3000/api/complaint/sla/COMPLAINT_ID
router.put("/sla/:id", authmiddleware, complaintCntroller.setSLA)


// http://localhost:3000/api/complaint/delete/COMPLAINT_ID
router.delete("/delete/:id", authmiddleware, complaintCntroller.deleteComplaint)


module.exports = router
