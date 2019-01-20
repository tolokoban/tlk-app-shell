/** @module modal.patient */require( 'modal.patient', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

var $ = require("dom");
var Err = require("tfw.message").error;
var Form = require("form");
var Flex = require("wdg.flex");
var Modal = require("wdg.modal");
var Button = require("wdg.button");
var Structure = require("structure");


/**
 * @param {string} caption - Mandatory.
 * @param {object} patient - Optional.
 * @param {function} onOk - Mandatory.
 * @param {function} onCancel - Optional.
 */
module.exports = function( caption, patient, onOK, onCancel ) {
    if( typeof patient === 'function' ) {
        onCancel = onOK;
        onOK = patient;
        patient = {};
    }
    var btnCancel = Button.Cancel();
    var btnOK = Button.Ok();
    var defSearchForm = Structure.value.patient;
    var wdgSearchForm = new Form( defSearchForm );
    wdgSearchForm.value = patient.data;
    var modal = new Modal({
        content: $.div({
            style: "width: 600px"
        }, [
            $.tag( 'h1', [caption] ),
            wdgSearchForm,
            $.div({ margin: '2rem' }, ["<html>&nbsp;"]),
            $.tag( 'hr' ),
            new Flex({ content: [btnCancel, btnOK ] })
        ])
    });
    btnOK.on(function() {
        patient = wdgSearchForm.value;
        var keys = wdgSearchForm.keys;
        var key, val;
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
            val = patient[key];
            console.info("[modal.patient] patient[" + key + "]=", patient[key]);
            if( !val ) {
                Err("<html>Champ obligatoire !<br/><code>" 
                    + defSearchForm[key].caption + "</code>");
                return;
            }
        }
        
        modal.detach();
        wdgSearchForm.focus = true;
        onOK( patient );
    });
    btnCancel.on(function() {
        modal.detach();
        if( typeof onCancel === 'function' ) {
            onCancel();
        }
    });
    modal.attach();
};


  
module.exports._ = _;
/**
 * @module modal.patient
 * @see module:$
 * @see module:dom
 * @see module:tfw.message
 * @see module:form
 * @see module:wdg.flex
 * @see module:wdg.modal
 * @see module:wdg.button
 * @see module:structure

 */
});