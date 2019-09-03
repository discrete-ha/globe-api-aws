var db = require('./dbConnection')();

module.exports = {
  getTopics: function (woeid, callback) {
    db.get(woeid, function(err, val){
      return callback(err, val);  
    })
  },
  setTopics: function (woeid, value) {
    return db.set(woeid, value);
  }
}

