var debug = require('debug')('gskse:corpController');

var Friend = getModel('friend');
var Corp = getModel('corp');
var News = getModel('news');
var Tick = getModel('tick');
var Order = getModel('order');
var Stock = getModel('stock');
var Report = getModel('report');

var sharp = require('sharp');
var Rusha = require('rusha');
var rusha = new Rusha();

var friendController = getController('friendController');

exports.register = function(friend, name, desc, symbol, locale, avatarData) {
	var self = this;

	return Promise.resolve(rusha.digestFromBuffer(avatarData)).then(sha1 => {
		self.avatar = sha1 + '.jpeg';
		return sharp(avatarData).resize(gskse.avatarWidth, gskse.avatarHeight).jpeg().toFile(getUploadPath(self.avatar));
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

			life: gskse.ghost,
			ceo: friend.id,
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
	debug('create stock [%s] for [%s]', corp.name, friend.name);
	return findStockOrCreateOneById(friend._id, corp._id);
};

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
	debug('deal [%s] buy from [%s] for [%s] [%d] x [%d]', buyer.name, seller.name, corp.symbol, quantity, price);
	return createTickById(corp._id, buyer._id, seller._id, quantity, price);
};

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
	return Order.create({
		friend: friend._id,
		corp: corp._id,

		quantity: quantity,
		unfilled: 0,

		action: 'buy',
		type: 'private',
		duration: 'gtc',

		price: 1,

		placed: Date.now(),
		filled: Date.now(),
		expired: gskse.getOrderExpiration('gtc'),

		is_aborted: false,
	}).then(order => {
		debug('invest [%s] <- [%d] by [%s]', corp.name, quantity, friend.name);
		return findStockOrCreateOne(friend, corp);
	}).then(stock => {
		corp.stock += quantity;
		corp.save();

		debug('has [%d] spent [%d]', stock.quantity, stock.spent);
		stock.quantity += quantity;
		stock.spent += quantity;
		stock.save();

		debug('stock change [$s] now holding [%s] [%d]', friend.name, corp.name, stock.quantity);
		return createTickById(corp._id, friend._id, corp.life, quantity, 1);
	});
};

exports.offer = function(friend, corp, quantity, price) {
	debug('offer [%s] of [%d] x [%d] by [%s]', corp.symbol, quantity, price, friend.name);

	if (friend.id != corp.ceo) {
		debug('friend [%s], ceo [%s]', friend.id, corp.ceo);
		return Promise.reject(gskse.status.unauthorized);
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
		duration: (type == 'market') ? 'ioc' : duration,

		price: (type == 'market') ? 0 : price,

		placed: Date.now(),
		filled: gskse.epoch,
		expired: gskse.getOrderExpiration(duration),

		is_aborted: false,
	}).then(order => {
		self.order = order;
		return matchOrder(corp);
	}).catch(err => {
		debug('match order abort: [%s]', err);
		if (self.order.duration == 'ioc' && self.order.unfilled != 0) {  // ioc order not filled, abort
			self.order.is_aborted = true;
			self.order.save();
		}
		return self.order;
	});
};

var matchOrder = function(corp) {
	var self = this;
	self.corp = corp;
	debug('corp [%s]', self.corp.symbol);

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
			throw 'No Order';
		}

		debug('    bid [%d] x [%d]', self.bid.quantity, self.bid.price);
		debug('    ask [%d] x [%d]', self.ask.quantity, self.ask.price);
		debug('    last tick [%d] x [%d]', self.tick.quantity, self.tick.price);

		if (self.bid.price < self.ask.price) {
			debug('    no trade');
			throw 'No Trade';
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

		checkViability(self.bid, self.ask, self.buyer, self.sellerStock, self.amount, self.quantity);
		
		self.bid.unfilled -= self.quantity;
		self.buyer.cash -= self.amount;
		self.buyerStock.quantity += self.quantity;

		return Promise.all([
			self.bid.save(),
			// self.buyer.save(),
			// self.buyerStock.save(),
			Friend.findByIdAndUpdate(self.buyer._id, { $inc: { cash: -self.amount } }),
			Stock.findByIdAndUpdate(self.buyerStock._id, { $inc: { quantity: self.amount } }),
		]);
	}).then(ignored => {
		self.ask.unfilled -= self.quantity;
		self.seller.cash += self.amount;
		self.sellerStock.quantity -= self.quantity;

		return Promise.all([
			self.ask.save(),
			// self.seller.save(),
			// self.sellerStock.save(),
			Friend.findByIdAndUpdate(self.seller._id, { $inc: { cash: self.amount } }),
			Stock.findByIdAndUpdate(self.sellerStock._id, { $inc: { quantity: -self.amount } }),
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
		bid.save();

		debug('buyer too poor');
		throw 'Buyer Too Poor';
	}

	if (sellerStock.quantity < sellQuantity) {  // seller cannot sell the stock
		ask.is_aborted = true;
		ask.save();

		debug('seller too poor');
		throw 'Seller Too Poor';
	}
};