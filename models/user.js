var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
	username: {type: String,
			required: true,
			unique: true},
	password: String,
	chatName: {type: String,
			required: true,
			unique: true}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", userSchema);