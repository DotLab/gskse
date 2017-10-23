var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var helper = require('./helper');

var TickSchema = new Schema({
	corp: 		helper.ref('Corp'),

	date: 		helper.date(),

	ask: 		helper.number(),
	bid: 		helper.number(),

	ask_vol:	helper.number(),
	bid_vol:	helper.number(),
});

module.exports = mongoose.model('Tick', TickSchema);