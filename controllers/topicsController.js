require('dotenv').config();
let commonWords = require('../common_words.json');
let topicsModel = require('../models/topicsModel');

let TwitterController = function(req, res){
	
	let appid = process.env.sendbox_appid || require(process.cwd()+'/config.json').appid;
	let cliendAppid = req.params.appid;
	if (appid !== cliendAppid) {
		var err = {
			status: 401,
			message: "An App ID with Identifier '" + cliendAppid + "' is not available'"
		};
		return res.send(err);
	}

	let Twitter = require('twitter');
	let TwitterConfig = {
			consumer_key: process.env.consumer_key,
			consumer_secret: process.env.consumer_secret,
			access_token_key: process.env.access_token_key,
			access_token_secret: process.env.access_token_secret
		};

	if (!process.env.consumer_key || 
		!process.env.consumer_secret || 
		!process.env.access_token_key || 
		!process.env.access_token_secret ) {
		TwitterConfig = require(process.cwd()+'/config.json').twitter
	}

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

	let getKeywords = function(location, callback){
		let params = {
			id:location.woeid
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
		let totalPoint = 0;
		for (var i = 0; i < keywords.length; i++) {
			var word = keywords[i].name.replace('#','');
			var point = keywords[i].tweet_volume || 0;
			if (commonWords.indexOf(word) === -1) {
				totalPoint += keywords[i].tweet_volume;
				ret.push({word:word, point:point});	
			}
		}
		
		ret.sort(function(a, b){
			return b.point-a.point
		});

		return {
			status:200,
			topics:ret,
			location:location,
			totalPoint:totalPoint
		};
	}

	let initData = function(){
		getAvailableWoeid(req.params.lat, req.params.long, function(err, location){
			if (err) {
				return res.send(err);	
			}else{
				var cacheKey = (location.woeid).toString();
				topicsModel.get(cacheKey, function(err, val){
					if (val === null || err !== null) {
						getKeywords(location, function(err, result){
							if (err) {
								return res.send(err);	
							}else{
								let ret = handleKeywords(result[0].trends, result[0].locations[0].name);
								topicsModel.set(cacheKey, JSON.stringify(ret));
								ret = {...ret, cached: false}
								return res.send(ret);
							}
						});
					}else{
						let ret = {...JSON.parse(val), cached: true};
						return res.send(ret);
					}
				});
			}
		});
	}

	initData();
};

module.exports = TwitterController;
