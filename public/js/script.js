var socket = io();

var typing = false;
var timeout = undefined;

function startTimeout(){
	typing = false;
	socket.emit("typing", "");
}

$(function(){
	$("form").submit(function(){
		socket.emit("chat message", $("#message").val());
		$("#message").val("");
		return false;
	});

	$("#message").on("keypress", function(event){
		if(event.which==13){
			startTimeout();
		}
		else{
			typing = true;
			socket.emit("typing", "user typing...");
			clearTimeout(timeout);
			timeout = setTimeout(startTimeout, 2000);
		}
	});

	socket.on("typing", function(message){
		if(typing==true){
			$("#typing").html(message);
		}
		else{
			$("#typing").html(message);
		}
	});

	socket.on("chat message", function(message){
		console.log(message)
		$("#messages").append("<p>"+message+"</p>");
	});
});