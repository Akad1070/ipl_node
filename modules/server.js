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
var _configureServer = function (callback) {
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
		if(err) 
	    	return (callback) ? callback(err) : null;
		return (callback) ? callback(null,msg) : null;
    });


	// Init the connection to Redis
	redis.connect(config.db.redis.port, function(err,msg) {
		if(err) 
	    	return (callback) ? callback(err) : null;
		return (callback) ? callback(null,msg) : null;
	});

};


/**
 * Configure application routes
 */
var _configureRoutes = function () {

	// Middleware to use before process all requests
	app.use(defRoute.beforeRequest);


	app.param('title',zikRoute.checkParamTitle);

	app.get('/',defRoute.home);

	app.route('/login')
			.get(defRoute.login)
			.post(defRoute.loginPosted, defRoute.home);

	app.get('/logout',defRoute.logout, defRoute.home);

	app.route('/signup')
			.get(defRoute.signup)
			.post(defRoute.signupPosted, defRoute.home);

	app.get('/stop',stop);



	/**
	 *  Sub-Router handler for /zik
	 */
	var appZik = express.Router();

	// Auth for all /zik/*
	appZik.all('/*', defRoute.isAuth);

	appZik.route('/add')
			.get(zikRoute.add)
			.post(zikRoute.addPosted, zikRoute.listBy);

	//		/zik/by/author/desc
	appZik.get('/by/:field/:sort?', zikRoute.listBy);

	appZik.route('/delete/:title')
			.get(zikRoute.del)
			.post(zikRoute.delPosted, zikRoute.list);

	//		/zik/list/title/Echo
	appZik.get('/list/:field?/:val?',zikRoute.list);

	appZik.route('/update/:title')
			.get(zikRoute.update)
			.post(zikRoute.updatePosted, zikRoute.list);

	appZik.get("/:field/:val",zikRoute.get);

	app.use('/ziks', appZik);


	/**
	 *  Sub-Router handler for /api
	 */

	var appApi = express.Router();

	// Check for the api if token
	appApi.all('/*', apiRoute.isAuth);

	appApi.route('/ziks')
			.get(apiRoute.getAllZiks) // Get All ziks
			.post( apiRoute.postZiks); // Create a new Zik

	appApi.route('/ziks/:title')
			.get(apiRoute.getZik)
			.post(apiRoute.postZiks)
			.put(apiRoute.updateZik)
			.delete(apiRoute.delZik);

	appApi.get('/ziks/:field/:val', apiRoute.getZikBy);

	app.use('/api', appApi);



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
	    	return (callback) ? callback(err) : null;
		}
    	logger.info(msg);		// Log all info about the config 
		_configureRoutes(); 	// Config the routes
		server = app.listen(process.env.PORT || 8080, config.server.host, function (err) {
			console.log(err);
			logger.info('[Server] Web server listening on ' + config.server.host + ':' + process.env.PORT || 8080);
			if (callback) callback();
		});
	});
};

/**
 * Stop the API Server
 * @param callback function called when the web server is no more listening
 */
var stop = function (callback) {
	if (server && typeof server.close == 'function') {
		server.close();
		mongo.stop();
		redis.stop();
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