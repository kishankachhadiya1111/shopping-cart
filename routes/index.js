var express = require('express');

var Cart = require('../models/cart');
var Product = require('../models/product');
var Order = require('../models/order');

var router = express.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
	var successMsg = req.flash('success')[0];
	var products = Product.find((err, docs) => {
		var productChuncks = [];
		var chunkSize = 3;
		for (var i = 0; i < docs.length; i += chunkSize) {
			productChuncks.push(docs.slice(i, i + chunkSize));
		}
		res.render('shop/index', { title: 'Express', products: productChuncks, successMsg: successMsg, noMessages: !successMsg });
	}).lean();
});

router.get('/add-to-cart/:id', function (req, res, next) {
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});
	Product.findById(productId, function (err, product) {
		if (err) {
			return res.redirect('/');
		}
		cart.add(product, product.id);
		req.session.cart = cart;
		res.redirect('/');
	});
});

router.get('/reduce/:id', function(req, res, next){
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});
	cart.reduceByone(productId);
	req.session.cart=cart;
	res.redirect('/shopping-cart');
});

router.get('/reduce/:id', function(req, res, next){
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});
	cart.removeItem(productId);
	req.session.cart=cart;
	res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function (req, res, next) {
	if (!req.session.cart) {
		return res.render('shop/shopping-cart', { products: null });
	}
	var cart = new Cart(req.session.cart);
	res.render('shop/shopping-cart', { products: cart.generateArray(), totalPrice: cart.totalPrice });
});

router.get('/checkout', isLoggedIn, function (req, res, next) {
	if (!req.session.cart) {
		return res.redirect('/shopping-cart');
	}
	var cart = new Cart(req.session.cart);
	var errMsg = req.flash('error')[0];
	res.render('shop/checkout', { total: cart.totalPrice, errMsg: errMsg, noError: !errMsg });
});

router.post('/checkout', isLoggedIn, function (req, res, next) {
	if (!req.session.cart) {
		return res.redirect('/shopping-cart');
	}
	var cart = new Cart(req.session.cart);
	const Stripe = require('stripe');
	const stripe = Stripe('sk_test_51IEakxJXWw3ymgg3TmIEmcNikTE3VFximBfyxKU7cUXhaA1SF1tszd3mjjPLpy9JXC77XT7RHKuLl9hcAvYHgZh400xEPU73oE');
	stripe.charges.create({
		amount: cart.totalPrice * 100,
		currency: 'inr',
		source: req.body.stripeToken,
		description: 'My First Test Charge (created for API docs)',
	}, function (err, charge) {
		if (err) {
			console.log(err.message);
			req.flash('error', err.message);
			return res.redirect('/checkout');
		}
		var order = new Order({
			user: req.user,
			cart: cart,
			address: req.body.address,
			name: req.body.name,
			paymentId: charge.id
		});
		order.save(function(err, result){
			req.flash('success', 'Successfully bought product');
			req.session.cart = null;
			res.redirect('/');
		});
	});
});

module.exports = router;
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.session.oldUrl=res.url;
	res.redirect('/user/signin');
}