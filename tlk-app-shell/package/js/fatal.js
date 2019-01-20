/** @module fatal */require( 'fatal', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";


module.exports = function( reject, msg, ex ) {
    if( typeof reject === 'string' ) {
        ex = msg;
        msg = reject;
        reject = null;
    }
    console.error( msg, ex );
    if( typeof reject === 'function' ) {
        reject( msg );
    }
    return false;
};


  
module.exports._ = _;
/**
 * @module fatal
 * @see module:$

 */
});