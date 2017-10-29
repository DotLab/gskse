var debug = require('debug')('gskse:corpController');

var Friend = require('../models/friend');
var Corp = require('../models/corp');
var News = require('../models/news');
var Tick = require('../models/tick');
var Order = require('../models/order');
var Stock = require('../models/stock');
var Report = require('../models/report');

var sharp = require('sharp');
var Rusha = require('rusha');
var rusha = new Rusha();

var friendController = require('../controllers/friendController');

var gskse = require('../config');

exports.register = function(friend, name, desc, symbol, locale, avatarData) {
	var self = this;

	return Promise.resolve(rusha.digestFromBuffer(avatarData)).then(sha1 => {
		self.avatar = sha1 + '.jpeg';
		return sharp(avatarData).resize(gskse.avatarWidth, gskse.avatarHeight).jpeg().toFile(gskse.getUploadPath(self.avatar));
	}).then(info => {
		return Corp.create({
			avatar: self.avatar,
			name: name,
			desc: desc,

			symbol: symbol,
			locale: locale,

			cash: 0,
			revenue: 0,

			stock: 0,
			offer: 0,
			price: 1,  // before ipo

			ceo: friend.id,
			life: gskse.ghost,
			founder: friend.id,

			founded: Date.now(),
			ipo: new Date(0),

			is_public: false,
			is_offering: false,
		});
	}).then(corp => {
		self.corp = corp;
		return friendController.signup(symbol + locale.toUpperCase().replace(/[^A-Z]/, ''), 'lajslkjendflaskj', avatarData);
	}).then(friend => {
		self.corp.life = friend._id;
		return self.corp.save();
	});
};

exports.findCorp = function(symbol, locale) {
	return Corp.findOne({ symbol: symbol, locale: locale });
};

exports.findStock = function(friend, corp) {
	return Stock.findOne({ friend: friend._id, corp: corp._id, quantity: { $gt: 0 } });
};

exports.findReports = function(corp) {
	return Report.find({ corp: corp._id }).sort('-date').limit(5);
};

exports.findNewses = function(corp) {
	return News.find({ corp: corp._id }).sort('-click -posted');
};

exports.findHolderStocks = function(corp) {
	return Stock.find({ corp: corp._id, quantity: { $gt: 0 } }).populate('friend');
};

var findStockOrCreateOne = function(friend, corp) {
	debug('create stock [%s] for [%s]', corp.symbol, friend.name);
	return findStockOrCreateOneById(friend._id, corp._id);
};

exports.findStockOrCreateOne = findStockOrCreateOne;

var findStockOrCreateOneById = function(friendId, corpId) {
	return Stock.findOne({ friend: friendId, corp: corpId }).then(stock => {
		if (stock) return stock;
		return Stock.create({
			friend: friendId,
			corp: corpId,

			quantity: 0,
			spent: 0,

			lock_up: new Date(0),
		});
	});
};

var createTick = function(corp, buyer, seller, quantity, price) {
	debug('deal [%s] buy from [%s] for [%s] [%d] x [%d]', buyer.name, seller.name, corp.symbol, price, quantity);
	return createTickById(corp._id, buyer._id, seller._id, quantity, price);
};

exports.createTick = createTick;

var createTickById = function(corpId, buyerId, sellerId, quantity, price) {
	return Tick.create({
		corp: corpId,
		
		buyer: buyerId,
		seller: sellerId,
		
		quantity: quantity,
		price: price,

		date: Date.now(),
	});
};

