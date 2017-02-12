/** @module tfw.archive */require( 'tfw.archive', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    /**
 * @module tfw.archive
 *
 * @description
 * Permet de créer une archive zippée de fichiers avec arborescence.
 *
 * @example
 * var Archive = require('tfw.archive');
 * var new archive = new Archive();
 * archive.addText( "manifest.xml", manifest );
 * archive.addBlob( "terrain.bin", terrain );
 * archive.addImage( "thumbnail.png", img );
 * archive.addImageFromURL( "background.jpg", "http://images.io/favorite.jpg" );
 * archive.close().then( callback, onerror );
 */
"use strict";

require("polyfill.promise");
var Zip = require("tfw.zip");


var Archive = function() {
    this._files = [];
    this._promise = new Promise(function (resolve, reject) {
        // TODO: asynchronous loading of images from Internet.
        resolve();
    });
};

/**
 * @return void
 */
Archive.prototype.addText = function(filename, text, mimetype) {
    if( typeof mimetype === 'undefined' ) mimetype = "text/plain";

    this._files.push([ filename, new Blob([text]) ]);
    return this;
};


/**
 * @return void
 */
Archive.prototype.close = function(mimetype) {
    var that = this;

    if( typeof mimetype === 'undefined' ) mimetype = "application/zip";

    return new Promise(function (resolve, reject) {
        that._promise.then(function() {
            Zip.createWriter(new Zip.BlobWriter(mimetype), function(zipWriter) {
                function next() {
                    if (that._files.length == 0) {
                        zipWriter.close( resolve );
                    } else {
                        var file = that._files.pop();
                        zipWriter.add( file[0], new Zip.BlobReader(file[1]), next );
                    }
                }
                next();
            }, reject );
        }, function(err) {
            reject(err);
        });
    });
};


module.exports = Archive;


  
module.exports._ = _;
/**
 * @module tfw.archive
 * @see module:$
 * @see module:polyfill.promise
 * @see module:tfw.zip

 */
});