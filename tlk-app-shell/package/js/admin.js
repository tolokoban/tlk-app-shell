/** @module admin */require( 'admin', function(require, module, exports) { var _=function(){var D={"en":{"title-home":"Administration page"},"fr":{"title-home":"Page d'administration"}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

/**
 * @module admin
 *
 * @description
 *
 *
 * @example
 * var mod = require('admin');
 */
require('font.josefin');
require('font.mystery-quest');

var $ = require("dom");
var W = require("x-widget").getById;
var WS = require("tfw.web-service");
var DB = require("tfw.data-binding");
var Cfg = require("$");
var Err = require("tfw.message").error;
var Msg = require("tfw.message").info;
var Area = require("wdg.area");
var Modal = require("wdg.modal");
var Parser = require("structure.parser");
var Structure = require("structure");

// ID of the combo of structures.
var g_id;

var SECTIONS = {
    types: "Types de données",
    patient: "Champs liés au patient",
    forms: "Formulaire de visite",
    vaccins: "Liste des vaccins",
    exams: "Détail des examens possibles"
};

// Map of Area widgets. The keys are the same keys as in `SECTIONS`.
var g_sections = {};

exports.onPage = function(pageId) {
    console.info("[admin] pageId=", pageId);
    if( pageId != 'Admin' ) {
        window.setTimeout(function() {
            W('username').focus = true;
        }, 100);
        return;
    }

    Structure.then(function() {
        var key, val, area;
        for( key in SECTIONS ) {
            val = SECTIONS[key];
            area = new Area({ label: val, value: Structure.source[key] });
            g_sections[key] = area;
            $.add( 'body.' + key, area );
        }
    });
};

exports.onSave = function() {
    var modal = new Modal({
        padding: true,
        content: ['Sauvegarde en cours...']
    });
    modal.attach();
    window.setTimeout(function() {
        var tasks = [];
        var key, val;
        for( key in SECTIONS ) {
            val = g_sections[key];
            console.info("[admin] key=", key);
            console.info("[admin] val=", val);
            tasks.push({ id: key, text: val.value, area: val });
            console.info("[admin] tasks=", tasks);
        }
        var next = function() {
            if( tasks.length == 0 ) {
                modal.detach();
                return;
            }
            var task = tasks.shift();
            try {
                Parser.parse( task.text );
            } catch( ex ) {
                modal.detach();
                Modal.alert(
                    "<html>Il y a une erreur dans le code de <b>"
                        + SECTIONS[task.id] + "</b> à la ligne <b>"
                        + ex.lineNumber + ".<pre class='error'>"
                        + ex.message + "</pre>",
                    function() {
                        task.area.focus = true;
                    }
                );
                return;
            }
            WS.get('PutOrg', task).then(function(ret) {
                console.info("[admin] ret=...", ret);
                Structure.value[task.id] = task.text;
                next();
            }, function(err) {
                console.info("[admin] err=...", err);
                Err( err );
            });
        };
        next();
    });
};

exports.onLogin = function() {
    var username = W('username').value;
    var password = W('password').value;
    WS.login(username, password).then(function(ret) {
        Msg("Bienvenue !");
        Structure.then(function() {
            location.hash = "#Admin";
        }, function(err) {
            err.context = "Loading...";
            console.error( err );
            Modal.alert( _('loading-error', JSON.stringify( err, null, '  ' ) ) );
        });
    }, function(err) {
        console.error( err );
        Err( "L'authentification a échoué !" );
        window.setTimeout(function() {
            location = "index.html";
        }, 3000);
    });
};


  
module.exports._ = _;
/**
 * @module admin
 * @see module:$
 * @see module:font.josefin
 * @see module:font.mystery-quest
 * @see module:dom
 * @see module:x-widget
 * @see module:tfw.web-service
 * @see module:tfw.data-binding
 * @see module:tfw.message
 * @see module:wdg.area
 * @see module:wdg.modal
 * @see module:structure.parser
 * @see module:structure

 */
});