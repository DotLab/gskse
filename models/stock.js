var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var helper = require('./helper');

var StockSchema = new Schema({
	friend: 	helper.ref('Friend'),
	corp: 		helper.ref('Corp'),

	quantity: 	helper.unsigned(),
	spent: 		helper.unsigned(),

	lock_up: 	helper.date(),  // cannot sell, can still buy
});

StockSchema.index({ friend: 1, corp: 1 }, { unique: true });

module.exports = mongoose.model('Stock', StockSchema);