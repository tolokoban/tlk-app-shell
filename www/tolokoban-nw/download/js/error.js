/** @module error */require( 'error', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

var Storage = require("tfw.storage").session;

var error = Storage.get("error", {});

text(
    'error',
    "Erreur dans le fichier '" + error.name + "' à la ligne " + error.line + " !\n\n"
        + error.message);
text(
    'content',
    ('' + error.content).split( '\n' )
        .map(function( line, index ) {
            var linenum = "" + (1 + index);
            while( linenum.length < 4 ) linenum = ' ' + linenum;
            return linenum + ". " + line;
        })
);

function text(id, text) {
    document.getElementById( id ).textContent = text;
}


  
module.exports._ = _;
/**
 * @module error
 * @see module:$
 * @see module:tfw.storage

 */
});