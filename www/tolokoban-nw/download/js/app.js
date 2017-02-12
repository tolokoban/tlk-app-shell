/** @module app */require( 'app', function(require, module, exports) { var _=function(){var D={"en":{"loading-error":"<html>Initialization failure!<br>Please send this message to support :<pre>$1</pre>","title-home":"Search / Register a patient","vaccination":"Vaccination list"},"fr":{"loading-error":"<html>Echec de l'initialisation !<br>Veuillez envoyer ce message au support :<pre>$1</pre>","title-home":"Rechercher / Enregistrer un patient","vaccination":"Liste des vaccins"}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

//require("offline");
require("font.josefin");

var $ = require("dom");
var Err = require("tfw.message").error;
var Msg = require("tfw.message").info;
var Modal = require("wdg.modal");

var Form = require("form");
var Structure = require("structure");

var pages = {
    loading: require("page.loading"),
    home: require("page.home"),
    list: require("page.list"),
    patient: require("page.patient"),
    visit: require("page.visit"),
    exam: require("page.exam")
};

exports.start = function() {
    location.hash = "#Loading";
    Structure.load().then(function() {
        location.hash = "#Home";
    }, function(err) {
        err.context = "Loading...";
        console.error( err );
        Modal.alert( _('loading-error', JSON.stringify( err, null, '  ' ) ) );
    });
};


exports.onPage = function( pageId ) {
    var page = pages[pageId.toLowerCase()];
    if( typeof page !== 'undefined' ) page.onPage();
};


  
module.exports._ = _;
/**
 * @module app
 * @see module:$
 * @see module:font.josefin
 * @see module:dom
 * @see module:tfw.message
 * @see module:wdg.modal
 * @see module:form
 * @see module:structure
 * @see module:page.loading
 * @see module:page.home
 * @see module:page.list
 * @see module:page.patient
 * @see module:page.visit
 * @see module:page.exam

 */
});