const express = require('express');
const router = express.Router();
const trainController = require('../controllers/train.controller');
const protectRoute = require('../middleware/auth.middleware');

router.post('/', protectRoute, trainController.train);

module.exports = router;
