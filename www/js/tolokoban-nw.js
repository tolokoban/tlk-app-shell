/** @module tolokoban-nw */require( 'tolokoban-nw', function(require, module, exports) { var _=function(){var D={"en":{"bad-repo":"Unable to contact this repository!","confirm-exit":"Are you sure you want to exit this application?","download-progress":"Downloading in progress: $1","exit":"Exit","loading":"Downloading application files...","repository":"Repository's URL"},"fr":{"bad-repo":"Le dépôt spécifié ne répond pas !","confirm-exit":"Êtes-vous sûr de vouloir quitter cette application ?","download-progress":"Téléchargement en cours: $1","exit":"Quitter","loading":"Téléchargement de l'application...","repository":"URL du dépôt"}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    /**
 * This is an application container.
 * It manages updates in background.
 */

"use strict";

var $ = require("dom");
var DB = require("tfw.data-binding");
var Err = require("tfw.message").error;
var Text = require("wdg.text");
var Wait = require("wdg.wait");
var Modal = require("wdg.modal");
var Local = require("tfw.storage").local;
var Button = require("wdg.button");

var FS = require("node://fs");
var Path = require("node://path");

var g_rootFolder = Path.resolve('.');
console.info("[tolokoban-nw] g_rootFolder=", g_rootFolder);

exports.start = function() {
    var installation = Local.get( 'install', null );
    if( installation ) upgrade( installation );
    else launch();
};


exports.onExit = function() {
    Modal.confirm(_('confirm-exit'), function() {
        nw.Window.get().close();
    });
};


function launch() {
    FS.readFile("package.json", function(err, out) {
        if( err ) {
            Err( err );
            return;
        }
        try {
            var jsn = out.toString();
            var pkg = JSON.parse( out.toString() );
            if( !checkForUpdates( pkg ) ) return;
        } catch( ex ) {
            Err("Bad JSON syntax in `package.json`!");
            return;
        }
        $('title').textContent = pkg.name + " " + pkg.version;
        $('iframe').setAttribute( 'src', 'index.html' );
    });
}


/**
 * Two cases: first install or update.
 */
function checkForUpdates( pkg ) {
    if( !pkg.tfw || !pkg.tfw.app
        || typeof pkg.tfw.app.id !== 'string' )
    {
        install( pkg );
        return false;
    }

    return true;
}


function install( pkg ) {
    if( typeof pkg.tfw === 'undefined' ) pkg.tfw = {};
    if( typeof pkg.tfw.app === 'undefined' ) pkg.tfw.app = {};
    var repo = new Text({
        label: _('repository'), wide: false, width: '30rem',
        value: 'http://localhost/Cameroun/index.php'
    });
    var loading = new Modal({ padding: true, content: [new Wait({ text: _('loading') })] });
    var ok = Button.Ok();
    var content = $.div([
        repo, ok
    ]);
    DB.bind( repo, 'action', ok, 'fire' );
    var modal = new Modal({ padding: true, content: content });
    modal.attach();
    window.setTimeout(function() {
        repo.focus = true;
    }, 300);
    ok.on(function() {
        var url = repo.value.trim();
        fetch( url ).then(function(response) {
            console.info("[tolokoban-nw] response=", response);
            if( !response.ok ) {
                Err(_('bad-repo') + " - " + response.status);
                repo.focus = true;
                return;
            }
            modal.detach();
            return response.json();
        }).then(function(list) {
            console.info("[tolokoban-nw] list=", list);
            return fetch( url + '?' + list[0].id )
        }).then(function(response) {
            return response.json();
        }).then(function(def) {
            console.info("[tolokoban-nw] def=", def);
            loading.attach();
            return download( def );
        }).then(function() {
            loading.detach();
            location.reload();
        }).catch(function(err) {
            console.error( err );
            Err( err );
            modal.detach();
        });
    });
}


function download(def) {
    // Check existence of download folder.
    mkdir("tolokoban-nw/download");

    var downloadedFiles = [];
    return new Promise(function (resolve, reject) {
        var next = function() {
console.info("[tolokoban-nw] def=", def);
            if( def.files.length == 0 ) {
                def.files = downloadedFiles;
                Local.set('install', def);
                resolve();
                return;
            }
            $('tooltip').textContent = _('download-progress', def.files.length);
            var file = def.files.pop();
            mkdir( 'tolokoban-nw/download/' + Path.dirname( file ) );
            var url = def.url + file;
            fetch( url ).then(function(response) {
                if( !response.ok ) {
                    throw Error(response.status + " " + response.statusText + " - " + url);
                }
                downloadedFiles.push( file );
                return response.arrayBuffer();
            }).then(function(arrayBuffer) {
                var output = Path.resolve(Path.join(g_rootFolder, "tolokoban-nw/download/", file));
                var data = new Buffer( arrayBuffer );
                console.info("[tolokoban-nw] output=", output);
                console.info("[tolokoban-nw] arrayBuffer=", arrayBuffer);
                FS.writeFile( output, data, function( err ) {
                    if( err ) throw Error("Unable to write file: " + output + "\n" + err);
                    next();
                });
            }).catch( reject );
        };

        next();
    });
}


function mkdir(folder) {
    var folders = folder.split( '/' );
    var dir = '.';
    folders.forEach(function (folder) {
        dir += '/' + folder;
        if( !FS.existsSync( dir ) ) {
            FS.mkdir( dir );
        }
    });
}


function update( def ) {
    console.info("[tolokoban-nw] def=", def);
    alert('upgrage');
    Local.set('install', null);
}


  
module.exports._ = _;
/**
 * @module tolokoban-nw
 * @see module:$
 * @see module:dom
 * @see module:tfw.data-binding
 * @see module:tfw.message
 * @see module:wdg.text
 * @see module:wdg.wait
 * @see module:wdg.modal
 * @see module:tfw.storage
 * @see module:wdg.button

 */
});