const express = require('express');
const router = express.Router();
const trainController = require('../controllers/train.controller');

router.post('/', trainController.train);

module.exports = router;
