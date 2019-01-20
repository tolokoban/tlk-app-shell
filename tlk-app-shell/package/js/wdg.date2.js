/** @module wdg.date2 */require( 'wdg.date2', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";


"use strict";

var $ = require("dom");
var DB = require("tfw.data-binding");
var DateUtil = require("date");


/**
 * @class Date2
 *
 * Arguments:
 * * __visible__ {boolean}: Visibility of the component.
 *
 * @example
 * var Date2 = require("wdg.date2");
 * var instance = new Date2({visible: false});
 */
var Date2 = function(opts) {
    var that = this;

    var label = $.div( 'theme-label', 'theme-color-bg-1' );
    var input = $.tag( 'input', { type: 'date' } );

    var elem = $.elem( this, 'div', 'wdg-date2', [label, input] );
    
    DB.propBoolean(this, 'focus')(function(v) {
        if (v) input.focus();
        else input.blur();
    });
    DB.prop(this, 'action');
    DB.propAddClass(this, 'wide');
    DB.propRemoveClass(this, 'visible', 'hide');
    DB.prop( this, 'value' )(function(v) {
        if( typeof v === 'number' ) {
            input.value = DateUtil.toYMD( v );
            that.valid = true;
        } else {
            input.value = '';
            that.valid = false;
        }
    });
    DB.propString(this, 'label')(function(v) {
        if (v === null || (typeof v === 'string' && v.trim() == '')) {
            $.addClass(elem, 'no-label');
        } else {
            $.removeClass(elem, 'no-label');
            $.textOrHtml(label, v);
            if (v.substr(0, 6) == '<html>') {
                $.att(elem, {title: ''});
            } else {
                $.att(elem, {title: v});
            }
        }
    });
    DB.propBoolean(this, 'enabled')(function(v) {
        if (v) {
            $.removeAtt(input, 'disabled');
        } else {
            $.att(input, {disabled: v});
        }
    });
    opts = DB.extend({
        wide: false,
        visible: true,
        enabled: true,
        label: null,
        focus: false,
        valid: false,
        value: 0
    }, opts, this);

    input.addEventListener('keyup', function( evt ) {
        if (evt.keyCode == 13) {
            evt.preventDefault();
            evt.stopPropagation();
            DB.fire( that, 'action', that.value );
        } else {
            DB.set( that, 'value', DateUtil.fromYMD( input.value ) );
        }
    });
    input.addEventListener('blur', function() {
        $.addClass( elem, "theme-elevation-2" );
        $.removeClass( elem, "theme-elevation-8" );
        $.removeClass(input, 'theme-color-bg-A1');
        DB.set( that, 'focus', false );
    });
    input.addEventListener('focus', function() {
        $.removeClass( elem, "theme-elevation-2" );
        $.addClass( elem, "theme-elevation-8" );
        $.addClass(input, 'theme-color-bg-A1');
        DB.set( that, 'focus', true );
    });

};


module.exports = Date2;


  
module.exports._ = _;
/**
 * @module wdg.date2
 * @see module:$
 * @see module:dom
 * @see module:tfw.data-binding
 * @see module:date

 */
});