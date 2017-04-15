const Human = require('mongoose').model('Human');

exports.create = function(req, res, next) {
	const human = new Human(req.body);

	human.save((err) => {
		if (err) {
			return next(err);
		}
		else {
			res.status(200).json(human);
		}
	});
}

exports.list = function(req, res, next) {
	human.find({} , (err, humans) => {
		if (err) {
			return next(err);
		}
		else {
			res.status(200).json(humans);
		}
	});
}