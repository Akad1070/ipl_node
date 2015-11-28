

/**
 * =============================
 *
 * Main application.
 *
 * =============================
 *
 * Attributes : /
 *
 * Methods : /
 *
 * Events : /
 *
 * =============================
 */


/**
 * Load modules
 */

// Custom
var config = require('./modules/config.js');
var server = require('./modules/server.js');



/**
 * Load config and print tests
 */

process.chdir(__dirname);


config.init('config.json');

config.load(function () {
    server.start();
});
