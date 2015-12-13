
/**
 * ===========================================
 *
 * To Handle all the actions made by the user
 *
 * ===========================================
 *
 * Attributes :
 *		- All the config key-values in read-only mode.
 *
 * Methods :
 *		- 	check (pseudo,pass,callback)
 *      - 	genToken (cb)
 * 		- 	checkUserToken (token,cb)
 *		-	addZik(tit,aut,gen,cb)
 * 		-	listerZik(field,value,cb)
 * 		-	listerZikBy(field,value,cb)
 * 		-	getZik(field,value,cb)
 * 		-	majZik(value,cb)
 * 		-	delZik(value,cb)
 *
 *
 * Events : /
 *
 * ==================================================
 */



/**
 * Load modules
 */
var jwt     = require('jsonwebtoken');
var bcrypt 	= require('bcrypt');

// Mine - Custom
var config  = require('./config');
var userDAO = require('./dao/userDAO');
var zikDAO  = require('./dao/zikDAO');





/**
 * My private vars
 */
var _retData	= null,
	_retErr	= null
;




/**
 * Handle the user
 */
var signup = function (user,cb) {
	userDAO.exist(user.pseudo.trim(), function (err, alreadyExists){
		if(err)	return ((cb) ? cb(err) : err);

		if(alreadyExists){
			_retErr = user.pseudo +' has been already token. Choose another';
			return ( cb ? cb(null,_retErr) : _retErr);
		}

		// Generate a salt
	    bcrypt.genSalt(8, function(err, salt) {
	        if(err)	return ((cb) ? cb(err) : err);
	        
	        // Hash the password using our new salt
	        bcrypt.hash(user.passwd, salt, function(err, hash) {
	    		if(err)	return ((cb) ? cb(err) : err);

	            user.passwd = hash;	// Override the password with the hashed
	            delete(user.passwd2); // Remove the passwd2 from the object
				userDAO.insert(user.pseudo.trim(),user,function (err,data) {
					if(err)
						if(cb) return cb(err);
	        		if(cb) return cb(null,user.pseudo +' has been inserted into our system.');
				});
	        });
	    });
	});
};



/**
 * Check the user.
 *
 * @param {String} pseudo The user pseudo/login
 * @param {String} pass The user password
 * @param {Function} cb Callback Function called when the user details is incorrect
 */
var login = function (pseudo,pass,cb){
	pseudo = pseudo.trim();
	pass = pass.trim();
	userDAO.get(pseudo, function (err,dbUser) {
		if(err)	return ((cb) ? cb(err) : err);

		if(!dbUser || pseudo !== dbUser.pseudo){
			_retErr = new Error("[User] This user '"+ pseudo +"' doesn't exists in our system");
			return ((cb) ? cb(_retErr) : _retErr);
		}

		// If the 2 password !=
		bcrypt.compare(pass, dbUser.passwd, function(err, isMatch) {
    		if (err){
    			_retErr = new Error("[User] Error while checking the password for "+ pseudo);
				return ((cb) ? cb(_retErr) : _retErr);
    		}

			if(!isMatch){
				_retErr = new Error("[User] The password for "+ pseudo +" is incorrect");
				return ((cb) ? cb(_retErr) : _retErr);
			}
			_retData = genToken(dbUser);
   			if(cb) return cb(null,_retData,('[User] Auth User('+ pseudo +') :=: Okay'));
   			return _retData;
		});
	});
};

/**
 * Create a token for the user connected
 */
var genToken = function (dbUser) {
	// Krypt the main secret key for the user
	var cryptKey = new Buffer(config.secretkey, 'base64').toString('ascii');

	// Generate the token with the user pseudo & passwd
	return jwt.sign(dbUser,cryptKey,{expiresIn : config.expiration});
};


