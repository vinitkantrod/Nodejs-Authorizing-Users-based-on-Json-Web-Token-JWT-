var mongoose = require('mongoose');
var schema = mongoose.Schema;

module.exports = mongoose.model('User', new schema({
	name: String,
	password: String,
	admin: Boolean
}));