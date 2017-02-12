/** @module guid */require( 'guid', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    var ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$#";

module.exports = function() {
    var x = Math.floor(Date.now() / 1000);
    var id = '';
    var digit;
    while (x > 0) {
        digit = x & 63;
        id = ALPHABET.charAt(digit) + id;
        x -= digit;
        x >>= 6;
    }
    return id;
};


  
module.exports._ = _;
/**
 * @module guid
 * @see module:$

 */
});