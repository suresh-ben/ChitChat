const socket = io('http://localhost:3000');

function loginOnClick(){
  const id = $(".userID").val();
  const pass = $(".userPASS").val();

  const creds = {
    id : id,
    pass : pass
  }

  socket.emit('userLogin', creds);
};

//Networking
socket.on('connection');

socket.on('credentialCookie', function(data){
  const id = data.id;
  const pass = data.pass;
  document.cookie = "id=" + id;
  document.cookie = "pass=" + pass;

  //lets do chatting
  window.location.replace("/");
});

socket.on('loginError', function(data){
  $(".feedback").html("credentials are not matching...Please try again");
});
