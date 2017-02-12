/** @module test */require( 'test', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

var W = require("x-widget").getById;

exports.onFocus = function(v) {
    console.info("[test] W('dte').value=...", W('dte').value);
};


  
module.exports._ = _;
/**
 * @module test
 * @see module:$
 * @see module:x-widget

 */
});