/** @module page.home */require( 'page.home', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    var $ = require("dom");
var W = require("x-widget").getById;
var DB = require("tfw.data-binding");
var Cfg = require("$").config;
var Form = require("form");
var Data = require("data");
var Modal = require("wdg.modal");
var Format = require("format");
var Button = require("wdg.button");
var Structure = require("structure");
var LocalDownload = require("tfw.local-download");


exports.onPage = function() {
    $('version').textContent = "Version " + Cfg.version + " - " + Cfg.date.substr(0, 10);
    var count = Data.countPatients();
    W('patients-count').text = count + " patient" + (count < 2 ? "" : "s");
    var defSearchForm = Structure.patient;
    var wdgSearchForm = new Form( defSearchForm );
    var divSearchForm = document.getElementById('search-form');
    $.clear( divSearchForm );
    var divSearchResult = document.getElementById('search-result');
    $.clear( divSearchResult );
    var divSearchButton = document.getElementById('search-button');
    $.clear( divSearchButton );
    
    $.add( divSearchForm, wdgSearchForm );
    wdgSearchForm.focus = true;
    var btnRegister = new Button({
        text: "Enregistrer un nouveau patient",
        enabled: false,
        icon: "plus"
    });
    $.add( 'search-button', btnRegister );

    DB.bind( wdgSearchForm, 'value', function(v) {
        var suggestions = Data.findPatients( v );
        $.clear( divSearchResult );
        if (suggestions.length > 0) {
            suggestions.forEach(function (id) {
                var patient = Data.getPatient(id);
                var btn = new Button({
                    type: 'simple',
                    text: Format.getPatientCaption( patient ),
                    href: "#Patient/" + id,
                    wide: true
                });
                $.add( divSearchResult, $.tag('li', [btn] ) );
            });
        }

        // Pas de suggestions, mais peut-être un nouvel enregistrement.
        var keys = wdgSearchForm.keys;
        var key, val;
        btnRegister.enabled = true;
        btnRegister.visible = true;
        for (var i = 0; i < keys.length; i++) {
            key = keys[i];
            if (Array.isArray(defSearchForm[key].tags)) {
                if (defSearchForm[key].tags.indexOf('OPTIONAL') > -1) {
                    // Les  champs  optionels  sont  ignorés  pour  le
                    // mécanisme    de    désactivation   du    bouton
                    // d'enregistrement d'un nouveau patient.
                    continue;
                }
            }
            val = v[key];
            if (!val || val.trim().length == 0) {
                btnRegister.enabled = false;
                return;
            }
        }
    });

    btnRegister.on(function() {
        var id = Data.newPatient( wdgSearchForm.value );
        location.hash = "Patient/" + id;
    });
};


exports.onExport = function() {
    var data = Data.export();
    LocalDownload.saveAs( data, "base.json", "application/json" );
};


  
module.exports._ = _;
/**
 * @module page.home
 * @see module:$
 * @see module:dom
 * @see module:x-widget
 * @see module:tfw.data-binding
 * @see module:form
 * @see module:data
 * @see module:wdg.modal
 * @see module:format
 * @see module:wdg.button
 * @see module:structure
 * @see module:tfw.local-download

 */
});