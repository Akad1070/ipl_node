
/**
 * This API allows to CRUD ziks.
 */

/**
 * Load modules
 */
 // Build - Install
var express = require('express');

// Mine - Custom
var logger = require('../modules/logger');
var User   = require('../modules/user');
var appZiks = express.Router();



var fields = ['author', 'genre', 'album','title','year'];


/**
 * Route methods for /Zik
 */



/**
 * Ckeck if the field is valid.
 * Otherwise, send 404 Status && callback.
 */
var checkParamField = function (req,res,next,field) {
	var err = 'No field provided';
	if(!field){
		logger.warn('[Server] '+err);
		return req.status(404).send(err);
	}	
	if(fields.indexOf(field) < 0){
		err = field + " : Unknown field";
		logger.warn('[Server] '+err);
		return req.status(404).send(err);
	}
	req.field = field;
	next();
};



/**
 * Check if the title provided in the URL is correct.
 */
var checkParamTitle = function (req,res,next,title) {
	User.getZik('title',title, function (err,zik,msg) {
		// If err throwned or zik is not founded
		if(err || !zik){
			logger.warn('[ZikDAO] '+err.message);
			return req.status(404).send(err);
		}
		logger.info('[ZikDAO] '+msg);
		req.zik = zik; // Put the zik in the request
		return next();
	});
};





var add = function (req,res){
	res.status(200).render('zik/add',{title : 'New Zik',header : 'Add a new Zik'});
	res.end();
};

var addPosted = function (req,res,next){
	User.addZik(req.body.title, req.body.author, (req.body.genre || 'Other'), function (err,zik,mess){
		if(err){
			logger.warn(err.message);
			res.status(401).send(err);
		}else{
			logger.info('[ZikDAO] DB Insertion of '+req.body.title);
			res.status(200).send(zik.title);
		}
		//req.params['field'] = 'title'; req.params['val'] = req.body.title;
	});

};


/**
 * Get all Ziks for the requested title,  author ou genre .
 */
var lister = function (req,res,next) {
	User.listerZik(req.params.field, req.params.val, function (err,datas,msg) {
		if(err){
			logger.warn(err.message);
			res.status(401);
		}else{
			logger.info('[ZikDAO] '+msg );
			res.status(200);
		}
		//console.dir(datas);
		res.render('zik/display',{
			    title  : 'Listing Zik'  ,header: 'Zik Page'
			    ,msg   : msg
			    ,type  :req.params.field
			    ,ziks  : datas
			});
		res.end();
	});
};



/**
 * Get the sorted list of Ziks by field { title, author, genre }.
 * Can also have be sorted by {asc , desc} || ASC by default
 */
var listerBy = function (req,res,next) {
	User.listerZikByField(req.field, req.params.sort, function (err,datas,msg) {
		if(err){
			logger.warn(err.message);
			res.status(401);
		}else{
			logger.info('[ZikDao] '+msg);
			res.status(200);
		}
		//console.log(datas);
		res.render('zik/list',{
				title : 'Listing zik by '+req.params.field
				,header : 'Zik Page'
				,msg : msg
				,type : req.params.field
				,list : datas
			});
		res.end();
	});
};


var getZik = function (req,res,next) {
	if(!req.params.val)
		res.status(404).send({msg : 'Which zik to display ?',zik : {}});

	User.getZik(req.params.field, req.params.val, function (err,data,msg) {
		if(err){
			logger.warn(err.message);
			res.status(404);
		}else{
			logger.info('[ZikDao] '+msg);
			res.status(200);
		}
		//console.log(data);
		res.render('zik/display',{
				title : 'Updating '+req.params.title
				,header : 'Updating \''+req.params.title+'\''
				,ziks : data
			});
	});


};


var update = function (req,res,next) {
	//console.log(data);
	res.render('zik/update',{
		title : 'Updating '+req.params.title
		,header : 'Updating \''+req.params.title+'\''
		,zik : req.zik
	});
};



/**
 * Update the Zik based on the old title.
 */
var updatePosted = function (req,res,next) {
	User.updateZik(req.params.title,req.body.title,req.body.author,req.body.genre
		, function (err,msg){
			if(err){
				logger.warn(err.message);
				return res.status(404).send(err);
			}else{
				logger.info('[ZikDao] '+msg);
				return res.status(200).send(msg);
			}
			//req.params['field'] = 'title'; req.params['val'] = data.title;
			//return res.render('update',{header : 'Updating \''+req.params.title+'\'',zik : data});
	});

};


var delZik = function (req,res,next) {
	User.getZik('title', req.params.title, function (err,data,msg) {
		if(err){
			logger.warn(err.message);
			res.status(404);
		}else{
			logger.info('[ZikDao] '+msg);
			res.status(200);
		}
		res.render('zik/del',
			{
				title : 'Deleting '+req.params.title
				,header : 'Deleting \''+req.params.title+'\''
				,zikTitle : req.params.title
			});
	});
};


var delZikPosted = function (req,res,next) {
	User.deleteZik(req.params.title, function (err,msg) {
		if(err){
			logger.warn(err.message);
			res.status(404);
		}else{
			logger.info('[ZikDao] '+msg);
			res.status(200);
		}
		res.end();
	});
};








	// Auth for all /zik/*
	//appZiks.all('/*', isAuth);
	
	appZiks.param('field',checkParamField);
	appZiks.param('title',checkParamTitle);

	appZiks.route('/add')
			.get(add)
			.post(addPosted);

	//		/ziks/by/author/desc
	appZiks.get('/by/:field/:sort?', listerBy);

	appZiks.route('/delete/:title')
			.get(delZik)
			.post(delZikPosted, lister);

	//		/ziks/list/title/Echo
	appZiks.get('/list/:field?/:val?',lister);

	appZiks.route('/update/:title')
			.get(update)
			.post(updatePosted);

	appZiks.get("/:field/:val",getZik);



/**
 * Exports
 */
exports	= appZiks;
