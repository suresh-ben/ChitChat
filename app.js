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
if (port == null || port == "") {
  port = 3000;
}
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

    console.log("user registered");
    callback(result);
  });
};

//Finding a user in database
const findUsers = function(db, data, callback) {
  //connecting to users collection
  const collection = db.collection('users');
  //finding user data
  const limit = 15;
  collection.find().toArray(function(err, foundUsers) {
    assert.equal(err, null);
    callback(foundUsers);
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

  socket.on('joinChat', function(data){
    socket.broadcast.emit('joining', data.id);
  });

  socket.on('message', function(data) {

    let message = {
      name: data.id,
      secret: data.message
    }

    socket.broadcast.emit('message', message);
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

  socket.on('joinRoom', function(data){
    const userName = data.userName;
    const clientName = data.clientName;
    const roomName = roomGenerator(userName, clientName);

    console.log(userName + "\n" + clientName + "\n" + roomName);
  });
});
