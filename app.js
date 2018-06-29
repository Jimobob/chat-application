var express = require("express");

var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.set("view engine", "ejs");

app.get("/", function(req, res){
	res.render("index");
});

app.use(express.static(__dirname + "/public"));

io.on("connection", function(socket){
	socket.on("chat message", function(message){
		io.emit("chat message", message);
	})

	socket.on("typing", function(data){
		console.log(data);
		socket.broadcast.emit("typing", data);
	})

	console.log("user entered");
	socket.on("disconnect", function(){
		console.log("user disconnected");
	})
})

http.listen(3000, function(){
	console.log("server listening");
})