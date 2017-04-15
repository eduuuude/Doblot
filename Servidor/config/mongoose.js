const config = require('./config');
const mongoose = require('mongoose');

module.exports = function() {
	mongoose.Promise = require('bluebird');
	const db = mongoose.connect(config.db);

	require('../app/models/user.model');
	return db;
}