const express = require('express');
const router = express.Router();
const GateLogController = require('../controllers/GateLogContrller');
const authmiddleware = require('../middleware/authmiddleware');

router.post('/create', authmiddleware, GateLogController.create);
router.get('/all', authmiddleware, GateLogController.all);
router.post('/exit', authmiddleware, GateLogController.exitVisitor);

module.exports = router;
