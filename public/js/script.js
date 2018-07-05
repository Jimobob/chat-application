var socket = io();

var typing = false;
var timeout = undefined;

function startTimeout(){
	typing = false;
	socket.emit("typing", "");
}

function overflowBottom(){
	var messageDiv = $("#messages");
	if(messageDiv[0].scrollHeight > messageDiv[0].clientHeight){
		var height = messageDiv[0].scrollHeight;
		messageDiv.scrollTop(height);
	}
}

$(function(){
	var uploader = new SocketIOFileUpload(socket);
	uploader.listenOnInput(document.getElementById("upload_input"));

	uploader.addEventListener("complete", function(event){
		socket.emit("images", event.file.name);
		console.log(event.file.name);
	})

	$("#siofu_input").submit();

	$("form").on("keypress", function(event){
		if(event.which == 13){
			console.log($("#message").val());
			socket.emit("chat message", $("#message").val());
			$("#message").val("");
			return false;
		}
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


	socket.on("my image", function(url){
		var $parent = ($("<div>").attr("class", "parent-right")).append(
			("<i class='fas fa-user-circle fa-4x right'></i>")
		);

		var image = ("<img src='uploads/" + url.img + "'>");

		var $img = ($("<div>")).append(
			("<img class='right-display' src='uploads/" + url.img + "' height='200px'>")
		).appendTo($parent);

		$parent.append(("<p class='bottom-right'>"+url.date+", "+url.time+"</p>"));
		$parent.appendTo("#messages");
	});

	socket.on("other image", function(url){
		var $parent = ($("<div>").attr("class", "parent-left")).append(
			("<i class='fas fa-user-circle fa-4x left'></i>")
		);

		var image = ("<img src='uploads/" + url.img + "'>");

		var $img = ($("<div>")).append(
			("<img class='left-display' src='uploads/" + url.img + "' height='200px'>")
		).appendTo($parent);

		$parent.append(("<p class='bottom-left'>"+url.date+", "+url.time+"</p>"));
		$parent.appendTo("#messages");
	});


	socket.on("typing", function(message){
		if(typing==true){
			$("#typing").html(message);
		}
		else{
			$("#typing").html(message);
		}
	});

	socket.on("chat message", function(data){
		var $parent = ($("<div>").attr("class", "parent-right")).append(
			("<i class='fas fa-user-circle fa-4x right'></i>")
		);

		var $div = ($("<div>").attr("class", "speech-bubble-right right-display")).append(
			("<p class='message'>"+data.message+"</p>")
		).appendTo($parent);

		$parent.append(("<p class='bottom-right'>"+data.date+", "+data.time+"</p>"));

		$parent.appendTo("#messages");
		overflowBottom();
	})

	socket.on("other message", function(data){
		var $parent = ($("<div>").attr("class", "parent-left")).append(
			("<i class='fas fa-user-circle fa-4x left'></i>")
		);

		var $div = ($("<div>").attr("class", "speech-bubble-left left-display")).append(
			("<p class='message'>"+data.message+"</p>")
		).appendTo($parent);

		$parent.append(("<p class='bottom-left'>"+data.date+", "+data.time+"</p>"));

		$parent.appendTo("#messages");
		overflowBottom();
	});
});