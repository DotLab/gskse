var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var helper = require('./helper');

var StockSchema = new Schema({
	friend: 	helper.ref('Friend'),
	corp: 		helper.ref('Corp'),

	quantity: 	helper.number(),

	spent: 		helper.number(),  //= spent + trade.spent
	value: 		helper.number(),  //= quantity * corp.stock_price
	price: 		helper.number(),  //= spent / quantity

	lock_up: 	helper.date(),  // cannot sell, can still buy

	is_locked: 		helper.boolean(),
});

StockSchema.index({ friend: 1, corp: 1 }, { unique: true });

module.exports = mongoose.model('Stock', StockSchema);