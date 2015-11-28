

/**
 * =======================================
 * The DAO to handle the user collections
 * =======================================
 *
 * Attributes :
 *		-
 *
 * Methods :
 *		-   add ()
 *      -   getBy  ()
 *      -   getByField()
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
var redis	   = require('../redis');




/**
 *  Vars
 */




/**
 *  Insert the a value for the specified key;
 */
var insertVal = function (key,val,cb) {
    redis.insert(key,val, function(err, msg) {
        if(err)
            if(cb) return cb(new Error('[UserDAO] '+err.message));
        if(cb) return cb(null,msg);
    });
};



/**
 *  Insert the an object for the specified key;
 */
var insert = function (key,obj,cb) {
    redis.insertObj(key,obj, function(err, data) {
        if(err)
            if(cb) return cb(new Error('[UserDAO] '+err.message));
        if(cb) return cb(null,data);
    });
};


var insertWithDoubleKey = function (key,secKey,val,cb) {
    redis.insertWithDoubleKey(key,secKey, val,function (err,obj) {
        if(err)
            if(cb) return cb(new Error('[UserDAO] '+err.message));
        if(cb) return cb(null,obj);
    });
};




var getVal = function (key,cb) {
    redis.select(key, function (err,val) {
        if(err)
            if(cb) return cb(new Error('[UserDAO] '+err.message));
        if(cb) return cb(null,val);
    });
};


var getObj = function (key,cb) {
    redis.selectObj(key, function (err,obj) {
        if(err)
            if(cb) return cb(new Error('[UserDAO] '+err.message));
        if(cb) return cb(null,obj);
    });
};

var getWithDoubleKey = function (key,secKey,cb) {
    redis.selectWithDoubleKey(key,secKey, function (err,obj) {
        if(err)
            if(cb) return cb(new Error('[UserDAO] '+err.message));
        if(cb) return cb(null,obj);
    });
};


var del = function (key,cb) {
    redis.delete(key, function (err,reply) {
        if(err)
            if(cb) return cb(new Error('[UserDAO] '+err.message));
        if(cb) return cb(null,reply);
    });
};


var contains = function (key,cb) {
    redis.contains(key, function(err, reply) {
        if(err)
            if(cb) return cb(new Error(' Error on checking if exists '+key));
        if(cb) return cb(null,reply);
    });
};



var expiresIn = function (key,exp) {
    redis.client.expire(key, exp);
};




/**
 * Exports
 */

// Methods
exports.insertVal           = insertVal;
exports.insert              = insert;
exports.insertWithDoubleKey = insertWithDoubleKey;
exports.getVal              = getVal;
exports.get                 = getObj;
exports.getWithDoubleKey    = getWithDoubleKey;
exports.delete              = del;
exports.expiresIn           = expiresIn;
exports.exist               = contains;

