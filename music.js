
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
var throng = require('throng');

// Custom
var config = require('./modules/config.js');
var server = require('./modules/server.js');





/**
 * VARS 
 */
var WORKERS = process.env.WEB_CONCURRENCY || 1;




/**
 * Load config and print tests
 */

//  Change the process's working directory into the directory path 
//  of the file (__dirname) being executed.
process.chdir(__dirname);


// Handle the cluster
throng(server.start, {
  workers: WORKERS,
  lifetime: Infinity // Minimum time to keep the Cluster alive
});


config.init('config.json');

config.load(function () {
    server.start(function () {
        process.on('SIGTERM', exitMusic); // // If ctrl+c
        process.on('uncaughtException', exitMusic); // // If Exception 
    });
});

var exitMusic = function () {
  server.stop(function () {
    process.exit(0);
  });
};
