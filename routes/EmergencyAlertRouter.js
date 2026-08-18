const express = require('express');
const router = express.Router();
const EmergencyAlertController = require('../controllers/EmergencyAlert Controller');
const authmiddleware = require('../middleware/authmiddleware');

router.post('/create', authmiddleware, EmergencyAlertController.create);
router.get('/all', authmiddleware, EmergencyAlertController.all);
router.get('/active', authmiddleware, EmergencyAlertController.active);
router.put('/resolve/:id', authmiddleware, EmergencyAlertController.resolve);
router.get('/directory', authmiddleware, EmergencyAlertController.directory);

module.exports = router;