var models = require('../models');
var bluebird = require('bluebird');


 
module.exports = {
  messages: {
    get: function (req, res) {
      models.messages.get(function(messages) {
        messages = messages.reverse();
        res.send(JSON.stringify(messages));
      })
    }, // a function which handles a get request for all messages
    post: function (req, res) {
      models.messages.post(req.body.username, req.body.message, req.body.roomname, function(rows, fields) {
        res.send("FINISHED");
      });
    } // a function which handles posting a message to the database
  },

  users: {
    // Ditto as above
    get: function (req, res) {
      models.users.get(function(users) {
         res.send(JSON.stringify(users));
      })
    },
    post: function (req, res) {
      models.users.post(req.body.username, function(rows, fields) {
        res.send("FINISHED");
      });
    }
  }
};

