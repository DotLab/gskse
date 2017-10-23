var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.render('index', { title: res.__('common-gskse') });
});

var friendController = require('../controllers/friendController');
router.get('/login', friendController.login);
router.post('/login', friendController.login_post);
router.get('/signup', friendController.signup);
router.post('/signup', friendController.signup_post);
router.get('/logout', friendController.logout);



router.use('/exchange', require('./exchange'));

router.get('/locale/:lang', function(req, res, next) {
	res.cookie('lang', req.params.lang, { maxAge: 900000, httpOnly: true });
	res.redirect('back');
});

module.exports = router;