var checkUserToken = function (token,cb) {
	if (token) {
		// verifies secret and checks
		var cryptKey = new Buffer(config.secretkey, 'base64').toString('ascii');
		jwt.verify(token, cryptKey, function(err, decoded) {
			if(err)	return((cb) ? cb(err) : err);
			// if everything is good, cb(decoded token)
			return ((cb) ? cb(null,decoded) : decoded);
		});
  	}else{
  		_retErr = new Error("No token provided");
		return (cb ? cb(_retErr) : _retErr);
  	}

};



/**
 *	Insert a new zik into ziks Collections.
 * @param {String	tit	The title of zik.Cannot be null
 * @param {String	aut	The artist of zik.Cannot be null
 * @param {String	gen	The genre of zik..Cannot be null
 * @param {Function} cb	The Callback function
 * @return Wheter an Error or a specific msg via the callback.
 */
var addZik = function (tit,aut,gen,cb) {
	var nZik = {},	missing = null;

	// Check if all fields required for a zik is present
	// Otherwise, add in the var missing the field missing or incorrect.
	if(tit && typeof tit == 'string'){
		nZik['title'] = tit.trim();
		if(aut && typeof aut == 'string'){
			nZik['author'] = aut.trim();
			if(gen && typeof gen == 'string'){
				nZik['genre'] = gen.trim();
				zikDAO.add({'title' : tit.trim()},nZik, function (err,data,msg){
					if(err)
						return ( cb ? cb(err) : err);
					return (cb ? cb(null,data,msg) :  {'data':data,'msg':msg});
				});
			}else{	missing += ', genre : '+gen+"\'";}
		}else{	missing +=	', author : '+ aut+"\'";}
	}else{	missing = '[User] Some field from the zik are incorrect' + '{ title : '+tit+"\'";}
	
	// If I got any missing error, send a Error(missing)
	if(missing)
		return (cb ? cb(new Error(missing += '}')) : new Error(missing += '}'));
	
};


/**
 * 
 */
var listerZik = function (fd,val,cb) {
	var obj = {};
	if(fd && typeof fd == 'string' && val)
		obj[fd] = val;
	return zikDAO.list(obj,cb);
};


/**
 * Get the list of the field 
 */
var listerZikBy = function (fd,val,cb) {
	var obj = {'fields' : {}};
	if(fd && typeof fd == 'string'){
		obj['fields'][fd] = (val && val.toLowerCase() === 'desc' ? -1 : 1 );
		obj['distinct'] = fd;
	}
	return zikDAO.listSortedByField(obj,cb);
};

/**
 * Get the zik requested by the field and his value;
 */
var getZik = function (fd,val,cb) {
	if(fd && typeof fd == 'string' && val){
		var obj = {}; obj[fd.trim()] = val.trim();
		return zikDAO.getZik(obj,cb);
	}
	_retErr = new Error('[User] Need the field or value to retrieve the zik');
	return ( (cb) ? cb(_retErr) : _retErr);
};


var majZik = function (oldTitle,nTit,nAut,nGen,cb) {
	if(oldTitle && typeof oldTitle == 'string'){
		return zikDAO.update({'title' : oldTitle}
			,{'title' : nTit, 'author' : nAut, 'genre' : nGen}
			,cb
		);
	}
	// Need oldTitle for the find
	_retErr = new Error('[User] Need the title before updating');
	return ( (cb) ? cb(_retErr) : _retErr);
};



var delZik = function (title,cb) {
	if(title && typeof title == 'string')
		return zikDAO.del({'title' : title},cb);
	_retErr = new Error('[User] Need the title before deleting');
	return ((cb) ? cb(_retErr) : _retErr);
};







/**
 * Exports
 */

// Methods realeted to Login
exports.signup            = signup;
exports.login             = login;
exports.genToken          = genToken;
exports.checkToken        = checkUserToken;


// Methods realeted to Zik
exports.addZik            = addZik;
exports.deleteZik         = delZik;
exports.getZik            = getZik;
exports.listerZik         = listerZik;
exports.listerZikByField  = listerZikBy;
exports.updateZik         = majZik;


