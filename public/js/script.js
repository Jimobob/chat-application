var socket = io();

var idNum = 0; //give each message an unique id
var typing = false;
var timeout = undefined;
var chatName;
var currentUser;

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

function imgModal(url){
	var imgUrl = url.src.substring(22, url.length);
	$(".content").append("<i class='fas fa-times-circle fa-2x close'></i>");
	$(".content").append("<img class='img-modal-size' src='" + imgUrl + "'>");
	$(".fa-times-circle").on("click", function(){
		$(".content").empty();
		$(".modal").hide();
	});
	$(".modal").on("click", function(){
		$(".modal").hide();
		$(".content").empty();
	})
	$(".modal").css({display: 'flex'}).show();
}

$(function(){
	var uploader = new SocketIOFileUpload(socket);
	uploader.listenOnInput(document.getElementById("upload_input"));

	uploader.addEventListener("complete", function(event){
		socket.emit("images", event.file.name);
		console.log(event.file.name);
	});

	socket.emit("logging in", event);

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

	socket.on("current user", function(name){
		console.log("GOING IN");
		currentUser = name;
		console.log(currentUser);
		console.log(name);
	});

	function chatRight(message){
		var $parent = ($("<div>").attr("class", "parent-right")).append(
			("<i class='fas fa-user-circle fa-4x right'></i>")
		);

		var $div = ($("<div>").attr("class", "speech-bubble-right right-display")).append(
			("<p class='message'>"+message.message+"</p>")
		).appendTo($parent);

		$parent.append(("<p class='bottom-right' id='" + timeID + "'> Just now </p>"));

		$parent.appendTo("#messages");
		overflowBottom();
	};

	function chatLeft(message){
		var $parent = ($("<div>").attr("class", "parent-left")).append(
			("<i class='fas fa-user-circle fa-4x left'></i>")
		);

		$parent.append(("<p class='name-left'>" + message.chatName + "</p>"));

		var $div = ($("<div>").attr("class", "speech-bubble-left left-display")).append(
			("<p class='message'>"+message.message+"</p>")
		).appendTo($parent);

		$parent.append(("<p class='bottom-left'>Just now</p>"));

		$parent.appendTo("#messages");
		overflowBottom();
	}

	//retrieve old messages from db and add to chat
	socket.on("old messages", function(messages){
		for(var i = 0; i < messages.length; i++){
			console.log(currentUser);
			console.log(messages[i].chatName);
			if(currentUser == messages[i].chatName){
				var $parent = ($("<div>").attr("class", "parent-right")).append(
					("<i class='fas fa-user-circle fa-4x right'></i>")
				);

				var $div = ($("<div>").attr("class", "speech-bubble-right right-display")).append(
					("<p class='message'>"+messages[i].message+"</p>")
				).appendTo($parent);

				$parent.append(("<p class='bottom-right'>" + messages[i].timeStamp + " </p>"));

				$parent.appendTo("#messages");
				overflowBottom();
			}
			else{
				var $parent = ($("<div>").attr("class", "parent-left")).append(
				("<i class='fas fa-user-circle fa-4x left'></i>")
				);

				$parent.append(("<p class='name-left'>" + messages[i].chatName + "</p>"));

				var $div = ($("<div>").attr("class", "speech-bubble-left left-display")).append(
					("<p class='message'>"+messages[i].message+"</p>")
				).appendTo($parent);

				$parent.append(("<p class='bottom-left'>" + messages[i].timeStamp + " </p>"));

				$parent.appendTo("#messages");
				overflowBottom();
			}
		}
	});

	socket.on("my image", function(url){
		var $parent = ($("<div>").attr("class", "parent-right")).append(
			("<i class='fas fa-user-circle fa-4x right'></i>")
		);

		var image = ("<img class='right-display' onclick='imgModal(this)' src='uploads/" + url.img + "'>");

		var $img = ($("<div>")).append(
			image
		).appendTo($parent);

		$parent.append(("<p class='bottom-right'>"+url.date+", "+url.time+"</p>"));
		$parent.appendTo("#messages");
	});

	socket.on("other image", function(url){
		var $parent = ($("<div>").attr("class", "parent-left")).append(
			("<i class='fas fa-user-circle fa-4x left'></i>")
		);

		$parent.append(("<p class='name-left'>" + data.chatName + "</p>"));

		var image = ("<img class='left-display' onclick='imgModal(this)' src='uploads/" + url.img + "'>");

		var $img = ($("<div>")).append(
			image
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

	var messages = [];

	var timeID = 0;


	socket.on("chat message", function(data){
		chatName = data.chatName;
		chatRight(data);

		messages.push({
			id: timeID,
			timeStamp: data.timeStamp
		});

		timeID++;
	});

	socket.on("other message", function(data){
		chatName = data.chatName;
		chatLeft(data);

		messages.push({
			id: timeID,
			timeStamp: data.timeStamp
		});

		timeID++;
	});

	setInterval(function(){
		messages.forEach(function(message){
			var time = moment(message.timeStamp).fromNow();
			$("#" + message.id).text(time);
		});
	}, 1000);
});