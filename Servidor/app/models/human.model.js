const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const HumanSchema = new Schema({
	username: String,
	password: String,
	salt: String
})

HumanSchema.pre('save', function(next) {
	if(this.password) {
		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.password = this.hashPassword( this.password );
	}
	next();
});

HumanSchema.methods.hashPassword = function (password) {
	return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
}

HumanSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
}

HumanSchema.statics.findUniqueUsername = function(username, suffix, callback) {
	var possibleUsername = username + (suffix || '');
	this.findOne({
		username: possibleUsername
	}, (err, user) => {
		if (!err) {
			if (!user) {
				callback(possibleUsername);
			}
			else {
				return this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		}
		else {
			callback(null);
		}
	});
};

mongoose.model('Human', HumanSchema);