/** @module tfw.local-download */require( 'tfw.local-download', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

/**
 * @module tfw.local-download
 *
 * @description
 *
 *
 * @example
 * var mod = require('tfw.local-download');
 */


exports.saveAs = function( content, filename, mimetype ) {
    if( typeof filename === 'undefined' ) filename = "output.txt";
    if( typeof mimetype === 'undefined' ) mimetype = "text/plain";


    var a = document.createElement("a");
    a.setAttribute("href", "data:" + mimetype + ";charset=UTF-8,"
                   + encodeURIComponent(content));
    a.setAttribute("download", filename);
    a.setAttribute("title", filename);
    a.setAttribute("target", "download");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};


  
module.exports._ = _;
/**
 * @module tfw.local-download
 * @see module:$

 */
});