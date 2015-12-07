
/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
// Leave the above lines for propper jshinting
//Type Node.js Here :)
"use strict";

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

    server.start(function (err){
        // if(err) process.kill(process.pid, 'SIGTERM');
        if(err) process.exit(0);;
    });
});


var exitMusic = function () {
  server.stop(function () {
    process.exit(0);
  });
};



// If Exception 
process.on('uncaughtException', exitMusic);
// If ctrl+c
process.on('SIGTERM', exitMusic);

