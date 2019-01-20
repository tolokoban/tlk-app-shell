/** @module files */require( 'files', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    /**
 * Tools for files.
 */
"use strict";

var FS = require("node://fs");
var Fatal = require("fatal");


/**
 * Save a blob to a file.
 * Resolves to the filename.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Blob#Example_for_extracting_data_from_a_Blob
 */
exports.saveBlob = function( filename, blob ) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.addEventListener("loadend", function() {
            var data = new Buffer( reader.result );
            FS.writeFile( filename, data, function( err ) {
                if( err ) reject( err );
                else resolve( filename );
            });
        });
        reader.readAsArrayBuffer( blob );
    });
};

/**
 * Save an JSON representation of an object to a file.
 * Resolves to `data`.
 */
exports.writeJson = function( filename, data ) {
    return new Promise(function (resolve, reject) {
        exports.mkdir( dirname( filename ) ).then(function() {
            var text = JSON.stringify( data );
            FS.writeFile( filename, text, function( err ) {
                if( err ) Fatal( reject, "Unable to write file `" + filename + "`!",  err );
                else resolve( data );
            });
        });
    });
};

/**
 * Load a file and parse it as a JSON.
 * Resolves to the object.
 */
exports.readJson = function( filename ) {
    return new Promise(function (resolve, reject) {
        FS.readFile( filename, function( err, data ) {
            if( err ) Fatal( reject, "Unable to read file `" + filename + "`!",  err );
            else {
                try {
                    resolve( JSON.parse( data.toString() ) );
                } catch( ex ) {
                    Fatal( reject, "Unable to parse JSON file `" + filename + "`!",
                           { ex: ex, data: data } );
                }
            }
        });
    });
};

exports.copy = function( src, dst ) {
    return new Promise(function (resolve, reject) {
        FS.readFile( src, function( err, data ) {
            if( err ) Fatal( reject, "Unable to read file `" + src + "`!", {
                err: err, src: src, dst: dst
            });
            else {
                var path = dirname( dst );
                exports.mkdir( path ).then(function() {
                    FS.writeFile( dst, data, function( err ) {
                        if( err ) Fatal( reject, "Unable to write file `" + dst + "`!", {
                            err: err, src: src, dst: dst
                        });
                        else {
                            resolve();
                        }
                    });
                }, reject);
            }
        });
    });
};

/**
 * Create directories recursively.
 * If they are already created, no problem.
 * Resolves in `undefined`.
 */
exports.mkdir = function(folder) {
    var sep = findSeparator(folder);
    var folders = folder.split( sep );
    var dir = '.';
    var directories = [];
    folders.forEach(function (folder) {
        if( folder.length == 2 && folder.charAt(1) == ':' ) {
            // dealing with windows drive letter (example: `C:`).
            dir = folder;
        } else {
            dir += sep + folder;
        }
        directories.push( dir );
    });

    return new Promise(function (resolve, reject) {
        var next = function() {
            if( directories.length == 0 ) {
                resolve();
                return;
            }
            var dir = directories.shift();
            if( FS.existsSync( dir ) ) {
                next();
            } else {
                FS.mkdir( dir, function( err ) {
                    if( err ) reject( err );
                    else next();
                });
            }
        };

        next();
    });
};

exports.delete = function( filename ) {
    return new Promise(function (resolve, reject) {
        FS.unlink( filename, function( err ) {
            if( err ) Fatal( reject, "Unable to delete file `" + filename + "`!", err );
            else resolve( filename );
        });
    });
};

exports.read = function( filename ) {
    return new Promise(function (resolve, reject) {
        FS.readFile( filename, function( err, data ) {
            if( err ) Fatal( reject, "Unable to read file `" + filename + "`!", err );
            else resolve( data );
        });
    });
};

exports.write = function( filename, data ) {
    return new Promise(function (resolve, reject) {
        exports.mkdir( dirname( filename ) ).then(function() {
            FS.writeFile( filename, data, function( err ) {
                if( err ) Fatal( reject, "Unable to write file `" + filename + "`!",
                                 { ex: err, data: data } );
                else resolve( data );
            });
        }, reject );
    });
};

/**
 * Remove the filename at the end of `path`.
 */
function dirname( path ) {
    var pos = path.lastIndexOf( findSeparator(path) );
    if( pos == -1 ) return path;
    return path.substr(0, pos);
}

/**
 * Return path separator: `/` or `\`.
 * The better is to avoid unix-like path with `\`.
 */
function findSeparator( path ) {
    var backslash = path.split('\\').length;
    var slash = path.split('/').length;
    if( backslash > slash ) return '\\';
    return '/';
}


  
module.exports._ = _;
/**
 * @module files
 * @see module:$
 * @see module:fatal

 */
});