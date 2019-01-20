/** @module format */require( 'format', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";


var Utils = require("utils");
var DateUtil = require("date");
var Structure = require("structure");


/**
 * @param {object} patientData.
 */
exports.getPatientCaption = function( patientData ) {
    var lastname = (patientData['#PATIENT-LASTNAME'] || '').trim();
    var firstname = (patientData['#PATIENT-FIRSTNAME'] || '').trim();
    var secondname = (patientData['#PATIENT-SECONDNAME'] || '').trim();
    var birth = patientData['#PATIENT-BIRTH'];
    if( typeof birth === 'number' ) {
        var dat = DateUtil.toDate( birth );
        birth = dat.getFullYear() + "-" + (1 + dat.getMonth()) + "-" + dat.getDate();
    }
    var name = lastname.toUpperCase()
            + ' ' + Utils.capitalize( firstname );
    if( secondname.length > 0 ) name += ' ' + Utils.capitalize( secondname );
    name += ' (' + birth + ') @' 
        + exports.expand(patientData['#PATIENT-COUNTRY'], '#NATIONALITY');
    return name;
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

    // Deal with dates, numbers, ...
    if( typeof text !== 'string' ) return text;

    var typeDic = type;
    if (typeof typeDic === 'string') typeDic = Structure.value.types[type];
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

exports.date = function( seconds ) {
    var date = new Date( seconds * 1000 );
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
 * @see module:utils
 * @see module:date
 * @see module:structure

 */
});