
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






var signup = function (user,cb) {
	userDAO.exist(user.pseudo, function (err, alreadyExists){
		if(err) if(cb) return cb(err);

		if(alreadyExists)
			if(cb) return cb(null,user.pseudo +' has been already token. Choose another');

		// Generate a salt
	    bcrypt.genSalt(8, function(err, salt) {
	        if (err)	if(cb) return cb(err);
	        // Hash the password using our new salt
	        bcrypt.hash(user.passwd, salt, function(err, hash) {
	            if (err) if(cb) return cb(err);

	            // Override the password with the hashed
	            user.passwd = hash;
	            delete(user.passwd2);
				userDAO.insert(user.pseudo,user,function (err,data) {
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
	console.log('Pseudo : ',pseudo);
	userDAO.get(pseudo, function (err,dbUser) {
		if(err)	if(cb) return cb(err);

		if(pseudo !== dbUser.pseudo)
			if(cb) return cb(new Error("[User] This user "+ pseudo +" doesn't exists in our system.<br>"));

		// If the 2 password !=
		bcrypt.compare(pass, dbUser.passwd, function(err, isMatch) {
    		if (err)
    			if(cb) return cb(new Error("[User] Error while checking the password for "+ pseudo));

			if(!isMatch)
				if(cb) return cb(new Error("[User] The password for "+ pseudo +" is incorrect"));

			// Get the user in REDiS
			userDAO.getVal('token+'+dbUser.pseudo,function (err, token) {
			    if(err || !token)
			    	token = genToken(dbUser);

		    	dbUser['token'] = token;
   				if(cb) return cb(null,dbUser,('[User] Auth User('+ pseudo +') :=: Okay'));
			});
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
	var token = jwt.sign(dbUser,cryptKey,{
		expiresIn : config.expiration
	});

	userDAO.insertVal('token+'+dbUser.pseudo,token,function (err,msg){
		if(err)
			return err.message;
		//userDAO.expiresIn('token+'+dbUser.pseudo,config.expiration);
		return token;
	});

};


/**
 *
 */
var checkUserToken = function (token,cb) {
	if (token) {
		// verifies secret and checks
		var cryptKey = new Buffer(config.secretkey, 'base64').toString('ascii');
		jwt.verify(token, cryptKey, function(err, decoded) {
			if (err)	return ( (cb) ? cb(err) : null);
				// if everything is good, cb(decoded token)
			if(cb)		return cb(null,decoded);
		});
  	}else{
		if(cb)  return cb(new Error("No token provided"));
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
	if(tit && typeof tit == 'string'){
		if(aut && typeof aut == 'string'){
			if(gen && typeof gen == 'string'){
				zikDAO.add({'title' : tit},{'title' : tit, 'author' : aut, 'genre' : gen}, function (err,data,msg){
					if(err)	if(cb) return cb(err);
					if(cb) return cb(null,data,'[ZikDAO] '+msg);
				});
			}
		}
	}
	//if(cb) return cb(new Error('[User] Some field from the zik are incorrect { title : '+tit+', author : '+ aut+', genre : '+gen+'}'));
};



var listerZik = function (fd,val,cb) {
	var obj = {};
	if(fd && typeof fd == 'string'&&val)
		obj[fd] = val;
	return zikDAO.list(obj,cb);
};


var listerZikBy = function (fd,val,cb) {
	var obj = {'fields' : {}};
	if(fd && typeof fd == 'string'){
		obj['fields'][fd] = (val && val.toLowerCase() === 'desc' ? -1 : 1 );
		obj['distinct'] = fd;
	}
	return zikDAO.listSortedByField(obj,cb);
};


var getZik = function (fd,val,cb) {
	if(fd && typeof fd == 'string' && val){
		var obj = {};	obj[fd] = val;
		return zikDAO.getZik(obj,cb);
	}
};


var majZik = function (oldTitle,nTit,nAut,nGen,cb) {
	if(oldTitle && typeof oldTitle == 'string'){
		return zikDAO.update(
			{'title' : oldTitle}
			,{'title' : nTit, 'author' : nAut, 'genre' : nGen}
			,cb
		);
	}
	// Need oldTitle for the find
	if(cb) return cb(new Error('[User] Need the title before updating'));
};


var delZik = function (title,cb) {
	if(title && typeof title == 'string')
		return zikDAO.del({'title' : title},cb);
	if(cb) return cb(new Error('[User] Need the title before deleting'));
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


