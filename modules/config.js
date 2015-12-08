
/**
 * =============================
 *
 * Load config for the application from a config file
 * and allow access it easily.
 * Exports the config
 *
 * The values are in read-only mode. Please NEVER
 * update them. Any update will impact all the app...
 *
 * =============================
 *
 * Attributes :
 *		- All the config key-values in read-only mode.
 *
 * Methods :
 *		- load([callback])
 *
 * Events : /
 *
 * =============================
 */



/**
 * Load modules
 */

// Built-in
var fs  = require('fs');
// Custom
var logger = require('./logger.js');



/**
 * Variables
 */

// An array of files that will be used to find the config file
var file ;


/**
 * Set the filenames  in config
 *
 */
var init = function (filename,cb) {
	file = filename;
	if(cb) cb(null);
};


/**
 * Load configuration found in the config file.
 *
 * @param callback return an error or null
 */
var load = function (cb) {
	// Start loading config
	logger.info('[Config] Start loading config file: ' + file);
	// Read file content
	fs.readFile(file, function (err, data) {
		// If an error occured
		if (err && cb) return cb(new Error('[Config] Unable to read the config file ' + file + ': ' + err.message));
		try {
			// If file read
			// Populate config
			var parsedConfig = JSON.parse(data);
			for (var key in parsedConfig) {
				exports[key] = parsedConfig[key];
			}
			// Done
			logger.info('[Config] Config file ' + file + ' loaded');
			if (cb) return cb(null);
		} catch (err) {
			if (cb) cb(new Error('[Config] Unable to parse the config file ' + file + ': ' + err.message));
		}
	});
};



/**
 * Exports
 */

// Methods
exports.load = load;
exports.init = init;