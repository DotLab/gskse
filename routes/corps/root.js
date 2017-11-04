var debug = require('debug')('gskse:corps');
var router = require('express').Router();

var Corp = gskse.getModel('corp');
var Stock = gskse.getModel('stock');
var News = gskse.getModel('news');

var friendController = gskse.getController('friendController');
var corpController = gskse.getController('corpController');

router.get('/', function(req, res, next) {
	Promise.all([
		Stock.find({ friend: res.locals.friend._id, quantity: { $gt: 0 } }).sort('-quantity').populate('corp'),  // watch lists
		Corp.find().sort('-volume').limit(5),  // active 
		Corp.find().sort('-change').limit(5),  // gainers 
		Corp.find().sort('change').limit(5),  // losers 
		News.find().sort('-date').limit(5),
	]).then(results => {
		var stocks = results[0],
			actives = results[1],
			gainers = results[2],
			losers = results[3],
			newses = results[4];

		res.locals.watches = stocks.map(a => a.corp);
		res.locals.actives = actives;
		res.locals.gainers = gainers;
		res.locals.losers = losers;
		res.locals.newses = newses;

		res.render('corps/index');
	}).catch(err => next(err));
});

router.get('/register', function(req, res, next) {
	res.render('corps/register');
});

router.post('/register', function(req, res, next) {
	req.body.name = String(req.body.name);
	req.body.desc = String(req.body.desc);
	req.body.symbol = String(req.body.symbol);
	req.body.locale = String(req.body.locale);

	friendController.pay(res.locals.friend, gskse.corpLegalFees).then(friend => {
		return corpController.register(friend, req.body.name, req.body.desc, req.body.symbol, req.body.locale, req.files.avatar.data);
	}).then(corp => {
		res.redirect(url_corps_symbol(corp.symbol));
	}).catch(err => next(err));
});

router.use('/:symbol', function(req, res, next) {
	req.params.symbol = String(req.params.symbol);
	if (!res.locals.friend) throw gskse.status.unauthorized();

	corpController.findCorp(req.params.symbol, res.locals.locale).then(corp => {
		if (!corp) throw gskse.status.not_found();
		
		res.locals.corp = corp;
		res.locals.is_ceo = (res.locals.corp.ceo == res.locals.friend.id);
		
		return Promise.all([
			corpController.findStock(res.locals.friend, res.locals.corp),
			corpController.findReports(res.locals.corp),
			corpController.getQuote(res.locals.corp),
		]);
	}).then(results => {
		var stock = results[0],
			reports = results[1],
			quote = results[2];

		if (stock) {
			res.locals.stock = stock;
			res.locals.is_holder = true;
		}

		res.locals.reports = reports;
		res.locals.quote = quote;

		next();
	}).catch(err => next(err));
}, require('./symbol'));

module.exports = router;