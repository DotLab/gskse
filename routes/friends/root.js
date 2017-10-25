var debug = require('debug')('gskse:friends');
var router = require('express').Router();

var Friend = getModel('friend');

var hasher = require('pbkdf2-password')();

var sharp = require('sharp');
var Rusha = require('rusha');
var rusha = new Rusha();

router.get('/login', function(req, res, next) {
	res.render('friends/login');
});

router.post('/login', function(req, res, next) {
	Friend.findOne({ name: req.body.name }).then(doc => {
		if (!doc) throw new Error('Login failed');

		return new Promise((resolve, reject) => {
			hasher({ password: req.body.password, salt: doc.salt }, function(err, pass, salt, hash) {
				if (err) return reject(err);
				if (hash != doc.hash) return reject(new Error('Login failed'));
				
				resolve(doc);
			});
		});
	}).then(friend => {
		req.session.friend = friend.id;
		req.session.save(err => {
			res.redirect('/');
		});
	}).catch(err => next(err));
});

router.get('/signup', function(req, res, next) {
	res.render('friends/signup');
});

router.post('/signup', function(req, res, next) {
	if (req.body.password != req.body.password_confirm) throw new Error('Signup failed');

	var context = {};

	new Promise((resolve, reject) => {
		resolve(rusha.digestFromBuffer(req.files.avatar.data));
	}).then(sha1 => {
		context.avatar = sha1 + '.jpeg';
		return sharp(req.files.avatar.data).resize(128, 128).jpeg().toFile(getUploadPath(context.avatar));
	}).then(info => {
		return new Promise((resolve, reject) => {
			hasher({ password: req.body.password }, function(err, pass, salt, hash) {
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
		res.redirect('/friends/login');
	}).catch(err => next(err));
});

router.get('/logout', function(req, res, next) {
	req.session.friend = null;
	req.session.save(err => {
		return res.redirect('/');
	});
});

module.exports = router;
