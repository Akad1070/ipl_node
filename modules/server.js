"use strict";

/**
 * =============================
 *
 * Set the route listening on, start/stop the server...
 *
 * =============================
 *
 * Attributes : /
 *
 * Methods :
 *		- start([callback])
 *		- stop([callback])
 *
 * Events : /
 *
 * =============================
 */



/**
 * Load modules
 */

// Built-in
var express    = require('express');
var bodyParser = require('body-parser');
var path       = require ('path');

// Custom
var logger     = require('./logger');
var config     = require('./config');
var mongo      = require('./mongo');
var redis	   = require('./redis');


// Routes
var defRoute   = require('../routes/routes');
var zikRoute   = require('../routes/zik');
var apiRoute   = require('../routes/api');



/**
 * Variables
 */

// Server
var app = express();
var server;



/**
 * Configure application:
 *		- parse json bodies
 */
var _configureServer = function (cb) {
	// Parse JSON bodies
	app.use(bodyParser.json());

	// Parse application/x-www-form-urlencoded so we can get data from POST and/or URL param
	app.use(bodyParser.urlencoded({ extended: true }));


	// Delivering Static Files (Node Acts Like Apache )
    app.use(express.static(path.join(__dirname,'/../public')));

	// Error handlers
	// production error handler
	app.use(defRoute.checkErrorProd);

	// The directory for the template files
	app.set('views',path.join(__dirname,'/../views'));
	// Define the rendering engine : jade
	app.set('view engine', 'jade');




	// Init the mongoDB by connecting to
	//var url = 'mongodb://'+process.env.IP+port+'/'+dbname;
	mongo.connect(config.db.mongo.port,config.db.mongo.dbname, function (err,db,msg) {
		if(err && cb) return cb(err);
		if(cb)  return cb(null,msg);
    });


	// Init the connection to Redis
	redis.connect(config.db.redis.port, function(err,msg) {
		if(err && cb) return cb(err);
		if(cb)  return cb(null,msg);
	});

};


/**
 * Configure application routes
 */
var _configureRoutes = function () {

	// Middleware to use before process all requests
	app.use(defRoute.beforeRequest);

	app.get('/',defRoute.home);

	app.route('/login')
			.get(defRoute.login)
			.post(defRoute.loginPosted);

	app.route('/signup')
			.get(defRoute.signup)
			.post(defRoute.signupPosted);
	app.get('/stop',stop);


	 // Sub-Router handler for /ziks
	app.use('/ziks', zikRoute);


	//  Sub-Router handler for /api
	app.use('/api', apiRoute);



	/* The 404 Route (ALWAYS Keep this as the last route) */
	app.use(defRoute.error404); // 404 handler
	app.use(defRoute.error500); // 500 handler
};


/**
 * Start the API Server
 * @param callback function called when the web server is listening
 */
var start = function (callback) {
	// Try to config the server
	_configureServer(function (err,msg){
		if(err) { // If any errors occurs, log it and callback
	    	logger.error(err.message);
	    	if (callback) return callback(err);
		}
    	logger.info(msg);		// Log all info about the config 
		_configureRoutes(); 	// Config the routes

		// Only if the server isn't already listenning
		if(!server){
			server = app.listen(process.env.PORT || 8080, process.env.IP || config.server.host, function () {
				logger.info('[Server] Web server listening on ' + config.server.host + ':' + process.env.PORT || 8080);
				if (callback) return callback();
			});
		}
	});
};

/**
 * Stop the API Server
 * @param callback function called when the web server is no more listening
 */
var stop = function (callback) {
	if (server && typeof server.close == 'function') {
		mongo.stop();
		redis.stop();
		server.close();
		logger.warn('[Server] Web server no more listening on ' + config.server.host + ':' + process.env.PORT);
		if (callback) callback();
	} else {
		logger.warn('[Server] Cannot stop web server not yet init. listening on ' + config.server.host + ':' + process.env.PORT);
		if (callback) callback();
	}
};




/**
 * Events on the Server
 */




/**
 * Exports
 */

// Methods

exports.start = start;
exports.stop = stop;