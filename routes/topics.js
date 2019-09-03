var express = require('express');
var router = express.Router();

let topicsController = require('../controllers/topicsController');
router.use('/:appid/:lat/:long', topicsController.getTopicsByLocation);
router.use('/:appid/:woeid', topicsController.getTopicsByWoeid);

module.exports = router;
