const passport = require('passport');
const connections = require('../../connections');

const user = require('../controllers/user.controller');

module.exports = function(app) {
	app.route('/doblot').post(user.create).get(user.list);

	app.route('/signin').post(passport.authenticate('local'), function (req, res) {
		connections.authenticateEntity(req.body.socketId );
		console.log("Socket " + req.body.socketId + " autenticado.");
	})
}