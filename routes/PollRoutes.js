const express = require('express');
const router = express.Router();
const PollController = require('../controllers/PollController');
const authmiddleware = require('../middleware/authmiddleware');

router.post('/create', authmiddleware, PollController.create);
router.get('/all', authmiddleware, PollController.all);
router.post('/:id/vote', authmiddleware, PollController.vote);

module.exports = router;
