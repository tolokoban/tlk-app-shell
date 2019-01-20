/** @module page.list */require( 'page.list', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

var $ = require("dom");
var Button = require("wdg.button");
var Format = require("format");
var Patients = require("patients");


exports.onPage = function() {
    $.clear('patients-list');
    Patients.all().then(function(patients) {
        var id, patientData;
        for( id in patients.records ) {
            patientData = patients.records[id];
            var btn = new Button({
                type: 'simple',
                href: '#Patient/' + id,
                text: Format.getPatientCaption( patientData )
            });
            $.add('patients-list', $.tag('li', [btn]));
        }
    });
};


  
module.exports._ = _;
/**
 * @module page.list
 * @see module:$
 * @see module:dom
 * @see module:wdg.button
 * @see module:format
 * @see module:patients

 */
});