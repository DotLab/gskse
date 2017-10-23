var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.render('index', { title: res.__('common-gskse') });
});

router.get('/locale/:lang', function(req, res, next) {
	res.cookie('lang', req.params.lang, { maxAge: 900000, httpOnly: true });
	res.redirect('back');
});

var friendController = require('../controllers/friendController');
router.get('/login', friendController.login);
router.post('/login', friendController.login_post);
router.get('/signup', friendController.signup);
router.post('/signup', friendController.signup_post);
router.get('/logout', friendController.logout);

var ventureController = require('../controllers/ventureController');
router.get('/venture/new', ventureController.new);
router.post('/venture/new', ventureController.new_post);
router.get('/venture/:symbol', ventureController.detail);

var newsController = require('../controllers/newsController');
router.get('/news/new', newsController.new);
router.post('/news/new', newsController.new_post);
router.get('/news/:id', newsController.detail);

module.exports = router;
