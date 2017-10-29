var debug = require('debug')('gskse:test:corpController');
var should = require('should');
var sharp = require('sharp');

var gskse = require('../config');

var friendController = require('../controllers/friendController');
var corpController = require('../controllers/corpController');

var Friend = require('../models/friend');
var Corp = require('../models/corp');
var Order = require('../models/order');
var Tick = require('../models/tick');
var Stock = require('../models/stock');

describe('corpController', function() {
	var self = this;

	before('clear database', function(done) {
		Promise.all([
			Friend.remove({}),
			Corp.remove({}),
			Order.remove({}),
			Tick.remove({}),
			Stock.remove({}),
		]).then(() => done()).catch(err => done(err));
	});

	describe('::register', function() {
		it('can register', function(done) {
			sharp({ create: {
				width: 64,
				height: 64,
				channels: 4,
				background: { r: 255, g: 0, b: 0, alpha: 128 },
			} }).jpeg().toBuffer().then(data => {
				self.avatarData = data;
				return friendController.signup('Kailang', '123', data);
			}).then(friend => {
				should.exist(friend);
				self.friend = friend;
				return friendController.signup('Kailang1', '123', self.avatarData);
			}).then(friend => {
				should.exist(friend);
				self.friend1 = friend;
				return corpController.register(self.friend, 'C.C.', 'Desc', 'CC', 'en', self.avatarData);
			}).then(corp => {
				self.corp = corp;
				should.exist(corp);
				corp.name.should.be.exactly('C.C.');
				corp.desc.should.be.exactly('Desc');
				corp.symbol.should.be.exactly('CC');
				corp.locale.should.be.exactly('en');
				should.exist(corp.ceo);
				should.exist(corp.life);
				should.exist(corp.founder);
				done();
			}).catch(err => done(err));
		});
	});

	describe('::findCorp', function() {
		it('can find corp', function(done) {
			corpController.findCorp('CC', 'en').then(corp => {
				should.exist(corp);
				done();
			}).catch(err => done(err));
		});
	});

	describe('::findStockOrCreateOne', function() {
		it('can create stock', function(done) {
			corpController.findStockOrCreateOne(self.friend, self.corp).then(stock => {
				should.exist(stock);
				done();
			}).catch(err => done(err));
		});
	});

	describe('::createTick', function() {
		it('can create tick', function(done) {
			corpController.createTick(self.corp, self.friend, self.friend, 100, 10).then(tick => {
				should.exist(tick);
				done();
			}).catch(err => done(err));
		});
	});

	describe('::invest', function() {
		it('can invest', function(done) {
			corpController.invest(self.friend, self.corp, 1000).then(order => {
				order.unfilled.should.be.exactly(0);
				order.deal.should.be.exactly(1000);
				order.is_aborted.should.be.false();
				done();
			}).catch(err => done(err));
		});
		it('cannot invest more than it has', function(done) {
			corpController.invest(self.friend, self.corp, 2000000).then(order => {
				done(order);
			}).catch(err => {
				err.name.should.be.exactly(gskse.status.too_poor().name);
				done();
			});
		});
		it('cannot invest after first offer', function(done) {
			corpController.offer(self.friend, self.corp, 100, 10).then(stock => {
				return corpController.invest(self.friend, self.corp, 100);
			}).then(order => {
				done(order);
			}).catch(err => {
				err.name.should.be.exactly(gskse.status.bad_request().name);
				done();
			});
		});
	});

	describe('::offer', function() {
		it('ceo can offer', function(done) {
			corpController.offer(self.friend, self.corp, 100, 10).then(stock => {
				should.exist(stock);
				done();
			}).catch(err => done(err));
		});
		it('others cannot offer', function(done) {
			corpController.offer(self.friend1, self.corp, 100, 10).then(stock => {
				done(stock);
			}).catch(err => {
				err.name.should.be.exactly(gskse.status.unauthorized().name);
				done();
			});
		});
	});

	describe('::trade', function() {
		afterEach('clear orders', function(done) {
			Order.remove({}).then(() => done());
		});

		it('buy sell at limit, filled, not aborted', function(done) {
			corpController.trade(self.friend1, self.corp, 100, 2, 'buy', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 100, 2, 'sell', 'limit', '1m');
			}).then(order => {
				order.unfilled.should.be.exactly(0);
				order.deal.should.be.exactly(200);
				order.is_aborted.should.be.false();
				done();
			}).catch(err => done(err));
		});

		it('buy sell x2 at limit, filled, not aborted', function(done) {
			corpController.trade(self.friend1, self.corp, 100, 2, 'buy', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 50, 2, 'sell', 'limit', '3m');
			}).then(order => {
				order.unfilled.should.be.exactly(0);
				order.deal.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 50, 2, 'sell', 'limit', '5m');
			}).then(order => {
				order.unfilled.should.be.exactly(0);
				order.deal.should.be.exactly(100);
				order.is_aborted.should.be.false();
				done();
			}).catch(err => done(err));
		});

		it('buy sell at different limit, filled, not aborted', function(done) {
			corpController.trade(self.friend1, self.corp, 100, 3, 'buy', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 100, 2, 'sell', 'limit', 'gtc');
			}).then(order => {
				order.unfilled.should.be.exactly(0);
				order.deal.should.be.exactly(250);
				order.is_aborted.should.be.false();
				done();
			}).catch(err => done(err));
		});

		it('buy sell at mismatch limit, no trade, not aborted', function(done) {
			corpController.trade(self.friend1, self.corp, 100, 1, 'buy', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 100, 2, 'sell', 'limit', 'gtc');
			}).then(order => {
				order.unfilled.should.be.exactly(100);
				order.deal.should.be.exactly(0);
				order.is_aborted.should.be.false();
				done();
			}).catch(err => done(err));
		});

		it('buy sell ioc at limit, filled, not aborted', function(done) {
			corpController.trade(self.friend1, self.corp, 100, 2, 'buy', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 100, 2, 'sell', 'limit', 'ioc');
			}).then(order => {
				order.unfilled.should.be.exactly(0);
				order.deal.should.be.exactly(200);
				order.is_aborted.should.be.false();
				done();
			}).catch(err => done(err));
		});

		it('buy sell ioc at limit, not filled, aborted', function(done) {
			corpController.trade(self.friend1, self.corp, 100, 2, 'buy', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 200, 2, 'sell', 'limit', 'ioc');
			}).then(order => {
				order.unfilled.should.be.exactly(100);
				order.deal.should.be.exactly(200);
				order.is_aborted.should.be.true();
				done();
			}).catch(err => done(err));
		});

		it('buy at limit sell at market, filled, not aborted', function(done) {
			corpController.trade(self.friend1, self.corp, 100, 2, 'buy', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 100, 0, 'sell', 'market', 'gtc');
			}).then(order => {
				order.unfilled.should.be.exactly(0);
				order.deal.should.be.exactly(200);
				order.is_aborted.should.be.false();
				done();
			}).catch(err => done(err));
		});

		it('buy at limit sell at market, not filled, not aborted', function(done) {
			corpController.trade(self.friend1, self.corp, 100, 2, 'buy', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 200, 0, 'sell', 'market', 'gtc');
			}).then(order => {
				order.unfilled.should.be.exactly(100);
				order.deal.should.be.exactly(200);
				order.is_aborted.should.be.false();
				done();
			}).catch(err => done(err));
		});

		it('buy sell at market, filled, not aborted', function(done) {
			corpController.createTick(self.corp, self.friend, self.friend1, 1, 2).then(tick => {
				return corpController.trade(self.friend1, self.corp, 50, 0, 'buy', 'market', 'gtc');
			}).then(order => {
				order.unfilled.should.be.exactly(50);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend1, self.corp, 50, 0, 'buy', 'market', 'gtc');
			}).then(order => {
				order.unfilled.should.be.exactly(50);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 75, 0, 'sell', 'market', 'gtc');
			}).then(order => {
				order.unfilled.should.be.exactly(0);
				order.deal.should.be.exactly(150);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 25, 0, 'sell', 'market', 'gtc');
			}).then(order => {
				order.unfilled.should.be.exactly(0);
				order.deal.should.be.exactly(50);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 1, 0, 'sell', 'market', 'ioc');
			}).then(order => {
				order.unfilled.should.be.exactly(1);
				order.deal.should.be.exactly(0);
				order.is_aborted.should.be.true();
				done();
			}).catch(err => done(err));
		});

		it('buy at limit sell at market, not filled, buyer too poor', function(done) {
			corpController.trade(self.friend1, self.corp, 100, 2000000, 'buy', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 100, 0, 'sell', 'market', '1m');
			}).then(order => {
				order.unfilled.should.be.exactly(100);
				order.deal.should.be.exactly(0);
				order.is_aborted.should.be.false();
				done();
			}).catch(err => done(err));
		});

		it('buy at limit sell at market, not filled, seller too poor', function(done) {
			corpController.trade(self.friend1, self.corp, 2000, 2, 'buy', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(2000);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 2000, 0, 'sell', 'market', '1m');
			}).then(order => {
				order.unfilled.should.be.exactly(2000);
				order.deal.should.be.exactly(0);
				order.is_aborted.should.be.true();
				done();
			}).catch(err => done(err));
		});

		// flipped -----------------------------------------------------------------------------------------

		it('sell buy at limit, filled, not aborted', function(done) {
			corpController.trade(self.friend1, self.corp, 100, 2, 'sell', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 100, 2, 'buy', 'limit', '1m');
			}).then(order => {
				order.unfilled.should.be.exactly(0);
				order.deal.should.be.exactly(200);
				order.is_aborted.should.be.false();
				done();
			}).catch(err => done(err));
		});

		it('sell buy x2 at limit, filled, not aborted', function(done) {
			corpController.trade(self.friend1, self.corp, 100, 2, 'sell', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 50, 2, 'buy', 'limit', '3m');
			}).then(order => {
				order.unfilled.should.be.exactly(0);
				order.deal.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 50, 2, 'buy', 'limit', '5m');
			}).then(order => {
				order.unfilled.should.be.exactly(0);
				order.deal.should.be.exactly(100);
				order.is_aborted.should.be.false();
				done();
			}).catch(err => done(err));
		});

		it('sell buy at different limit, filled, not aborted', function(done) {
			corpController.trade(self.friend1, self.corp, 100, 2, 'sell', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 100, 3, 'buy', 'limit', 'gtc');
			}).then(order => {
				order.unfilled.should.be.exactly(0);
				order.deal.should.be.exactly(250);
				order.is_aborted.should.be.false();
				done();
			}).catch(err => done(err));
		});

		it('sell buy at mismatch limit, no trade, not aborted', function(done) {
			corpController.trade(self.friend1, self.corp, 100, 3, 'sell', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 100, 2, 'buy', 'limit', 'gtc');
			}).then(order => {
				order.unfilled.should.be.exactly(100);
				order.deal.should.be.exactly(0);
				order.is_aborted.should.be.false();
				done();
			}).catch(err => done(err));
		});

		it('sell buy ioc at limit, filled, not aborted', function(done) {
			corpController.trade(self.friend1, self.corp, 100, 2, 'sell', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 100, 2, 'buy', 'limit', 'ioc');
			}).then(order => {
				order.unfilled.should.be.exactly(0);
				order.deal.should.be.exactly(200);
				order.is_aborted.should.be.false();
				done();
			}).catch(err => done(err));
		});

		it('sell buy ioc at limit, not filled, aborted', function(done) {
			corpController.trade(self.friend1, self.corp, 100, 2, 'sell', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 200, 2, 'buy', 'limit', 'ioc');
			}).then(order => {
				order.unfilled.should.be.exactly(100);
				order.deal.should.be.exactly(200);
				order.is_aborted.should.be.true();
				done();
			}).catch(err => done(err));
		});

		it('sell at limit buy at market, filled, not aborted', function(done) {
			corpController.trade(self.friend1, self.corp, 100, 2, 'sell', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 100, 0, 'buy', 'market', 'gtc');
			}).then(order => {
				order.unfilled.should.be.exactly(0);
				order.deal.should.be.exactly(200);
				order.is_aborted.should.be.false();
				done();
			}).catch(err => done(err));
		});

		it('sell at limit buy at market, not filled, not aborted', function(done) {
			corpController.trade(self.friend1, self.corp, 100, 2, 'sell', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 200, 0, 'buy', 'market', 'gtc');
			}).then(order => {
				order.unfilled.should.be.exactly(100);
				order.deal.should.be.exactly(200);
				order.is_aborted.should.be.false();
				done();
			}).catch(err => done(err));
		});

		it('sell buy at market, filled, not aborted', function(done) {
			corpController.createTick(self.corp, self.friend, self.friend1, 1, 2).then(tick => {
				return corpController.trade(self.friend1, self.corp, 50, 0, 'sell', 'market', 'gtc');
			}).then(order => {
				order.unfilled.should.be.exactly(50);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend1, self.corp, 50, 0, 'sell', 'market', 'gtc');
			}).then(order => {
				order.unfilled.should.be.exactly(50);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 75, 0, 'buy', 'market', 'gtc');
			}).then(order => {
				order.unfilled.should.be.exactly(0);
				order.deal.should.be.exactly(150);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 25, 0, 'buy', 'market', 'gtc');
			}).then(order => {
				order.unfilled.should.be.exactly(0);
				order.deal.should.be.exactly(50);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 1, 0, 'buy', 'market', 'ioc');
			}).then(order => {
				order.unfilled.should.be.exactly(1);
				order.deal.should.be.exactly(0);
				order.is_aborted.should.be.true();
				done();
			}).catch(err => done(err));
		});

		it('sell at limit buy at market, not filled, buyer too poor', function(done) {
			corpController.trade(self.friend1, self.corp, 100, 2000000, 'sell', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(100);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 100, 0, 'buy', 'market', '1m');
			}).then(order => {
				order.unfilled.should.be.exactly(100);
				order.deal.should.be.exactly(0);
				order.is_aborted.should.be.true();
				done();
			}).catch(err => done(err));
		});

		it('sell at limit buy at market, not filled, seller too poor', function(done) {
			corpController.trade(self.friend1, self.corp, 2000, 2, 'sell', 'limit', 'gtc').then(order => {
				order.unfilled.should.be.exactly(2000);
				order.is_aborted.should.be.false();
				return corpController.trade(self.friend, self.corp, 2000, 0, 'buy', 'market', '1m');
			}).then(order => {
				order.unfilled.should.be.exactly(2000);
				order.deal.should.be.exactly(0);
				order.is_aborted.should.be.false();
				done();
			}).catch(err => done(err));
		});
	});
});