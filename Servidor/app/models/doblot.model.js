const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const DoblotSchema = new Schema({
	username: String,
	password: String,
	propietary: String,
	salt: String
})

DoblotSchema.pre('save', function(next) {
	if(this.password) {
		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.password = this.hashPassword( this.password );
	}
	next();
});

DoblotSchema.methods.hashPassword = function (password) {
	return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
}

DoblotSchema.methods.authenticate = function = function(password) {
	return this.password === this.hashPassword(password);
}

DoblotSchema.statics.findUniqueUsername = function(username, suffix, callback) {
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

mongoose.model('Doblot', DoblotSchema);