const passport = require('passport');
const connections = require('../../connections');

//Hay que pasarlo a un servidor de administracion
const user = require('../controllers/user.controller');


module.exports = function(app) {
	//pasarlo a un servidor de administracion
	app.route('/human').post(user.create).get(user.list);

	app.post('/signin', function(req, res, next) {
	  passport.authenticate('local', function(err, user, info) {
	    if (err) { return next(err); 
	    	console.log("faaaail")}
	    if (!user) { 
	    	console.log("faaaaaaaaaail")
	    	connections.sendAlert(req.body.socketId,"Incorrect username or password, please try again"); 
	    	return 
	    }
	    req.logIn(user, function(err) {
	      if (err) {
	      	return next(err); 
	      }
	      console.log("Socket " + req.body.socketId + " authenticated.");
	      connections.authenticateEntity( req.body.socketId );
	      return ;
	    });
	  })(req, res, next);
	});
}