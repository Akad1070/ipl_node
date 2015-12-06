
/**
 * =============================
 *
 * To handle the redisDB
 * =============================
 *
 * Attributes :
 *      -   _redisClient : To Handle the redisClient DB
 *
 *
 *
 *
 * Methods :
 *		-   connect(port,dbname,cb)
 *      -   stop()
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
var redis = require('redis');

// Mine - Custom
var _client ;



/**
 * Connect to redis
 * @param {String} port Port for the database
 * @param {String} Name of the db
 * @param {Function} cb The function called after connected or not.
 */
var connect = function (port,cb) {
    var url = process.env.DB_REDIS_URL || 'redis://'+process.env.IP+':'+port;
    _client = redis.createClient(url);
    _client.on('connect',function(err) {
        if(err)
            if(cb) return cb(new Error('[Redis] Error on connecting the client'));
        if(cb) return cb(null,'[Redis DB] Connected on '+url);
    });
};


var disconnect = function () {
    if(_client)
        _client.quit;
};


var insert = function (key,val,cb) {
    var insert = ('OK' === _client.set(key, val, redis.print));
    if(cb)
        return cb( (insert) ? (null,key +' has been saved') : (new Error(' Error on saving '+key)));
    return null;
};



var insertObj = function (key,obj,cb) {
    _client.hmset(key, obj, function(err, reply) {
        if(err)
            if(cb) return cb(new Error(' Error on getting '+key));
        if(cb) return cb(null,reply);
    });
};


var insertWithDoubleKey = function (key,secKey,val,cb) {
     _client.hset(key, secKey,val,function(err, reply) {
        if(err)
            if(cb) return cb(new Error(' Error on getting val for '+key +'-'+secKey));
        if(cb) return cb(null,reply);
    });
};



var select = function (key,cb) {
    _client.get(key, function(err, reply) {
        if(err)
            if(cb) return cb(new Error(' Error on getting '+key));
        if(cb) return cb(null,reply);
    });
};


var selectObj = function (key,cb) {
     _client.hgetall(key, function(err, reply) {
        if(err)
            if(cb) return cb(new Error(' Error on getting {object} for '+key));
        if(cb) return cb(null,reply);
    });
};


var selectWithDoubleKey = function (key,secKey,cb) {
     _client.hget(key, secKey,function(err, reply) {
        if(err)
            if(cb) return cb(new Error(' Error on getting val for '+key +'-'+secKey));
        if(cb) return cb(null,reply);
    });
};



var contains = function (key,cb) {
    _client.exists(key, function(err, reply) {
        if(err)
            if(cb) return cb(new Error(' Error on checking if exists '+key));
        var exist = (reply === 1);
        if(cb) return cb(null,exist);
        return exist;
    });
};



var del = function (key,cb) {
    _client.del(key, function(err, reply) {
        if(err)
            if(cb) return cb(new Error(' Error on deleting '+key));
        if(cb) return cb(null,reply);
    });
};







/**
 * Exports
 */

// Methods
exports.client              = _client;
exports.connect             = connect;
exports.stop                = disconnect;

exports.contains            = contains;
exports.delete              = del;
exports.insert              = insert;
exports.insertObj           = insertObj;
exports.insertWithDoubleKey = insertWithDoubleKey;
exports.select              = select;
exports.selectObj           = selectObj;
exports.selectWithDoubleKey = selectWithDoubleKey;


