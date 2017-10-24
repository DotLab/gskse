var debug = require('debug')('gskse:app');

// env ----------------------------------------------------------------------------------------------------
var path = require('path');
global.appRoot = path.resolve(__dirname);
global.getPath = function() {
	return Array.prototype.reduce.call(arguments, (a, b) => path.join(a, b), appRoot);
};
global.getUploadPath = (file => getPath('public', 'upload', file));
global.getModel = (model => require(getPath('models', model)));
global.getJob = (job => require(getPath('jobs', job)));
debug('appRoot [%s]', appRoot);
debug('getPath [%s]', getPath('routes', 'root'));

// mongoose ----------------------------------------------------------------------------------------------------
var mongoose = require('mongoose');//.set('debug', true);
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
var morgan = require('morgan');
app.use(morgan('dev')); // log requests

// static ----------------------------------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

// bodyParser ----------------------------------------------------------------------------------------------------
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

// fileupload ----------------------------------------------------------------------------------------------------
var fileupload = require('express-fileupload');
app.use(fileupload());

// helpers ----------------------------------------------------------------------------------------------------
var Friend = getModel('friend');
app.use(function(req, res, next) {
	if (req.session.locale) i18n.setLocale([ req, res, res.locals ], req.session.locale);
	
	debug('friend [%s]', req.session.friend);
	if (req.session.friend) {
		Friend.findById(req.session.friend).exec().then(doc => {
			if (doc != null) {
				req.friend = doc;
				res.friend = doc;
				res.locals.friend = doc;
			}
		}).catch(err => next(err)).then(() => {
			next();
		});
	} else next();
});

// routes ----------------------------------------------------------------------------------------------------
app.use('/', require(getPath('routes', 'root')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Page Not Found: "' + req.url + '"');
	err.status = 404;

	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	err.status = err.status || 500;
	
	res.status(err.status);

	res.render('error', { 
		title: err.name, 
		error: err
	});
});

// cron ----------------------------------------------------------------------------------------------------
var Job = require('cron').CronJob;
new Job('*/5 * * * * *', getJob('calculateProfit'), null, true, 'America/Los_Angeles');
new Job('*/10 * * * * *', getJob('matchOrder'), null, true, 'America/Los_Angeles');

module.exports = app;