var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var helper = require('./helper');

var StockSchema = new Schema({
	friend: 	helper.ref('Friend'),
	company: 	helper.ref('Company'),

	quantity: 	helper.number(),

	spent: 		helper.number(),  //= spent + trade.spent
	value: 		helper.number(),  //= quantity * company.stock_price
	price: 		helper.number(),  //= spent / quantity

	lock_up: 	helper.date(),  // cannot sell, can still buy

	is_locked: 		helper.boolean(),
});

StockSchema.index({ friend: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Stock', StockSchema);