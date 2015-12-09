
/**
 * This API allows to CRUD ziks.
 */



/**
 * Load modules
 */

// Mine - Custom
var logger = require('../modules/logger');
var User   = require('../modules/user');




var fields = ['author', 'genre', 'album','title','year'];


/**
 * Route methods for /Zik
 */

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


var checkField = function (req,res,next,field) {
	if(fields.indexOf(field) < 0){
		var err = field +" : Unknown field";
		logger.warn('[Server] '+err);
		return req.status(404).send(err);
	}
	next();
}



/**
 * Check if the title provided in the URL is correct.
 * 
 */
var checkTitle = function (req,res,next,title) {
	User.getZik('title',title, function (err,zik,msg) {
		// If err throwned or zik is not founded
		if(err || !zik){
			logger.warn('[ZikDAO] '+err.message);
			return req.status(404).send(err);
		}
		logger.info('[ZikDAO] '+msg);
		req.zik = zik;
		return next();
	});
};





/**
 * Ckeck if the field is in the request params.
 * Otherwise, send 401 Status && callback.
 */
var _checkParamFieldForList = function (field,res,cb) {
	if(!field){
		res.status(404);
		if(cb) return cb(new Error());
	}
	if(cb) return cb(null);
};


/**
 * Get all Ziks for the requested title,  author ou genre .
 */
var lister = function (req,res,next) {
	if(!req.params.field){
		res.status(404);
		return res.render('zik/list',{
			header : 'Zik Page'
			,msg : 'Missing the field for the listing'
			,list : {}
		});
	}

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
	if(!req.params.field){
		res.status(404);
		return res.render('zik/list',{
			header : 'Zik Page'
			,msg : 'Missing the field for the listing'
			,list : {}
		});
	}

	User.listerZikByField(req.params.field, req.params.sort, function (err,datas,msg) {
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
	if(!req.params.field || !req.params.val){
		res.status(404);
		return res.render('zik/display',{
			header : 'Get a Zik'
			,msg : 'Which zik to display ?'
			,zik : {}
		});
	}

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


var majZik = function (req,res,next) {
	if(!req.params.title){
		res.status(404);
		return res.render('zik/update',{
			header : 'Update a Zik'
			,msg : 'Which zik to update ?'
			,zik : {}
		});
	}

		//console.log(data);
	res.render('zik/update',{
		title : 'Updating '+req.params.title
		,header : 'Updating \''+req.params.title+'\''
		,zik : req.zik
	});
};



/**
 * Update the Zik based on the old title.
 * Redirect to page Zik with the updated Zik.
 */
var majZikPosted = function (req,res,next) {
	if(!req.params.title){
		res.status(404);
		return res.render('update',{
			header : 'Update a Zik'
			,msg : 'Which zik to update ?'
			,zik : {}
		});
	}

	User.updateZik(req.params.title
		,req.body.title,req.body.author,req.body.genre
		, function (err,data,msg){
			if(err){
				logger.warn(err.message);
				return res.status(404).send(err);
			}else{
				logger.info('[ZikDao] '+msg);
				return res.status(200).send(data);
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
	if(!req.params.title){
		res.status(404);
		return res.render('delete',{
			header : 'Update a Zik'
			,msg : 'Which zik to delete ?'
			,zik : {}
		});
	}
	User.deleteZik(req.params.title, function (err,msg) {
		if(err){
			logger.warn(err.message);
			res.status(404);
		}else{
			logger.info('[ZikDao] '+msg);
			res.status(200);
		}
		req.params['field'] = 'title';
		return next();
	});
};














/**
 * Exports
 */

// Methods

exports.checkParamTitle	= checkTitle;
exports.checkParamField	= checkField;

exports.add        		= add;
exports.addPosted		= addPosted;

exports.get 			= getZik;

exports.list			= lister;
exports.listBy			= listerBy;

exports.update			= majZik;
exports.updatePosted	= majZikPosted;

exports.del				= delZik;
exports.delPosted		= delZikPosted;