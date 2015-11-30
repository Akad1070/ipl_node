
/**
 * This API allows to CRUD nothing.
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
		msg: {}
	});
};



var notFound = function(req, res){
	// log error:
	logger.log('[Server] 404 error: ' + req.url);
	res.render('errors/404', {
		status: 404,
		locals:{ title: 'Ressource Not Found 404 :(' }
  	});
};

var serverError = function(err, req, res, next){
	// log error:

	logger.log('[Server] ' + (err.status != 500) ? err :err.stack);

	// send output based on type of request json vs html
	var accept = req.headers.accept || '';

	if (~accept.indexOf('json')) {
		res.json({ error: "There was a server error :(" }, err.status || 500);
  	}else{
		res.render('errors/500', {
			status: err.status || 500,
			locals: { title: '500 Internal ServerError :( ' }
	  });
	}
};
















/**
 *
 * Route methods
 *
 */


var home = function (req,res,next) {
	res.status(200);
	res.render('home',{title : "Home",header : "Welcome to NodeZikApp"});
	//return next();
 };




var signup = function (req,res,next) {
	res.render('signup',{title: "SignUp",header : "Sign Up"});
	return next();
};



var signupPosted = function (req,res,next) {
	var isNotSet = false, msg = null;
	if(!(req.body && req.body.pseudo && req.body.passwd && req.body.passwd2)){
		isNotSet = true; msg = '[User] One field is not set for the signup form';
	}else{
		if(req.body.passwd !== req.body.passwd2){
			isNotSet = true; msg = '[User] The 2 passwords doesn\'t match';
		}
	}
	if(isNotSet){
		logger.warn(msg);
		return res.status(404).render('signup',{msg : msg});
	}
	User.signup(req.body, function (err,msg) {
		if(err){
			logger.warn(err.message);
			res.status(404);
			return res.render('signup',{msg : err.message});
		}
		logger.info('[User] '+msg);
		res.status(200);
		return next();
	});
};





var login = function (req,res,next) {
	res.render('login',{title: "Connexion",header : "Log In"});
	return next();
 };


var loginPosted = function (req,res,next) {
	User.login(req.body.pseudo,req.body.passwd, function (err,user,msg) {
		if(err){
			logger.warn(err.message);
			res.status(401);
			return res.send(err.message);
		}
		if(user){	// Generate the token  & save it into the REDIS user
			logger.info(msg);
			res.status(200);
			res.send(user.token);
		}
	});
};

var logout = function (req,res,next) {
	User.logout();
	return next();
};




var isAuth = function (req,res,next) {
	// Check header or URL parameters or POST parameters for token
	var token = req.headers['api-token'];

	User.checkToken(token,function (err,decoded) {
		if(err){
			// Sending a 401 will require authentication,
			logger.warn('[Server] Authentification Failed : '+err.message);
			res.status(401);
			return res.send(err.name);
		}
		logger.warn('[Server] Authorization for : ');
		//res.status(200).send('Hi '+"LePseudo"+', You look at my protected page :-) !');
		return next();
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
exports.logout          = logout;
exports.loginPosted    	= loginPosted;

