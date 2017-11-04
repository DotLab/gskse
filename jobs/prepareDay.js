var debug = require('debug')('gskse:jobs:preDay');

var Friend = gskse.getModel('friend');
var Corp = gskse.getModel('corp');
var News = gskse.getModel('news');
var Report = gskse.getModel('report');
var Tick = gskse.getModel('tick');

module.exports = function() {
	debug('prepare day');

	var context = {};

	Corp.find().then(corps => {
		return Promise.all(corps.map(corp => {
			return Tick.findOne({ corp: corp._id, date: { $lt: gskse.getLastMidnight() } }).sort('-date').then(tick => {
				if (!tick) return null;

				debug('corp [%s] close [%d]', corp.symbol, tick.price);
				return corp.update({ $set: { close: tick.price, volume: 0 } });
			});
		}));
	}).then(ignored => {
		debug('prepare day finished');
	}).catch(err => debug(err));
};