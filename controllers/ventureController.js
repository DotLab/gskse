var hasher = require('pbkdf2-password')();
var sharp = require('sharp');
var Rusha = require('rusha');
var rusha = new Rusha();
var path = require('path');
var debug = require('debug')('gskse:ventureController');

var Friend = require('../models/friend');
var Corp = require('../models/corp');

exports.new = function(req, res, next) {
	res.render('venture_new');
};

exports.new_post = function(req, res, next) {
	var context = {};

	sharp(req.files.avatar.data).metadata().then(meta => {
		context.avatar = rusha.digestFromBuffer(req.files.avatar.data) + '.jpeg';

		return sharp(req.files.avatar.data).resize(128, 128).jpeg({
			// quality: 60,
			// progressive: true,
		}).toFile(path.join(appRoot, 'public/upload', context.avatar));
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
		return res.send(corp);
		res.redirect('/login');
	}).catch(err => next(err));
};

exports.detail = function(req, res, next) {
	Corp.findOne({ symbol: req.params.symbol, locale: res.locals.locale }).exec().then(doc => {
		if (!doc) throw new Error('Cannot find the corporation');

		res.locals.corp = doc;

		res.render('venture_detail');
	}).catch(err => next(err));
};