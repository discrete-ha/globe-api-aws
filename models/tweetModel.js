var db = require('./dbConnection')();
let Twitter = require('twitter');
let TwitterConfig = require(process.cwd()+'/config.json').twitter;
let twitterClient = new Twitter(TwitterConfig);

module.exports = {
	postTweet:function(topicsData){
		console.log(topicsData);
		var statusText = "These are popular in #" + topicsData.location + ", " + topicsData.country + " now\n";
		
		statusText = statusText + "#1 " + topicsData.topics[0].word + "\n";
		statusText = statusText + "#2 " + topicsData.topics[1].word + "\n";
		statusText = statusText + "#3 " + topicsData.topics[2].word + "\n";

		statusText = statusText + "if you wanna see more then, http://www.air-flare.com/globe/\n";
		console.log(statusText);
		
		// for (var i = 0; i < topicsData.length; i++) {
		// 	topicsData[i]
		// }
		let params = {
			status: statusText
		};
		
		let requestUrl = '/statuses/update.json';

		twitterClient.post(requestUrl, params, function(error, tweets, response) {
			let contents = [];
			console.log("done posting");
		});
	},
}

