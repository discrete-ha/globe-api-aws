var db = require('./dbConnection')();
let Twitter = require('twitter');
let TwitterConfig = require(process.cwd()+'/config.json').twitter;
let twitterClient = new Twitter(TwitterConfig);
let commonWords = require('../common_words.json');

module.exports = {
	handleKeywords: function(keywords, location){
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
	},
	getAvailableWoeid: function(lat, long, callback){
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
	},
	getKeywordsFromApi:function(woeid, callback){
		let params = {
			id: woeid,
			exclude:"hashtags"
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
	},
	getKeywords:function(woeid, callback){
		let noCache = false;
		var self = this;
		this.getTopics( woeid, function(err, val){
			if ( val === null || err !== null || noCache ) {
				self.getKeywordsFromApi( woeid, function(err, result){
					if (err) {
						console.log(err);
						callback({ err: 'get Keywords error' }, null);
					}else{
						let ret = self.handleKeywords(result[0].trends, result[0].locations[0].name);
						self.setTopics(woeid, JSON.stringify(ret));
						ret.cached = false;
						callback(null, ret);
					}
				});
			}else{
				let ret = {...JSON.parse(val), cached: true};
				callback(null, ret);
			}
		});
	},
  	getTopics: function (woeid, callback) {
    	db.get(woeid, function(err, val){
      		return callback(err, val);  
    	})
  	},
  	setTopics: function (woeid, value) {
    	return db.set(woeid, value);
  	}
}

