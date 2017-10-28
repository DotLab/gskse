var debug = require('debug')('gskse:test:friendController');
var should = require('should');
var sharp = require('sharp');

var gskse = require('../config');

var friendController = require('../controllers/friendController');

var Friend = require('../models/friend');

describe('friendController', function() {
	describe('::signup', function() {
		it('can signup', function(done) {
			sharp({ create: {
				width: 64,
				height: 64,
				channels: 4,
				background: { r: 255, g: 0, b: 0, alpha: 128 },
			} }).jpeg().toBuffer().then(data => {
				return friendController.signup('Kailang', '123', data);
			}).then(friend => {
				friend.name.should.be.exactly('Kailang');
				friend.cash.should.be.exactly(gskse.startFund);
				done();
			}).catch(err => done(err));
		});
	});

	describe('::login', function() {
		it('can login', function(done) {
			friendController.login('Kailang', '123').then(friend => {
				done();
			}).catch(err => done(err));
		});
	});

	describe('::pay', function() {
		it('can pay', function(done) {
			Friend.findOne({}).then(friend => {
				return friendController.pay(friend, 100);
			}).then(friend => {
				friend.cash.should.be.within(0, gskse.startFund);
				done();
			}).catch(err => done(err));
		});
		it('cannot pay more than it has', function(done) {
			Friend.findOne({}).then(friend => {
				return friendController.pay(friend, 1e20);
			}).then(friend => {
				done(friend.cash);
			}).catch(err => {
				err.should.be.exactly(gskse.status.too_poor);
				done();
			});
		});
	});
});