require('dotenv').config();
let topicsModel = require('../models/topicsModel');
let appid = require(process.cwd()+'/config.json').appid;
let AVAILABLE_WOEID = require(process.cwd()+'/available.json');

let mergeResults = function(apiResult, data, ratio){
	let totalPoint = 0;
	for (var j = 0; j < data.length; j++) {
		
		let newData = true;
		let point = parseInt(data[j].point * ratio);
		data[j].point = point;
		for (var i = 0; i < apiResult.topics.length; i++) {
			if (data[j].word === apiResult.topics[i].word) {
				apiResult.topics[i].point += point;
				newData = false;
			}
		}

		if (newData) {
			apiResult.topics.push(data[j]);
		}

		totalPoint += point;
	}
	apiResult.totalPoint += totalPoint;
	apiResult.topics.sort(function(a, b){
		return b.point-a.point
	});
	return apiResult;
}

let getTopicsByLocation = function(req, res){
	
	let dataProcessCount = 2;
	let apiResult = {
		topics:[],
		location: null,
		country: null,
		countryCode: null,
		woeid: null,
		totalPoint: 0
	};

	let cliendAppid = req.params.appid;
	if (appid !== cliendAppid) {
		var err = {
			status: 401,
			message: "An App ID with Identifier '" + cliendAppid + "' is not available'"
		};
		return res.send(err);
	}

	let responseTopics =function( apiResult, keywordsData, ratio){
		var result = mergeResults(apiResult, keywordsData, ratio);
		dataProcessCount--;
		if (dataProcessCount === 0) {
			return res.send({...result, status: 200});
		}
	}

	topicsModel.getAvailableWoeid(req.params.lat, req.params.long, function(err, location){
		if (err) {
			return res.send({err: err});	
		}else{
			var countryWoeid = (location.parentid).toString();
			var cityWoeid = (location.woeid).toString();			
			apiResult.woeid = cityWoeid;
			apiResult.countryCode = location.countryCode;

			topicsModel.getKeywords(countryWoeid, function(err, result){
				if(err !== null){
					return res.send(err);	
				}
				var topics = result.topics;
				apiResult = {...apiResult, country: result.location};
				responseTopics(apiResult , topics, 0.5);
			});

			topicsModel.getKeywords(cityWoeid, function(err, result){
				if(err !== null){
					return res.send(err);
				}

				apiResult = {...apiResult, location: result.location};
				var topics = result.topics;
				responseTopics(apiResult , topics, 1);
			});
		}
	});
};

let findParent = function(cityWoeid){
	for (var i = 0; i < AVAILABLE_WOEID.length; i++) {
		if ( parseInt(AVAILABLE_WOEID[i].woeid) === parseInt(cityWoeid) ) {
			var res = {
				woeid : AVAILABLE_WOEID[i].parentid ? AVAILABLE_WOEID[i].parentid.toString() : "1", 
				countryCode :  AVAILABLE_WOEID[i].countryCode ? AVAILABLE_WOEID[i].countryCode.toString() : "earth"
			};
			return res
			break;
		}
	}

}

let getTopicsByWoeid = function(req, res){
	
	let dataProcessCount = 2;
	let apiResult = {
		topics:[],
		location: null,
		country: null,
		countryCode: null,
		woeid: null,
		totalPoint: 0
	};

	let cliendAppid = req.params.appid;
	if (appid !== cliendAppid) {
		var err = {
			status: 401,
			message: "An App ID with Identifier '" + cliendAppid + "' is not available'"
		};
		return res.send(err);
	}

	let responseTopics =function( apiResult, keywordsData, ratio){
		var result = mergeResults(apiResult, keywordsData, ratio);
		dataProcessCount--;
		if (dataProcessCount === 0) {
			return res.send({...result, status: 200});
		}
	}
	
	var countryWoeid;
	var cityWoeid = req.params.woeid;		
	apiResult.woeid = cityWoeid;
	var parentLocation = findParent(cityWoeid);
	countryWoeid  = parentLocation.woeid;
	apiResult.countryCode = parentLocation.countryCode;

	topicsModel.getKeywords(countryWoeid, function(err, result){
		if(err !== null){
			return res.send(err);	
		}
		
		apiResult = {...apiResult, country: result.location};
		var topics = result.topics;
		responseTopics(apiResult , topics, 0.5);
	});

	topicsModel.getKeywords(cityWoeid, function(err, result){
		if(err !== null){
			return res.send(err);
		}

		apiResult = {...apiResult, location: result.location};
		var topics = result.topics;
		responseTopics(apiResult , topics, 1);
	});

};

module.exports = {
	getTopicsByLocation: getTopicsByLocation,
	getTopicsByWoeid: getTopicsByWoeid
};