exports.invest = function(friend, corp, quantity) {
	if (corp.is_public) throw gskse.status.bad_request();

	var self = this;
	self.friend = friend;
	self.corp = corp;
	self.quantity = quantity;

	return Order.create({
		friend: self.friend._id,
		corp: self.corp._id,

		quantity: self.quantity,
		unfilled: self.quantity,

		action: 'buy',
		type: 'private',
		duration: 'ioc',

		price: 1,
		deal: 0,

		placed: Date.now(),
		filled: gskse.epoch,
		expired: gskse.getOrderExpiration('ioc'),

		is_aborted: false,
	}).then(order => {
		self.order = order;
		return friendController.pay(self.friend, self.quantity);
	}).catch(err => {
		if (err.name != gskse.status.too_poor().name) throw err;
		self.order.is_aborted = true;
		return self.order.save().then(order => {
			throw err;
		});
	}).then(friend => {
		debug('invest [%s] <- [%d] by [%s]', self.corp.symbol, self.quantity, self.friend.name);
		return findStockOrCreateOne(self.friend, self.corp);
	}).then(stock => {
		self.order.unfilled = 0;
		self.order.deal = self.order.quantity;
		self.order.filled = Date.now();
		self.order.save();

		self.corp.stock += self.quantity;
		self.corp.save();

		debug('    has [%d] spent [%d]', stock.quantity, stock.spent);
		stock.quantity += quantity;
		stock.spent += quantity;
		stock.save();

		debug('    stock change [%s] now holding [%s] [%d]', self.friend.name, self.corp.symbol, stock.quantity);
		return createTickById(self.corp._id, self.friend._id, self.corp.life, self.quantity, 1);
	}).then(tick => {
		return self.order;
	});
};

exports.offer = function(friend, corp, quantity, price) {
	debug('offer [%s] of [%d] x [%d] by [%s]', corp.symbol, price, quantity, friend.name);

	if (friend.id != corp.ceo) {
		debug('    friend [%s] is not ceo [%s]', friend.id, corp.ceo);
		return Promise.reject(gskse.status.unauthorized());
	}

	if (!corp.is_public) {  // ipo
		corp.is_public = true;
		corp.ipo = Date.now();
	}
	corp.price = price;
	corp.offer = quantity;
	corp.is_offering = true;

	return corp.save().then(corp => {
		return findStockOrCreateOne(friend, corp);
	}).then(stock => {
		stock.lock_up = gskse.getOfferLockUp();
		return stock.save();
	});
};

exports.trade = function(friend, corp, quantity, price, action, type, duration) {
	var self = this;

	return Order.create({
		friend: friend._id,
		corp: corp._id,

		quantity: quantity,
		unfilled: quantity,

		action: action,
		type: type,
		duration: duration,

		price: (type == 'market') ? 0 : price,
		deal: 0,

		placed: Date.now(),
		filled: gskse.epoch,
		expired: gskse.getOrderExpiration(duration),

		is_aborted: false,
	}).then(order => {
		self.order = order;
		return matchOrder(corp);
	}).catch(err => {
		if (err != buyer_too_poor && err != seller_too_poor && err != no_order && err != no_trade) throw err;
		debug('match order abort: [%s]', err);
		return Order.findById(self.order._id);
	}).then(order => {
		self.order = order;
		if (self.order.duration == 'ioc' && self.order.unfilled != 0) {  // ioc order not filled, abort
			self.order.is_aborted = true;
			self.order.save();
		}
		return self.order;
	});
};

var buyer_too_poor = 'buyer too poor',
	seller_too_poor = 'seller too poor',
	no_order = 'no order',
	no_trade = 'no trade';

