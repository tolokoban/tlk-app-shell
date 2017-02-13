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
var g_config;

function get(key, def) {
    return Local.get('tolokoban-nw' + '/' + key, def);
}

function set(key, val) {
    return Local.set('tolokoban-nw' + '/' + key, val);
}


exports.start = function() {
    Modal.alert("Start debugger now!", function() {
        FS.readFile("package.json", function(err, out) {
            if( err ) {
                Err( "<html>Unable to read/parse <b>package.json</b>: <code>" + err.message + "</code>" );
                return;
            }
            try {
                var jsn = out.toString();
                g_config = JSON.parse( out.toString() );
            } catch( ex ) {
                Err("Bad JSON syntax in `package.json`!");
                return;
            }
            $('title').textContent = g_config.name + " " + g_config.version;

            var pkg = get( 'install' );
            debugger;
            if( pkg ) installPackage( pkg ).then( execApp );
            else checkFirstLaunch();
        });
    });
};

exports.onExit = exitApp;

/**
 * Check if it is the first launch or not.
 */
function checkFirstLaunch() {
    return new Promise(function (resolve, reject) {
        getPackageDef().then( downloadPackageIfNeeded )
        .then( showIndexPage );
    });
}

/**
 * Open the page `index.html` in the IFrame.
 */
function showIndexPage() {
    $('iframe').setAttribute( 'src', 'index.html' );
}

/**
 * Promise which resolves in an URL of the repository.
 */
function getRepositoryUrl() {
    return new Promise(function (resolve, reject) {
        var repository = get( 'repository' );
        if( repository ) return resolve( repository );
        var repo = new Text({
            label: _('repository'), wide: false, width: '30rem',
            value: 'http://localhost/www/Cameroun/index.php'
        });
        var loading = new Modal({ padding: true, content: [new Wait({ text: _('loading') })] });
        var ok = Button.Ok();
        var exit = new Button({ text: _('exit'), icon: "close", type: 'simple' });
        exit.on( exitApp );
        var content = $.div([
            repo, ok,
            $.tag('hr'),
            $.tag('center', [exit])
        ]);
        DB.bind( repo, 'action', ok, 'fire' );
        var modal = new Modal({ padding: true, content: content });
        modal.attach();
        window.setTimeout(function() {
            repo.focus = true;
        }, 300);
        ok.on(function() {
            resolve( repo.value.trim() );
        });
    });
}

/**
 * Resolves in the URL of the repo and the ID of the package.
 * `{ repo: <string>, id: <string> }`
 */
function getPackageUrl( repoUrl ) {
    return new Promise(function (resolve, reject) {
        set( 'repository', repoUrl );
        var pkgId = get( 'id' );
        if( pkgId ) resolve( repoUrl + "?" + pkgId );
        // Ask the repository the list of packages.
        fetch( repoUrl ).then(function(response) {
            if( !response.ok ) throw { message: response.status + ": " + response.statusText };
            return response.json();
        }).then(function( packagesList ) {

            // @TODO Manage the case of multi packages by adding a selection screen.
            resolve({
                repo: repoUrl,
                id: packagesList[0].id
            });
        }).catch(function(err) {
            manageNetworkFailure( repoUrl, err ).then( resolve );
        });
    });
}

/**
 * Network errors are ignored if the first installation has already occured.
 * That means if the `version` storage attribute has already been set.
 */
function manageNetworkFailure( url, err ) {
    return new Promise(function (resolve, reject) {
        console.error( "Unable to contact ", url, " because of error ", err );
        if( get('version') ) resolve( null );
        else {
            Modal.alert(_('network-error', url, err.message), function() {
                set('repository', null);
                set('id', null);
                set('version', null);
                location.reload();
            });
        }
    });
}

/**
 * Resolves in a package definition or `null`.
 * A package definition has this format:
 * ```
 * {
 *   url: <string>
 *   version: <string>
 *   files: [<string>, ...]
 * }
 * ```
 */
function getPackageDef() {
    return new Promise(function (resolve, reject) {
        getRepositoryUrl().then( getPackageUrl ).then(function( pkgUrl ) {
            var url = pkgUrl.repo + "?" + pkgUrl.id;
            fetch( url ).then(function( response ) {
                if( !response.ok ) throw { message: response.status + ": " + response.statusText };
                return response.json();
            }).then(function(pkgDef) {
                resolve(pkgDef);
            }).catch(function(err) {
                manageNetworkFailure( url, err ).then( resolve );
            });
        });
    });
}

/**
 * If `get("version")` is missing  or different from `pkg.version`, we
 * must download the package files.
 * It  `get("version")` is  not  missing, the  downloads  will run  in
 * background. Otherwise, we will wait for all the downloads to finish
 * before resolving.
 */
function downloadPackageIfNeeded( pkg ) {
    // Check existence of download folder.
    mkdir("tolokoban-nw/download");

    var downloadedFiles = [];
    return new Promise(function (resolve, reject) {
        var next = function() {
            console.info("[tolokoban-nw] pkg=", pkg);
            if( pkg.files.length == 0 ) {
                pkg.files = downloadedFiles;
                // @TODO Mettre dans le bon parametre.
                Local.set('tolokoban-nw/install666', pkg);
                resolve();
                return;
            }
            $('tooltip').textContent = _('download-progress', pkg.files.length);
            var file = pkg.files.pop();
            mkdir( 'tolokoban-nw/download/' + Path.dirname( file ) );
            var url = pkg.url + file;
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
            }).catch(function(err) {
                manageNetworkFailure( url, err ).then( resolve );
            });
        };

        next();
    });
}

/**
 * Close the mian window, hence exit the application.
 */
function exitApp() {
    Modal.confirm(_('confirm-exit'), function() {
        nw.Window.get().close();
    });
}

/**
 * Execute the application by loading `index.html` page.
 */
function execApp() {
    $('iframe').setAttribute( 'src', 'index.html' );
}

/**
 * Install package stored in `/tolokoban-nw/package`.
 */
function installPackage( pkg ) {
    return new Promise(function (resolve, reject) {
        alert('TODO!');
    });
}

/**
 * Create directories recursively.
 * If they are already created, no problem.
 */
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
    var exit = new Button({ text: _('exit'), icon: "close", type: 'simple' });
    exit.on(function() {
        nw.Window.get().close();
    });
    var content = $.div([
        repo, ok,
        $.tag('hr'),
        $.tag('center', [exit])
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
            Local.set('tolokoban-nw/repository', url);
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
            repo.focus = true;
            Err( "<html>" + _('bad-repo') + "<br/>" + err.message );
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
                Local.set('tolokoban-nw/install', def);
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



function upgrade( def ) {
    return new Promise(function (resolve, reject) {
        var next = function() {
            if( def.files.length == 0 ) {
                $('tooltip').textContent = '';
                Local.set('tolokoban-nw/install', null);
                resolve();
                return;
            }
            $('tooltip').textContent = _('install-progress', def.files.length);
            var file = def.files.pop();
            mkdir( Path.dirname( file ) );
            FS.readFile( "./tolokoban-nw/download/" + file, function(err, data) {
                if( err ) {
                    console.error( err );
                    reject( err );
                    return;
                }
                FS.writeFile( file, data, function( err ) {
                    if( err ) {
                        console.error( err );
                        reject( err );
                        return;
                    }
                    next();
                });
            });
        };
        next();
    });
}
