const express = require('express');
const router = express.Router();
const StaffAttendanceController = require('../controllers/StaffAttendanceController.js.js');
const authmiddleware = require('../middleware/authmiddleware');

router.post('/check-in', authmiddleware, StaffAttendanceController.checkIn);
router.post('/check-out', authmiddleware, StaffAttendanceController.checkOut);
router.get('/my', authmiddleware, StaffAttendanceController.myAttendance);

module.exports = router;
