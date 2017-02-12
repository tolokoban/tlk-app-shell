/** @module page.list */require( 'page.list', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";

var $ = require("dom");
var Data = require("data");
var Button = require("wdg.button");


exports.onPage = function() {
    $.clear('patients-list');
    var patients = Data.getAllPatients();
    patients.forEach(function (patient) {
        // Patient is an array:
        // [id, lastname, firstname, birthdate]
        var btn = new Button({
            type: 'simple',
            href: '#Patient/' + patient[0],
            text: patient[1].toUpperCase() + " " + patient[2] + " (" + patient[3] + ")"
        });
        $.add('patients-list', $.tag('li', [btn]));
    });
};


  
module.exports._ = _;
/**
 * @module page.list
 * @see module:$
 * @see module:dom
 * @see module:data
 * @see module:wdg.button

 */
});