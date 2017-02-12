/**********************************************************************
 require( 'require' )
 -----------------------------------------------------------------------
 @example

 var Path = require("node://path");  // Only in NodeJS/NW.js environment.
 var Button = require("tfw.button");

 **********************************************************************/

window.require = function() {
    var modules = {};
    var definitions = {};
    var nodejs_require = typeof window.require === 'function' ? window.require : null;

    var f = function(id, body) {
        if( id.substr( 0, 7 ) == 'node://' ) {
            // Calling for a NodeJS module.
            if( !nodejs_require ) {
                throw Error( "[require] NodeJS is not available to load module `" + id + "`!" );
            }
            return nodejs_require( id.substr( 7 ) );
        }

        if( typeof body === 'function' ) {
            definitions[id] = body;
            return;
        }
        var mod;
        body = definitions[id];
        if (typeof body === 'undefined') {
            var err = new Error("Required module is missing: " + id);   
            console.error(err.stack);
            throw err;
        }
        mod = modules[id];
        if (typeof mod === 'undefined') {
            mod = {exports: {}};
            var exports = mod.exports;
            body(f, mod, exports);
            modules[id] = mod.exports;
            mod = mod.exports;
            //console.log("Module initialized: " + id);
        }
        return mod;
    };
    return f;
}();
function addListener(e,l) {
    if (window.addEventListener) {
        window.addEventListener(e,l,false);
    } else {
        window.attachEvent('on' + e, l);
    }
};

addListener(
    'DOMContentLoaded',
    function() {
        document.body.parentNode.$data = {};
        // Attach controllers.
        APP = require('admin');
setTimeout(function (){if(typeof APP.start==='function')APP.start()});
var I = require('x-intl');
var W = require('x-widget');
        W('wdg.layout-stack0', 'wdg.layout-stack', {
            hash: "^#([a-zA-Z0-9]+)",
            content: [
          W({
              elem: "div",
              attr: {
                key: "Loading",
                class: "x-page theme-color-bg-B3"},
              prop: {"$key": "Loading"},
              children: [
                W({
                  elem: "header",
                  attr: {"class": "theme-color-bg-B5"},
                  children: [
                    "\n    ",
                                        W('wdg.flex1', 'wdg.flex', {"content": [
                                              W('wdg.icon2', 'wdg.icon', {
                          content: "wait",
                          size: "32px",
                          rotate: "true"}),
                      W({
                          elem: "div",
                          children: ["Chargement en cours..."]})]}),
                    "\n"]}),
                "\n",
                W({
                  elem: "div",
                  attr: {"style": "font-family: mystery-quest"},
                  children: [
                    "\n    ",
                    W({
                      elem: "p",
                      attr: {"style": "font-family: mystery-quest"},
                      children: ["\n\n    « Je jure par Apollon, médecin, par Asclépios, par Hygie et Panacée, par tous les dieux et toutes les déesses, les prenant à témoin que je remplirai, suivant mes forces et ma capacité, le serment et l'engagement suivants :\n    "]}),
                    W({
                      elem: "p",
                      attr: {"style": "font-family: mystery-quest"},
                      children: ["\n    Je mettrai mon maître de médecine au même rang que les auteurs de mes jours, je partagerai avec lui mon savoir et, le cas échéant, je pourvoirai à ses besoins ; je tiendrai ses enfants pour des frères, et, s'ils désirent apprendre la médecine, je la leur enseignerai sans salaire ni engagement. Je ferai part de mes préceptes, des leçons orales et du reste de l'enseignement à mes fils, à ceux de mon maître et aux disciples liés par engagement et un serment suivant la loi médicale, mais à nul autre.\n    "]}),
                    W({
                      elem: "p",
                      attr: {"style": "font-family: mystery-quest"},
                      children: ["\n    Je dirigerai le régime des malades à leur avantage, suivant mes forces et mon jugement, et je m'abstiendrai de tout mal et de toute injustice. Je ne remettrai à personne du poison, si on m'en demande, ni ne prendrai l'initiative d'une pareille suggestion ; semblablement, je ne remettrai à aucune femme un pessaire2 abortif. Je passerai ma vie et j'exercerai mon art dans l'innocence et la pureté.\n    "]}),
                    W({
                      elem: "p",
                      attr: {"style": "font-family: mystery-quest"},
                      children: ["\n    Je ne pratiquerai pas l'opération de la taille, je la laisserai aux gens qui s'en occupent.\n    "]}),
                    W({
                      elem: "p",
                      attr: {"style": "font-family: mystery-quest"},
                      children: ["\n    Dans quelque maison que j'entre, j'y entrerai pour l'utilité des malades, me préservant de tout méfait volontaire et corrupteur, et surtout de la séduction des femmes et des garçons, libres ou esclaves.\n    "]}),
                    W({
                      elem: "p",
                      attr: {"style": "font-family: mystery-quest"},
                      children: ["\n    Quoi que je voie ou entende dans la société pendant, ou même hors de l'exercice de ma profession, je tairai ce qui n'a jamais besoin d'être divulgué, regardant la discrétion comme un devoir en pareil cas.\n    "]}),
                    W({
                      elem: "p",
                      attr: {"style": "font-family: mystery-quest"},
                      children: ["\n    Si je remplis ce serment sans l'enfreindre, qu'il me soit donné de jouir heureusement de la vie et de ma profession, honoré à jamais des hommes ; si je le viole et que je me parjure, puissé-je avoir un sort contraire ! »\n    "]}),
                    "\n"]}),
                "\n"]}),
          W({
              elem: "div",
              attr: {
                key: "Admin",
                class: "x-page theme-color-bg-B3"},
              prop: {"$key": "Admin"},
              children: [
                W({
                  elem: "header",
                  attr: {"class": "theme-color-bg-B5"},
                  children: [W({
                      elem: "span",
                      attr: {
                        id: "_I0",
                        style: "display:none"}})]}),
                "\n\n",
                W({
                  elem: "div",
                  children: [
                    "\n    ",
                                        W('wdg.flex3', 'wdg.flex', {"content": [
                                              W('cboData', 'wdg.combo', {
                          label: "Type de données",
                          wide: "true",
                          content: {
  "patient": "Champs liés au patient",
  "forms": "Formulaire de visite",
  "types": "Types de données",
  "vaccins": "Liste des vaccins",
  "exams": "Détail des examens possibles"
}}),
                                              W('wdg.button4', 'wdg.button', {
                          text: "Mettre en ligne",
                          icon: "import"})]}),
                    "\n    ",
                    W({
                      elem: "textarea",
                      attr: {
                        id: "content",
                        class: "theme-elevation-4",
                        rows: "35"}}),
                    "\n"]}),
                "\n"]})]})
        W('modal.login', 'wdg.modal', {
            padding: "true",
            content: [
                      W('login', 'wdg.text', {
              label: "Administrateur",
              wide: "true"}),
                      W('password', 'wdg.text', {
              label: "Mot de passe",
              wide: "true",
              type: "password"}),
          W({
              elem: "hr"}),
          W({
              elem: "center",
              children: [
                "\n                ",
                                W('modal.login.btnOK', 'wdg.button', {"text": "Connexion"}),
                "\n            "]})]})
        W.bind('wdg.layout-stack0',{"value":{"S":["onPage"]}});
I(0,"title-home")
        W.bind('cboData',{"value":{"S":["onCombo"]}});
        W.bind('wdg.button4',{"action":{"S":["onSave"]}});
        W.bind('password',{"focus":{"B":[["login","action"]]},"action":{"S":["onLogin"]}});
        W.bind('modal.login.btnOK',{"action":{"S":["onLogin"]}});
    }
);
