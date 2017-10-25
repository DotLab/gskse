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
	var err = new Error('Page Not Found: "' + req.url + '"');
	err.status = 404;

	next(err);
});

// error handler
var status_codes = require('./statusCodes');
app.use(function(err, req, res, next) {
	if (status_codes[err.message]) { 
		err.status = err.message;
		err.message = status_codes[err.message];
	} 

	err.status = err.status || 500;
	
	res.status(err.status);

	res.render('error', { 
		title: err.name, 
		error: err
	});
});

// cron ----------------------------------------------------------------------------------------------------
var Job = require('cron').CronJob;
new Job('*/30 * * * * *', getJob('calculateCorpProfit'), null, true, 'America/Los_Angeles');
new Job('*/20 * * * * *', getJob('calculateFriendValue'), null, true, 'America/Los_Angeles');
new Job('*/10 * * * * *', getJob('matchOrder'), null, true, 'America/Los_Angeles');

// config ----------------------------------------------------------------------------------------------------
global.gskse = {
	start_fund: 10000,

	avatar_width: 128,
	avatar_height: 128,

	corp_legal_fees: 300,
	
	corp_tax_rate: 0.2,
	corp_ceo_cut: 0.05,
	corp_revenue_cut: 0.5,
	corp_dividen_cut: 0.25,  // 1 - corp_tax_rate - corp_ceo_cut - corp_revenue_cut

	salary_tax_rate: 0.2,

	po_revenue_threshold: 100000000,
	po_lock_up_days: 3,
	po_fees: 5000000,
	po_cut: 0.08,

	funs: {
		corp_revenue: (g, c) => g * c ** 2 * 3000,
		corp_revenue_break: r => {
			var tax = Math.round(r * gskse.corp_tax_rate);
			var ceo = Math.round(r * gskse.corp_ceo_cut);
			var revenue = Math.round(r * gskse.corp_revenue_cut);
			var dividen = r - tax - ceo - revenue;
			return { tax: tax, ceo: ceo, revenue: revenue, dividen: dividen };
		},

		salary: s => Math.round(s * (1 - gskse.salary_tax_rate)),

		po_lock_up: () => {
			var lock_up = new Date(Date.now());
			lock_up.setDate(lock_up.getDate() + gskse.po_lock_up_days);
			return lock_up;
		},
		po_fund: f => Math.round(f * (1 - gskse.po_cut)),
	}
};
debug(gskse.funs.salary(3000));
debug(gskse.funs.po_lock_up());

module.exports = app;