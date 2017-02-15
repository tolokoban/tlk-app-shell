/**
 * This is an application container.
 * It manages updates in background.
 */

"use strict";

var $ = require("dom");
var DB = require("tfw.data-binding");
var Msg = require("tfw.message").info;
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

var APP_ID = "tlk-app-shell";
var PACKAGE_DIR = APP_ID + "/package";


function get(key, def) {
    return Local.get(APP_ID + '/' + key, def);
}

function set(key, val) {
    return Local.set(APP_ID + '/' + key, val);
}


exports.start = function() {
    if( location.search == '?debug' ) {
        nw.Window.get().showDevTools( null, start );
        //Modal.alert("Start debugger now!", start);
    } else {
        start();
    }
};

function start() {
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
        if( pkg ) installPackage( pkg ).then( execApp );
        else checkFirstLaunch();
    });
};

exports.onExit = exitApp;

/**
 * Check if it is the first launch or not.
 */
function checkFirstLaunch() {
    return new Promise(function (resolve, reject) {
        log( "> checkFirstLaunch()" );
        getPackageDef().then( downloadPackageIfNeeded )
            .then( execApp );
    });
}

/**
 * Promise which resolves in an URL of the repository.
 */
function getRepositoryUrl() {
    return new Promise(function (resolve, reject) {
        log( "> getRepositoryUrl()" );
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
        log( "> getPackageUrl(", repoUrl, ")" );
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
        console.error( "[NetworkFailure] Unable to contact ", url, " because of error ", err );
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

function manageInstallFailure( pkg, err ) {
    return new Promise(function (resolve, reject) {
        console.error( "[InstallFailure] Unable to install package ", pkg, " because of error ", err );
        Modal.alert(_('install-error', pkg.version, err.message), function() {
            set('version', null);
            if( !get('version') ) location.reload();
        });
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
        log( "> getPackageDef()" );
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
    mkdir( PACKAGE_DIR );

    var downloadedFiles = [];
    return new Promise(function (resolve, reject) {
        log( "> downloadPackageIfNeeded(", pkg, ")" );
        var next = function() {
            if( pkg.files.length == 0 ) {
                log("Download is done!");
                $('tooltip').textContent = '';
                pkg.files = downloadedFiles;
                set('install', pkg);
                if( get('version', null) === null ) {
                    // First install.
                    installPackage( pkg ).then( resolve );
                } else {
                    Msg( _('available', pkg.version) );
                }
                return;
            }
            $('tooltip').textContent = _('download-progress', pkg.files.length);
            var file = pkg.files.pop();
            var dir = PACKAGE_DIR + Path.dirname( file );
            var url = pkg.url + file;
            fetch( url, {
                cache: 'no-cache',
                mode: 'cors',
                redirect: 'follow'
            }).then(function(response) {
                log( response.url, response.ok );
                if( !response.ok ) {
                    throw Error(response.status + " " + response.statusText + " - " + response.url);
                }
                downloadedFiles.push( file );
                return response.arrayBuffer();
            }).then(function(arrayBuffer) {
                var output = Path.resolve(Path.join(g_rootFolder, PACKAGE_DIR, file));
                mkdir( dirname( output ) );
                var data = new Buffer( arrayBuffer );
                FS.writeFile( output, data, function( err ) {
                    if( err ) {
                        console.error( "Unable to write file: " + output + "\n", err );
                        throw Error("Unable to write file: " + output + "\n" + err);
                    }
                    next();
                });
            }).catch(function(err) {
                manageNetworkFailure( url, err ).then( resolve );
            });
        };

        if( !pkg || get('version') === pkg.version ) {
            // Version is uptodate, or we were unable to download the package definition.
            log("get('version')=...", get('version'));
            log("pkg.version=...", pkg.version);
            resolve( pkg );
        } else {
            if( get('version') ) {
                // New version is downloaded in background.
                log("Background download...");
                resolve( pkg );
            }
            log("Start download.");
            next();
        }
    });
}

/**
 * Close the mian window, hence exit the application.
 */
function exitApp( withoutConfirmation ) {
    if( withoutConfirmation ) nw.Window.get().close();
    else Modal.confirm(_('confirm-exit'), function() {
        nw.Window.get().close();
    });
}

/**
 * Execute the application by loading `index.html` page.
 */
function execApp() {
    try {
        log( "> execApp()" );
        if( !FS.existsSync( "./index.html" ) ) {
            throw Error("Missing start page!");
        }
        $('title').textContent = g_config.name + " " + g_config.version;
        $('iframe').setAttribute( 'src', 'index.html' );
    } catch( ex ) {
        set('version', null);
        Modal.alert(_('install-corruption'), exitApp.bind( null, true ));
    }
}

/**
 * Install package stored in `install`.
 */
function installPackage( pkg ) {
    return new Promise(function (resolve, reject) {
        log( "> installPackage(", pkg, ")" );
        // If installation failed, the package will be doanloaded again.
        set('install', null);

        var modal = new Modal({
            content: new Wait({ text: _('install-progress', pkg.version) })
        });
        modal.attach();

        var next = function() {
            if( pkg.files.length == 0 ) {
                // Everything has been installed, we can update the version number.
                set('version', pkg.version);
                g_config.version = pkg.version;
                g_config.name = pkg.name;
                $('tooltip').textContent = '';
                FS.writeFile( "package.json", JSON.stringify( g_config, null, '    ' ), function( err ) {
                    modal.detach();
                    resolve();
                });
                return;
            }
            $('tooltip').textContent = _('install-progress', pkg.files.length);
            var file = pkg.files.pop();
            mkdir( dirname( file ) );
            FS.readFile( "./" + PACKAGE_DIR + "/" + file, function(err, data) {
                if( err ) {
                    console.error( err );
                    manageInstallFailure( pkg, err );
                    return;
                }
                FS.writeFile( file, data, function( err ) {
                    if( err ) {
                        console.error( err );
                        manageInstallFailure( pkg, err );
                        return;
                    }
                    next();
                });
            });
        };
        // Start installation in 600 ms to give the time to read the version number.
        window.setTimeout( next, 600 );
    });
}

/**
 * Create directories recursively.
 * If they are already created, no problem.
 */
function mkdir(folder) {
    var sep = findSeparator(folder);
    var folders = folder.split( sep );
    var dir = '.';
    folders.forEach(function (folder) {
        if( folder.length == 2 && folder.charAt(1) == ':' ) {
            // dealing with windows drive letter (example: `C:`).
            dir = folder;
        } else {
            dir += sep + folder;
        }
        if( !FS.existsSync( dir ) ) {
            log( "mkdir ", dir );
            FS.mkdirSync( dir );
        }
    });
}

/**
 * Remove the filename at the end of `path`.
 */
function dirname( path ) {
    var pos = path.lastIndexOf( findSeparator(path) );
    if( pos == -1 ) return path;
    return path.substr(0, pos);
}

/**
 * Return path separator: `/` or `\`.
 * The better is to avoid unix-like path with `\`.
 */
function findSeparator( path ) {
    var backslash = path.split('\\').length;
    var slash = path.split('/').length;
    if( backslash > slash ) return '\\';
    return '/';
}

function log() {
    var args = Array.prototype.slice.call( arguments );
    args.unshift( "[" + APP_ID + "]" );
    console.log.apply( console, args );
}
