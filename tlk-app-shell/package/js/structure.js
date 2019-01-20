/** @module structure */require( 'structure', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

require("polyfill.promise");
var $ = require("dom");
var WS = require("tfw.web-service");
var Files = require("files");
var Modal = require("wdg.modal");
var Parser = require("structure.parser");
var Storage = require("tfw.storage").session;

var FS = require("node://fs");

// Name of the local backup for structure.
var FILENAME = "data/structure.json";
// URL of the service delivering structure.
var URL = "http://tolokoban.org/Cameroun/tfw/svc.php?s=GetOrg";

var g_structure = null;
var g_source = null;

/**
 * Resolves in the complete structure.
 */
module.exports = new Promise(function (resolve, reject) {
    if( g_structure ) resolve( g_structure );
    else {
        // Load structure from internet or from local disk if network is unreachable.
        Files.mkdir( "data" )
            .then(function() {
                return fetch( URL );
            })
            .then(function( response ) {
                if( response.ok == false) {
                    throw( "Error " + response.status + " - " + response.statusText );
                }
                return response.json();
            })
            .then(function( data ) {
                if( !loadStructure( data ) ) {
                    throw( "Unparsable JSON!" );
                }
                FS.writeFile( FILENAME, JSON.stringify( data, null, '    ' ) );
                resolve( g_structure );
            })
            .catch(function( err ) {
                // Unable to  retrieve structure from the  network (or
                // structure is corrupted). We  try to get the locally
                // stored backup.
                if( !FS.existsSync( FILENAME ) ) {
                    reject( "No connection and no structure in cache!" );
                } else {
                    FS.readFile( FILENAME, function(err, data) {
                        if( err ) {
                            reject( "Unable to read backup file for structure!\n" + err );
                        } else {
                            loadStructure( JSON.parse( data.toString() ) );
                            resolve( g_structure );
                        }
                    });
                }
            });
    }
});

Object.defineProperty( module.exports, 'value', {
    get: function() { return g_structure; },
    set: function(v) {}
});

Object.defineProperty( module.exports, 'source', {
    get: function() { return g_source; },
    set: function(v) {}
});


function loadStructure( data ) {
    g_structure = {};
    g_source = {};

    var key, val;
    for( key in data ) {
        val = data[key];
        if( typeof val !== 'string' ) val = '';
        try {
            g_source[key] = val;
            g_structure[key] = Parser.parse( val );
            console.info("[structure] exports[", key, "]=", g_structure[key]);
        }
        catch (ex) {
            Modal.alert($.div([
                "Error in structure `" + key + "` at line " + ex.lineNumber,
                $.tag('code', [ex.message])
            ]));
            return false;
        }
    }
    return true;
}


  
module.exports._ = _;
/**
 * @module structure
 * @see module:$
 * @see module:polyfill.promise
 * @see module:dom
 * @see module:tfw.web-service
 * @see module:files
 * @see module:wdg.modal
 * @see module:structure.parser
 * @see module:tfw.storage

 */
});