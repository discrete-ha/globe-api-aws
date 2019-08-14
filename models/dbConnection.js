var memjs = require('memjs');

var client = memjs.Client.create(process.env.MEMCACHEDCLOUD_SERVERS, {
  username: process.env.MEMCACHEDCLOUD_USERNAME,
  password: process.env.MEMCACHEDCLOUD_PASSWORD
});

module.exports = function () {
  return {

    set: function (key, value) {
		client.set(key, value, {expires:120}, function(err, val) {
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