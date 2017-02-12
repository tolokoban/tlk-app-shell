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
var Modal = require("wdg.modal");
var Parser = require("structure.parser");
var Structure = require("structure");

// ID of the combo of structures.
var g_id;

exports.start = function() {
    location.hash = "#Loading";
    Structure.load().then(function() {
        if( location.hash != "#Loading" ) checkLogin();
        else location.hash = "#Loading";
    });
};


exports.onPage = function( pageId ) {
    if( !checkLogin() )  return;
};

exports.onSave = function() {
    try {
        var content = $('content').value.trim();
        var data = Parser.parse( content );
        var id = g_id;
        var modal = new Modal({ 
            padding: true,
            content: ['Sauvegarde en cours...'] 
        });
        modal.attach();
        window.setTimeout(function() {
            WS.get('PutOrg', { id: id, text: content }).then(function(ret) {
                console.info("[admin] ret=...", ret);
                modal.detach();
                Msg("Sauvegarde réussie !");
            }, function(err) {
                console.info("[admin] err=...", err);
                Err( err );
            });
        }, 1000 );
    }
    catch( err ) {
        Err( err );
        $('content').focus();
    }
};

exports.onCombo = function( id ) {
    g_id = id;
    var area = $('content');
    area.value = '' + Structure.data[id];
    $.addClass( area, 'flash' );
    window.setTimeout( $.removeClass.bind( $, area, 'flash' ) );
};

exports.onLogin = function() {
    var modal = W('modal.login');
    modal.visible = false;
    var user = W('login').value;
    var password = W('password').value;
    WS.login(user, password).then(function(ret) {
        Msg("Bienvenue !");
        Structure.load().then(function() {
            location.hash = "#Admin";
            exports.onCombo( 'patient' );
        }, function(err) {
            err.context = "Loading...";
            console.error( err );
            Modal.alert( _('loading-error', JSON.stringify( err, null, '  ' ) ) );
        });
    }, function(err) {
        console.error( err );
        Err( "L'authentification a échoué !" );
        window.setTimeout(function() {
            modal.visible = true;
        }, 3000);
    });
};


function checkLogin() {
    if( !WS.isLogged() ) {
        W('modal.login').attach();
        W('login').focus = true;
        return false;
    }
    return true;
}


  
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
 * @see module:wdg.modal
 * @see module:structure.parser
 * @see module:structure

 */
});