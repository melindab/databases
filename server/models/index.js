var db = require('../db');
console.log(db)
module.exports = {
  messages: {
    get: function (callback) {
      var messages = [];
      db.messages.findAll({include: [db.users]}).then(function(result) {
        result.forEach(function(obj) {
          messages.push({username: obj.user.dataValues.name, roomname: obj.roomname, text: obj.text})
        });
        callback(messages);
      });
     
    }, // a function which produces all the messages
    post: function (username, message, roomname, callback) {
      db.users.findOrCreate({where : {name:username}}).then(function(result) {
        console.log(result)
        console.log(result[0].dataValues.id)
        var userId = result[0].dataValues.id;
        db.messages.findOrCreate({where: {userId: userId, text: message, roomname: roomname}}).then(function(result) {
          callback(result, result);
        });
      });
    } // a function which can be used to insert a message into the database
  },

  users: {
    // Ditto as above.
    get: function (callback) {
      var users = [];
      db.users.findAll().then(function(result) {
        result.forEach(function(item) {
          users.push({id: item.dataValues.id,name: item.dataValues.name})
        });
        callback(users);
      });
    },
    post: function (name, callback) {
      db.users.findOrCreate({where: {name: name}}).then(function(result) {
        callback(result);
      });
    }
  }
};

