const passport = require('passport');
const connections = require('../../connections');

//Hay que pasarlo a un servidor de administracion
const user = require('../controllers/user.controller');


module.exports = function(app) {
	//pasarlo a un servidor de administracion
	app.route('/human').post(user.create).get(user.list);

	app.route('/signin').post(passport.authenticate('local'), function (req, res) {
		connections.authenticateEntity( req.body.socketId );
		console.log("Socket " + req.body.socketId + " autenticado.");
	})
}