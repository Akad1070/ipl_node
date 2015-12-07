

/**
 * =======================================
 * The DAO to handle the zik collections
 * =======================================
 *
 * Attributes :
 *		-
 *
 * Methods :
 *		-   add ()
 *      -   listBy  ()
 *      -   listnSortByField ()
 *      -   getBy ()
 *
 *
 * Events : /
 *
 * =======================================
 */


/**
 * Load modules
 */
// Built-in


// Mine - Custom
var config	   = require('../config');
var mongo	   = require('../mongo');




/**
 *  Vars
 */




/**
 *  Insert the specified nObj if no exist into the zik documents.
 *  Otherwise, upsert with the nObj.
 */
var add = function (selectObj,nObj,cb) {
	mongo.getCollection(config.db.mongo.collections.musics, function (err,docZiks) {
		if(err)
			if(cb) return cb(err);

		mongo.insert(docZiks,selectObj,nObj,{ upsert: true},function (err, result) {
			if(err)
				if(cb) return cb(' '+err);
			if(cb) return cb(null,result,'Inserted of '+result.title);
		});
	});
};



/**
 * List all ziks
 * @param {Object}      obj     The obj containing the field & value.
 * @param {Function}    cb      Callback Function
 */
var listBy = function (obj,cb) {
	mongo.getCollection(config.db.mongo.collections.musics, function (err,collects){
		if(err)
			if(cb) return cb(err);

		mongo.selectAll(collects,obj,null,function (err, docs) {
			var val = obj[Object.keys(obj)[0]]  || 'all' ;  val = '\''+val+'\'';
			if(err)
				if(cb) return cb(new Error('[ZikDao] '+err.message + ' for '+val));
			if(cb) return cb(null,docs,'Found '+docs.length+' zik(s) for '+ val);
		});

	});
};



/**
 * List & Sort all ziks according to the specified field.
 * @param {Object}      obj     The obj containing the field & value.
 * @param {Function}    cb  Callback Function
 */
var listnSortByField = function (obj,cb) {
	mongo.getCollection(config.db.mongo.collections.musics , function (err,docZiks){
		if(err)	return ( (cb) ? cb(err) : null);
		mongo.selectAll(docZiks,{},obj,function (err, docs) {
			var val = Object.keys(obj['fields'])[0]  || 'all';
			if(err)
				if(cb) return ( (cb) ? cb(new Error('[ZikDao]  '+err.message + ' by '+val)): null);
			if(cb) return cb(null,docs,'Found '+docs.length+' zik(s) by '+ val);
		});

	});
};



/**
 * List one zik by the field specified field.
 * @param {Object}      obj     The obj containing the field & value.
 * @param {Function}    cb      Callback Function
 */
var getZikBy = function (obj,cb) {
	mongo.getCollection(config.db.mongo.collections.musics , function (err,docZiks){
		if(err) return ( (cb) ? cb(err) : null);
		/*
		docZiks.find(obj).limit(1).toArray(function (err, doc) {
			var val = '\''+obj[Object.keys(obj)[0]] +'\'';
			if(err)
				if(cb) return cb(new Error('[ZikDao]  Error on finding '+val));
			if(cb) return cb(null,doc[0],' Found zik requested');
		});
		*/
		mongo.selectOne(docZiks,obj,null,{'limit' : 1},function (err, docs,msg) {
			var val = '\''+obj[Object.keys(obj)[0]] +'\'';
			if(err)
				if(cb) return cb(' '+err.message+val);
			if(cb) return cb(null,docs[0],msg);
		});

	});
};




var maj = function  (oldTitle,obj,cb) {
	mongo.getCollection(config.db.mongo.collections.musics, function (err,docZiks,msg) {
		if(err) return ( (cb) ? cb(err) : null);

		mongo.update(docZiks,oldTitle,obj,function (err, doc) {
			var val = '\''+oldTitle +'\'';
			if(err)
				if(cb) return cb(' '+err.message+val);
			if(cb) return cb(null,doc.value,msg+val);
		});

	});
};



var del = function (title,cb) {
	mongo.getCollection(config.db.mongo.collections.musics, function (err,docZiks) {
		if(err) return ( (cb) ? cb(err) : null);

		mongo.delete(docZiks,title,function (err,msg) {
			var val = '\''+title +'\'';
			if(err)
				if(cb) return cb(' '+err.message+val);
			if(cb) return cb(null,msg+val);
		});

	});
};










/**
 * Exports
 */

// Methods
exports.add               = add;

exports.del               = del;

exports.getZik            = getZikBy;

exports.list              = listBy;
exports.listSortedByField = listnSortByField;

exports.update            = maj;


