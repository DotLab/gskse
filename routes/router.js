var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.render('index', { title: res.__('common-gskse') });
});

router.use('/exchange', require('./exchange'));

router.get('/locale/:lang', function(req, res, next) {
	res.cookie('lang', req.params.lang, { maxAge: 900000, httpOnly: true });
	res.redirect('back');
});

module.exports = router;
