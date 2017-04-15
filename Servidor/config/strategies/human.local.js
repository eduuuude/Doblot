const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Human = require('mongoose').model('Human');

module.exports = function() {
	passport.use(new LocalStrategy((username, password, done) => {
		Human.findOne({
			username: username
		}, (err, human) => {
			if (err) {
				return done(err);
			}

			if (!human) {
				return done(null, false, {
					message: 'Unknown human'
				});
			}

			if (!human.authenticate(password)) {
				return done(null, false, {
					message: 'Invalid password'
				});
			}

			return done(null, human);
		});
	}));
}