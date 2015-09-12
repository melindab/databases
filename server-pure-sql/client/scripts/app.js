var app = {
  //server: 'https://api.parse.com/1/classes/chatterbox',
  server: 'http://127.0.0.1:3000/classes/messages',
  friends: [],
  rooms: [],
  messages: [],
  currentRoom: ''
};

// Client-server Interaction
app.send = function(message) {
  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};

app.fetch = function() {
  var spinner = $("<img class='spinner'></img>").attr("src", 'images/spiffygif_46x46.gif');
  $('h1').after(spinner);

  $.ajax({
    url: app.server,
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      console.log(data)
      if(typeof data === "string") {
        data = JSON.parse(data);
      }
      app.parseMessages(data);
      $(".spinner").remove();
      console.log('chatterbox: Messages fetched');
    },
    error: function (data) {
      $(".spinner").remove();
      console.error('chatterbox: Failed to fetch message');
    }
  });
};

app.parseMessages = function(data) {
  var messages = [];
  _.each(data, function(message) {
    message.username = _.escape(message.username);
    message.text = _.escape(message.text);
    message.roomname = _.escape(message.roomname);
    messages.push(message);
  });

  var roomList = _.chain(messages)
    .pluck('roomname')
    .uniq()
    .value();

  this.addRoom(roomList);
  this.handleMessages(messages);
}


app.addRoom = function(roomName) {
  if (typeof roomName === 'string') {
    roomName = [roomName];
  }

  app.rooms = _.union(app.rooms, roomName).sort();

  $('#roomSelect').empty();
  $('#roomSelect').append($('<option class="addRoom"></option>').html('New room...'));

  _.each(app.rooms, function(roomName) {
    $('#roomSelect').append($('<option></option>').val(roomName).html(roomName));
  });

  $("#roomSelect").val(app.currentRoom);
}

// Message Handling
app.handleMessages = function(messages) {
  //To fix later;
  app.messages = messages;
  app.refreshMessages();
  return;
  if (app.messages.length === 0) {
    app.messages = messages;
  } else {
    var indexOfLastMessage = _.chain(messages)
      .pluck('objectId')
      .indexOf(app.messages[0].objectId)
      .value();

    // Only keep new messages
    if (indexOfLastMessage > 0) {
      messages = messages.slice(0, indexOfLastMessage);
    }

    if (indexOfLastMessage !== 0) {
      app.messages = messages.concat(app.messages);
    }
  }

  app.refreshMessages();
}

// Doesn't refetch from the server
app.refreshMessages = function() {
  app.clearMessages();
  _.each(app.getMessagesFromRoom(app.currentRoom), function(message) {
    app.addMessage(message);
  });
};

app.getMessagesFromRoom = function(room) {
  return _.filter(app.messages, function(message) {
    return message.roomname === room;
  });
}

// State-tracking
app.addFriend = function(friend) {
  var index = app.friends.indexOf(friend);
  if(index >= 0) {
    app.friends.splice(index, 1);
  } else {
    app.friends.push(friend);
  }
}

// Client Display
app.clearMessages = function() {
  $("#chats").empty();
}

app.addMessage = function(message) {
  var newDom = $('<span class="username">' + message.username + '</span><span>' + message.text + '</span>');

  if (app.friends.indexOf(message.username) !== -1) {
    newDom.addClass('friend');
  }

  var newDiv = $('<div class="chat"></div>').append(newDom);

  $('#chats').append(newDiv);

  // Unbind to prevent the event from firing multiple times
  $(".username").unbind().on("click", function(event) {
    app.addFriend($(this).text());
    app.refreshMessages();
  });
}

// UI Elements
app.handleSubmit = function() {
  var message = {
      username: _.escape(window.location.search.substring(10)),
      message: _.escape($("#message").val()),
      roomname: _.escape($('#roomSelect :selected').text()),

    }
    app.send(message);
    app.clearMessages();
    app.fetch();
}

app.init = function() {
  var username = _.escape(window.location.search.substring(10));
  console.log(username)
  $(this).ready(function() {

    $.ajax({
      url: "http://127.0.0.1:3000/classes/users",
      type: 'POST',
      data: JSON.stringify({username: username}),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: user sent');
      },
      error: function (data) {
        console.error('chatterbox: Failed to send user');
      }
    });

    $('#roomSelect').on('change', function() {
      if ($('#roomSelect :selected').hasClass('addRoom')) {
        var newRoomName = _.escape(prompt('What room name?')) || '';
        app.currentRoom = newRoomName;
        app.addRoom(newRoomName);
      } else {
        app.currentRoom = $("#roomSelect :selected").val();
      }

      app.refreshMessages();
    });

    $("#send").on("click", function() {
      event.preventDefault();
      if($("#message").val().length > 0) {
        app.handleSubmit();
      }

      $("#message").val("");

    });
    $("#send").on("submit", function(event) {
      event.preventDefault();
      if($("#message").val().length > 0) {
        app.handleSubmit();
      }
      $("#message").val("");

    });

    $("#message").on("submit", function(event) {
       event.preventDefault();
      if($("#message").val().length > 0) {
        app.handleSubmit();
      }
    });

    app.fetch();

    setInterval(function() {
        app.fetch();
    }, 2000)
  })
};

app.init();
