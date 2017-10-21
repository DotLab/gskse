var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.redirect('/exchange/profile');
});

router.get('/profile', function(req, res, next) {
	res.render('exchange/profile', { title: res.__('common-gskse') });
});

router.get('/profile/edit', function(req, res, next) {
	res.render('exchange/profile_edit', { title: 'Edit Profile', body: req.body, error: new Error('Test') });
});

router.get('/portfolio', function(req, res, next) {
	res.render('exchange/portfolio', { title: res.__('common-gskse') });
});

router.get('/portfolio/trade', function(req, res, next) {
	res.render('exchange/portfolio_trade', { title: res.__('common-gskse') });
});

router.get('/watchlist', function(req, res, next) {
	res.render('exchange/watchlist', { title: res.__('common-gskse') });
});

module.exports = router;
