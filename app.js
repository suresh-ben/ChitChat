//My requires --- js scripts made by me
const roomGenerator = require(__dirname + '/utilis/roomGenerator.js');

//External requires
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const MongoClient = require("mongodb").MongoClient;
const assert = require('assert');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

//requires init
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { orgin: "*"}});
app.use(cookieParser());

app.set('view engine', 'ejs');
app.use(express.static("public"));

//Variables
let port = process.env.PORT;

const url = process.env.DATAPORT;
const dbName = "ChitChat";
const client = new MongoClient(url, {
  useNewUrlParser: true
});

app.get("/", function(req, res) {
  const cookies = req.cookies;
  const userID = cookies.id;
  const pass = cookies.pass;

  if(!userID || !pass)
    res.redirect("/register");
  else //find the user and load the chat page
  {
    client.connect(function(err) {
      assert.equal(null, err);

      const db = client.db(dbName);

      //connecting to users collection
      const collection = db.collection('users');

      collection.find({userID: userID}).toArray(function(err, foundUser) {
        assert.equal(err, null);


        if(foundUser.length == 0 || foundUser[0].pass != pass)
          {
            //deleting cookies -- error cookie
            res.clearCookie("id");
            res.clearCookie("pass");
            res.redirect("/login");
          }
        else if(foundUser[0].pass == pass)
            res.render("index", { optionsAvailable: 1 });

          client.close();
      });
    });
  }
});

app.get("/login", function(req, res) {
  const cookies = req.cookies;
  const userID = cookies.id;
  const pass = cookies.pass;

  if(!userID || !pass)
    res.render("login", { optionsAvailable: 0 });
  else
    res.redirect("/");
});

app.get("/register", function(req, res) {
  const cookies = req.cookies;
  const userID = cookies.id;
  const pass = cookies.pass;

  if(!userID || !pass)
    res.render("register", { optionsAvailable: 0 });
  else
    res.redirect("/");
});

app.get("/profile", function(req, res) {
  res.render("profile", { optionsAvailable: 0 });
});

server.listen(port, function() {
  console.log("Server Started on port : " + port);
});

//Database

//user insertion into database
const insertUser = function(db, data, callback) {
  //connecting to users collection
  const collection = db.collection('users');
  //insering user data
  collection.insertOne({
    userID : data.id,
    pass: data.pass,
    mail : data.mail
  }, function(err, result) {
    assert.equal(err, null);

    callback(result);
  });
};

//userID: new RegExp(data， ‘i')

//io----server
io.on('connection', function(socket) {

  socket.on('registerRequest', function(data) {

    client.connect(function(err) {
      assert.equal(null, err);
      const db = client.db(dbName);

      //connecting to users collection
      const collection = db.collection('users');
      //checking wheter user id exists
      //finding user data

      collection.find({mail: data.mail}).toArray(function(err, foundUsermail) {
        assert.equal(err, null);

        if (foundUsermail.length != 0) {
          //console.log("Mail already exists");
          io.to(socket.id).emit("mailExists");

          client.close();
        }
        else{
          collection.find({userID: data.id}).toArray(function(err, foundUser) {
            assert.equal(err, null);

            if (foundUser.length != 0) {
              //console.log("User already exists");
              io.to(socket.id).emit("userIDExists");

              client.close();
            }
            else {
              //Inserting a user
              insertUser(db, data, function() {
                //make login cookie
                io.to(socket.id).emit("credentialCookie", data);
                client.close();
              });

            }

          })}});
    });

  });

  socket.on('userLogin', function(data){
    const userID = data.id;
    const pass = data.pass;

    client.connect(function(err) {
      assert.equal(null, err);

      const db = client.db(dbName);

      //connecting to users collection
      const collection = db.collection('users');

      collection.find({userID: userID}).toArray(function(error, foundUser) {
        assert.equal(error, null);
        if(foundUser.length == 0)
        {
          io.to(socket.id).emit('loginError');
        }
        else if(foundUser[0].pass == pass)
        {
          io.to(socket.id).emit("credentialCookie", data);
        }
        else
        {
          io.to(socket.id).emit("loginError", data);
        }

          client.close();
      });
    });
  });

  socket.on('LoadFriends', function(data){
    //data.id
    client.connect(function(err) {
      assert.equal(null, err);

      //opening friends database
      const db = client.db(dbName);
      const collection = db.collection('friends');

      let friendsList;
      collection.find({userID : data.id }).toArray(function(err, foundUser){
        assert.equal(err, null);

        if(typeof(foundUser[0]) !== 'undefined')
        friendsList = foundUser[0].friends;
        io.to(socket.id).emit('friendsList', friendsList);
      })

    });
  });

  socket.on('message', function(data) {
    const roomID = data.roomID;
    let message = {
      name: data.id,
      secret: data.message
    }

    io.to(roomID).emit('message', message);

    //storing to data Database
    client.connect(function(err) {
      assert.equal(null, err);

      //connecting to chats db --- rooID as collection
      const db = client.db('Chats');
      const collection = db.collection(roomID);

      collection.insertOne({
        name: data.id,
        secret: data.message});
    });

  });

  socket.on('searchUsers', function(data){
    client.connect(function(err) {
      assert.equal(null, err);

      const db = client.db(dbName);
      const collection = db.collection('users');

      collection.find({ userID: { $regex: data, $options: 'i' } }).limit(15).toArray(function(err, foundUsers) {
        assert.equal(err, null);
        io.to(socket.id).emit("loadUsers", foundUsers);
      })

    });
  });

  socket.on('addFriend',function(data){

    const userName = data.userName;
    const clientName = data.clientName;

    client.connect(function(err) {
      assert.equal(null, err);

      //opening friends database
      const db = client.db(dbName);
      const collection = db.collection('friends');

      collection.update({ userID : userName },
	         {
	            $setOnInsert: {userID : userName, friends: []}
	         },
	         {upsert: true}, function(){
             //after upadting list with user friends
             //finding friends of user
             let friendsList;
             collection.find({ userID : userName }).toArray(function(err, foundUser) {
               assert.equal(err, null);

               friendsList = new Set (foundUser[0].friends);
               friendsList.add(clientName);

               collection.updateOne({ userID : userName },
                 { $set:{friends: Array.from(friendsList)}} , function(err, result) {
                 assert.equal(err, null);

                 client.close();
               });
             })
           }
      )
    })
  });

  socket.on('joinRoom', function(data){
    const prevRoom = data.currentRoom;
    if(prevRoom)
      socket.leave(prevRoom);

    const userName = data.userName;
    const clientName = data.clientName;
    const roomID = roomGenerator(userName, clientName);

    socket.join(roomID);
    io.to(socket.id).emit("joinedRoom", roomID);
  });

  socket.on('loadChat', function(roomID){

    client.connect(function(err) {
      assert.equal(null, err);

      //connecting to chats db --- rooID as collection
      const db = client.db('Chats');
      const collection = db.collection(roomID);

      collection.find().toArray(function(err, messages) {
        assert.equal(err, null);

        io.to(socket.id).emit('loadChatMessages', messages);
      });
    });

  });
});
//Bug fixed
