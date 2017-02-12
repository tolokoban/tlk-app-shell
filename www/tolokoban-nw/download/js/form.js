/** @module form */require( 'form', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

/**
 * Créer des formulaires génériques.
 */
var $ = require("dom");
var DB = require("tfw.data-binding");
var Text = require("wdg.text");
var Structure = require("structure");


var Form = function( def ) {
    var that = this;

    var elem = $.elem(this, 'div', 'form');
    var table = $.div('table');
    $.add( elem, table );
    var inputs = createInputs.call( this, table, def );

    this._lockValueSet = false;
    this._lockValueGet = false;
    DB.prop( this, 'value' )(function(v) {
        if (that._lockValueSet) return;
        that._lockValueGet = true;
        inputs.forEach(function (input) {
            input.value = v[input.$id] || '';
        });
        that._lockValueGet = false;
    });
    DB.propBoolean( this, 'focus' )(function(v) {
        if (v) {
            window.setTimeout(function() {
                inputs[0].focus = true;
            });
        } else {
            inputs.forEach(function (input) {
                input.focus = false;
            });
        }
    });

    /**
     *
     */
    Object.defineProperty( Form.prototype, 'keys', {
        get: function() {
            var keys = [];
            inputs.forEach(function (input) {
                keys.push( input.$id );
            });
            return keys;
        },
        set: function(v) {},
        configurable: true,
        enumerable: true
    });
};


function createInputs( table, def ) {
    var that = this;

    var inputs = [];
    var id, item;
    var row, wdg;

    var slotChange = function(v) {
        if (that._lockValueGet) return;
        var value = {};
        inputs.forEach(function (input) {
            var v = input.value.trim();
            var w = input.$map[v.toLowerCase()];
            if (typeof w !== 'undefined') {
                // S'il  y a  un identifiant  associé à  ce texte,  on
                // l'utilise comme valeur.
                v = w;
            }
            if (v != '') {
                value[input.$id] = v;
            }
        });
        that._lockValueSet = true;
        that.value = value;
        that._lockValueSet = false;
    };

    var completion; 
    for( id in def ) {
        item = def[id];
        completion = getCompletion(item.type);
        wdg = new Text({ label: item.caption, wide: true, list: completion.list });
        wdg.$id = id;        
        wdg.$map = completion.map;
        inputs.push( wdg );
        row = $.div([
            //$.div([item.caption]),    // Il faut retirer le texte sur la gauche.
            $.div([wdg])
        ]);
        $.add( table, row );
        DB.bind( wdg, 'value', slotChange );
    }

    var i;
    for (i = 0 ; i < inputs.length - 1 ; i++) {
        DB.bind( inputs[i], 'action', inputs[i + 1], 'focus', { value: true } );
    }

    return inputs;
}


var NO_COMPLETION = { list: [], map: {} };

function getCompletion( type ) {
    if( typeof type === 'undefined' ) return NO_COMPLETION;
    type = Structure.types[type];
    if( typeof type === 'undefined' ) return NO_COMPLETION;
    type = type.children;
    if( typeof type === 'undefined' ) return NO_COMPLETION;

    var list = [];
    var map = {};
    var key, val;
    for( key in type ) {
        val = type[key];
        list.push( val.caption );
        map[val.caption.toLowerCase()] = key;
    }
    list.sort();
    return {list: list, map: map};
}


module.exports = Form;


  
module.exports._ = _;
/**
 * @module form
 * @see module:$
 * @see module:dom
 * @see module:tfw.data-binding
 * @see module:wdg.text
 * @see module:structure

 */
});