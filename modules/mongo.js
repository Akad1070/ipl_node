
/**
 * =============================
 *
 * To handle the mongoDB*
 * =============================
 *
 * Attributes :
 *      -   _mongoClient : To Handle the mongoClient DB
 *		-   db : Get the connection to the mongoDB after the call of connect()
 *
 *
 *
 *
 * Methods :
 *		-   connect(port,dbname,cb)
 *      -   stop()
 *      -   getCollection(col,cb)
 *
 *
 * Events : /
 *
 * =============================
 */



/**
 * Load modules
 */

// Built-In
var _mongoClient = require('mongodb').MongoClient;

// Custom




/**
 * Variables
 */
 var _db;



/**
 * Connect to mongoDB by concat. the port, dbname
 * @param {String} port Port for the database
 * @param {String} dbname Name of the database
 * @param {Function} cb The function called after connected or not.
 * @return  The database object in the cb;
 */
var connect = function (port,dbname,cb) {
    var url = process.env.DB_MONGO_URL || 'mongodb://'+process.env.IP+':'+port+'/'+dbname;
    _mongoClient.connect(url, function(err, mongodb) {
        if(err)
            if(cb) return cb(new Error("[Mongo DB] Error on Connecting to "+url +" : " + err.message));
        _db = mongodb;
        //mongodb.collection('ziks').remove();
        if(cb) return cb(null,mongodb,"[Mongo DB] Connected to "+ url);
    });

};

/**
 * Called to stop the connection to the db.
 */
var stop = function (){
    if(_db && typeof _db.close === 'function')
        _db.close();
};


/**
 *  Get the specified name of collection OR return the db.
 *  @param {String} col The name of the collection required
 *  @param {Function} callback The callback function.
 */
var getCollection = function (col, callback) {
    _db.collection(col, function (err,colls){
        if(err)
            if (callback) return callback(new Error('[Mongo DB] Unable to retrieve collection ('+col+')'));
        if (callback) return callback(null, colls);
    });
};



/**
 *
 *
 *
 */
var selectAll = function (collects,cond,options,callback){
    var query = collects;
/*    if(options && options.distinct){
        query.distinct(options.distinct);
    }else{*/
        query = query.find(cond);

    if(options){
        if(options.sort)
            query.sort(options.sort);
        if(options.limit)
            query.limit(options.limit);
        if(options.fields){
            query.fields = options.fields;
            query.sort(query.fields);
        }
    }

    query.toArray(function (err, docs) {
    	if(err)
    		if(callback) return callback(new Error(' Error on listing all ziks'));
    	if(callback) return callback(null,docs);
    });

};


/**
 *  Get the specified collection
 *
 */
var selectOne = function (collects,select,where,options,callback) {
    return selectAll(collects,select,options,function (err, docs) {
		if(err)
			if(callback) return callback(new Error(' Error on finding '));
		if(callback) return callback(null,docs,' Found zik requested');
	});

};


var insert = function (collects,select,nObj,cond,options,cb) {
    collects.findOneAndReplace(select,nObj,cond, function (err, result) {
		if(err)
			if(cb) return cb(new Error(' Error on inserting '+nObj.titre));
		if(cb) return cb(null,nObj);
	});
};



var update = function (collects,oObj,nObj,callback){
    collects.findOneAndReplace(oObj, nObj
		,{
			returnOriginal: false // returns the updated document
			, upsert: true // Upsert the document if it does not exist.
		}
		,function (err, doc) {
			if(err)
				if(callback) return callback(new Error(' Error on updating '));
			if(callback) return callback(null,doc,' Updated ');
	});


};



var del = function (collects,select,cb){
	collects.findOneAndDelete(select,function (err, doc) {
		if(err)
			if(cb) return cb(new Error(' Error on deleting '));
		if(cb) return cb(null,' Deletd ');
	});
};

/**
 * Exports
 */

// Methods

exports.connect      = connect;
exports.getCollection= getCollection;
exports.stop         = stop;
exports.selectOne    = selectOne;
exports.selectAll    = selectAll;
exports.insert       = insert;
exports.update       = update;
exports.delete       = del;


