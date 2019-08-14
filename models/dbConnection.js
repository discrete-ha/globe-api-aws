let Memcached = require('memcached-elasticache');


let memcacheServer = require(process.cwd()+'/config.json').memcache_server;

let memcachedClient = new Memcached(memcacheServer, {});

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