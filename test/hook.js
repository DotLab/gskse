var Friend = require('../models/friend');
var Corp = require('../models/corp');

before('connect to database', function() {
	// mongoose ----------------------------------------------------------------------------------------------------
	var mongoose = require('mongoose');
	// mongoose.set('debug', true);
	mongoose.Promise = global.Promise;
	mongoose.connect('mongodb://localhost:27017/gskse-test', {
		useMongoClient: true,
	}).then(db => {
		db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	});
});