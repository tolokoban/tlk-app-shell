/** @module tlk-app-shell */require( 'tlk-app-shell', function(require, module, exports) { var _=function(){var D={"en":{"available":"<html>Version <b>$1</b> is available!<br/>Restart to install it.","bad-repo":"Unable to contact this repository!","confirm-exit":"Are you sure you want to exit this application?","download-progress":"Downloading in progress: $1","exit":"Exit","install-corruption":"<html><b style='color:red'>The install is corrupted!</b><br/>Restart the application to fix the problem.<br/>If it is still here after restart, please contact the support.","install-error":"<html>Unable to install version <b>$1</b><pre class='error'>$2</pre>","install-progress":"Installing version $1","loading":"Downloading application files...","network-error":"<html>An error occured while trying to contact repository <b>$1</b>.<pre class='error'>$2</pre><hr/>A good network connection is mandatory for the first installation.","repository":"Repository's URL","reset":"Reset"},"fr":{"available":"<html>La version <b>$1</b> est disponible !<br/>Relancer l'application pour l'installer.","bad-repo":"Le dépôt spécifié ne répond pas !","confirm-exit":"Êtes-vous sûr de vouloir quitter cette application ?","download-progress":"Téléchargement en cours: $1","exit":"Quitter","install-corruption":"<html><b style='color:red'>L'installation est corrompue !</b><br/>Relancez l'application pour tenter de corriger le problème.<br/>S'il persiste, contactez le support informatique.","install-error":"Impossible d'installer la version <b>$1</b><pre class='error'>$2</pre>","install-progress":"Installation de la version $1","loading":"Téléchargement de l'application...","network-error":"<html>Une erreur est survenur lors de la tentative de connexion au dépôt <b>$1</b>.<pre class='error'>$2</pre><hr/>Une bonne connexion réseau est indispensable lors de la première installation.","repository":"URL du dépôt","reset":"R.à z."}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
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
var Button = require("wdg.button");

var FS = require("node://fs");
var Path = require("node://path");

var g_rootFolder = Path.resolve('.');
var g_config;
// If there is no network, the download is postpone until the network is up again.
var g_downloadIsDone = false;

var APP_ID = "tlk-app-shell";
var PACKAGE_DIR = APP_ID + "/package";

var Local = (function() {
    // On n'utilise pas  le local storage parce qu'il  change quand on
    // met à jour les fichiers !!! On préfère passer par un fichier de
    // configuration local.
    var config = {};
    var loaded = false;
    var configFilename = Path.resolve("./" + APP_ID + ".json");

    return {
        get: function(key, def) {
            if (!loaded) {
                loaded = true;
                console.log("Loading configuration file: ", configFilename);
                if (FS.existsSync(configFilename)) {
                    var data = FS.readFileSync(configFilename);
                    try {
                        config = JSON.parse(data.toString());
                        console.log("config: ", config);
                    } catch (ex) {
                        console.error("[" + APP_ID + "] Unable to parse config file!", {
                            ex: ex,
                            data: data.toString()
                        });
                        config = {};
                    }
                } else {
                    console.log("There is no configuration file!");
                    config = {};
                }
            }
            return config[key] || def;
        },

        set: function(key, val) {
            config[key] = val;
            FS.writeFile(configFilename, JSON.stringify(config, null, '  '), function(err) {
                if (err) {
                    console.error("[" + APP_ID + "] Unable to write config file!", err);
                }
            });
        }
    };
})();


exports.start = function() {
    if (location.search == '?debug') {
        nw.Window.get().showDevTools(null, start);
    } else {
        start();
    }
};

function start() {
    debugger;
    $.on('network', showAdmin);
    FS.readFile("package.json", function(err, out) {
        if (err) {
            Err("<html>Unable to read/parse <b>package.json</b>: <code>" + err.message + "</code>");
            return;
        }
        try {
            var jsn = out.toString();
            g_config = JSON.parse(out.toString());
        } catch (ex) {
            Err("Bad JSON syntax in `package.json`!");
            return;
        }
        $('title').textContent = g_config.name + " " + g_config.version;

        updateNetworkStatus();
        var pkg = Local.get('install');
        if (pkg) installPackage(pkg).then(execApp);
        else checkFirstLaunch();
    });
};

exports.onExit = exitApp;

/**
 * Check if it is the first launch or not.
 */
function checkFirstLaunch() {
    return new Promise(function(resolve, reject) {
        log("> checkFirstLaunch()");
        getPackageDef().then(downloadPackageIfNeeded)
            .then(execApp);
    });
}

/**
 * Promise which resolves in an URL of the repository.
 */
function getRepositoryUrl() {
    return new Promise(function(resolve, reject) {
        log("> getRepositoryUrl()");
        var repository = Local.get('repository');
        if (repository) return resolve(repository);
        var repo = new Text({
            label: _('repository'),
            wide: false,
            width: '30rem',
            value: Local.get('repository', '')
        });
        var loading = new Modal({ padding: true, content: [new Wait({ text: _('loading') })] });
        var ok = Button.Ok();
        DB.bind(repo, 'action', ok.fire.bind(ok));
        var exit = new Button({ text: _('exit'), icon: "close", type: 'simple' });
        exit.on(exitApp);
        var content = $.div([
            repo, ok,
            $.tag('hr'),
            $.tag('center', [exit])
        ]);
        DB.bind(repo, 'action', ok, 'fire');
        var modal = new Modal({ padding: true, content: content });
        modal.attach();
        window.setTimeout(function() {
            repo.focus = true;
        }, 300);
        ok.on(function() {
            modal.detach();
            Local.set('repository', repo.value.trim());
            resolve(repo.value.trim());
        });
    });
}

/**
 * Resolves in the URL of the repo and the ID of the package.
 * `{ repo: <string>, id: <string> }`
 */
function getPackageUrl(repoUrl) {
    return new Promise(function(resolve, reject) {
        log("> getPackageUrl(", repoUrl, ")");
        Local.set('repository', repoUrl);
        var pkgId = Local.get('id');
        log("pkgId=", pkgId);
        if (pkgId) return resolve({ repo: repoUrl, id: pkgId });
        // Ask the repository the list of packages.
        log("Asking a package ID...");
        fetch(repoUrl).then(function(response) {
            if (!response.ok) throw { message: response.status + ": " + response.statusText };
            return response.json();
        }).then(function(packagesList) {
            // @TODO Manage the case of multi packages by adding a selection screen.
            console.info("[tlk-app-shell] packagesList=", packagesList);
            resolve({
                repo: repoUrl,
                id: packagesList[0].id
            });
        }).catch(function(err) {
            manageNetworkFailure(repoUrl, err).then(resolve, reject);
        });
    });
}

/**
 * Network errors are ignored if the first installation has already occured.
 * That means if the `version` storage attribute has already been set.
 */
function manageNetworkFailure(url, err) {
    return new Promise(function(resolve, reject) {
        console.error("[NetworkFailure] Unable to contact ", url, " because of error ", err);
        if (Local.get('version')) {
            log("No connection to check updates! We will use the local version: ",
                Local.get('version'));
            resolve(null);
        } else {
            Modal.alert(_('network-error', url, err.message), function() {
                Local.set('repository', null);
                Local.set('id', null);
                Local.set('version', null);
                location.reload();
            });
        }
    });
}

function manageInstallFailure(pkg, err) {
    return new Promise(function(resolve, reject) {
        console.error("[InstallFailure] Unable to install package ", pkg, " because of error ", err);
        Modal.alert(_('install-error', pkg.version, err.message), function() {
            Local.set('version', null);
            if (!Local.get('version')) location.reload();
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
    return new Promise(function(resolve, reject) {
        log("> getPackageDef()");
        getRepositoryUrl().then(getPackageUrl).then(function(pkgUrl) {
            if (!pkgUrl) {
                resolve(null);
                return;
            }
            var url = pkgUrl.repo + "?" + pkgUrl.id;
            console.log("Fetching package definition: ", url);
            fetch(url).then(function(response) {
                if (!response.ok) throw { message: response.status + ": " + response.statusText };
                return response.json();
            }).then(function(pkgDef) {
                resolve(pkgDef);
            }).catch(function(err) {
                manageNetworkFailure(url, err).then(resolve);
            });
        });
    });
}

/**
 * If `Local.get("version")` is missing  or different from `pkg.version`, we
 * must download the package files.
 * It  `Local.get("version")` is  not  missing, the  downloads  will run  in
 * background. Otherwise, we will wait for all the downloads to finish
 * before resolving.
 */
function downloadPackageIfNeeded(pkg) {
    // Check existence of download folder.
    mkdir(PACKAGE_DIR);

    var downloadedFiles = [];
    return new Promise(function(resolve, reject) {
        log("> downloadPackageIfNeeded(", pkg, ")");
        if (!pkg) return resolve(null);

        var next = function() {
            if (pkg.files.length == 0) {
                log("Download is done!");
                g_downloadIsDone = true;
                $('tooltip').textContent = '';
                pkg.files = downloadedFiles;
                Local.set('install', pkg);
                if (Local.get('version', null) === null) {
                    // First install.
                    installPackage(pkg).then(resolve);
                } else {
                    Msg(_('available', pkg.version));
                }
                return;
            }
            $('tooltip').textContent = _('download-progress', pkg.files.length);
            var file = pkg.files.pop();
            var dir = PACKAGE_DIR + Path.dirname(file);
            var url = pkg.url + file;
            fetch(url, {
                cache: 'no-cache',
                mode: 'cors',
                redirect: 'follow'
            }).then(function(response) {
                log(response.url, response.ok);
                if (!response.ok) {
                    throw Error(response.status + " " + response.statusText + " - " + response.url);
                }
                downloadedFiles.push(file);
                return response.arrayBuffer();
            }).then(function(arrayBuffer) {
                var output = Path.resolve(Path.join(g_rootFolder, PACKAGE_DIR, file));
                mkdir(dirname(output));
                var data = Buffer.from(arrayBuffer);
                FS.writeFile(output, data, function(err) {
                    if (err) {
                        console.error("Unable to write file: " + output + "\n", err);
                        throw Error("Unable to write file: " + output + "\n" + err);
                    }
                    next();
                });
            }).catch(function(err) {
                manageNetworkFailure(url, err).then(resolve);
            });
        };

        if (!pkg || Local.get('version') === pkg.version) {
            // Version is uptodate, or we were unable to download the package definition.
            log("get('version')=...", Local.get('version'));
            log("pkg.version=...", pkg.version);
            resolve(pkg);
        } else {
            if (Local.get('version')) {
                // New version is downloaded in background.
                log("Background download...");
                resolve(pkg);
            }
            log("Start download.");
            next();
        }
    });
}

/**
 * Close the mian window, hence exit the application.
 */
function exitApp(withoutConfirmation) {
    if (withoutConfirmation) nw.Window.get().close();
    else Modal.confirm(_('confirm-exit'), function() {
        nw.Window.get().close();
    });
}

/**
 * Execute the application by loading `index.html` page.
 */
function execApp() {
    try {
        log("> execApp()");
        if (!FS.existsSync("./index.html")) {
            throw Error("Missing start page!");
        }
        $('title').textContent = g_config.name + " " + g_config.version;
        $('iframe').setAttribute('src', 'index.html');
    } catch (ex) {
        Local.set('version', null);
        Modal.alert(_('install-corruption'), exitApp.bind(null, true));
    }
}

/**
 * Install package stored in `install`.
 */
function installPackage(pkg) {
    return new Promise(function(resolve, reject) {
        log("> installPackage(", pkg, ")");
        // If installation failed, the package will be doanloaded again.
        Local.set('install', null);

        var modal = new Modal({
            content: new Wait({ text: _('install-progress', pkg.version) })
        });
        modal.attach();

        var next = function() {
            if (pkg.files.length == 0) {
                // Everything has been installed, we can update the version number.
                Local.set('version', pkg.version);
                g_config.version = pkg.version;
                g_config.name = pkg.name;
                $('tooltip').textContent = '';
                FS.writeFile("package.json", JSON.stringify(g_config, null, '    '), function(err) {
                    modal.detach();
                    resolve();
                });
                return;
            }
            $('tooltip').textContent = _('install-progress', pkg.files.length);
            var file = pkg.files.pop();
            mkdir(dirname(file));
            FS.readFile("./" + PACKAGE_DIR + "/" + file, function(err, data) {
                if (err) {
                    console.error(err);
                    manageInstallFailure(pkg, err);
                    return;
                }
                FS.writeFile(file, data, function(err) {
                    if (err) {
                        console.error(err);
                        manageInstallFailure(pkg, err);
                        return;
                    }
                    next();
                });
            });
        };
        // Start installation in 600 ms to give the time to read the version number.
        window.setTimeout(next, 600);
    });
}

/**
 * Create directories recursively.
 * If they are already created, no problem.
 */
function mkdir(folder) {
    var sep = findSeparator(folder);
    var folders = folder.split(sep);
    var dir = '.';
    if (folder.charAt(0) == '/') {
        // Deal with absolute path.
        dir = '';
    }
    folders.forEach(function(folder) {
        if (folder.length == 2 && folder.charAt(1) == ':') {
            // dealing with windows drive letter (example: `C:`).
            dir = folder;
        } else {
            dir += sep + folder;
        }
        if (!FS.existsSync(dir)) {
            log("mkdir ", dir);
            FS.mkdirSync(dir);
        }
    });
}

/**
 * Remove the filename at the end of `path`.
 */
function dirname(path) {
    var pos = path.lastIndexOf(findSeparator(path));
    if (pos == -1) return path;
    return path.substr(0, pos);
}

/**
 * Return path separator: `/` or `\`.
 * The better is to avoid unix-like path with `\`.
 */
function findSeparator(path) {
    var backslash = path.split('\\').length;
    var slash = path.split('/').length;
    if (backslash > slash) return '\\';
    return '/';
}

function log() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift("[" + APP_ID + "]");
    console.log.apply(console, args);
}


/**
 * Update the network indicator. Red for offline and red for online.
 */
function updateNetworkStatus() {
    if (navigator.onLine) {
        $.addClass('network', 'online');
    } else {
        $.removeClass('network', 'online');
    }
}

/**
 *
 */
function addNetworkStatusListeners() {
    window.addEventListener('online', function() {
        updateNetworkStatus();
        if (!g_downloadIsDone) {
            getPackageDef().then(downloadPackageIfNeeded);
        }
    });
    window.addEventListener('offline', updateNetworkStatus);
}

/**
 * We need  an admin screen to  change the repository URL  and control
 * the update process.
 */
function showAdmin() {
    var btnReset = new Button({ text: _('reset') });
    var repo = new Text({
        label: _('repository'),
        wide: false,
        width: '30rem',
        value: Local.get('repository', '')
    });
    var content = $.div([
        repo, $.tag('br'),
        "id: ", $.tag('b', [Local.get('id') || '---']),
        ", version: ", $.tag('b', [Local.get('version') || '---']),
        ", install: ", $.tag('b', [Local.get('install') || '---']),
        btnReset
    ]);
    btnReset.on(function() {
        Local.set('install', '');
        Local.set('version', '');
        Local.set('repository', repo.value.trim());
        getPackageDef()
            .then(downloadPackageIfNeeded)
            .then(installPackage)
            .then(location.reload.bind(location));
    });
    Modal.alert(content);
}

  
module.exports._ = _;
/**
 * @module tlk-app-shell
 * @see module:$
 * @see module:dom
 * @see module:tfw.data-binding
 * @see module:tfw.message
 * @see module:wdg.text
 * @see module:wdg.wait
 * @see module:wdg.modal
 * @see module:wdg.button

 */
});