var debug = require('debug')('gskse:friendController');

var Friend = require('../models/friend');

var hasher = require('pbkdf2-password')();

var sharp = require('sharp');
var Rusha = require('rusha');
var rusha = new Rusha();

var gskse = require('../config');

exports.login = function(name, password) {
	return Friend.findOne({ name: name }).then(doc => {
		if (!doc) throw gskse.status.unauthorized();

		return new Promise((resolve, reject) => {
			hasher({ password: password, salt: doc.salt }, function(err, pass, salt, hash) {
				if (err || hash != doc.hash) return reject(gskse.status.unauthorized());
				debug('user login [%s]', doc.name);
				resolve(doc);
			});
		});
	});
};

exports.signup = function(name, password, avataData) {
	var self = this;

	return Promise.resolve(rusha.digestFromBuffer(avataData)).then(sha1 => {
		self.avatar = sha1 + '.jpeg';
		return sharp(avataData).resize(gskse.avatarWidth, gskse.avatarHeight).jpeg().toFile(gskse.getUploadPath(self.avatar));
	}).then(info => {
		return new Promise((resolve, reject) => {
			hasher({ password: password }, function(err, pass, salt, hash) {
				if (err) return reject(err);
				resolve({ pass, salt, hash });
			});
		});
	}).then(({ pass, salt, hash }) => {
		return Friend.create({
			avatar: self.avatar,
			name: name,

			salt: salt,
			hash: hash,

			cash: gskse.startFund,
			pledge: 0,

			value: gskse.startFund,

			joined: Date.now(),
		});
	});
};

exports.pay = function(friend, amount) {
	if (friend.cash <= amount) throw gskse.status.too_poor();
	friend.cash -= amount;
	return friend.save();
};