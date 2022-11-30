import socket from "./requires/socket.js";
import * as manager from "./requires/manager.js";
import * as searchManager from "./requires/searchManager.js";
import * as chatManager from "./requires/chatManager.js";
import * as cookieManager from "./requires/cookieManager.js";

var roomID;
const cookies = cookieManager.cookies;

$(".search-bar input").on('input',(err)=>{
  const inp = $(".search-bar input");
  if(inp.val() == "")
  {
    $(".search-list").html("");
    searchManager.addTip();
    return;
  }
  sendLoadReq(inp.val());
});
$(".send-button").click(()=>{
  sendMessage();
});
$(".nav-option-back").click(function(){
    socket.emit('LoadFriends', cookies);
    chatManager.backToLogs();
});
$(".logout").click(()=>{
  cookieManager.deleteCookies();
  location.reload();
});
//Networking
socket.on('connection');
socket.emit('LoadFriends', cookies);

//todo -- for grps
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
  if(data.name === cookies.id)
    loadMeassage("Me", data.secret, true);
  else
  loadMeassage(data.name, data.secret, false);
});

socket.on('loadUsers', function(data){
  $(".search-list").html("");
  for(let i =0; i < data.length; i++)
  {
    loadUser(data[i]);
  }
  $(".search-item a").click(function(){
    //chat -- box dealing
    const clientName = $(this).attr("class");
    loadUserChat(clientName);
  });
});

socket.on('joinedRoom', function(data){
  roomID = data;
  loadPreviousMessages(roomID);
});

socket.on('friendsList', function(data){
  if(data == null) return;
  $(".chat-rooms").html("");

  for(let i = 0; i < data.length; i++)
  {
    const userData = {
      userID : data[i],
      userDP : null
    }
    loadFriend(userData);
  }
  $(".chat-rooms a").click(function(){
    const clientName = $(this).attr("class");
    chatManager.loadFriendChat(clientName);

    //joining room
    const data = {
      currentRoom : roomID,
      userName : cookies.id,
      clientName : clientName
    }
    socket.emit('joinRoom', data);
  })
});

socket.on('loadChatMessages', function(messages){
  for(let i =0; i < messages.length; i++)
  {
    if(messages[i].name == cookies.id)
      loadMeassage("Me", messages[i].secret, true);
    else
      loadMeassage(messages[i].name, messages[i].secret, false);
  }
})

function sendMessage() {
  let input = $('.input-message');

  const userID = cookies.id;
  const message = input.val();
  input.val("");

  const data = {
    id : userID,
    roomID: roomID,
    message : message
  }
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

  window.scrollTo(0, $(".message-container").outerHeight());

}

function sendLoadReq(data){
  socket.emit('searchUsers', data);
};

function loadUser(data){
  let name = $((document.createElement('p')));
  name.html(data.userID);

  let img = $((document.createElement('img')));
  img.attr("src", "https://avatars.dicebear.com/api/adventurer/" + data.userID + ".svg" + "?scale=85");

  let userDIV = $((document.createElement('div')));
  userDIV.addClass("user-detail");
  userDIV.append(img);
  userDIV.append(name);

  let message = $((document.createElement('a')));
  message.html("Message");
  message.addClass(data.userID);

  let searchItem = $((document.createElement('div')));
  searchItem.addClass("search-item");
  searchItem.append(userDIV);
  searchItem.append(message);

  $(".search-list").append(searchItem);
}

function loadUserChat(clientName){
  manager.openChatBox(clientName);
  manager.closeSearchEngine();
  const data = {
    currentRoom : roomID,
    userName : cookies.id,
    clientName : clientName
  }
  socket.emit('addFriend', data);
  socket.emit('joinRoom', data);
}

function loadFriend(data){
  let name = $((document.createElement('p')));
  name.html(data.userID);

  let img = $((document.createElement('img')));
  img.attr("src", "https://avatars.dicebear.com/api/adventurer/" + data.userID + ".svg" + "?scale=85");

  let userDIV = $((document.createElement('div')));
  userDIV.addClass("chat-item");
  userDIV.addClass("chat");
  userDIV.append(img);
  userDIV.append(name);

  let chatLink = $((document.createElement('a')));
  chatLink.attr('style','text-decoration:none');
  chatLink.addClass(data.userID);
  chatLink.append(userDIV);

  $(".chat-rooms").append(chatLink);
}

function loadPreviousMessages(roomID){
  $('.message-container').html("");

  //todo --- load prev messages mowa...
  socket.emit('loadChat', roomID);
}
