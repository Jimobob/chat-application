var mongoose = require("mongoose"),
	schema = mongoose.Schema;

var chatSchema = new Schema({
	chat: String
});

module.exports = mongoose.model("chat", chatSchema);