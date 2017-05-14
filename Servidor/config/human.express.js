const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path');

module.exports = function() {
	const app = express();
	const _dirname = '/home/pi/Github/Doblot/Servidor';

	app.use(passport.initialize());
	//app.use(passport.session());

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));

	
	require('../app/routes/human.routes')(app);

	app.use(express.static(path.join(_dirname, 'public')));

	return app;
}
