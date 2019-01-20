/** @module polyfill.string */require( 'polyfill.string', function(require, module, exports) { var _=function(){var D={"en":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    // IE11 doe not support String.toLowerCase().
if (typeof String.toLowerCase !== 'function') {
    String.toLowerCase = function(v) { return v.toLowerCase(); };
    String.toUpperCase = function(v) { return v.toUpperCase(); };
    String.trim = function(v) { return v.trim(); };
}


  
module.exports._ = _;
/**
 * @module polyfill.string
 * @see module:$

 */
});