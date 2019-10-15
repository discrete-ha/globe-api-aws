require('dotenv').config();
let topicsModel = require('../models/topicsModel');
let appid = require(process.cwd()+'/config.json').appid;
let AVAILABLE_CITIES = require(process.cwd()+'/available.json');

let getAvailableLocation = function(req, res){
	let cliendAppid = req.params.appid;
	if (appid !== cliendAppid) {
		var err = {
			status: 401,
			message: "An App ID with Identifier '" + cliendAppid + "' is not available'"
		};
		return res.send(err);
	}

	var ret = {};
	for (var i = 0; i < AVAILABLE_CITIES.length; i++) {
		var country = AVAILABLE_CITIES[i].country;
		delete AVAILABLE_CITIES[i].country;
		delete AVAILABLE_CITIES[i].url;
		delete AVAILABLE_CITIES[i].placeType;
		if( ret[country] == null && country != ""){
			ret[country] = [
				AVAILABLE_CITIES[i]
			]
		} else if(country == ""){
			ret["earth"] = [AVAILABLE_CITIES[i]];
		}else{
			ret[country].push(AVAILABLE_CITIES[i])
		}
		
	}

	return res.send(JSON.stringify(ret));
};

module.exports = {
	getAvailableLocation: getAvailableLocation,
};
