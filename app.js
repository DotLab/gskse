var debug = require('debug')('gskse:app');

// env ----------------------------------------------------------------------------------------------------
var path = require('path');
global.appRoot = path.resolve(__dirname);
debug('appRoot', appRoot);

// mongoose ----------------------------------------------------------------------------------------------------
var mongoose = require('mongoose').set('debug', true);
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

// sass ----------------------------------------------------------------------------------------------------
// var sass = require('node-sass-middleware');
// app.use(sass({
// 	src: path.join(__dirname, 'public'),
// 	dest: path.join(__dirname, 'public'),
// 	debug: true,
// 	outputStyle: 'compressed',
// 	indentedSyntax: false, // true = .sass and false = .scss
// 	sourceMap: true
// }));

// static ----------------------------------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

// bodyParser ----------------------------------------------------------------------------------------------------
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// cookieParser ----------------------------------------------------------------------------------------------------
var cookieParser = require('cookie-parser');
app.use(cookieParser());

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
	cookie: 'lang',
	queryParameter: 'lang',
	directory: __dirname + '/locales',

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
var Friend = require('./models/friend');
app.use(function (req, res, next) {
	res.locals.nop = 'javascript:void(0)';
	res.locals.getUrl = (file => '/upload/' + file);
	
	debug(req.session.friend);
	if (req.session.friend) {
		Friend.findById(req.session.friend).exec().then(doc => {
			if (doc != null) {
				req.friend = doc;
				res.locals.friend = doc;
			}
		}).catch(err => next(err)).then(() => {
			next();
		});
	} else next();
});

// routes ----------------------------------------------------------------------------------------------------
var router = require('./routes/router');
app.use('/', router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Page Not Found');
	err.status = 404;

	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	res.status(err.status || 500);

	res.render('error', { 
		title: err.name, 
		error: err
	});
});

module.exports = app;