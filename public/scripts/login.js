import socket from "./requires/socket.js";
import * as cookieManager from "./requires/cookieManager.js";
var allowClickOnce = true;

$(".login-button").click(()=>{

  //validating -- one click
  if(!allowClickOnce) return;
  allowClickOnce = false;

  const id = $(".userID").val();
  const pass = $(".userPASS").val();

  const creds = {
    id : id,
    pass : pass
  }

  socket.emit('userLogin', creds);
});

//Networking
socket.on('connection');

socket.on('credentialCookie', function(data){
  cookieManager.makeCookies(data);
});

socket.on('loginError', function(data){
  $(".feedback").html("credentials are not matching...Please try again");
});
