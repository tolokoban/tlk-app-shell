/** @module date */require( 'date', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";


exports.now = function() {
    return Math.floor( Date.now() * .001 );    
};


/**
 * @param {number} dat - Number of seconds since UNIX epoc (UTC).
 * @return Age in seconds.
 */
exports.age = function( dat ) {
    return exports.now() - dat;
};


exports.toDate = function( dat ) {
    return new Date( dat * 1000 );
};


exports.toYMD = function( dat ) {
    if( typeof dat !== 'number' ) return null;

    var d = exports.toDate( dat );
    var Y = d.getFullYear();
    var M = d.getMonth() + 1;
    if( Y < 10 ) Y = '0' + Y;
    var D = d.getDate() + 1;
    if( D < 10 ) D = '0' + D;
    
    return Y + "-" + M + "-" + D;
};


exports.fromYMD = function( ymd ) {
    if( typeof ymd !== 'string' ) return null;
    if( ymd.length < 10 ) return null;

    var Y = parseInt( ymd.substr( 0, 4 ) );
    var M = parseInt( ymd.substr( 5, 2 ) );
    var D = parseInt( ymd.substr( 8, 2 ) );
    var objDate = new Date( Y, M - 1, D );

    return objDate.getTime() * .001;
};


  
module.exports._ = _;
/**
 * @module date
 * @see module:$

 */
});