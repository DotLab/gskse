var debug = require('debug')('gskse:jobs:calculateProfit');

var Friend = getModel('friend');
var Corp = getModel('corp');
var News = getModel('news');

module.exports = function() {
	debug('calculate profit');

	var context = {};

	News.find({ click: { $gte: 0 } }).exec().then(docs => {
		context.click = {};
		context.count = {};
		
		docs.forEach(doc => {
			if (context.click[doc.corp]) context.click[doc.corp] += doc.click;
			else context.click[doc.corp] = doc.click;

			if (context.count[doc.corp]) context.count[doc.corp] += 1;
			else context.count[doc.corp] = 1;

			doc.click = 0;
			doc.save();
		});

		return Corp.find().exec();
	}).then(docs => {
		docs.forEach(doc => {
			var count = context.count[doc.id] ? context.count[doc.id] : 0,
				click = context.click[doc.id] ? context.click[doc.id] : 0;
			var profit = Math.round(count * ((click + 0.1) ** 1.2) * 3000);
			debug('\tcorp [%s], profit [%d]', doc.symbol, profit);

			profit = Math.round(profit * 0.8);
			doc.cash += Math.round(profit * 0.5);

			doc.save();

			var context2 = {};
			context2.profit = profit;

			Friend.findById(doc.ceo).exec().then(ceo => {
				var salary = Math.round(context2.profit * 0.05);
				debug('\t\tceo [%s], salary[%d]', ceo.name, salary);
				ceo.cash += salary;
				ceo.save();
			});
		});
	}).catch(err => debug(err));
};