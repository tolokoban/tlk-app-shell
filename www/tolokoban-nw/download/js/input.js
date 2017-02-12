/** @module input */require( 'input', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

var $ = require("dom");
var DB = require("tfw.data-binding");
var Data = require("data");
var Text = require("wdg.text");
var Format = require("format");
var Structure = require("structure");


var Input = function( args ) {
    var that = this;
    var visit;

    var elem = $.elem(this, 'div', 'input');

    if (typeof args.patient === 'undefined') {
        throw Error("[input] Missing mandatory argument: `patient`!");
    }
    var patient = args.patient;
    visit = Data.getLastVisit( patient );

    var def = args.def;
    addWidget( elem, def, patient, visit );
};


/**
 * Il existe trois types d'inputs :
 * * __Simple__ : Texte libre avec suggestions éventuelles.
 * * __Multiple__ : C'est une liste  alimentée par un texte libre avec
 *   suggestions. Les types `multiple` terminent par un `+`.
 * * __Hiérarchique__  : Plusieurs  textes libres  dont la  suggestion
 *   dépend de la valeur du champ juste au dessus.
 */
function addWidget( container, def, patient, visit ) {
    if (def.type && def.type.charAt(def.type.length - 1) == '+') {
        addWidgetMultiple( def, patient, visit );
        return;
    }

    var value = Data.getValue( patient, def.id );
    var completion = getCompletion( def.type );
    var wdg = new Text({
        wide: true,
        label: def.caption,
        list: completion.list,
        placeholder: Format.expand(value.old, def.type),
        value: Format.expand(value.new, def.type)
    });
    DB.bind( wdg, 'value', function(v) {
        if (typeof v !== 'string') return;
        v = v.trim();
        if (v.length == 0) {
            delete visit.data[def.id];
        } else {
            // Quand c'est possible, on essaie de stoquer un ID plutôt qu'un texte libre.
            var valueID = completion.map[v.toLowerCase()];
            visit.data[def.id] = valueID || v;
        }
        Data.save();
    });

    $.add( container, $.div([
        //$.div([def.caption]),
        $.div([wdg])
    ]));

    addWidgetMultiple( container, wdg, def, patient, visit );
}

function addWidgetMultiple( container, parentWidget, def, patient, visit ) {
    // Gérer les hiérarchies.
    var wdg;
    var parent = def;
    var child = def;
    var level = 0;

    var mapValueToID = {};
    var completion = findHierarchicalCompletion(Structure.types[def.type], mapValueToID);

    while (null != (child = getFirstChild(parent))) {
        parentWidget = createHierarchicalWidget(
            container, visit, mapValueToID, parentWidget, patient, def, child, level, completion );
        level++;
        parent = child;
    }
}

/**
 * Recherche récursive des complétions par niveau.
 * ```
 * result: [
 *   { "Europe": ["France", "Italie"], "Afrique": ["Cameroun", "Mali"] },
 *   {
 *     "France": ["Paris", "Marseille"],
 *     "Italie": ["Padova", "Milano"],
 *     "Cameroun": ["Yaoundé"],
 *     "Mali": ["Bamako"]
 *   }
 * ]
 * ```
 */
function findHierarchicalCompletion( typeDic, map, level, result, parentKey ) {
    if (typeof typeDic === 'undefined') return [];
    if( typeof level === 'undefined' ) level = 0;
    if( typeof result === 'undefined' ) result = [];

    if (result.length <= level) result.push({});

    var key, child;
    for( key in typeDic.children ) {
        child = typeDic.children[key];
        // On mémorise un dictionaires de clefs en fonction des valeurs.
        // Cela va  nous servir à  stoquer la clef  en base et  nom la
        // valeur qui peut dépendre de la langue.
        map[child.caption.trim().toUpperCase()] = key;
        if (level > 0) {
            if (!result[level - 1][parentKey]) result[level - 1][parentKey] = [child.caption];
            else result[level - 1][parentKey].push(child.caption);
        }
        findHierarchicalCompletion( child, map, level + 1, result, key );
    }

    return result;
}


function createHierarchicalWidget( container,
                                   visit,
                                   mapValueToID,
                                   parentWidget,
                                   patient,
                                   def,
                                   child,
                                   level,
                                   completion )
{
    var type = Structure.types[def.type];
    var value = Data.getValue( patient, child.id );
    var wdg = new Text({
        wide: true,
        label: child.caption + "  (" + def.caption + ")",
        placeholder: Format.expand(value.old, type, level),
        value: Format.expand(value.new, type, level)
    });
    DB.bind( wdg, 'focus', function(v) {
        if (v) {
            var parentValue = parentWidget.value.trim().toUpperCase();
            var key = mapValueToID[parentValue];
            wdg.list = completion[level][key || parentValue] || [];
        }
    });
    DB.bind( wdg, 'value', function(v) {
        if (typeof v !== 'string') return;
        v = v.trim();
        if (v.length == 0) {
            delete visit.data[child.id];
        } else {
            // Quand c'est possible, on essaie de stoquer un ID plutôt qu'un texte libre.
            var valueID = mapValueToID[v.trim().toUpperCase()];
            visit.data[child.id] = valueID || v;
        }
        Data.save();
    });
    $.add( container, wdg );

    return wdg;
}


function getFirstChild( def ) {
    if (typeof def.children === 'undefined' ) return null;
    var k;
    for( k in def.children ) {
        return def.children[k];
    }
    return null;
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

module.exports = Input;


  
module.exports._ = _;
/**
 * @module input
 * @see module:$
 * @see module:dom
 * @see module:tfw.data-binding
 * @see module:data
 * @see module:wdg.text
 * @see module:format
 * @see module:structure

 */
});