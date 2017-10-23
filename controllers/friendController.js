var hasher = require('pbkdf2-password')();
var sharp = require('sharp');
var Rusha = require('rusha');
var rusha = new Rusha();
var path = require('path');
var debug = require('debug')('gskse:friendController');

var Friend = require('../models/friend');


exports.login = function (req, res, next) {
	res.render('login');
};

exports.login_post = function (req, res, next) {
	Friend.findOne({ name: req.body.name }).exec().then(doc => {
		if (!doc) throw new Error('Login failed');

		return new Promise((resolve, reject) => {
			hasher({ password: req.body.password, salt: doc.salt }, function (err, pass, salt, hash) {
				if (err) return reject(err);
				if (hash != doc.hash) return reject(new Error('Login failed'));
				
				resolve(doc);
			});
		});
	}).then(friend => {
		req.session.regenerate(() => {
			req.session.friend = friend.id;
			res.redirect('/');
		});
	}).catch(err => next(err));
};

exports.signup = function (req, res, next) {
	res.render('signup');
};

exports.signup_post = function (req, res, next) {
	if (req.body.password != req.body.password_confirm) throw new Error('Signup failed');

	var context = {};

	sharp(req.files.avatar.data).metadata().then(meta => {
		context.avatar = rusha.digestFromBuffer(req.files.avatar.data) + '.jpeg';

		return sharp(req.files.avatar.data).resize(128, 128).jpeg({
			// quality: 60,
			// progressive: true,
		}).toFile(path.join(appRoot, 'public/upload', context.avatar));
	}).then(info => {
		return new Promise((resolve, reject) => {
			hasher({ password: req.body.password }, function (err, pass, salt, hash) {
				if (err) return reject(err);
				
				resolve({ pass, salt, hash });
			});
		});
	}).then(({ pass, salt, hash }) => {
		return new Friend({
			avatar: context.avatar,
			name: req.body.name,

			salt: salt,
			hash: hash,

			cash: 10000,
			value: 10000,

			joined: Date.now(),
		}).save();
	}).then(friend => {
		res.redirect('/login');
	}).catch(err => next(err));
};

// destroy the friend's session to log them out
// will be re-created next request
exports.logout = function (req, res, next) {
	req.session.destroy(function () {
		return res.redirect('/');
	});
}
