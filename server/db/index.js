//var mysql = require('mysql');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('chat', 'root', '');

// Create a database connection and export it from this file.
// You will need to connect with the user "root", no password,
// and to the database "chat".
 
var users = sequelize.define('users', {
  name: Sequelize.STRING
}, {
  timestamps: false,
});

var messages = sequelize.define('messages', {
  userId: Sequelize.INTEGER,
  text: Sequelize.STRING,
  roomname: Sequelize.STRING
},{
  timestamps: false,
});

users.hasMany(messages);
messages.belongsTo(users);
sequelize.sync().then(function() {
  console.log("SYNCED");
});

module.exports.users = users;
module.exports.messages = messages;


// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : '',
//   database : 'chat'
// });
 
// connection.connect();
// module.exports = connection;
