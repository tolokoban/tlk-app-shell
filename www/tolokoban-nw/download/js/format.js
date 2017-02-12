/** @module format */require( 'format', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

var Structure = require("structure");


exports.getPatientCaption = function( patient ) {
    return patient['#PATIENT-LASTNAME'].toUpperCase()
        + " " + patient['#PATIENT-FIRSTNAME']
        + " " + exports.expand(patient['#PATIENT-SECONDNAME'])
        + " (" + exports.expand(patient['#PATIENT-COUNTRY'], '#COUNTRY') + ")";
};


/**
 * Quand c'est possible, les données  sont stoquées sous forme de leur
 * identifiant qui  commence par un  dièse `#`. Cette  fonction permet
 * donc de retrouver le texte  associé à l'identifiant, ou à retourner
 * le texte tel quel s'il ne s'agit pas d'un identifiant.
 */
exports.expand = function( text, type, level ) {
    if( typeof text === 'undefined' ) return '';
    if( typeof type === 'undefined' ) return text;
    if( typeof level === 'undefined' ) level = 0;

    var typeDic = type;
    if (typeof typeDic === 'string') typeDic = Structure.types[type];
    text = text.trim().toUpperCase();
    var expansion = findExpansion( text, typeDic, level );
    return expansion || '';
};

/**
 * Recherche récursive à un certain niveau de l'arbre des types.
 */
function findExpansion( text, typeDic ) {
    if (!typeDic) return undefined;

    var item = typeDic.children[text];
    if( typeof item === 'undefined' ) {
        var k, v;
        for( k in typeDic.children ) {
            v = typeDic.children[k];
            item = findExpansion( text, v );
            if (item) return item;
        }
    } else {
        return item.caption;
    }
    return undefined;
}


var WEEK_DAY = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
var MONTH = [
    'Janvier', 'Février', 'Mars', 'Avril',
    'Mai', 'Juin', 'Juillet', 'Août',
    'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

exports.date = function( ms ) {
    var date = new Date( ms );
    return WEEK_DAY[date.getDay()]
        + " " + date.getDate()
        + " " + MONTH[date.getMonth()]
        + " " + date.getFullYear()
        + " à " + exports.pad(date.getHours())
        + ":" + exports.pad(date.getMinutes());
};


exports.pad = function( txt, size, prepend ) {
    if( typeof size !== 'number' ) size = 2;
    if( typeof prepend !== 'string' ) prepend = '0';

    txt = "" + txt;
    while (txt.length < size) txt = prepend + txt;
    return txt;
};


  
module.exports._ = _;
/**
 * @module format
 * @see module:$
 * @see module:structure

 */
});