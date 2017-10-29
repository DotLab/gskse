var debug = require('debug')('gskse:corps');
var router = require('express').Router();

var friendController = gskse.getController('friendController');
var corpController = gskse.getController('corpController');

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