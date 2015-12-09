
/**
 * This API allows to CRUD nothing.
 */



/**
 * Load modules
 */

var jwt    = require('jsonwebtoken');

// Mine - Custom
var logger = require('../modules/logger');
var config = require('../modules/config');
var User   = require('../modules/user');



/**
 * Authentifucation for the API
 */
var isAuth = function (req,res,next) {
	// Check header or URL parameters or POST parameters for token
	var token = req.headers['api-token'];

	User.checkToken(token,function (err,decoded) {
	//console.log('Token for isAuth %s',token);
		if(err){
			// Sending a 401 will require authentication,
			return res.status(401);
  		}
		//res.status(200).send('Hi '+"LePseudo"+', You look at my protected page :-) !');
		return next();
  	});

};


/**
 * Route methods for /api/
 */


// POST /api/ziks
var addZik = function (req,res){
	User.addZik(req.body.title, req.body.author, (req.body.genre || 'Other'), function (err,data,msg){
		if(err){
			logger.warn(err.message);
			res.status(401).json();
		}else{
			logger.info(msg);
			res.status(200).json(data);
		}
	});

};


/**
 *
 * Ckeck if the field is in the request params.
 * Otherwise, send 401 Status && callback.
 */
var _checkParamFieldForList = function (field,res,cb) {
	if(!field){
		res.status(404);
		if(cb) return cb(new Error("Missing the field to execute the command"));
	}
	if(cb) return cb(null);
};


/**
 * GET /api/ziks
 * GET /api/ziks/list/:field/:val  ==> /api/ziks/title/Echo
 * Get all Ziks for the requested title,  author ou genre.
 */
var getAllZiks = function (req,res) {
/*
	_checkParamFieldForList(req.params.field, res,function (err) {
		if(err)
			return res.status(404).json({'err' : err.message});
	});

	_checkParamFieldForList(req.params.val, res,function (err) {
		if(err)
			return res.status(404).json({'err' : "Missing the value of the field to execute the command"});
	});
*/

	User.listerZik('title', null , function (err,datas,msg) {
		if(err){
			logger.warn(err.message);
			return res.status(401).json({'err' : err.message});
		}else{
			logger.info(msg );
			return res.status(200).json(datas);
		}
	});
};



/**
 * GET /api/zik/by/:field/:sort?
 * Get the sorted list of Ziks by field { title, author, genre }.
 * Can also have be sorted by {asc , desc} || ASC by default
 */
var listerSortedBy = function (req,res) {
	_checkParamFieldForList(req.params.field, res,function (err) {
		if(err)
			return res.status(404).json({'err' : err.message});
	});

	_checkParamFieldForList(req.params.sort, res,function (err) {
		if(err)
			req.params.sort = 'desc';
	});
	User.listerZikByField(req.params.field, req.params.sort, function (err,datas,msg) {
		if(err){
			logger.warn(err.message);
			return res.status(401).json({'err' : err.message});
		}else{
			logger.info(msg );
			return res.status(200).json(datas);
		}
	});
};

/**
 * GET /api/zik/:field/:val ==> GET /api/zik/title/Echo
 *
 */
var getZikBy = function (req,res) {
	_checkParamFieldForList(req.params.field, res,function (err) {
		if(err)
			return res.status(404).json({'err' : err.message});
	});
	_checkParamFieldForList(req.params.val, res,function (err) {
		if(err)
			return res.status(404).json({'err' : "Missing the value of the field to execute the command"});
	});

	User.getZik(req.params.field,req.params.val, function (err,data,msg) {
		if(err){
			logger.warn(err.message);
			return res.status(404).json({'err' : err.message});
		}else{
			logger.info(msg);
			return res.status(200).json(data);
		}
	});
};

/**
 * GEt /api/zik/:title
 *
 */
var getZik = function (req,res) {
	_checkParamFieldForList(req.params.title, res,function (err) {
		if(err)
			return res.status(404).json({'err' : err.message});
	});
	req.params.field = 'title';
	req.params.val = req.params.title;
	return getZikBy(req,res);
};


/**
 * PUT  /api/zik/:title
 * Update the Zik based on the old title.
 * Redirect to page Zik with the updated Zik.
 */
var majZik = function (req,res) {
	_checkParamFieldForList(!req.params.title, res,function (err) {
		if(err)
			return res.status(404).json({'err' : err.message});
	});

	User.updateZik(req.params.title,req.body.title,req.body.author,req.body.genre, function (err,data,msg){
		if(err){
			logger.warn(err.message);
			return 	res.status(404).json(err.message);
		}else{
			logger.info(msg);
			return res.status(200).json(data);
		}
	});

};

/***
 * DELETE  /api/zik/:title
 * Delete the specified zik by his title.
 */
var delZik = function (req,res) {
	_checkParamFieldForList(!req.params.title, res,function (err) {
		if(err)
			return res.status(404).json({'err' : "Missing the title to execute the command"});
	});
	User.deleteZik(req.params.title, function (err,msg) {
		if(err){
			logger.warn(err.message);
			return res.status(404).json({'err' : err.message});
		}else{
			logger.info(msg);
			return res.status(200);
		}
	});
};




/**
 * Exports
 */

// Methods
exports.isAuth		= isAuth;
exports.delZik      = delZik;
exports.getZik      = getZik;
exports.getZikBy    = getZikBy;
exports.sortedBy    = listerSortedBy;
exports.getAllZiks  = getAllZiks;
exports.postZiks    = addZik;
exports.updateZik   = majZik;

