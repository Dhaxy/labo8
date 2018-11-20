var express = require('express'),
		app = express(),
		cookieParser = require('cookie-parser'),
		port = process.env.PORT || 3000,
		jwt = require('jsonwebtoken');

var users = [];

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.route('/').get(function(req, res) {
	if (req.cookies.session) {
		return res.status(200).redirect('/userprofile');
	}
	res.sendFile('./views/index.html', {root:__dirname})
});

app.route('/userprofile').get(function(req, res) {
	if (!req.cookies.session) {
		return res.status(401).redirect('/');
	}
	res.sendFile('./views/userprofile.html', {root:__dirname})
});

app.route('/users').post(function(req, res) {
	for (let user of users) {
		if (user.username == req.body.username) {
			return res.status(400).send({
				message: "User account already exists"
			})
		}
	}
	users.push({
		username: req.body.username,
		password: req.body.password,
		token: ''
	});
	res.json("Account " + req.body.username + " has been succesfully created.");
	return res.status(200);
});

app.route('/login').post(function(req, res) {
	if (!req.cookies.session) {
		for (let user of users) {
			if (user.username == req.body.username && user.password == req.body.password) {
				user.token = jwt.sign({token:user.username}, 'session');
				res.cookie('session', user.token);
				return res.status(200).redirect('/userprofile');
			}
		}
	}
	return res.status(401).redirect('/');
});

app.listen(port);
console.log('App listening on ' + port);
