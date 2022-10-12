const socket = io('https://evening-ocean-76261.herokuapp.com');


function registerUser(){

  const userEmail = $(".userEmail").val();

  //Validating user Email
  if(!isValidEmail(userEmail)){
    $(".feedback").html("Enter a valid email address");
    return;
  }

  //Validating user ID
  const userID = $(".userID").val();
  if(userID == ""){
    $(".feedback").html("please enter userID");
    return;
  }

  //Validating password
  const pass = $(".userPASS").val();
  if(pass.length < 8){
    $(".feedback").html("password must contain 8 or more characters");
    return;
  }

  const data = {
    id : userID,
    pass : pass,
    mail : userEmail
  }

  $(".feedback").html("");
  registerRequest(data);
}

function isValidEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

//Networking
socket.on('connection');

function registerRequest(data){
  socket.emit('registerRequest', data);
};

socket.on('mailExists', function(data){
  $(".feedback").html("An account already exists with this mail");
});

socket.on('userIDExists', function(data){
  $(".feedback").html("User ID is already taken. <br>Please choose an another ID");
});

socket.on('credentialCookie', function(data){
  const id = data.id;
  const pass = data.pass;
  document.cookie = "id=" + id;
  document.cookie = "pass=" + pass;

  //lets do chatting
  window.location.replace("/");
});
