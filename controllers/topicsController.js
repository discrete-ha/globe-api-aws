require('dotenv').config();
let commonWords = require('../common_words.json');
let topicsModel = require('../models/topicsModel');
let appid = require(process.cwd()+'/config.json').appid;
let AVAILABLE_WOEID = require(process.cwd()+'/available.json');
let Twitter = require('twitter');
let TwitterConfig = require(process.cwd()+'/config.json').twitter;
let twitterClient = new Twitter(TwitterConfig);

let getAvailableWoeid = function(lat, long, callback){
	let params = {
		lat: lat,
		long: long
	};

	let requestUrl = '/trends/closest.json';

	twitterClient.get(requestUrl, params, function(error, location, response) {
		let contents = [];
		if (!error) {
			try{
				return callback(null, location[0]);
			}catch(e){
				return callback(e, null);
			}
		}else{
			return callback(JSON.stringify(error), null);
		}
	});
}

let getKeywords = function(woeid, callback){
	let noCache = false;
	topicsModel.getTopics( woeid, function(err, val){
		if ( val === null || err !== null || noCache ) {
			getKeywordsFromApi( woeid, function(err, result){
				if (err) {
					console.log(err);
					callback({ err: 'get Keywords error' }, null);
				}else{
					let ret = handleKeywords(result[0].trends, result[0].locations[0].name);
					topicsModel.setTopics(woeid, JSON.stringify(ret));
					callback(null, ret);
				}
			});
		}else{
			let ret = {...JSON.parse(val), cached: true};
			callback(null, ret);
		}
	});
}

let getKeywordsFromApi = function(woeid, callback){
	let params = {
		id: woeid
	};
	
	let requestUrl = '/trends/place.json';

	twitterClient.get(requestUrl, params, function(error, tweets, response) {
		let contents = [];
		if (!error) {
			try{
				return callback(null, tweets);
			}catch(e){
				return callback(e, null);
			}
		}else{
			return callback(JSON.stringify(error), null);
		}
	});
}

let handleKeywords = function(keywords, location){
	let ret = [];
	for (var i = 0; i < keywords.length; i++) {
		var word = keywords[i].name.replace('#','');
		var point = keywords[i].tweet_volume || 0;
		if (commonWords.indexOf(word) === -1) {
			ret.push({word:word, point:point});	
		}
	}

	return {
		topics:ret,
		location:location
	};
}

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


	getAvailableWoeid(req.params.lat, req.params.long, function(err, location){
		if (err) {
			return res.send({err: err});	
		}else{
			var countryWoeid = (location.parentid).toString();
			var cityWoeid = (location.woeid).toString();			
			apiResult.woeid = cityWoeid;
			getKeywords(countryWoeid, function(err, result){
				if(err !== null){
					return res.send(err);	
				}
				var topics = result.topics;
				responseTopics(apiResult , topics, 0.5);
			});

			getKeywords(cityWoeid, function(err, result){
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

let getTopicsByWoeid = function(req, res){
	
	let dataProcessCount = 2;
	let apiResult = {
		topics:[],
		location: null,
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
	
	for (var i = 0; i < AVAILABLE_WOEID.length; i++) {
		if ( parseInt(AVAILABLE_WOEID[i].woeid) === parseInt(cityWoeid) ) {
			countryWoeid = AVAILABLE_WOEID[i].parentid.toString();
			break;
		}
	}

	getKeywords(countryWoeid, function(err, result){
		if(err !== null){
			return res.send(err);	
		}
		var topics = result.topics;
		responseTopics(apiResult , topics, 0.5);
	});

	getKeywords(cityWoeid, function(err, result){
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
