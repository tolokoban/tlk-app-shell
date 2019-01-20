/** @module page.patient */require( 'page.patient', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

var $ = require("dom");
var W = require("x-widget").getById;
var Msg = require("tfw.message").info;
var Err = require("tfw.message").error;
var Text = require("wdg.text");
var Flex = require("wdg.flex");
var Icon = require("wdg.icon");
var Modal = require("wdg.modal");
var Button = require("wdg.button");
var Format = require("format");
var DateUtil = require("date");
var Patients = require("patients");
var Structure = require("structure");
var ModalPatient = require("modal.patient");

var Path = require("node://path");


var g_patient;
var g_patientId;
var g_currentVaccinID;


exports.onPage = function() {
    var hash = location.hash.split('/');
    var patientId = hash[1];
    g_patientId = patientId;
    Patients.get( patientId ).then(function(patient) {
        g_patient = patient;

        refreshAttachments();
        W('picture').value = patient;
        document.getElementById('patient.title').textContent = 
            Format.getPatientCaption( g_patient.data );

        var hint = document.getElementById('patient.hint');
        var btnExit = W('patient.exit');
        btnExit.visible = false;

        if( !Array.isArray(g_patient.admissions) || g_patient.admissions.length == 0 ) {
            hint.textContent = "Ce patient n'a encore jamais été admis dans ce service.";
        } else {
            var admission = g_patient.admissions[g_patient.admissions.length - 1];
            if (typeof admission.exit === 'undefined') {
                // Toujours admis dans l'hôpital.
                hint.innerHTML = "Ce patient est admis dans ce service depuis<br/><b>"
                    + Format.date(admission.enter) + "</b>.";
                btnExit.visible = true;
            } else {
                hint.innerHTML = "Ce patient a déjà été admis dans ce service du <ul><li><b>"
                    + Format.date(admission.enter) + "</b></li><li>au <b>"
                    + Format.date(admission.exit) + "</b>.</li></ul>";
            }
        }

        initVaccins();
    }, Err );
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
    $('vaccin-name').textContent = Structure.value.vaccins[id].caption;
    var vaccin = g_patient.vaccins[id] || {};
    var dateVaccin = vaccin.date;
    //if( !dateVaccin ) dateVaccin = DateUtil.now();
    W('vaccin-date').value = dateVaccin;
    W('vaccin-lot').value = vaccin.lot || "";
}

function initVaccins() {
    $.clear( 'vaccins' );
    var id, caption, row;
    for( id in Structure.value.vaccins ) {
        caption = Structure.value.vaccins[id].caption;
        var vaccin = g_patient.vaccins[id];
        if( vaccin ) {
            var dateVaccin = vaccin.date;
            // `delta`is computed in years.
            var delta = Math.floor(DateUtil.age(vaccin.date) / 31557600);
            row = $.div( 'theme-elevation-2',
                         'level-' + (delta < 6 ? '0' : (delta < 11 ? '1' : '2')), [
                             $.div([ caption ]), 
                             $.div([ delta < 2 ? "Moins d'un an" : delta + " ans" ])
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
    var dat = W('vaccin-date').value;
    if( typeof dat !== 'number' ) {
        Err("La date est obligatoire !");
        W('vaccin-date').focus = true;
        return;
    }
    if( DateUtil.age(dat) < 0 ) {
        Err('La date spécifiée est dans le futur !');
        W('vaccin-date').focus = true;
        return;
    }
    g_patient.vaccins[g_currentVaccinID] = { date: dat, lot: W('vaccin-lot').value };
    Patients.save( g_patient );
    closeVaccin();
};

exports.onVaccinDel = function() {
    delete g_patient.vaccins[g_currentVaccinID];
    Patients.save( g_patient );
    closeVaccin();
};

exports.onExam = function() {
    location = "#Exam/" + g_patientId;
};

exports.onNewVisit = function() {
    var visit = Patients.lastVisit( g_patient );
    if ( !visit || visit.exit || DateUtil.age( visit.enter ) > 3600 ) {
        // Il n'y a pas de visite en cours.
        if( visit && !visit.exit ) visit.exit = DateUtil.now();
        Patients.createVisit( g_patient ).then(function( visit ) {
            location.hash = "#Visit/" + g_patientId;            
        });
    } else {
        location.hash = "#Visit/" + g_patientId;
    }
};

exports.onPatientExit = function() {
    Modal.confirm(
        "<html>Confirmez vous que le patient<br/><b>"
            + Format.getPatientCaption( g_patient.data ) + "</b><br/>est sorti du service ?",
        function() {
            var visit = Patients.lastVisit( g_patient );
            if( !visit.exit ) visit.exit = DateUtil.now();
            var len = g_patient.admissions.length;
            var admission = g_patient.admissions[len - 1];
            admission.exit = DateUtil.now();
            Patients.save( g_patient ).then(function() {
                exports.onPage();
            });
        }
    );
};

exports.onPatientEdit = function() {
    ModalPatient( "Editer l'identité du patient", g_patient, function( patientData ) {
        g_patient.data = patientData;
        Patients.save( g_patient ).then( exports.onPage.bind( exports ) );
    });
};


function refreshAttachments() {
    var div = $('attachments');
    $.clear( div );
    if( !Array.isArray( g_patient.attachments ) ) g_patient.attachments = [];
    g_patient.attachments.forEach(function (item) {
        var btn = new Button({
            text: item.desc,
            icon: 'show',
            type: 'simple'
        });
        btn.on(function() {
            Msg("Affichage en cours...");
            nw.Shell.openItem( Path.resolve( "data/" + g_patient.id + "/" + item.id ) );
        });
        var btnDelete = new Icon({
            content: 'delete',
            button: true,
            size: "1.5rem",
            type: 'accent'
        });
        btnDelete.on(function() {
            Modal.confirm(
                "<html>Êtes-vous sûr de vouloir supprimer définitivement le document<br>"
                + "<code>" + item.desc + "</code> ?",
                function() {
                    Patients.detach( g_patient, item.id ).then( refreshAttachments, Err );
                }
            );
        });
        $.add( div, $.div([
            $.div([btn]), 
            $.div([Format.date(item.date)]),
            $.div([btnDelete])
        ]));
    });

}


exports.onAddAttachment = function() {
    var btnCancel = Button.Cancel();
    var btnOK = Button.Save();
    btnOK.enabled = false;

    var file = null;
    var input = $.tag( 'input', { type: 'file' } );
    input.addEventListener( 'change', function() {
        file = this.value;
        btnOK.enabled = true;
    });
    var desc = new Text({ label: "Description de la pièce jointe", wide: true });
    var modal = new Modal({ content: [
        input, desc, $.tag('hr'),
        new Flex({ content: [btnCancel, btnOK] })
    ]});
    modal.attach();
    window.setTimeout(function() {
        input.click();
    }, 300);

    btnOK.on(function() {
        var description = desc.value.trim();
        if( description.length == 0 ) {
            description = Path.basename( file );
        }
        desc.value = description;
        modal.detach();
        Patients.attach( g_patient, file, description ).then(function( patient ) {
            refreshAttachments();
        });
    });
    btnCancel.on(function() {
        modal.detach();
    });
};


  
module.exports._ = _;
/**
 * @module page.patient
 * @see module:$
 * @see module:dom
 * @see module:x-widget
 * @see module:tfw.message
 * @see module:wdg.text
 * @see module:wdg.flex
 * @see module:wdg.icon
 * @see module:wdg.modal
 * @see module:wdg.button
 * @see module:format
 * @see module:date
 * @see module:patients
 * @see module:structure
 * @see module:modal.patient

 */
});