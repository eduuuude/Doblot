const passport = require('passport');
const connections = require('../../connections');

const user = require('../controllers/user.controller');



module.exports = function(app) {
	app.route('/doblot').post(user.create).get(user.list);

	app.post('/signin', function(req, res, next) {
	  passport.authenticate('local', function(err, user, info) {
	    if (err) { return next(err); }
	    if (!user) { 
	    	connections.sendAlert(req.body.socketId,"Incorrect username or password"); 
	    	return 
	    }
	    req.logIn(user, function(err) {
	      if (err) {
	      	return next(err); 
	      }
	      console.log("Socket " + req.body.socketId + " authenticated.");
	      connections.sendAlert(req.body.socketId,"Logged in"); 
	      connections.authenticateEntity( req.body.socketId );
	      return ;
	    });
	  })(req, res, next);
	});
}