var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var helper = require('./helper');

var CompanySchema = new Schema({
	avatar: 	helper.string(),
	name: 		helper.stringUnique(),
	desc: 		helper.string(),

	symbol: 	helper.stringMatch(/^[A-Z]{1,4}$/),
	locale: 	helper.stringEnum(helper.localeOption),

	cash: 		helper.number(),
	profit: 	helper.number(),
	
	stock: 		helper.number(),
	offer: 		helper.number(),
	price: 		helper.number(),

	ceo: 		helper.ref('Friend'),
	founder: 	helper.ref('Friend'),

	founded: 	helper.date(),
	ipo: 		helper.date(),

	is_public: 		helper.boolean(),
	is_offering:	helper.boolean(),
});

module.exports = mongoose.model('Company', CompanySchema);