var db = require('./dbConnection')();

module.exports = {
  get: function (key, callback) {
    db.get(key, function(err, val){
      return callback(err, val);  
    })
  },
  set: function (key, value) {
    return db.set(key, value);
  }
}

