const socket = io('https://evening-ocean-76261.herokuapp.com');

const cookies = {};
var pairs = document.cookie.split(";");
for (var i=0; i<pairs.length; i++){
  var pair = pairs[i].split("=");
  cookies[(pair[0]+'').trim()] = unescape(pair.slice(1).join('='));
}

socket.emit('joinChat', cookies);

//Networking
socket.on('connection');

socket.on('joining', function(data) {
  let joinSecret = $((document.createElement('p')));
  joinSecret.addClass("join-secret");
  let text = data + " joined the chat";
  joinSecret.html(text);

  let joinBox = $((document.createElement('div')));
  joinBox.addClass("join-box");
  joinBox.append(joinSecret);

  $(".message-container").append(joinBox);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on('message', function(data) {
  loadMeassage(data.name, data.secret, false);
});

function sendMessage() {
  let input = $('.input-message');

  const userID = cookies.id;
  const message = input.val();
  input.val("");

  const data = {
    id : userID,
    message : message
  }

  loadMeassage("Me", message, true);
  socket.emit('message', data);
}

function loadMeassage(sender, data, myMessage) {

  if (data == "") return;

  let name = $((document.createElement('p')));
  name.addClass("name");
  name.html(sender);

  let secret = $((document.createElement('p')));
  secret.addClass("secret");
  secret.html(data);

  let message = $((document.createElement('div')));
  message.addClass("message");
  message.append(name);
  message.append(secret);

  let messageBox = $((document.createElement('div')));
  messageBox.addClass("message-box");
  messageBox.append(message);

  if (myMessage) {
    messageBox.addClass("my-message-box");
    message.addClass("my-message");
  }

  $(".message-container").append(messageBox);
  window.scrollTo(0, document.body.scrollHeight);


}
