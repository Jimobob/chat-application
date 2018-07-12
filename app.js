var express = require("express");
var moment = require("moment");
var bodyParser = require("body-parser");
var siofu = require("socketio-file-upload");
var passportSocketIo = require("passport.socketio");
var app = express().use(siofu.router);
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var mongoose = require("mongoose");
var User = require('./models/user.js');
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

app.use(passport.initialize());
app.use(passport.session());

app.use(require("express-session")({
	store: new MongoStore({ mongooseConnection: mongoose.connection}),
	secret: "carly slay legendsen",
	resave: false,
	saveUninitialized: false
}));

io.use(passportSocketIo.authorize({
	cookieParser: require("cookie-parser"),
	secret: "carly slay legendsen",
	store: new MongoStore({ mongooseConnection: mongoose.connection})
}));

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine", "ejs");


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

app.get("/chat", function(req, res){
	res.render("chat");
});

app.post("/register", function(req, res){
	var username = req.body.username;
	var chatName = req.body.chatname;
	console.log(username);
	console.log(chatName);
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

app.use(express.static(__dirname + "/public"));

io.on("connection", function(socket){
	var chatName = socket.request.user.chatName;
	var uploader = new siofu();
	uploader.dir = "public/uploads";
	uploader.listen(socket);

	var time = moment().format("LT");
	var date = moment().format("LL");

	socket.on("chat message", function(message){
		if(message !== ""){
			socket.emit("chat message", {message: message, time: time, date: date});
			socket.broadcast.emit("other message", {message: message, time: time, date: date, chatName: chatName});
		}
	})

	socket.on("typing", function(data){
		console.log(data);
		socket.broadcast.emit("typing", data);
	});

	socket.on("images", function(img){
		console.log(img);
		socket.emit("my image", {img: img, time: time, date: date});
		socket.broadcast.emit("other image", {img: img, time: time, date: date});
	});

	console.log("user entered");
	socket.on("disconnect", function(){
		console.log("user disconnected");
	})
})

http.listen(3000, function(){
	console.log("server listening");
})