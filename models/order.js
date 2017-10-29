var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var helper = require('./helper');

var OrderSchema = new Schema({
	friend: 	helper.ref('Friend'),
	corp: 		helper.ref('Corp'),

	quantity: 	helper.unsigned(),
	unfilled: 	helper.unsigned(),

	action: 	helper.stringEnum(helper.orderAction),
	type: 		helper.stringEnum(helper.orderType),
	duration: 	helper.stringEnum(helper.orderDuration),

	price: 		helper.unsigned(),
	deal: 		helper.unsigned(),

	placed: 	helper.date(),
	filled: 	helper.date(),
	expired: 	helper.date(),

	is_aborted: 	helper.boolean(),
});

module.exports = mongoose.model('Order', OrderSchema);