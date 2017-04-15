const passport = require('passport');
const connections = require('../../connections');

module.exports = function(app) {
	app.route('/signin').post(passport.authenticate('local'), function (req, res) {
		connections.authenticateEntity(req.body.socketId );
		console.log("Socket " + req.body.socketId + " autenticado.");
	})
}