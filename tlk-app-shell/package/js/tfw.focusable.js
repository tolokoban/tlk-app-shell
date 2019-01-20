/** @module tfw.focusable */require( 'tfw.focusable', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

var $ = require("dom");
var DB = require("tfw.data-binding");

/**
 * ```
 * var Focusable = require("tfw.focusable");
 * 
 * function Showhide( opts ) {
 *     var that = this;
 * 
 *     var elem = $.elem( this, 'div', 'wdg-showhide', 'theme-elevation-2', [...] );
 * 
 *     Focusable( this, function(evt) {
 *         switch( evt.keyCode ) {
 *         case 13:
 *         case 32:
 *             that.value = !that.value;
 *             break;
 *         }
 *     });
 * ```
 */
var Focusable = function( widget, onKeyDown ) {
    if( typeof onKeyDown !== 'function' ) onKeyDown = function() {};

    $.addClass( widget, 'tfw-focusable' );
    var input = $.tag( 'input' );
    $(widget).insertAdjacentElement( 'afterbegin', $.div('tfw-focusable-invisible', [input]) );

    input.addEventListener( 'keydown', function(evt) {
        onKeyDown( evt );
        input.value = '';
    });
    input.addEventListener( 'focus', function() {
        $.addClass( widget, 'focus' );
        widget.focus = true;
    });
    input.addEventListener( 'blur', function() {
        $.removeClass( widget, 'focus' );
        widget.focus = false;
    });

    DB.propBoolean( widget, 'focus' )(function(v) {
        console.info("[tfw.focusable] v=", v);
        window.setTimeout(function() {
            if( v ) input.focus();
            else input.blur();
        });
    });
};


module.exports = Focusable;


  
module.exports._ = _;
/**
 * @module tfw.focusable
 * @see module:$
 * @see module:dom
 * @see module:tfw.data-binding

 */
});