var express = require('express');
var router = express.Router();

let settingsController = require('../controllers/settingsController');
router.use('/:appid/available/location', settingsController.getAvailableLocation);

module.exports = router;
