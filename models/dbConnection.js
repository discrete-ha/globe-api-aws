var memjs = require('memjs');
let cacheServer = require(process.cwd()+'/config.json').cache_server_host;
let cacheServerUser = require(process.cwd()+'/config.json').cache_server_user;
let cacheServerPassword = require(process.cwd()+'/config.json').cache_server_password;

var client = memjs.Client.create(cacheServer, {
  username: cacheServerUser,
  password: cacheServerPassword
});

module.exports = function () {
  return {

    set: function (key, value) {
		client.set(key, value, { expires: 60 }, function(err, val) {
			if (err) {
				console.log("err",err);
			}
		});
    },

    get: function (key, callback) {
    	try{
    		client.get(key, function(err, val) {
				return callback(err, val);
			});
    	}catch(err){
    		return callback(err, null);
    	}
    }
  }
};