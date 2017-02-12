/** @module page.patient */require( 'page.patient', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

var $ = require("dom");
var W = require("x-widget").getById;
var Err = require("tfw.message").error;
var Data = require("data");
var Modal = require("wdg.modal");
var Format = require("format");
var Structure = require("structure");


var g_patient;
var g_patientId;
var g_currentVaccinID;


exports.onPage = function() {
    var hash = location.hash.split('/');
    var patientId = hash[1];
    g_patientId = patientId;
    g_patient = Data.getPatient( patientId );
    document.getElementById('patient.title').textContent = Format.getPatientCaption( g_patient );

    var hint = document.getElementById('patient.hint');
    var btnExit = W('patient.exit');
    btnExit.visible = false;

    if (!Array.isArray(g_patient.$admissions) || g_patient.$admissions.length == 0) {
        hint.textContent = "Ce patient n'a encore jamais été admis dans ce service.";
    } else {
        var admission = g_patient.$admissions[g_patient.$admissions.length - 1];
        if (typeof admission.exit === 'undefined') {
            // Toujours admis dans l'hôpital.
            hint.innerHTML = "Ce patient est admis dans ce service depuis<br/><b>"
                + Format.date(admission.enter) + "</b>.";
            btnExit.visible = true;
        } else {
            hint.innerHTML = "Ce patient a été admis dans ce service du <ul><li><b>"
                + Format.date(admission.enter) + "</b></li><li>au <b>"
                + Format.date(admission.exit) + "</b>.</li></ul>";
        }
    }

    initVaccins();
};

function onVaccinHover( down ) {
    if( down ) {
        $.addClass( this, 'theme-elevation-8', 'theme-color-bg-A4' );
        $.removeClass( this, 'theme-elevation-2', 'theme-color-bg-A1' );
    } else {
        $.removeClass( this, 'theme-elevation-8', 'theme-color-bg-A4' );
        $.addClass( this, 'theme-elevation-2', 'theme-color-bg-A1' );
    }
}

function onVaccinTap( id ) {
    g_currentVaccinID = id;
    W('vaccin-edit').attach();
    $('vaccin-name').textContent = Structure.vaccins[id].caption;
    var vaccin = Data.getVaccin( g_patient, id ) || {};
    var dateVaccin = vaccin.date;
    if( !dateVaccin ) dateVaccin = new Date();
    W('vaccin-date').value = dateVaccin;
    W('vaccin-lot').value = vaccin.lot || "";
}

function initVaccins() {
    $.clear( 'vaccins' );
    var id, caption, row;
    for( id in Structure.vaccins ) {
        caption = Structure.vaccins[id].caption;
        var vaccin = Data.getVaccin( g_patient, id );
        if( vaccin ) {
            var dateVaccin = vaccin.date;
            var delta = Math.ceil( (Date.now() - dateVaccin.getTime()) / 31557600000 );
            row = $.div( 'theme-elevation-2', 
                         'level-' + (delta < 6 ? '0' : (delta < 11 ? '1' : '2')), [
                $.div([ caption ]), $.div([ delta < 2 ? "Moins d'un an" : delta + " ans" ])
            ]);            
        } else {
            row = $.div( 'theme-elevation-2', 'level-3', [
                $.div([ caption ]), $.div( 'unknown', ['Inconnu...'] )
            ]);
        }

        $.add( 'vaccins', row );
        $.on( row, {
            down: onVaccinHover.bind( row, true ),
            up: onVaccinHover.bind( row, false ),
            tap: onVaccinTap.bind( row, id )
        });
    }
}

function closeVaccin() {
    W('vaccin-edit').detach();
    initVaccins();
}

exports.onVaccinOK = function() {
    var d = W('vaccin-date').value;
    if( d.getTime() > Date.now() ) {
        Err('La date spécifiée est dans le futur !');
        return;
    }
    Data.setVaccin( g_patient, g_currentVaccinID, { date: d, lot: W('vaccin-lot').value } );
    closeVaccin();
};

exports.onVaccinDel = function() {
    Data.delVaccin( g_patient, g_currentVaccinID );
    closeVaccin();
};

exports.onExam = function() {
    location = "#Exam/" + g_patientId;
};

exports.onNewVisit = function() {
    var visit = Data.getLastVisit( g_patient );
    if (!visit || visit.exit) {
        // Il n'y a pas de visite en cours.
        visit = Data.createVisit( g_patient );
        location.hash = "#Visit/" + g_patient.$id;
    } else {
        var content = $.div([
            "Une visite débutée ",
            $.tag('b', [Format.date(visit.enter)]),
            " n'a pas été cloturée.",
            $.tag('br'),
            "Voulez-vous la poursuivre ?",
            $.tag('hr'),
            $.tag('em', ["Si vous choisissez NON, nous créerons une nouvelle visite."])
        ]);
        Modal.confirm(
            content,
            function() {
                location.hash = "#Visit/" + g_patient.$id;
            },
            function() {
                visit.exit = visit.enter;
                Data.createVisit( g_patient );
                location.hash = "#Visit/" + g_patient.$id;
            }
        );
    }
};


function formatDate( d ) {
    if( typeof d === 'string' ) return d;
    return d.toString();
}


  
module.exports._ = _;
/**
 * @module page.patient
 * @see module:$
 * @see module:dom
 * @see module:x-widget
 * @see module:tfw.message
 * @see module:data
 * @see module:wdg.modal
 * @see module:format
 * @see module:structure

 */
});