var hasher = require('pbkdf2-password')();
var sharp = require('sharp');
var Rusha = require('rusha');
var rusha = new Rusha();
var path = require('path');
var debug = require('debug')('gskse:newsController');

var Friend = require('../models/friend');
var Corp = require('../models/corp');
var News = require('../models/news');

exports.new = function(req, res, next) {
	res.render('news_new');
};

exports.new_post = function(req, res, next) {
	var context = {};

	Corp.findOne({ symbol: req.body.symbol, locale: req.body.locale }).exec().then(doc => {
		if (!doc) throw new Error('No company found');

		context.corp = doc;

		return sharp(req.files.hero.data).metadata();
	}).then(meta => {
		context.hero = rusha.digestFromBuffer(req.files.hero.data) + '.jpeg';

		return sharp(req.files.hero.data).resize(256, 144).jpeg().toFile(
			path.join(appRoot, 'public/upload', context.hero));
	}).then(info => {
		return new News({
			friend: req.friend.id,
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
		return res.send(news);
	}).catch(err => next(err));
};

exports.detail = function(req, res, next) {
	News.findById(req.params.id).exec().then(doc => {
		if (!doc) throw new Error('Cannot find the corporation');

		res.locals.news = doc;

		res.render('news_detail');
	}).catch(err => next(err));
};