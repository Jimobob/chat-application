var express = require("express");
var moment = require("moment");
var bodyParser = require("body-parser");
var siofu = require("socketio-file-upload");

var app = express().use(siofu.router);
var http = require("http").createServer(app);
var io = require("socket.io")(http, {
	pingInterval: 9000,
	pingTimeout: 5000
});
var mongoose = require("mongoose");
var User = require('./models/user.js');
var Message = require('./models/message.js');
var passport = require("passport");
var localStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var MongoStore = require("connect-mongo")(require("express-session"));

app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect(
	"mongodb://localhost:27017/chat",
	{useNewUrlParser: true},
	function(err, db){
		if(err){
			console.log(err);
		}
		else{
			console.log("connected to database");
		}
	});

var session = require("express-session")({
	store: new MongoStore({ mongooseConnection: mongoose.connection}),
	secret: "carly slay legendsen",
	key: "express.sid",
	resave: true,
	saveUninitialized: true,
});

app.use(session);

var sharedsession = require("express-socket.io-session");

io.use(sharedsession(session, {
	autoSave: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine", "ejs");

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		res.redirect("/");
	}
}

//==========
// ROUTES
//==========

app.get("/", function(req, res){
	res.render("home");
});

app.post("/", passport.authenticate("local", {
	successRedirect: "/chat",
	failureRedirect: "/"
}), function(req, res){

});

app.get("/register", function(req, res){
	res.render("register");
});

app.get("/chat", isLoggedIn, function(req, res){
	res.render("chat");
});

app.post("/register", function(req, res){
	username = req.body.username;
	var chatName = req.body.chatname;
	User.register(new User({username: username, chatName: chatName}), req.body.password, function(err, user){
		if(err){
			console.log(err);
			res.render("home");
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("chat");
		});
	});
});

app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});

app.use(express.static(__dirname + "/public"));

var time;
var date;
var timeStamp;

setInterval(function(){
	time = moment().format("LT");
	date = moment().format("LL");
	timeStamp = date + " at " + time;
}, 1000);



io.on("connection", function(socket){
	var uploader = new siofu();
	uploader.dir = "public/uploads";
	uploader.listen(socket);

	socket.on("logging in", function(e){
		getChatName();
		Message.find({}, function(err, messages){
			socket.emit("old messages", messages);
		});
	})

	var chatName;

	function getChatName(){
		var username = socket.handshake.session.passport.user;
		var name = User.find({"username": username}, "chatName", function(err, return_item){
			if(err){
				console.log(err);
			}
			else{
				chatName = return_item[0].chatName;
				socket.emit("current user", chatName);
			}
		});
	};



	socket.on("chat message", function(message){
		console.log(chatName);
		if(message !== ""){
			Message.create({chatName: chatName, message: message, timeStamp: timeStamp}, function(err, message){
				if(err){
					console.log(err);
				}
			});

			socket.emit("chat message", {message: message, 
										time: time, 
										date: date, 
										chatName: chatName,
										timeStamp: new Date()});
			socket.broadcast.emit("other message", {message: message, 
										time: time, 
										date: date, 
										chatName: chatName, 
										timeStamp: new Date()});
		}
	});

	socket.on("typing", function(data){
		socket.broadcast.emit("typing", data);
	});

	socket.on("images", function(img){
		getChatName;
		console.log(img);
		socket.emit("my image", {img: img, 
								time: time, 
								date: date});
		socket.broadcast.emit("other image", {img: img, 
											time: time, 
											date: date, 
											chatName: chatName});
	});

	console.log("connected to chat");
	socket.on("disconnect", function(){
		console.log("user disconnected");
	});
});

http.listen(3000, function(){
	console.log("server listening");
});