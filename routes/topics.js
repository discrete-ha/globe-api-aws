var express = require('express');
var router = express.Router();

router.use('/:appid/:lat/:long', require('../controllers/topicsController'));

module.exports = router;
