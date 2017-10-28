var debug = require('debug')('gskse:jobs:matchOrder');

var Friend = getModel('friend');
var Corp = getModel('corp');
var News = getModel('news');
var Order = getModel('order');
var Stock = getModel('stock');

var faker = require('faker');

module.exports = function() {
	var self = this;

	Friend.create({
		avatar: faker.random.uuid(),
		name: faker.name.firstName(),

		salt: faker.random.uuid(),
		hash: faker.random.uuid(),

		cash: gskse.startFund,
		pledge: 0,

		value: gskse.startFund,

		joined: Date.now(),
	}).then(friend => {
		debug(friend)
		self.friend = friend;

		return Corp.create({
			avatar: faker.random.uuid(),
			name: faker.name.firstName(),
			desc: faker.lorem.paragraphs(),

			symbol: faker.lorem.word().substring(0, 4).toUpperCase(),
			locale: 'en',

			cash: 0,
			revenue: 0,

			stock: 0,
			offer: 10000,
			price: 10,

			ceo: friend._id,
			founder: friend._id,

			founded: Date.now(),
			ipo: Date.now(),

			is_public: true,
			is_offering: true,
		});
	}).then(corp => {
		debug(corp)
		self.corp = corp;

		return Stock.create({
			friend: self.friend._id,
			corp: corp._id,

			quantity: faker.finance.mask(),

			spent: 0,
			value: 0,
			price: 0,

			updated: Date.now(),

			lock_up: gskse.epoch,
		});
	}).then(stock => {
		debug(stock)
		self.stock = stock;

		for (var i = 0; i < 10; i++) {
			Order.create({
				friend: self.friend._id,
				corp: self.corp._id,

				quantity: Math.round(faker.finance.amount()),

				action: 'buy',
				type: 'market',

				placed: Date.now(),
				expired: gskse.getOrderExpiration('gtc'),
				filled: gskse.epoch,

				price: Math.round(faker.finance.amount() / 100 + 2),
				deal: 0,

				is_filled: false,
				is_filling: true,
			});
			Order.create({
				friend: self.friend._id,
				corp: self.corp._id,

				quantity: Math.round(faker.finance.amount()),

				action: 'sell',
				type: 'market',

				placed: Date.now(),
				expired: gskse.getOrderExpiration('gtc'),
				filled: gskse.epoch,

				price: Math.round(faker.finance.amount() / 100 + 2),
				deal: 0,

				is_filled: false,
				is_filling: true,
			});
			Order.create({
				friend: self.friend._id,
				corp: self.corp._id,

				quantity: Math.round(faker.finance.amount()),

				action: 'buy',
				type: 'limit',

				placed: Date.now(),
				expired: gskse.getOrderExpiration('gtc'),
				filled: gskse.epoch,

				price: Math.round(faker.finance.amount() / 100 + 2),
				deal: 0,

				is_filled: false,
				is_filling: true,
			});
			Order.create({
				friend: self.friend._id,
				corp: self.corp._id,

				quantity: Math.round(faker.finance.amount()),

				action: 'sell',
				type: 'limit',

				placed: Date.now(),
				expired: gskse.getOrderExpiration('gtc'),
				filled: gskse.epoch,

				price: Math.round(faker.finance.amount() / 100 + 2),
				deal: 0,

				is_filled: false,
				is_filling: true,
			});
		}
	}).catch(err => debug(err.message));
};