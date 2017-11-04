var debug = require('debug')('gskse:news');
var router = require('express').Router();

var Friend = gskse.getModel('friend');
var Corp = gskse.getModel('corp');
var News = gskse.getModel('news');

var sharp = require('sharp');
var Rusha = require('rusha');
var rusha = new Rusha();

router.get('/', function(req, res, next) {
	News.find({}).then(newses => {
		res.locals.newses = newses;

		res.render('news/index');
	});
});

router.get('/post', function(req, res, next) {
	res.render('news/post');
});

router.post('/post', function(req, res, next) {
	var context = {};

	Corp.findOne({ symbol: req.body.symbol, locale: req.body.locale }).then(doc => {
		if (!doc) throw new Error('No company found');

		context.corp = doc;

		return new Promise((resolve, reject) => {
			resolve(rusha.digestFromBuffer(req.files.hero.data));
		});
	}).then(sha1 => {
		context.hero = sha1 + '.jpeg';
		return sharp(req.files.hero.data).resize(gskse.heroWidth, gskse.heroHeight).jpeg().toFile(gskse.getUploadPath(context.hero));
	}).then(info => {
		return new News({
			friend: res.locals.friend.id,
			corp: context.corp.id,

			hero: context.hero,
			title: req.body.title,
			source: req.body.source,
			content: req.body.content,

			symbol: req.body.symbol,
			locale: req.body.locale,

			posted: Date.now(),

			click: 0,
		}).save();
	}).then(news => {
		return res.redirect(url_news_id(news.id));
	}).catch(err => next(err));
});

router.get('/:id', function(req, res, next) {
	News.findById(req.params.id).populate('corp').then(doc => {
		if (!doc) throw new Error('Cannot find the corporation');

		res.locals.news = doc;
		
		doc.click += 1;
		doc.save();

		res.render('news/id');
	}).catch(err => next(err));
});

module.exports = router;