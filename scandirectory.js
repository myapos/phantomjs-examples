// List all the files in a Tree of Directories
"use strict";
var system = require('system');

var myFunctions = require('./functions')
var htmlFiles = new Array();
var cssFiles = new Array();
if (system.args.length !== 2) {
    console.log("Usage: phantomjs scandir.js DIRECTORY_TO_SCAN");
    phantom.exit(1);
}

var scanDirectory = function (path) {
    var fs = require('fs');
    if (fs.exists(path) && fs.isFile(path)) {
        //console.log(path);
        if (path.indexOf('.html') !== -1){
            htmlFiles.push(path);
        } else if (path.indexOf('.css') !== -1) {
            cssFiles.push(path);
        }
    } else if (fs.isDirectory(path)) {
        fs.list(path).forEach(function (e) {
            if ( e !== "." && e !== ".." ) {    //< Avoid loops
                scanDirectory(path + '/' + e);
            }
        });
    }
};
scanDirectory(system.args[1]);
console.log('Number of Html Files: ' + htmlFiles.length, ' htmlFiles:', htmlFiles);
console.log('Number of Css Files: ' + cssFiles.length, ' cssFiles:', cssFiles);
myFunctions.checkFiles(htmlFiles);
//console.log('log:', htmlFiles[1],'url', url.url);
//checkFiles(url, cssFiles);
//phantom.exit();
