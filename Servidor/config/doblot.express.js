const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');

module.exports = function() {
	const app = express();

	
	app.use(passport.initialize());
	//app.use(passport.session());

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	
	require('../app/routes/doblot.routes')(app);

	return app;
}