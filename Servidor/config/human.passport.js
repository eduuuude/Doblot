const passport = require('passport');
const mongoose = require('mongoose');

module.exports = function() {
	const Human = mongoose.model('Human');

	passport.serializeUser((human, done) => {
		done(null, human.id);
	});

	passport.deserializeUser((id, done) => {
		Human.findOne({
			_id: id
		}, '-password -salt', (err, human) => {
			done(err, human);
		});
	});

	require('./strategies/human.local')();
}