var debug = require('debug')('gskse:corps:symbol');
var router = require('express').Router();

var Friend = getModel('friend');
var Corp = getModel('corp');
var News = getModel('news');
var Order = getModel('order');
var Stock = getModel('stock');

router.get('/', function(req, res, next) {
	News.find({ corp: res.locals.corp._id }).then(newses => {
		res.locals.newses = newses;
		res.render('corps/symbol/index');
	})
});

router.get('/chart', function(req, res, next) {
	res.render('corps/symbol/chart');
});

router.get('/profile', function(req, res, next) {
	res.render('corps/symbol/profile');
});

router.get('/holders', function(req, res, next) {
	if (!res.locals.corp.is_public && !res.locals.is_holder) throw new Error(403);

	Stock.find({ corp: res.locals.corp._id, quantity: { $gte: 0 } }).populate('friend').then(stocks => {
		res.locals.stocks = stocks;
		res.render('corps/symbol/holders');
	}).catch(err => next(err));
});

router.get('/financials', function(req, res, next) {
	res.render('corps/symbol/financials');
});

router.get('/conversations', function(req, res, next) {
	res.render('corps/symbol/conversations');
});

router.get('/trade', function(req, res, next) {
	res.render('corps/symbol/trade');
});

router.post('/trade', function(req, res, next) {
	res.render('corps/symbol/trade');
});

router.get('/invest', function(req, res, next) {
	res.render('corps/symbol/invest');
});

router.post('/invest', function(req, res, next) {
	debug(parseInt(req.body.amount));
	var amount = Math.round(Math.abs(parseInt(req.body.amount)));
	amount = amount ? amount : 100;

	if (amount > res.locals.friend.cash) throw new Error('Too poor');
	res.locals.friend.cash -= amount;
	res.locals.friend.save();

	debug({ friend: res.locals.friend._id, corp: res.locals.corp._id });
	
	Order.create({
		friend: res.locals.friend._id,
		corp: res.locals.corp._id,

		quantity: amount,

		action: 'buy',
		type: 'private',

		placed: Date.now(),
		expired: new Date(0),
		filled: Date.now(),

		price: res.locals.corp.price,
		deal: res.locals.corp.price,

		is_expired: false,
		is_filled: true,
	}).then(order => {
		debug(order);
		return Stock.findOne({ friend: res.locals.friend._id, corp: res.locals.corp._id });
	}).then(stock => {
		if (!stock) {
			return Stock.create({ 
				friend: res.locals.friend._id,
				corp: res.locals.corp._id,

				quantity: 0,

				spent: 0,
				value: 0,
				price: 0,

				updated: new Date(0),

				lock_up: new Date(0),
				
				is_locked: false,
			});
		}

		return stock; 
	}).then(stock => {
		res.locals.corp.stock += amount;
		res.locals.corp.save();

		stock.quantity += amount;

		stock.spent += amount;
		stock.value = stock.quantity * res.locals.corp.price;
		stock.price = stock.spent / stock.quantity;
		stock.updated = Date.now();
		
		return stock.save();
	}).then(stock => {
		debug(stock);
		res.redirect(url_corps_symbol_holders(res.locals.corp.symbol));
	}).catch(err => next(err));
});

module.exports = router;