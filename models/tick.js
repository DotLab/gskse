var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var helper = require('./helper');

var TickSchema = new Schema({
	corp: 		helper.ref('Corp'),

	buyer: 		helper.ref('Friend'),
	seller: 	helper.ref('Friend'),

	price: 		helper.unsigned(),
	quantity: 	helper.unsigned(),

	date: 		helper.date(),
});

module.exports = mongoose.model('Tick', TickSchema);