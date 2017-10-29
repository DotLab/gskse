var debug = require('debug')('gskse:corps:symbol');
var router = require('express').Router();

var Friend = gskse.getModel('friend');
var Corp = gskse.getModel('corp');
var News = gskse.getModel('news');
var Order = gskse.getModel('order');
var Stock = gskse.getModel('stock');

var corpController = gskse.getController('corpController');
var friendController = gskse.getController('friendController');

router.get('/', function(req, res, next) {
	corpController.findNewses(res.locals.corp).then(newses => {
		res.locals.newses = newses;
		res.render('corps/symbol/index');
	});
});

router.get('/chart', function(req, res, next) {
	res.render('corps/symbol/chart');
});

router.get('/profile', function(req, res, next) {
	res.render('corps/symbol/profile');
});

router.get('/holders', function(req, res, next) {
	if (!res.locals.corp.is_public && !res.locals.is_holder) throw gskse.status.forbidden();

	corpController.findHolderStocks(res.locals.corp).then(stocks => {
		res.locals.stocks = stocks;
		res.render('corps/symbol/holders');
	}).catch(err => next(err));
});

router.get('/financials', function(req, res, next) {
	if (!res.locals.corp.is_public && !res.locals.is_holder) throw gskse.status.forbidden();

	res.render('corps/symbol/financials');
});

router.get('/conversations', function(req, res, next) {
	res.render('corps/symbol/conversations');
});

router.get('/trade', function(req, res, next) {
	corpController.findOrders(res.locals.corp).then(orders => {
		res.locals.asks = orders.asks;
		res.locals.bids = orders.bids;
		res.render('corps/symbol/trade');
	});
});

router.post('/trade', function(req, res, next) {
	req.body.quantity = parseInt(req.body.quantity);
	req.body.price = parseFloat(req.body.price);
	req.body.action = String(req.body.action);
	req.body.type = String(req.body.type);
	req.body.duration = String(req.body.duration);

	corpController.trade(res.locals.friend, res.locals.corp, req.body.quantity, req.body.price, req.body.action, req.body.type, req.body.duration).then(order => {
		res.redirect(url_corps_symbol_trade(res.locals.corp.symbol));
	});
});

router.get('/invest', function(req, res, next) {
	res.render('corps/symbol/invest');
});

router.post('/invest', function(req, res, next) {
	req.body.quantity = parseInt(req.body.quantity);

	corpController.invest(res.locals.friend, res.locals.corp, req.body.quantity).then(stock => {
		res.redirect(url_corps_symbol_holders(res.locals.corp.symbol));
	}).catch(err => next(err));
});

router.get('/offer', function(req, res, next) {
	res.render('corps/symbol/offer');
});

router.post('/offer', function(req, res, next) {
	req.body.price = parseFloat(req.body.price);
	req.body.quantity = parseInt(req.body.quantity);

	corpController.offer(res.locals.friend, res.locals.corp, req.body.quantity, req.body.price).then(stock => {
		res.redirect(url_corps_symbol_holders(res.locals.corp.symbol));
	}).catch(err => next(err));
});

module.exports = router;