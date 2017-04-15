const passport = require('passport');
const connections = require('../../connections');

//Hay que pasarlo a un servidor de administracion
const human = require('../controllers/human.controller');


module.exports = function(app) {
	//pasarlo a un servidor de administracion
	app.route('/human').post(human.create).get(human.list);

	app.route('/signin').post(passport.authenticate('local'), function (req, res) {
		connections.authenticateEntity( req.body.socketId );
		console.log("Socket " + req.body.socketId + " autenticado.");
	})
}