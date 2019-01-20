/** @module wdg.wait */require( 'wdg.wait', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

var $ = require("dom");
var DB = require("tfw.data-binding");
var Icon = require("wdg.icon");


/**
 * @class Wait
 *
 * Arguments:
 * * __visible__ {boolean}: Visibility of the component.
 *
 * @example
 * var Wait = require("wdg.wait");
 * var instance = new Wait({visible: false});
 */
var Wait = function(opts) {
    var text = $.div();
    var icon = new Icon({ content: 'wait', rotate: true });
    var elem = $.elem( this, 'div', 'wdg-wait', [icon, text] );
    
    DB.propRemoveClass( this, 'visible', 'hide' );
    DB.propUnit( this, 'size' )(function(unit) {
        icon.size = unit.v + unit.u;
        // We want to text to be 75% of the icon.
        $.css( text, {
            'font-size': (unit.v * .75) + unit.u,
            'padding-left': (unit.v * .5) + unit.u
        });
    });
    DB.propString( this, 'text' )(function(v) {
        text.textContent = v;
    });
    
    opts = DB.extend({
        size: '24px',
        text: '',
        visible: true
    }, opts, this);
};


module.exports = Wait;


  
module.exports._ = _;
/**
 * @module wdg.wait
 * @see module:$
 * @see module:dom
 * @see module:tfw.data-binding
 * @see module:wdg.icon

 */
});