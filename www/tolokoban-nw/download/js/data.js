/** @module data */require( 'data', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";
/**
 * @module data
 *
 * ```
 * visit := {
 *   enter: <number>
 *   exit: <number>
 *   data: {}
 *   prescriptions: []
 * }
 *
 *
 * @example
 * var mod = require('data');
 */


var Guid = require("guid");
var Storage = require("tfw.storage").local;
var Structure = require("structure");


var data = Storage.get("cameroun", {});

/**
 * Compter le nombre de patients.
 */
exports.countPatients = function() {
    var count = 0;
    for( var key in data ) count++;
    return count;
};

exports.getAllPatients = function() {
    var patients = [];
    var key, val;
    for( key in data ) {
        val = data[key];
        patients.push([
            key, val['#PATIENT-LASTNAME'], val['#PATIENT-FIRSTNAME'], val['#PATIENT-BIRTH']
        ]);
    }
    patients.sort(function(a,b) {
        var A = a[1] + "     " + a[2] + "     " + a[3];
        var B = b[1] + "     " + b[2] + "     " + b[3];
        if( A < B ) return -1;
        if( A > B ) return +1;
        return 0;
    });
    return patients;
};

/**
 * Retourner une liste de patients' id.
 */
exports.findPatients = function(criteria, limit) {
    if( typeof limit === 'undefined' ) limit = 5;

    // Mettre les critères en minuscule.
    var critKey, critVal;
    for( critKey in criteria ) {
        critVal = criteria[critKey];
        if( typeof critVal !== 'string' ) continue;
        criteria[critKey] = critVal.trim().toLowerCase();
    }

    var result = [];
    var patientKey, patientVal, patientAtt, score;
    var percent, pos;
    for( patientKey in data ) {
        patientVal = data[patientKey];
        if( !patientVal ) console.error("No patient with id: ", patientKey);
        score = 0;
        for( critKey in criteria ) {
            critVal = criteria[critKey];
            patientAtt = patientVal[critKey];
            if( !patientAtt ) {
                console.error("Bad criteria: ", critKey);
                continue;
            }
            patientAtt = patientAtt.toLowerCase();
            if (patientAtt.length == 0) continue;
            percent = critVal.length / patientAtt.length;
            if (percent > 1) continue;
            pos = patientAtt.indexOf( critVal );
            if (pos < 0) continue;
            score = Math.max( 0, 100 * percent - pos );
            result.push([score, patientKey]);
        }
    }

    // Trier par score décroissant.
    result.sort(function(a, b) {
        return b[0] - a[0];
    });

    result = result.slice(0, limit);
    result = result.map(function(v) {
        return v[1];
    });
    return result;
};


exports.getPatient = function(id) {
    return data[id];
};


exports.newPatient = function(value) {
    var id = Guid();
    var patient = JSON.parse(JSON.stringify(value));
    patient.$id = id;
    patient.$admissions = [];
    data[id] = patient;
    exports.save();
    return id;
};


/**
 * @return `{ old: '', new: '' }`
 */
exports.getValue = function( patient, id ) {
    var visit = exports.getLastVisit( patient );
    var result = {
        new: visit.data[id]
    };
    if (!Array.isArray(patient.$admissions)) patient.$admissions = [];
    patient.$admissions.forEach(function (admission) {
        admission.visits.forEach(function (visit) {
            var value = visit.data;
            if (value === result.new) return;
            var v = value[id];
            if (typeof v !== 'undefined' && v.length > 0 ) {
                result.old = v;
            }
        });
    });

    return result;
};

exports.setVaccin = function(patient, id, vaccin) {
    if( typeof patient.$vaccins === 'undefined' ) patient.$vaccins = {};
    var dte = vaccin.date;
    var lot = vaccin.lot;
    if( typeof lot !== 'string' ) lot = '';
    if( dte instanceof Date ) dte = dte.toString();
    patient.$vaccins[id] = {date: dte, lot: lot};
    exports.save();
};

exports.delVaccin = function(patient, id) {
    if( typeof patient.$vaccins === 'undefined' ) return;
    delete patient.$vaccins[id];
    exports.save();
};

exports.getVaccin = function(patient, id) {
    if( typeof patient.$vaccins === 'undefined' ) return undefined;
    var vaccin = patient.$vaccins[id];
    if( !vaccin ) return undefined;
    if( typeof vaccin === 'string' ) return undefined;
    if( typeof vaccin.date !== 'string' ) return undefined;
    var dte = new Date( vaccin.date );
    if( isNaN( dte.getTime() ) ) return undefined;
    var lot = vaccin.lot;
    if( typeof lot !== 'string' ) lot = '';
    return { date: dte, lot: lot };
};

/**
 * Find the last patient's visit or return `null`.
 */
exports.getLastVisit = function( patient ) {
    if (!Array.isArray(patient.$admissions)) return null;
    var admission = patient.$admissions[patient.$admissions.length - 1];
    if (!admission) return null;
    if (!Array.isArray(admission.visits)) return null;
    if (admission.visits.length == 0) return null;
    return admission.visits[admission.visits.length - 1];
};


exports.createVisit = function( patient ) {
    var admission;
    if (!Array.isArray(patient.$admissions) || patient.$admissions.length == 0) {
        admission = exports.createAdmission( patient );
    } else {
        admission = patient.$admissions[patient.$admissions.length - 1];
    }

    var visit = { enter: Date.now(), data: {}, prescriptions: [] };
    admission.visits.push( visit );
    exports.save();
    return visit;
};


exports.closeVisit = function( visit ) {
    visit.exit = Date.now();
};


exports.createAdmission = function( patient ) {
    var admission = { enter: Date.now(), visits: [] };
    if (!Array.isArray(patient.$admissions) || patient.$admissions.length == 0) {
        patient.$admissions = [admission];
    } else {
        patient.$admissions.push( admission );
    }
    exports.save();
    return admission;
};


exports.save = function() {
    Storage.set('cameroun', data);
};


exports.export = function() {
    var s = JSON.stringify(data, null, '  ');
    return s;
};


  
module.exports._ = _;
/**
 * @module data
 * @see module:$
 * @see module:guid
 * @see module:tfw.storage
 * @see module:structure

 */
});