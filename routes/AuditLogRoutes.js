const express = require('express');
const router = express.Router();
const AuditLogController = require('../controllers/AuditLogController');
const authmiddleware = require('../middleware/authmiddleware');

router.get('/all', authmiddleware, AuditLogController.all);

module.exports = router;
