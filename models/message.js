var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var messageSchema = new mongoose.Schema({
	chatName: String,
	message: String,
	timeStamp: String
});

messageSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("message", messageSchema);