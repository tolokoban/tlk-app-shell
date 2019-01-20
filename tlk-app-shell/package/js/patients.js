/** @module patients */require( 'patients', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    /**
 * Patients are stored locally on hard disk.
 * The list of patients is in `data/patients.json`:
 * ```
 * {
 *   "count": 13,
 *   "records": {
 *     "c14D5": {
 *       // Patient identity taken from `patient.org`
 *     },
 *     ...
 *   }
 * }
 * ```
 *
 * There is a folder for each patient. For instance: `data/c14D5`.
 * It owns  all the attachments  files for  this patient and  the file
 * `patient.json` which has this format:
 * ```
 * {
 *   "id": <Patient ID>
 *   "created": <seconds since UNIX epoc (UTC)>,
 *   "edited": <seconds since UNIX epoc (UTC)>,
 *   "data": {
 *     // Patient identity taken from `patient.org`
 *   },
 *   "admissions": [
 *     {
 *       "enter": <seconds since UNIX epoc (UTC)>,
 *       "exit": <seconds since UNIX epoc (UTC)>,
 *       "visits": [
 *         {
 *           "enter": <seconds since UNIX epoc (UTC)>,
 *           "exit": <seconds since UNIX epoc (UTC)>,
 *           "data": <forms.org>,
 *         },
 *         ...
 *       ]
 *     },
 *     ...
 *   ],
 *   "vaccins": {
 *     "HA": {
 *       "date": <seconds since UNIX epoc (UTC)>,
 *       "lot": <numéro de lot {string}>
 *     },
 *     ...
 *   },
 *   "exams": [
 *     {
 *       "date": ...,
 *       "done": <{boolean}>  // If not done, we are still waiting for results.
 *       "data": [
 *         ["Prescription d'examen biologique", [
 *             ["Biologie sanguine", {
 *                 "CL": <result or null>
 *                 "K": <result or null>
 *                 ...
 *               }
 *             ]
 *           ]
 *         ]
 *       ]
 *     },
 *     ...
 *   ],
 *   "picture": "data:..."  // Identity picture 192x192 (DataURI).
 *   "attachments": [
 *     {
 *       "id": "32JK.pdf",
 *       "desc": "Radiographie",
 *       "date": <seconds since UNIX epoc (UTC)>
 *     }
 *   }
 * }
 * ```
 */
"use strict";

var FS = require("node://fs");
var Path = require("node://path");
var Guid = require("guid");
var Fatal = require("fatal");
var Files = require("files");
var Spawn = require('node://child_process').spawn;
var DateUtil = require("date");

var g_patients = null;


module.exports = {
    /**
     * @resolve patients
     */
    all: getAllPatients,
    count: countPatients,
    get: getPatient,
    /**
     * @param {object} data - (optional) Initial data.
     * @resolve {object} patient.
     */
    create: createPatient,
    save: save,
    exit: closeAdmission,
    /**
     * @param {object} patient.
     * @resolve {object} visit.
     */
    createVisit: createVisit,
    /**
     * @resolve {string} Full path to the resulting `*.tgz` file.
     */
    export: exportPatients,
    /**
     * @param {object} patient.
     * @param {string} filename.
     * @param {string} description.
     * @resolve {string} filename.
     */
    attach: addAttachment,
    /**
     * @param {object} patient.
     * @param {string} attachment's ID.
     * @resolve {undefined}
     */
    detach: delAttachment,

    ////////////////////////////////////////////////
    // Following functions don't return Promises. //
    ////////////////////////////////////////////////

    /**
     * @param {object} patient - Patient.
     * @param {string} id - Value's ID.
     * @return {object} Value of a specific attributes.
     * @return {string} .old - Value of previous visits.
     * @return {string} .new - Value of last visit.
     */
    value: getPatientValue,
    lastVisit: getLastVisit
};

/**
 * Resolves in `patients`.
 */
function getAllPatients() {
    return new Promise(function (resolve, reject) {
        if( g_patients ) resolve( g_patients );
        else {
            Files.mkdir( 'data' ).then(function() {
                var filename = 'data/patients.json';
                if( !FS.existsSync( filename ) ) {
                    // The file does not exist. We have to create it.
                    g_patients = {
                        count: 0, records: {}
                    };
                    Files.writeJson( filename, g_patients ).then( resolve, reject );
                } else {
                    Files.readJson( filename ).then(function( data ) {
                        g_patients = data;
                        resolve( data );
                    }, reject );
                }
            });
        }
    });
}

/**
 * Resolves in `count`.
 */
function countPatients() {
    return new Promise(function (resolve, reject) {
        getAllPatients().then(function( patients ) {
            resolve( patients.count || 0 );
        }, reject );
    });
};

/**
 * Resolves in `patient` or `null`.
 */
function getPatient( patientId ) {
    return new Promise(function (resolve, reject) {
        getAllPatients().then(function( patients ) {
            if( !patients.records || !patients.records[patientId] ) resolve( null );
            else {
                var filename = 'data/' + patientId + '/patient.json';
                Files.readJson( filename ).then( function( patient ) {
                    if( isInvalidPatient( patient, reject, "[patients.getPatient]" ) ) {
                        return;
                    }
                    resolve( patient );
                }, reject );
            }
        }, reject );
    });
}

/**
 * Resolves in `patient`.
 */
function createPatient( data ) {
    if( !data || typeof data !== 'object' ) data = {};
    return new Promise(function (resolve, reject) {
        save({
            id: Guid(),
            created: DateUtil.now(),
            edited: DateUtil.now(),
            data: data,
            admissions: [],
            vaccins: {},
            exams: [],
            picture: null,
            attachments: {}
        }).then( resolve, reject );
    });
}


/**
 * Save a patient and the list of all patients.
 * Resolves in `patient`.
 */
function save(patient) {
    return new Promise(function (resolve, reject) {
        if( isInvalidPatient( patient, reject, "[patients.save]" ) ) return;
        getAllPatients().then(function( patients ) {
            if( typeof patient !== 'undefined' ) {
                patient.edited = DateUtil.now();
                if( typeof patients.records[patient.id] === 'undefined' ) {
                    patients.count = (patients.count || 0) + 1;
                }
                patients.records[patient.id] = patient.data;
                var filename = 'data/' + patient.id + "/patient.json";
                Files.writeJson( filename, patient ).then(function() {
                    saveAllPatients().then( resolve.bind( null, patient ), reject );
                }, reject );
            } else {
                // Save all patients.
                saveAllPatients().then( resolve.bind( null, patient ), reject );
            }
        });
    });
}


/**
 * Save `data/patients.json`.
 */
function saveAllPatients() {
    return new Promise(function (resolve, reject) {
        getAllPatients().then(function(patients) {
            var filename = 'data/patients.json';
            Files.writeJson( filename, patients ).then( resolve, reject );
        });
    });
}

/**
 * Resolves in `visit`.
 */
function createVisit( patient ) {
    return new Promise(function (resolve, reject) {
        if( isInvalidPatient( patient, reject, "[patients.createVisit]" ) ) return;
        var admission = getCurrentAdmission( patient );
        var visit = {
            enter: DateUtil.now(),
            data: {}
        };
        admission.visits.push( visit );
        save( patient ).then( resolve.bind( null, visit ), reject );
    });
}

/**
 * Resolves in `patient`.
 */
function closeAdmission( patient ) {
    return new Promise(function (resolve, reject) {
        if( isInvalidPatient( patient, reject, "[patients.closeAdmission]" ) ) return;
        var admissions = patient.admissions || [];
        var len = admissions.length;
        if( len == 0 ) return resolve( patient );
        var admission = admissions[len - 1];
        if( typeof admission.exit !== 'undefined' ) resolve( patient );
        else {
            admission.exit = DateUtil.now();
            save( patient ).then( resolve.bind( null, patient ), reject );
        }
    });
}

function exportPatients() {
    return new Promise(function (resolve, reject) {
        var path = Path.resolve('.');
        var inputPath = "data/";
        var outputPath = "data.tgz";
        var process = Spawn( "tar", ["-czf", outputPath, inputPath] );
        process.stdout.on('data', function(data) {
            console.info( data );
        });
        process.stderr.on('data', function(data) {
            console.error( data );
        });
        process.on( 'close', resolve.bind( null, Path.join( path, outputPath ) ) );
    });
}

function addAttachment( patient, filename, description ) {
    return new Promise(function (resolve, reject) {
        var id = Guid() + Path.extname( filename );
        var dst = "./data/" + patient.id + "/" + id;
        Files.copy( filename, dst ).then(function() {
            if( !Array.isArray( patient.attachments ) ) patient.attachments = [];
            var item = {
                id: id, desc: description, date: DateUtil.now()
            };
            patient.attachments.unshift( item );
            save( patient ).then( function() {
                resolve( Path.resolve( dst ) );
            }, reject );
        }, reject);
    });
}

function delAttachment( patient, id ) {
    return new Promise(function (resolve, reject) {
        Files.delete( "data/" + patient.id + "/" + id ).then(function() {
            patient.attachments = patient.attachments.filter(function(itm) {
                return itm.id != id;
            });
            save( patient ).then( resolve, reject );
        }, reject);
    });
}

////////////////////////////////////////////////
// Following functions don't return Promises. //
////////////////////////////////////////////////

/**
 * Check if the `patient` is a correct one.
 */
function isInvalidPatient( patient, reject, src ) {
    if( !patient || typeof patient !== 'object' || typeof patient.id !== 'string' ) {
        Fatal( reject, "This is not a valid patient!", {
            patient: patient,
            src: src
        });
        return true;
    }
    return false;
}

/**
 * Get the current open admission or create it.
 */
function getCurrentAdmission( patient ) {
    if( typeof patient.admissions === 'undefined' ) patient.admissions = [];
    var len = patient.admissions.length;
    var admission = len == 0 ? {exit: 1} : patient.admissions[len - 1];
    if( !admission.exit ) return admission;
    admission = {
        enter: DateUtil.now(),
        visits: []
    };
    patient.admissions.push( admission );
    return admission;
}


/**
 * @return `{ old: '', new: '' }`
 */
function getPatientValue( patient, id ) {
    var visit = getLastVisit( patient );
    var result = {
        new: visit ? visit.data[id] : undefined
    };
    if (!Array.isArray(patient.admissions)) patient.admissions = [];
    patient.admissions.forEach(function (admission) {
        admission.visits.forEach(function (visit) {
            var value = visit.data;
            if (value === result.new) return;
            var v = value[id];
            if (typeof v !== 'undefined' && v.length !== 0 ) {
                result.old = v;
            }
        });
    });

    return result;
}

/**
 * Return last visit or `null`.
 */
function getLastVisit( patient ) {
    if( typeof patient.admissions === 'undefined' ) patient.admissions = [];
    var len = patient.admissions.length;
    if( len == 0 ) return null;
    var admission = patient.admissions[len - 1];
    var visits = admission.visits;
    if( !Array.isArray( visits ) ) return null;
    len = visits.length;
    if( len == 0 ) return null;
    return visits[len - 1];
}


  
module.exports._ = _;
/**
 * @module patients
 * @see module:$
 * @see module:guid
 * @see module:fatal
 * @see module:files
 * @see module:date

 */
});