var matchOrder = function(corp) {
	var self = this;
	self.corp = corp;
	debug('match order for corp [%s]', self.corp.symbol);

	return Promise.all([
		Order.findOne({ 
			corp: self.corp._id, 
			action: 'buy', 
			type: { $in: [ 'limit', 'market' ] }, 
			unfilled: { $gt: 0 }, 
			expired: { $gt: Date.now() },
			is_aborted: false,
		}).sort('-type -price placed'),  // -type so that (market > limit) can merge to the top

		Order.findOne({ 
			corp: self.corp._id, 
			action: 'sell', 
			type: { $in: [ 'limit', 'market' ] },
			unfilled: { $gt: 0 }, 
			expired: { $gt: Date.now() },
			is_aborted: false,
		}).sort('-type price placed'),
		
		Tick.findOne({
			corp: self.corp._id,
		}).sort('-date'),
	]).then(results => {
		self.bid = results[0];
		self.ask = results[1];
		self.tick = results[2];

		if (!self.bid || !self.ask) {
			debug('    no order');
			throw no_order;
		}

		debug('    bid [%d] x [%d]', self.bid.price, self.bid.quantity);
		debug('    ask [%d] x [%d]', self.ask.price, self.ask.quantity);
		debug('    last tick [%d] x [%d]', self.tick.price, self.tick.quantity);

		if (self.bid.type == 'limit' && self.ask.type == 'limit' && self.bid.price < self.ask.price) {
			debug('    no trade');
			throw no_trade;
		}

		return Promise.all([
			Friend.findById(self.bid.friend),
			Friend.findById(self.ask.friend),

			findStockOrCreateOneById(self.bid.friend, self.corp._id),
			findStockOrCreateOneById(self.ask.friend, self.corp._id),
		]);
	}).then(results => {
		self.buyer = results[0];
		self.seller = results[1];
		self.buyerStock = results[2];
		self.sellerStock = results[3];

		debug('    buyer [%s] with cash [%d] stock [%d]', self.buyer.name, self.buyer.cash, self.buyerStock.quantity);
		debug('    seller [%s] with cash [%d] stock [%d]', self.seller.name, self.seller.cash, self.sellerStock.quantity);

		self.quantity = Math.min(self.bid.unfilled, self.ask.unfilled);
		// determine the transaction price:
		if (self.bid.type == 'market' && self.ask.type == 'market') self.price = self.tick.price;  // all market order, trade at previous price
		else if (self.bid.type == 'market') self.price = self.ask.price;  // bid is market, trade at ask
		else if (self.ask.type == 'market') self.price = self.bid.price;  // ask is market, trade at bid
		else self.price = (self.bid.price + self.ask.price) * 0.5;  // all limit order, trade at middle
		self.amount = self.quantity * self.price;

		return checkViability(self.bid, self.ask, self.buyer, self.sellerStock, self.amount, self.quantity);
	}).then(ignored => {
		self.bid.unfilled -= self.quantity;
		self.bid.deal += self.amount;
		checkFill(self.bid);
		self.buyer.cash -= self.amount;
		self.buyerStock.quantity += self.quantity;

		return Promise.all([
			self.bid.save(),
			// self.buyer.save(),
			// self.buyerStock.save(),
			Friend.findByIdAndUpdate(self.buyer._id, { $inc: { cash: -self.amount } }),
			Stock.findByIdAndUpdate(self.buyerStock._id, { $inc: { quantity: self.quantity } }),
		]);
	}).then(ignored => {
		self.ask.unfilled -= self.quantity;
		self.ask.deal += self.amount;
		checkFill(self.ask);
		self.seller.cash += self.amount;
		self.sellerStock.quantity -= self.quantity;

		return Promise.all([
			self.ask.save(),
			// self.seller.save(),
			// self.sellerStock.save(),
			Friend.findByIdAndUpdate(self.seller._id, { $inc: { cash: self.amount } }),
			Stock.findByIdAndUpdate(self.sellerStock._id, { $inc: { quantity: -self.quantity } }),
		]);
	}).then(ignored => {
		return createTick(self.corp, self.buyer, self.seller, self.quantity, self.price);
	}).then(ignored => {
		return matchOrder(corp);
	});
};

var checkViability = function(bid, ask, buyer, sellerStock, buyAmount, sellQuantity) {
	debug('check buy [%d] has [%d], sell [%d] has [%d]', buyAmount, buyer.cash, sellQuantity, sellerStock.quantity);

	if (buyer.cash < buyAmount) {  // buyer cannot paid for the stock
		bid.is_aborted = true;
		return bid.save().then(bid => {
			debug('buyer too poor');
			throw buyer_too_poor;
		});
	}

	if (sellerStock.quantity < sellQuantity) {  // seller cannot sell the stock
		ask.is_aborted = true;
		return ask.save().then(ask => {
			debug('seller too poor');
			throw seller_too_poor;
		});
	}
};

var checkFill = function(order) {
	if (Math.round(order.unfilled) != 0) return;
	order.unfilled = 0;
	order.filled = Date.now();
};