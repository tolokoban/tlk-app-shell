/** @module structure.parser */require( 'structure.parser', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

/**
 * Le fichier `types.org` définit tous  les types de données complexe.
 * Il  n'y a  pas  de type  très contraignant,  tous  les textes  sont
 * libres, mais on propose des listes pour faciliter la saisie. Chaque
 * élément  de cette  liste est  muni d'un  identifiant (précédé  d'un
 * dièse `#`).
 * Un type peut être hiérarchique. Par exemple, une adresse propose un
 * pays, une région,  un district, ... Les  propositions dépendent des
 * choix  précédents. Ainsi,  la liste  des propositions  de districts
 * dépend de la région sélectionnée.
 *
 * Le  parsing du  fichier `types.org`  se  fait ligne  par ligne.  On
 * ignore tous  les espaces/tabulations en  début de ligne.  Le nombre
 * d'astérisques  `*`  qui  commencent  une ligne  indique  le  niveau
 * hiérarchique.
 * Au  niveau 1,  on trouve  l'identifiant du  type qui  doit toujours
 * commencer par un dièse `#`.
 *
 * Voici un  exemple de  fichier en  entrée et de  comment on  doit le
 * traduire.
 * ```
 * #GENDER
 * * #H Homme
 * * #F Femme
 *
 * #LOCALIZATION
 * * Cameroun
 * ** Littoral
 * *** District 9
 * **** Village 1
 * **** Village 2
 * **** Village 3
 * *** Un peu plus loin
 * **** Village A
 * **** Village B
 * ** Centre
 * *** Pas tout près
 * **** Village Toto
 * *** Au fin fond du...
 * **** Village Alpha
 * **** Village Beta
 * **** Village Gama
 * ```
 *
 * ```
 * {
 *   "#GENDER": {
 *     "#H": { "caption": "Homme" },
 *     "#F": { "caption": "Femme" }
 *   },
 *   "#LOCALIZATION": {
 *     "Cameroun": { "caption": "Cameroun", "children": {
 *       "Littoral": { "caption": "Littoral", "children": {
 *         ...
 *       }},
 *       "Centre": { "caption": "Centre", "children": {
 *         ...
 *       }},
 *       ...
 *     }}
 *   }
 * }
 * ```
 */


var RX_LINE = /^(#[A-Z0-9-]+)?([^\(@]*)(\([^\)]*\)\+?)?(@[A-Z0-9,-]+)?/;


exports.parse = function(code) {
    var types = {};
    var levels = [types];
    if( typeof code !== 'string' ) code = '' + code;
    code.split('\n').forEach(function (line, lineNumber) {
        try {
            line = line.trim();
            // Ignorer les lignes vides.
            if (line.length == 0) return;
            // Ignorer les commentaires.
            if (line.substr(0, 2) == '//') return;
            if (line.charAt(0) != '*') {
                throw "Une ligne non vide et non commentée doit toujours commencer "
                    + "par au moins une astérisque pour indiquer le niveau hiérarchique.";
            }

            // Calculer le niveau hiérarchique `level`.
            var level = 0;
            while (line.charAt(0) == '*') {
                line = line.substr(1);
                level++;
            }
            line = line.trim();

            var item;
            if (level > levels.length) {
                throw "Vous avez sauté au moins un niveau hiérarchique: `" + line + "` !\n"
                    + "Vous étiez au niveau " + (levels.levels - 1)
                    + " et vous définissez maintenant le niveau " + level + ".";
            }
            while (levels.length > level) {
                levels.pop();
            }
            item = parseLine( line );
            if (typeof levels[levels.length - 1][item.id] !== 'undefined') {
                throw "Vous avez déjà déclaré cet identifiant : `" + item.id + "` !";
            }
            levels[levels.length - 1][item.id] = item;
            levels.push( item.children );
        }
        catch (ex) {
            throw { lineNumber: lineNumber + 1, message: ex };
        }
    });
    return types;
};



function parseLine( line ) {
    line = line.trim();
    var item = { children: {} };
    var m = RX_LINE.exec(line);
    if (m[2]) {
        item.caption = m[2].trim();
    }
    if (m[1]) {
        item.id = m[1].trim();
    } else {
        item.id = item.caption.toUpperCase();
    }
    if (m[3]) {
        item.type = m[3].substr(1, m[3].length - 2).trim();
    }
    if (m[4]) {
        item.tags = m[4].trim().substr(1).split('\n').map(function(v) { return v.trim(); });
    }

    return item;
}


exports.get = function( def, path ) {
    if (!Array.isArray( path ) || path.length == 0) return def;
    if( typeof def === 'undefined' ) return def;

    var criteria = path.shift();
    if (criteria.charAt(0) == '@') {
        var key, val;
        for( key in def ) {
            val = def[key];
            if (Array.isArray(val.tags) && val.tags.indexOf(criteria.substr(1)) > -1) {
                return exports.get( val.children, path );
            }
        }
        return null;
    } else {
        return exports.get( def[criteria].children, path );
    }
};


  
module.exports._ = _;
/**
 * @module structure.parser
 * @see module:$

 */
});