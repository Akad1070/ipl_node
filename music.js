
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

/*
//  Handle the cluster
throng(config.load, {
  workers: WORKERS,
  lifetime: Infinity // Minimum time to keep the Cluster alive
});
*/

//  Set the file name for the config
config.init('config.json');

//  Launch the config's loading 
config.load(function (err) {
  if(err) exitMusic();
  //  Callback to start the server
    server.start(function (err) {
      if(err) exitMusic();
    });
});

var exitMusic = function () {
  server.stop(function () {
    return process.kill(process.pid,'SIGTERM');
  });
};

// If ctrl+c
process.on('SIGINT', exitMusic); 
process.on('SIGTERM', exitMusic); 
// If Exception 
process.on('uncaughtException', exitMusic);