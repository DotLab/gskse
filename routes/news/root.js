var debug = require('debug')('gskse:news');
var router = require('express').Router();

var Friend = getModel('friend');
var Corp = getModel('corp');
var News = getModel('news');

var sharp = require('sharp');
var Rusha = require('rusha');
var rusha = new Rusha();

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
		return sharp(req.files.hero.data).resize(256, 144).jpeg().toFile(getUploadPath(context.hero));
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
	News.findById(req.params.id).then(doc => {
		if (!doc) throw new Error('Cannot find the corporation');

		res.locals.news = doc;
		
		doc.click += 1;
		doc.save();

		res.render('news/id');
	}).catch(err => next(err));
});

module.exports = router;