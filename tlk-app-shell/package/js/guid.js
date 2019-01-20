/** @module guid */require( 'guid', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    var ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_";
var DATE_BASE = new Date(2017, 0, 1).getTime();

var lastId = null;
var counter = 0;

module.exports = function() {
    var x = Math.floor( (Date.now() - DATE_BASE) * .001 );
    var id = b64( x );
    if( lastId == id ){
        counter++;
        id += '.' + b64(counter);
    } else {
        // Reset the counter because this is a new ID.
        counter = 0;
    }
    lastId = id;
    return id;
};


function b64( x ) {
    var id = '', digit;
    while (x > 0) {
        digit = x & 63;
        id = ALPHABET.charAt(digit) + id;
        x -= digit;
        x >>= 6;
    }
    return id;
}


  
module.exports._ = _;
/**
 * @module guid
 * @see module:$

 */
});