var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var helper = require('./helper');

var OrderSchema = new Schema({
	friend: 	helper.ref('Friend'),
	company: 	helper.ref('Company'),

	quantity: 	helper.number(),

	action: 	helper.stringEnum(helper.orderAction),
	type: 		helper.stringEnum(helper.orderType),

	placed: 	helper.date(),
	expired: 	helper.date(),
	filled: 	helper.date(),

	price: 		helper.number(),
	deal: 		helper.number(),

	is_expired: 	helper.boolean(),
	is_filled: 		helper.boolean(),
});

module.exports = mongoose.model('Order', OrderSchema);