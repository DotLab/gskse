var debug = require('debug')('gskse:jobs:calcVal');

var Friend = getModel('friend');
var Corp = getModel('corp');
var News = getModel('news');
var Report = getModel('report');
var Stock = getModel('stock');

module.exports = function() {
	debug('calculate friend value');

	values = {};

	Stock.find({ quantity: { $gte: 0 } }).populate('corp').then(stocks => {
		stocks.forEach(stock => {
			if (!values[stock.friend]) values[stock.friend] = 0;
			values[stock.friend] += stock.quantity * stock.corp.price;
		});

		return Friend.find();
	}).then(friends => {
		friends.forEach(friend => {
			if (!values[friend.id]) values[friend.id] = 0;
			friend.value = friend.cash + values[friend.id];
			debug('\tfriend [%s], value [%d], stock [%d]', friend.name, friend.value, values[friend.id]);
			friend.save();
		});
	})
};