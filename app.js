'use strict';

var debug = require('debug')('gskse:app');

// env ----------------------------------------------------------------------------------------------------
var path = require('path');
global.appRoot = path.resolve(__dirname);
global.getPath = function() {
	return Array.prototype.reduce.call(arguments, (a, b) => path.join(a, b), appRoot);
};
global.getUploadPath = (file => getPath('public', 'upload', file));
global.getModel = (model => require(getPath('models', model)));
global.getController = (model => require(getPath('controllers', model)));
global.getJob = (job => require(getPath('jobs', job)));
debug('appRoot [%s]', appRoot);
debug('getPath [%s]', getPath('routes', 'root'));

// config ----------------------------------------------------------------------------------------------------
global.gskse = require('./config');
debug(gskse.getSalary(3000));
debug(gskse.getOfferLockUp());

// mongoose ----------------------------------------------------------------------------------------------------
var mongoose = require('mongoose');
// mongoose.set('debug', true);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/gskse', {
	useMongoClient: true,
}).then(db => {
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
});

// express ----------------------------------------------------------------------------------------------------
var express = require('express');
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// morgan ----------------------------------------------------------------------------------------------------
// var morgan = require('morgan');
// app.use(morgan('dev')); // log requests

// static ----------------------------------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

// bodyParser ----------------------------------------------------------------------------------------------------
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// fileupload ----------------------------------------------------------------------------------------------------
var fileupload = require('express-fileupload');
app.use(fileupload());

// session ----------------------------------------------------------------------------------------------------
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
app.use(session({
	resave: false, // don't save session if unmodified
	saveUninitialized: false, // don't create session until something stored
	secret: '此生无悔入东方，来世愿生幻想乡。',
	store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// i18n ----------------------------------------------------------------------------------------------------
var i18n = require('i18n');
i18n.configure({
	locales: [ 'en', 'ja', 'zh-hans', 'zh-hant' ],
	fallbacks: { 'zh': 'zh-hans' },
	defaultLocale: 'en',
	directory: __dirname + '/locales',

	objectNotation: true,
	autoReload: true,
	updateFiles: true,
	syncFiles: true,

	preserveLegacyCase: true
});
app.use(i18n.init);

// helpers ----------------------------------------------------------------------------------------------------
var Friend = getModel('friend');
app.use(function(req, res, next) {
	var locale = req.session.locale;
	if (locale) i18n.setLocale(res, locale);
	
	res.locals.query = req.query;
	res.locals.body = req.body;

	// debug('friend [%s]', req.session.friend);
	if (req.session.friend) {
		Friend.findById(req.session.friend).then(friend => {
			if (friend != null) res.locals.friend = friend;

			next();
		}).catch(err => next(err));
	} else next();
});

// routes ----------------------------------------------------------------------------------------------------
app.use('/', require(getPath('routes', 'root')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(gskse.status.not_found);
});

// error handler
app.use(function(err, req, res, next) {
	err.status = err.status || 500;
	err.name = err.name == 'Error' ? 'Internal Server Error' : err.name;
	
	res.locals.error = err;
	
	res.status(err.status);
	res.render('error');
});

// cron ----------------------------------------------------------------------------------------------------
var Job = require('cron').CronJob;
new Job('*/10 * * * * *', getJob('calculateCorpProfit'), null, true, 'America/Los_Angeles');
// new Job('*/20 * * * * *', getJob('calculateFriendValue'), null, true, 'America/Los_Angeles');
// new Job('* * * * * *', getJob('matchOrder'), null, true, 'America/Los_Angeles');

module.exports = app;