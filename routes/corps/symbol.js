var debug = require('debug')('gskse:corps:symbol');
var router = require('express').Router();

var Friend = getModel('friend');
var Corp = getModel('corp');
var News = getModel('news');

router.get('/', function(req, res, next) {
	News.find({ corp: res.corp._id }).exec().then(docs => {
		res.locals.news = docs;
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
	res.render('corps/symbol/holders');
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
	res.render('corps/symbol/invest');
});

module.exports = router;