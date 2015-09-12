var db = require('../db');



 
module.exports = {
  messages: {
    get: function (callback) {
      var messages = [];
      db.query("SELECT * from messages LEFT OUTER JOIN users ON messages.userId = users.id", function(err, rows, fields) {
        if(err) throw err;
        rows.forEach(function(obj) {
          messages.push({username: obj.name, roomname: obj.roomname, text: obj.text});
        });
        //console.log(fields);
         callback(messages);
      })
     
    }, // a function which produces all the messages
    post: function (username, message, roomname, callback) {
      db.query('SELECT id from users WHERE name=(?);', username, function(err, rows, fields) {
        db.query('INSERT INTO messages (text, userid, roomname) VALUES (?, (?), ?);',[message, rows[0].id, roomname], function(err, rows, fields) {
          if(err) throw err;
          console.log(rows);
          callback(rows, fields);
        });
        
      });
    } // a function which can be used to insert a message into the database
  },

  users: {
    // Ditto as above.
    get: function (callback) {
      db.query("SELECT * from users;" , function(err, rows, fields) {
        callback(rows);
      })
    },
    post: function (name, callback) {

      db.query('SELECT id from users WHERE name=(?);', name, function(err, rows, fields) {
        if(rows[0] === undefined) {
          db.query('INSERT INTO users (name) VALUE (?);',name, function(err, rows, fields) {
            if(err) throw err;
            callback(rows, fields);
          });
        } else {
          callback(rows, fields);
        }
      });
    }
  }
};

