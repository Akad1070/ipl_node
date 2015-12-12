
/**
 * This Route allows to login and signup.
 */



/**
 * Load modules
 */

// Mine - Custom
var logger = require('../modules/logger');
var config = require('../modules/config');
var User   = require('../modules/user');


/**
 * Method included for Routes routines
 * 		- Log All request URL
 * 		- Check JWT for authorized route
 *
 */
var	gotReq = function (req,res,next) {
	// Log all req with the Type of method and the url
	logger.info('[Server] Got a '+req.method +' for ' + req.url);
	next();
};



/**
 * Developement Error Handler
 * Just log the error with the status code or 500.
 *
 */
var checkErrorDev = function (err,req,res,next) {
	logger.warn('[' +(err.status || 500) + '] : ' + err.message);
	next();
};

/**
 *	Production Error Handler
 *	Usual params for the route include the err and the next fct to call
 *	return a rendered view of Error page
 */
var checkErrorProd = function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('/error', {
		header: err.message,
		msg: err
	});
};



var notFound = function (req, res){
	// log error:
	logger.log('[Server] 404 error: ' + req.url);
	res.render('errors/404', {
		status: 404,
		locals:{ title: 'Ressource Not Found 404 :(' }
  	});
};

var serverError = function (err, req, res, next){
	// log error:
	logger.warn('[Server] ' + (err.status != 500) ? err.message : err.stack);

	// Response depend on type of request JSON || HTML
	var accept = req.headers.accept || '';
	// The tilde ~ allows to make a true|| false operation
	// Otherwise, indexof() return a int.
	if (~accept.indexOf('json')) {
		res.json({ error: "There was a server error :(" }, err.status || 500);
  	}else{
		res.render('errors/500', {
			msg : err.message,
			locals: { title: '500 Internal ServerError :( ' },
			status: err.status || 500
	  });
	}
};


/**
 * Check the token in the header.
 */
var isAuth = function (req,res,next) {
	// Check header or URL parameters or POST parameters for token
	var token = req.headers['api-token'];

	User.checkToken(token,function (err,decoded) {
		if(err){
			// Sending a 401 will require authentication,
			logger.warn('[Server] Authentification Failed : '+err.message);
			return res.status(401).send(err);
		}
		// Save some user info 
		req.user = {
			'pseudo' : decoded.pseudo,
			'fullName' : decoded.fname +', '+decoded.lname
		};
		logger.info('[Server] Authorized for '+req.user.pseudo);
		res.status(200);
		return next();
	});

};





/**
 *
 * Route methods
 *
 */


var home = function (req,res,next) {
	res.status(200);
	res.render('home',{header : "Welcome to NodeZikApp"});
 };




var signup = function (req,res,next) {
	res.render('signup',{title: "SignUp",header : "Sign Up"});
};

var signupPosted = function (req,res,next) {
	var msg = null;
	if(!(req.body && req.body.pseudo && req.body.passwd && req.body.passwd2)){
		msg = 'One of the fields is not defined for the signup';
	}else{
		if(req.body.passwd !== req.body.passwd2)
			msg = 'The 2 passwords doesn\'t match';
	}
	if(msg){
		logger.warn('[User] '+msg);
		return res.status(404).render('signup',{msg : msg});
	}
	User.signup(req.body, function (err,msg) {
		if(err){
			logger.warn('[User] '+ (msg = err.message));
			res.status(404);
		}else{
			logger.info('[User] '+msg);
			res.status(200);
		}
		res.send(msg);
	});
};





var login = function (req,res,next) {
	res.render('login',{title: "Connexion",header : "Log In"});
	//return next();
 };


var loginPosted = function (req,res,next) {
	User.login(req.body.pseudo,req.body.passwd, function (err,token,msg) {
		if(err){
			logger.warn(err.message);
      		return res.status(401).send(err.message);
		}
		if(token){	// Generate the token
			logger.info(msg);
			return res.status(200).send(token);
		}
	});
};








/**
 * Exports
 */

// Methods
exports.beforeRequest  	= gotReq;
exports.checkErrorDev  	= checkErrorDev;
exports.checkErrorProd 	= checkErrorProd;
exports.error404		= notFound;
exports.error500		= serverError;

exports.isAuth         	= isAuth;

exports.home        	= home;

exports.signup			= signup;
exports.signupPosted	= signupPosted;

exports.login          	= login;
exports.loginPosted    	= loginPosted;

