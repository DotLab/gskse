var debug = require('debug')('gskse:corps');
var router = require('express').Router();

var Corp = getModel('corp');

var sharp = require('sharp');
var Rusha = require('rusha');
var rusha = new Rusha();

router.get('/register', function(req, res, next) {
	res.render('corps/register');
});

router.post('/register', function(req, res, next) {
	var context = {};

	new Promise((resolve, reject) => {
		resolve(rusha.digestFromBuffer(req.files.avatar.data));
	}).then(sha1 => {
		context.avatar = sha1 + '.jpeg';
		return sharp(req.files.avatar.data).resize(128, 128).jpeg().toFile(getUploadPath(context.avatar));
	}).then(info => {
		return new Corp({
			avatar: context.avatar,
			name: req.body.name,
			desc: req.body.desc,

			symbol: req.body.symbol,
			locale: req.body.locale,

			cash: 0,
			profit: 0,

			stock: 0,
			offer: 0,
			price: 0,

			ceo: req.friend.id,
			founder: req.friend.id,

			founded: Date.now(),
			ipo: new Date(0),

			is_public: false,
			is_offering: false,
		}).save();
	}).then(corp => {
		res.redirect(url_corps_symbol(corp.symbol));
	}).catch(err => next(err));
});

router.use('/:symbol', function(req, res, next) {
	Corp.findOne({ symbol: req.params.symbol, locale: req.locale }).exec().then(doc => {
		if (!doc) throw new Error('Cannot find the corporation');

		res.corp = doc;
		res.locals.corp = doc;

		next();
	}).catch(err => next(err));
}, require('./symbol'));

module.exports = router;