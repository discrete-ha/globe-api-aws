let Memcached = require('elasticache-client');


let memcacheServer = require(process.cwd()+'/config.json').memcache_server;
let memcachedClient = new Memcached(memcacheServer, {}, {});

module.exports = function () {
  return {

    set: function (key, value) {
		memcachedClient.set(key, value, {expires:120}, function(err, val) {
			if (err) {
				console.log("err",err);
			}
		});
    },

    get: function (key, callback) {
      console.log("get1");
    	try{
        console.log("get2");
    		memcachedClient.get(key, function(err, val) {
          console.log("get3");
  				return callback(err, val);
  			});
    	}catch(err){
        console.log("err",err);
    		return callback(err, null);
    	}
    }
  }
};