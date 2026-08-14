const express = require("express")
const router = express.Router()

const authmiddleware = require("../middleware/authmiddleware")
const FlatController = require("../Controllers/FlatController")


// http://localhost:3000/api/flat/create
router.post("/create", authmiddleware, FlatController.create)


// http://localhost:3000/api/flat/all
router.get("/all",authmiddleware, FlatController.all)


// http://localhost:3000/api/flat/single/FLAT_ID
router.get("/single/:id", authmiddleware, FlatController.getSingleFlat)


// http://localhost:3000/api/flat/occupied
router.get("/occupied", authmiddleware, FlatController.occupiedFlats)


// http://localhost:3000/api/flat/vacant
router.get("/vacant", authmiddleware, FlatController.vacantFlats)


// http://localhost:3000/api/flat/assign-owner/FLAT_ID
router.put("/assign-owner/:id", authmiddleware, FlatController.assignOwner)


// http://localhost:3000/api/flat/assign-tenant/FLAT_ID
router.put("/assign-tenant/:id", authmiddleware, FlatController.assignTenant)


// http://localhost:3000/api/flat/remove-owner/FLAT_ID
router.put("/remove-owner/:id", authmiddleware, FlatController.removeOwner)


// http://localhost:3000/api/flat/remove-tenant/FLAT_ID
router.put("/remove-tenant/:id", authmiddleware, FlatController.removeTenant)


// http://localhost:3000/api/flat/occupancy/FLAT_ID
router.put("/occupancy/:id", authmiddleware,FlatController.updateOccupancy)


// http://localhost:3000/api/flat/update/FLAT_ID
router.put("/update/:id", authmiddleware, FlatController.updateFlat)


// http://localhost:3000/api/flat/delete/FLAT_ID
router.delete("/delete/:id", authmiddleware, FlatController.deleteFlat)


module.exports = router
