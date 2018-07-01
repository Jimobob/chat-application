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
		var $parent = ($("<div>").attr("class", "parent-right")).append(
			("<i class='fas fa-user-circle fa-4x right'></i>")
		);

		var $div = ($("<div>").attr("class", "speech-bubble-right")).append(
			("<p class='message'>"+message+"</p>")
		).appendTo($parent);

		$parent.appendTo("#messages");
	})

	socket.on("other message", function(message){
		var $parent = ($("<div>").attr("class", "parent-left")).append(
			("<i class='fas fa-user-circle fa-4x left'></i>")
		);

		var $div = ($("<div>").attr("class", "speech-bubble-left")).append(
			("<p class='message'>"+message+"</p>")
		).appendTo($parent);

		$parent.appendTo("#messages");
	});
});