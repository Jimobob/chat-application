var express = require("express");
var moment = require("moment");
var bodyParser = require("body-parser");
var siofu = require("socketio-file-upload");

var app = express().use(siofu.router);
var http = require("http").createServer(app);
var io = require("socket.io")(http);
app.use(bodyParser.json())


app.set("view engine", "ejs");

app.get("/", function(req, res){
	res.render("index");
});

app.use(express.static(__dirname + "/public"));

io.on("connection", function(socket){
	var uploader = new siofu();
	uploader.dir = "public/uploads";
	uploader.listen(socket);

	var time = moment().format("LT");
	var date = moment().format("LL");

	socket.on("chat message", function(message){
		if(message !== ""){
			socket.emit("chat message", {message: message, time: time, date: date});
			socket.broadcast.emit("other message", {message: message, time: time, date: date});
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