var debug = require('debug')('gskse:jobs:calcProf');

var Friend = gskse.getModel('friend');
var Corp = gskse.getModel('corp');
var News = gskse.getModel('news');
var Report = gskse.getModel('report');
var Stock = gskse.getModel('stock');

var corp_revenue = ((count, click) => Math.round(count * ((click + 0.1) ** 1.2) * 3000)),
	corp_tax = 0.2,  // of revenue
	corp_earning = 0.5 * (1 - corp_tax),  // of revenue
	ceo_salary = 0.05 * (1 - corp_tax),  // of revenue
	ceo_tax = 0.2;  // of salary

var corpController = gskse.getController('corpController');

module.exports = function() {
	debug('calculate profit');

	var context = {};

	// don't use aggregate since we need to reset the click
	News.find({ click: { $gte: 0 } }).then(newses => {
		context.click = {};
		context.count = {};
		
		newses.forEach(news => {
			if (context.click[news.corp]) context.click[news.corp] += news.click;
			else context.click[news.corp] = news.click;

			if (context.count[news.corp]) context.count[news.corp] += 1;
			else context.count[news.corp] = 1;

			news.click = 0;
			news.save();
		});

		return Corp.find();
	}).then(corps => {
		corps.forEach(corp => {
			var count = context.count[corp.id] ? context.count[corp.id] : 0,
				click = context.click[corp.id] ? context.click[corp.id] : 0;

			var revenue = corp_revenue(count, click);
			var tax = Math.round(revenue * corp_tax);
			var earning = Math.round(revenue * corp_earning);
			debug('\tcorp [%s], revenue [%d], earning [%d]', corp.symbol, revenue, earning);

			if (revenue <= 1) return;

			corp.revenue = revenue;
			corp.cash += earning;
			corp.save();

			// save report
			Report.create({
				corp: corp._id,
				date: Date.now(),

				revenue: 	revenue,
				tax: 		tax, 
				expense: 	revenue - tax - earning,
				earning: 	earning,
			}).then(report => {
				return Promise.all([
					Friend.findById(corp.ceo),
					Stock.find({ corp: corp._id, quantity: { $gte: 0 } }).populate('friend'),
				]);
			}).then(results => {
				var ceo = results[0],
					stocks = results[1];

				var salary = Math.round(revenue * ceo_salary);
				debug('\t\tcorp [%s], ceo [%s], salary [%d]', corp.symbol, ceo.name, salary);
				ceo.cash += salary;
				ceo.save();

				var remains = Math.round(revenue - tax - earning - salary);
				if (remains <= 1) true;

				stocks.forEach(stock => {
					var divident = Math.round(remains * (stock.quantity / corp.stock));
					debug('\t\tcorp [%s], holder [%s], divident [%d]', corp.symbol, stock.friend.name, divident);
					stock.friend.cash += divident;
					stock.friend.save();
				});
			});
		});
	}).catch(err => debug(err));
};