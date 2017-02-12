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
        APP = require('app');
setTimeout(function (){if(typeof APP.start==='function')APP.start()});
var I = require('x-intl');
var W = require('x-widget');
        W('wdg.layout-stack5', 'wdg.layout-stack', {
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
                                        W('wdg.flex6', 'wdg.flex', {"content": [
                                              W('wdg.icon7', 'wdg.icon', {
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
                key: "Home",
                class: "x-page theme-color-bg-B3"},
              prop: {"$key": "Home"},
              children: [
                W({
                  elem: "header",
                  attr: {"class": "theme-color-bg-B5"},
                  children: [W({
                      elem: "span",
                      attr: {
                        id: "_I1",
                        style: "display:none"}})]}),
                "\n\n",
                W({
                  elem: "div",
                  children: [
                    "\n    ",
                    W({
                      elem: "div",
                      attr: {"id": "search-form"}}),
                    "\n    ",
                    W({
                      elem: "ul",
                      attr: {"id": "search-result"}}),
                    "\n    ",
                    W({
                      elem: "div",
                      attr: {
                        id: "search-button",
                        class: "right"}}),
                    "\n    ",
                    W({
                      elem: "hr"}),
                    "\n    ",
                                        W('wdg.flex8', 'wdg.flex', {"content": [
                                              W('wdg.button9', 'wdg.button', {
                          text: "Exporter la base",
                          icon: "export"}),
                                              W('patients-count', 'wdg.button', {
                          type: "simple",
                          href: "#List"})]}),
                    "\n    ",
                    W({
                      elem: "hr"}),
                    "\n    ",
                    W({
                      elem: "div",
                      attr: {"id": "version"}}),
                    "\n"]}),
                "\n"]}),
          W({
              elem: "div",
              attr: {
                key: "List",
                class: "x-page theme-color-bg-B3"},
              prop: {"$key": "List"},
              children: [
                W({
                  elem: "header",
                  attr: {
                    id: "exam.title",
                    class: "theme-color-bg-B5"},
                  children: [
                    "\n    ",
                                        W('wdg.button10', 'wdg.button', {
                      text: "Retour",
                      icon: "back",
                      type: "simple",
                      href: "#Home"}),
                    "\n"]}),
                "\n\n",
                W({
                  elem: "div",
                  children: [
                    "\n    ",
                    W({
                      elem: "ul",
                      attr: {"id": "patients-list"}}),
                    "\n"]}),
                "\n"]}),
          W({
              elem: "div",
              attr: {
                key: "Patient",
                class: "x-page theme-color-bg-B3"},
              prop: {"$key": "Patient"},
              children: [
                W({
                  elem: "header",
                  attr: {
                    id: "patient.title",
                    class: "theme-color-bg-B5"}}),
                "\n\n",
                W({
                  elem: "div",
                  children: [
                    "\n    ",
                    W({
                      elem: "p",
                      attr: {
                        id: "patient.hint",
                        class: "theme-color-bg-B0"}}),
                    "\n    ",
                                        W('wdg.flex11', 'wdg.flex', {"content": [
                                              W('patient.exit', 'wdg.button', {
                          text: "Sortie du patient",
                          icon: "user"}),
                                              W('wdg.button12', 'wdg.button', {
                          text: "Créer une nouvelle visite",
                          icon: "plus"}),
                                              W('wdg.button13', 'wdg.button', {
                          text: "Prescrire des examens",
                          icon: "print"})]}),
                    "\n    ",
                    W({
                      elem: "hr"}),
                    "\n    ",
                                        W('wdg.showhide14', 'wdg.showhide', {
                      label: "Liste des vaccins",
                      value: "false",
                      content: [
                      W({
                          elem: "div",
                          attr: {"id": "vaccins"}})]}),
                    "\n    ",
                    W({
                      elem: "hr"}),
                    "\n    ",
                                        W('wdg.flex15', 'wdg.flex', {"content": [
                                              W('wdg.button16', 'wdg.button', {
                          text: "Retour à l'écran principal",
                          icon: "back",
                          href: "#Home",
                          type: "simple"})]}),
                    "\n    ",
                                        W('vaccin-edit', 'wdg.modal', {
                      visible: "false",
                      padding: "true",
                      content: [
                      W({
                          elem: "h1",
                          attr: {"id": "vaccin-name"}}),
                      W({
                          elem: "center",
                          children: [
                            "\n                ",
                            W({
                              elem: "span",
                              children: ["Date de la dernière vaccination : "]}),
                            "\n                ",
                                                        W('vaccin-date', 'wdg.date', {"format": "DMY"}),
                            "\n                ",
                                                        W('vaccin-lot', 'wdg.text', {
                              label: "Numéro de lot",
                              wide: "true"}),
                            "\n                ",
                            W({
                              elem: "div",
                              attr: {
                                class: "x-spc H",
                                style: "height:2rem"}}),
                            "\n                ",
                                                        W('wdg.flex17', 'wdg.flex', {"content": [
                                                              W('btnVaccinCancel', 'wdg.button', {
                                  text: "Annuler",
                                  type: "simple",
                                  value: "false"}),
                                                              W('wdg.button18', 'wdg.button', {"text": "Valider"})]}),
                            "\n                ",
                            W({
                              elem: "hr"}),
                            "\n                ",
                                                        W('wdg.button19', 'wdg.button', {
                              text: "Supprimer la date",
                              type: "warning",
                              icon: "delete"}),
                            "\n            "]})]}),
                    "\n"]}),
                "\n"]}),
          W({
              elem: "div",
              attr: {
                key: "Visit",
                class: "x-page theme-color-bg-B3"},
              prop: {"$key": "Visit"},
              children: [
                W({
                  elem: "header",
                  attr: {
                    id: "visit.title",
                    class: "theme-color-bg-B5"}}),
                "\n\n",
                W({
                  elem: "div",
                  children: [
                    "\n    ",
                    W({
                      elem: "div",
                      attr: {"id": "visit.data"}}),
                    "\n    ",
                    W({
                      elem: "hr"}),
                    "\n    ",
                    W({
                      elem: "center",
                      children: [
                        "\n        ",
                                                W('wdg.button20', 'wdg.button', {
                          text: "Terminer la rencontre",
                          icon: "ok"}),
                        "        \n    "]}),
                    "\n"]}),
                "\n"]}),
          W({
              elem: "div",
              attr: {
                key: "Exam",
                class: "x-page theme-color-bg-B3"},
              prop: {"$key": "Exam"},
              children: [
                W({
                  elem: "header",
                  attr: {
                    id: "exam.title",
                    class: "theme-color-bg-B5"},
                  children: [
                    "\n    ",
                                        W('wdg.button21', 'wdg.button', {
                      text: "Retour",
                      icon: "back",
                      type: "simple"}),
                    "\n"]}),
                "\n\n",
                W({
                  elem: "div",
                  children: [
                    "\n    ",
                    W({
                      elem: "div",
                      attr: {"id": "exam.data"}}),
                    "\n    ",
                    W({
                      elem: "hr"}),
                    "\n    ",
                    W({
                      elem: "center",
                      children: [
                        "\n        ",
                                                W('wdg.button22', 'wdg.button', {
                          text: "Préparer le document pour impression",
                          icon: "print"}),
                        "        \n    "]}),
                    "\n"]}),
                "\n"]})]})
        W.bind('wdg.layout-stack5',{"value":{"S":["onPage"]}});
I(1,"title-home")
        W.bind('wdg.button9',{"action":{"S":[["page.home","onExport"]]}});
        W.bind('wdg.button12',{"action":{"S":[["page.patient","onNewVisit"]]}});
        W.bind('wdg.button13',{"action":{"S":[["page.patient","onExam"]]}});
        W.bind('vaccin-edit',{"visible":{"B":[["btnVaccinCancel","action"]]}});
        W.bind('vaccin-lot',{"focus":{"B":[["vaccin-date","action"]]}});
        W.bind('wdg.button18',{"enabled":{"B":[["vaccin-date","valid"]]},"action":{"B":[["vaccin-lot","action"]],"S":[["page.patient","onVaccinOK"]]}});
        W.bind('wdg.button19',{"action":{"S":[["page.patient","onVaccinDel"]]}});
        W.bind('wdg.button20',{"action":{"S":[["page.visit","onClose"]]}});
        W.bind('wdg.button21',{"action":{"S":[["page.exam","onBack"]]}});
        W.bind('wdg.button22',{"action":{"S":[["page.exam","onPrint"]]}});
    }
);
