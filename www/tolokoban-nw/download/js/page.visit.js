/** @module page.visit */require( 'page.visit', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

var $ = require("dom");
var Data = require("data");
var Form = require("form");
var Modal = require("wdg.modal");
var Input = require("input");
var Format = require("format");
var ShowHide = require("wdg.showhide");
var Structure = require("structure");



var g_patient;


exports.onPage = function() {
    var hash = location.hash.split('/');
    var patientId = hash[1];
    g_patient = Data.getPatient( patientId );
    document.getElementById('visit.title').textContent = Format.getPatientCaption( g_patient );

    var container = document.getElementById("visit.data");
    $.clear( container );
    addForm( container, Structure.forms );
};


exports.onClose = function() {
    var visit = Data.getLastVisit( g_patient );
    visit.exit = Date.now();
    Data.save();
    location.hash = "#Home";
};

/**
 * @param {DOM} parent
 * @param {object} def - Définition des zones de saisie.
 */
function addForm( parent, def ) {
    if( typeof def === 'undefined' ) return;
    
    var key, val;
    var wdg, div;
    for( key in def ) {
        val = def[key];
        if (key.charAt(0) == '#') {
            // Input
            wdg = new Input({
                def: val,
                patient: g_patient
            });
        } else {
            // Show/Hide
            div = $.div();
            wdg = new ShowHide({
                label: val.caption,
                content: [div],
                simple: true,
                value: false
            });
            addForm( div, val.children );
        }
        $.add( parent, wdg );
    }
}

exports.onNewVisit = function() {
    var currentAdmission = g_patient.$admissions[g_patient.$admissions.length - 1];
    if (!currentAdmission) {
        currentAdmission = {
            enter: Date.now(),
            visits: [
                { date: Date.now() }
            ]
        };
        g_patient.$admissions.push( currentAdmission );
        location.hash = "#Visit/" + g_patient.id + "/0/0";
    } else {
        if (currentAdmission.exit) {
            currentAdmission = {
                enter: Date.now(),
                visits: [
                    { date: Date.now() }
                ]
            };
            g_patient.$admissions.push( currentAdmission );
            location.hash = "#Visit/" + g_patient.id + "/" + (g_patient.$admissions.length - 1) + "/0";
        } else {
            currentAdmission = g_patient.$admissions[g_patient.$admissions.length - 1];
            location.hash = "#Visit/" + g_patient.id + "/" + (g_patient.$admissions.length - 1) + "/"
                + (currentAdmission.visits.length - 1);
        }
    }
};


  
module.exports._ = _;
/**
 * @module page.visit
 * @see module:$
 * @see module:dom
 * @see module:data
 * @see module:form
 * @see module:wdg.modal
 * @see module:input
 * @see module:format
 * @see module:wdg.showhide
 * @see module:structure

 */
});