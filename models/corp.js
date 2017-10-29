var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var helper = require('./helper');

var CorpSchema = new Schema({
	avatar: 	helper.string(),
	name: 		helper.string(),
	desc: 		helper.string(),

	symbol: 	helper.stringMatch(/^[A-Z]{1,4}$/),
	locale: 	helper.stringEnum(helper.localeOption),

	cash: 		helper.unsigned(),
	revenue: 	helper.unsigned(),

	stock: 		helper.unsigned(),
	offer: 		helper.unsigned(),
	price: 		helper.unsigned(),

	ceo: 		helper.ref('Friend'),
	life: 		helper.ref('Friend'),
	founder: 	helper.ref('Friend'),

	founded: 	helper.date(),
	ipo: 		helper.date(),

	is_public: 		helper.boolean(),
	is_offering:	helper.boolean(),
});

CorpSchema.index({ symbol: 1, locale: 1 }, { unique: true });

module.exports = mongoose.model('Corp', CorpSchema);