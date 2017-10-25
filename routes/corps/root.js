var debug = require('debug')('gskse:corps');
var router = require('express').Router();

var Corp = getModel('corp');
var Report = getModel('report');
var Stock = getModel('stock');

var sharp = require('sharp');
var Rusha = require('rusha');
var rusha = new Rusha();

var corp_fees = 300;

router.get('/register', function(req, res, next) {
	res.render('corps/register');
});

router.post('/register', function(req, res, next) {
	var context = {};

	if (res.locals.friend.cash <= corp_fees) throw new Error('Too poor');
	res.locals.friend.cash -= 300;
	res.locals.friend.save();

	new Promise((resolve, reject) => {
		resolve(rusha.digestFromBuffer(req.files.avatar.data));
	}).then(sha1 => {
		context.avatar = sha1 + '.jpeg';
		return sharp(req.files.avatar.data).resize(128, 128).jpeg().toFile(getUploadPath(context.avatar));
	}).then(info => {
		return Corp.create({
			avatar: context.avatar,
			name: req.body.name,
			desc: req.body.desc,

			symbol: req.body.symbol,
			locale: req.body.locale,

			cash: 0,
			profit: 0,

			stock: 0,
			offer: 0,
			price: 1,  // before ipo

			ceo: res.locals.friend.id,
			founder: res.locals.friend.id,

			founded: Date.now(),
			ipo: new Date(0),

			is_public: false,
			is_offering: false,
		});
	}).then(corp => {
		res.redirect(url_corps_symbol(corp.symbol));
	}).catch(err => next(err));
});

router.use('/:symbol', function(req, res, next) {
	Corp.findOne({ symbol: req.params.symbol, locale: res.locals.locale }).then(corp => {
		if (!corp) throw new Error('Cannot find the corporation');
		res.locals.corp = corp;
		return Promise.all([
			Stock.findOne({ corp: corp._id, friend: res.locals.friend._id, quantity: { $gte: 0 } }),
			Report.find({ corp: corp._id }).sort('-date').limit(5),
		]);
	}).then(results => {
		var stock = results[0],
			reports = results[1];

		if (stock) {	
			res.locals.stock = stock;
			res.locals.is_holder = true;
		}
		res.locals.reports = reports;

		next();
	}).catch(err => next(err));
}, require('./symbol'));

module.exports = router;