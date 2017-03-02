{"intl":"var _=function(){var D={\"en\":{}},X=require(\"$\").intl;function _(){return X(D,arguments);}_.all=D;return _}();\n","src":"/** @module tfw.timer */require( 'tfw.timer', function(require, module, exports) { var _=function(){var D={\"en\":{}},X=require(\"$\").intl;function _(){return X(D,arguments);}_.all=D;return _}();\n    require(\"polyfill.promise\");\r\n\r\nexports.later = function(delay) {\r\n    if (typeof delay === 'undefined') delay = 1;\r\n    return new Promise(\r\n        function(resolve, reject) {\r\n            window.setTimeout(resolve, delay);\r\n        }\r\n    );\r\n};\r\n\r\n\r\n/**\r\n * @param action Promise to start after delay.\r\n * @param delay Milliseconds.\r\n */\r\nvar ActionPromise = function(action, delay) {\r\n    if (typeof delay !== 'number') delay = 300;\r\n    if (delay < 0) delay = 0;\r\n    var that = this;\r\n    this.enabled = true;\r\n    this.waiting = false;\r\n    this.action = action;\r\n    this.delay = delay;\r\n    this.timer = 0;\r\n};\r\n\r\n/**\r\n * @return void\r\n */\r\nActionPromise.prototype.dbg = function(msg) {\r\n    console.log((this.enabled ? 'E' : 'e') + (this.waiting ? 'W' : 'w') + \": \" + msg);\r\n};\r\n\r\n/**\r\n * @return void\r\n */\r\nActionPromise.prototype.fire = function() {\r\n    var that = this;\r\n    if (this.timer) {\r\n        window.clearTimeout(this.timer);\r\n    }\r\n    if (this.enabled) {\r\n        this.waiting = false;\r\n        var f = function() {\r\n            that.enabled = true;\r\n            if (that.waiting) {\r\n                that.fire();\r\n            }\r\n        };\r\n        this.timer = window.setTimeout(\r\n            function() {\r\n                that.timer = 0;\r\n                that.enabled = false;\r\n                that.action().then(f, f);\r\n            },\r\n            that.delay\r\n        );\r\n    } else {\r\n        this.waiting = true;\r\n    }\r\n};\r\n\r\n\r\n/**\r\n * @param action Function to start after delay.\r\n * @param delay Milliseconds.\r\n */\r\nvar Action = function(action, delay) {\r\n    if (typeof delay !== 'number') delay = 300;\r\n    if (delay < 0) delay = 100;\r\n    var that = this;\r\n    this.action = action;\r\n    this.delay = delay;\r\n    this.timer = 0;\r\n};\r\n\r\n/**\r\n * @return void\r\n */\r\nAction.prototype.fire = function() {\r\n    var that = this;\r\n    if (this.timer) {\r\n        window.clearTimeout(this.timer);\r\n    }\r\n    this.timer = window.setTimeout(\r\n        function() {\r\n            that.timer = 0;\r\n            that.enabled = false;\r\n            that.action();\r\n        },\r\n        that.delay\r\n    );\r\n};\r\n\r\nvar LongAction = function() {\r\n  this._timer = null;\r\n  this._action = null;\r\n};\r\n\r\n/**\r\n * Fire an action. This action will be executed only if there is nothing else running.\r\n * @return void\r\n */\r\nLongAction.prototype.fire = function(action, duration) {\r\n  var that = this;\r\n  if (!this._timer) {\r\n    action();\r\n    this._timer = window.setTimeout(\r\n      function() {\r\n        that._timer = null;\r\n      },\r\n      duration\r\n    );\r\n  }\r\n  return this;\r\n};\r\n\r\n\r\n\r\n/**\r\n * @param action A function returning a Promise.\r\n */\r\nexports.laterPromise = function(action, delay) {\r\n    return new ActionPromise(\r\n        function() {\r\n            return new Promise(action);\r\n        },\r\n        delay\r\n    );\r\n};\r\n\r\n/**\r\n * @param action A function to execute.\r\n */\r\nexports.laterAction = function(action, delay) {\r\n    return new Action(action, delay);\r\n};\r\n\r\n\r\nexports.longAction = function() {\r\n  return new LongAction();\r\n}\r\n\n\n  \nmodule.exports._ = _;\n/**\n * @module tfw.timer\n * @see module:$\n * @see module:polyfill.promise\n\n */\n});","zip":"require(\"tfw.timer\",function(t,i,n){var e=function(){function i(){return e(n,arguments)}var n={en:{}},e=t(\"$\").intl;return i.all=n,i}();t(\"polyfill.promise\"),n.later=function(t){return void 0===t&&(t=1),new Promise(function(i,n){window.setTimeout(i,t)})};var r=function(t,i){\"number\"!=typeof i&&(i=300),i<0&&(i=0);this.enabled=!0,this.waiting=!1,this.action=t,this.delay=i,this.timer=0};r.prototype.dbg=function(t){console.log((this.enabled?\"E\":\"e\")+(this.waiting?\"W\":\"w\")+\": \"+t)},r.prototype.fire=function(){var t=this;if(this.timer&&window.clearTimeout(this.timer),this.enabled){this.waiting=!1;var i=function(){t.enabled=!0,t.waiting&&t.fire()};this.timer=window.setTimeout(function(){t.timer=0,t.enabled=!1,t.action().then(i,i)},t.delay)}else this.waiting=!0};var o=function(t,i){\"number\"!=typeof i&&(i=300),i<0&&(i=100);this.action=t,this.delay=i,this.timer=0};o.prototype.fire=function(){var t=this;this.timer&&window.clearTimeout(this.timer),this.timer=window.setTimeout(function(){t.timer=0,t.enabled=!1,t.action()},t.delay)};var u=function(){this._timer=null,this._action=null};u.prototype.fire=function(t,i){var n=this;return this._timer||(t(),this._timer=window.setTimeout(function(){n._timer=null},i)),this},n.laterPromise=function(t,i){return new r(function(){return new Promise(t)},i)},n.laterAction=function(t,i){return new o(t,i)},n.longAction=function(){return new u},i.exports._=e});\n//# sourceMappingURL=tfw.timer.js.map","map":{"version":3,"file":"tfw.timer.js","sources":["tfw.timer.js"],"sourcesContent":["/** @module tfw.timer */require( 'tfw.timer', function(require, module, exports) { var _=function(){var D={\"en\":{}},X=require(\"$\").intl;function _(){return X(D,arguments);}_.all=D;return _}();\n    require(\"polyfill.promise\");\r\n\r\nexports.later = function(delay) {\r\n    if (typeof delay === 'undefined') delay = 1;\r\n    return new Promise(\r\n        function(resolve, reject) {\r\n            window.setTimeout(resolve, delay);\r\n        }\r\n    );\r\n};\r\n\r\n\r\n/**\r\n * @param action Promise to start after delay.\r\n * @param delay Milliseconds.\r\n */\r\nvar ActionPromise = function(action, delay) {\r\n    if (typeof delay !== 'number') delay = 300;\r\n    if (delay < 0) delay = 0;\r\n    var that = this;\r\n    this.enabled = true;\r\n    this.waiting = false;\r\n    this.action = action;\r\n    this.delay = delay;\r\n    this.timer = 0;\r\n};\r\n\r\n/**\r\n * @return void\r\n */\r\nActionPromise.prototype.dbg = function(msg) {\r\n    console.log((this.enabled ? 'E' : 'e') + (this.waiting ? 'W' : 'w') + \": \" + msg);\r\n};\r\n\r\n/**\r\n * @return void\r\n */\r\nActionPromise.prototype.fire = function() {\r\n    var that = this;\r\n    if (this.timer) {\r\n        window.clearTimeout(this.timer);\r\n    }\r\n    if (this.enabled) {\r\n        this.waiting = false;\r\n        var f = function() {\r\n            that.enabled = true;\r\n            if (that.waiting) {\r\n                that.fire();\r\n            }\r\n        };\r\n        this.timer = window.setTimeout(\r\n            function() {\r\n                that.timer = 0;\r\n                that.enabled = false;\r\n                that.action().then(f, f);\r\n            },\r\n            that.delay\r\n        );\r\n    } else {\r\n        this.waiting = true;\r\n    }\r\n};\r\n\r\n\r\n/**\r\n * @param action Function to start after delay.\r\n * @param delay Milliseconds.\r\n */\r\nvar Action = function(action, delay) {\r\n    if (typeof delay !== 'number') delay = 300;\r\n    if (delay < 0) delay = 100;\r\n    var that = this;\r\n    this.action = action;\r\n    this.delay = delay;\r\n    this.timer = 0;\r\n};\r\n\r\n/**\r\n * @return void\r\n */\r\nAction.prototype.fire = function() {\r\n    var that = this;\r\n    if (this.timer) {\r\n        window.clearTimeout(this.timer);\r\n    }\r\n    this.timer = window.setTimeout(\r\n        function() {\r\n            that.timer = 0;\r\n            that.enabled = false;\r\n            that.action();\r\n        },\r\n        that.delay\r\n    );\r\n};\r\n\r\nvar LongAction = function() {\r\n  this._timer = null;\r\n  this._action = null;\r\n};\r\n\r\n/**\r\n * Fire an action. This action will be executed only if there is nothing else running.\r\n * @return void\r\n */\r\nLongAction.prototype.fire = function(action, duration) {\r\n  var that = this;\r\n  if (!this._timer) {\r\n    action();\r\n    this._timer = window.setTimeout(\r\n      function() {\r\n        that._timer = null;\r\n      },\r\n      duration\r\n    );\r\n  }\r\n  return this;\r\n};\r\n\r\n\r\n\r\n/**\r\n * @param action A function returning a Promise.\r\n */\r\nexports.laterPromise = function(action, delay) {\r\n    return new ActionPromise(\r\n        function() {\r\n            return new Promise(action);\r\n        },\r\n        delay\r\n    );\r\n};\r\n\r\n/**\r\n * @param action A function to execute.\r\n */\r\nexports.laterAction = function(action, delay) {\r\n    return new Action(action, delay);\r\n};\r\n\r\n\r\nexports.longAction = function() {\r\n  return new LongAction();\r\n}\r\n\n\n  \nmodule.exports._ = _;\n});"],"names":["require","module","exports","_","X","D","arguments","en","intl","all","later","delay","Promise","resolve","reject","window","setTimeout","ActionPromise","action","this","enabled","waiting","timer","prototype","dbg","msg","console","log","fire","that","clearTimeout","f","then","Action","LongAction","_timer","_action","duration","laterPromise","laterAction","longAction"],"mappings":"AAAwBA,QAAS,YAAa,SAASA,EAASC,EAAQC,GAAW,GAAIC,GAAE,WAA+C,QAASA,KAAI,MAAOC,GAAEC,EAAEC,WAA5D,GAAID,IAAGE,OAASH,EAAEJ,EAAQ,KAAKQ,IAAiD,OAARL,GAAEM,IAAIJ,EAASF,IACvLH,GAAQ,oBAEZE,EAAQQ,MAAQ,SAASC,GAErB,MADqB,UAAVA,IAAuBA,EAAQ,GACnC,GAAIC,SACP,SAASC,EAASC,GACdC,OAAOC,WAAWH,EAASF,KAUvC,IAAIM,GAAgB,SAASC,EAAQP,GACZ,gBAAVA,KAAoBA,EAAQ,KACnCA,EAAQ,IAAGA,EAAQ,EAEvBQ,MAAKC,SAAU,EACfD,KAAKE,SAAU,EACfF,KAAKD,OAASA,EACdC,KAAKR,MAAQA,EACbQ,KAAKG,MAAQ,EAMjBL,GAAcM,UAAUC,IAAM,SAASC,GACnCC,QAAQC,KAAKR,KAAKC,QAAU,IAAM,MAAQD,KAAKE,QAAU,IAAM,KAAO,KAAOI,IAMjFR,EAAcM,UAAUK,KAAO,WAC3B,GAAIC,GAAOV,IAIX,IAHIA,KAAKG,OACLP,OAAOe,aAAaX,KAAKG,OAEzBH,KAAKC,QAAS,CACdD,KAAKE,SAAU,CACf,IAAIU,GAAI,WACJF,EAAKT,SAAU,EACXS,EAAKR,SACLQ,EAAKD,OAGbT,MAAKG,MAAQP,OAAOC,WAChB,WACIa,EAAKP,MAAQ,EACbO,EAAKT,SAAU,EACfS,EAAKX,SAASc,KAAKD,EAAGA,IAE1BF,EAAKlB,WAGTQ,MAAKE,SAAU,EASvB,IAAIY,GAAS,SAASf,EAAQP,GACL,gBAAVA,KAAoBA,EAAQ,KACnCA,EAAQ,IAAGA,EAAQ,IAEvBQ,MAAKD,OAASA,EACdC,KAAKR,MAAQA,EACbQ,KAAKG,MAAQ,EAMjBW,GAAOV,UAAUK,KAAO,WACpB,GAAIC,GAAOV,IACPA,MAAKG,OACLP,OAAOe,aAAaX,KAAKG,OAE7BH,KAAKG,MAAQP,OAAOC,WAChB,WACIa,EAAKP,MAAQ,EACbO,EAAKT,SAAU,EACfS,EAAKX,UAETW,EAAKlB,OAIb,IAAIuB,GAAa,WACff,KAAKgB,OAAS,KACdhB,KAAKiB,QAAU,KAOjBF,GAAWX,UAAUK,KAAO,SAASV,EAAQmB,GAC3C,GAAIR,GAAOV,IAUX,OATKA,MAAKgB,SACRjB,IACAC,KAAKgB,OAASpB,OAAOC,WACnB,WACEa,EAAKM,OAAS,MAEhBE,IAGGlB,MAQTjB,EAAQoC,aAAe,SAASpB,EAAQP,GACpC,MAAO,IAAIM,GACP,WACI,MAAO,IAAIL,SAAQM,IAEvBP,IAORT,EAAQqC,YAAc,SAASrB,EAAQP,GACnC,MAAO,IAAIsB,GAAOf,EAAQP,IAI9BT,EAAQsC,WAAa,WACnB,MAAO,IAAIN,IAKbjC,EAAOC,QAAQC,EAAIA"},"dependencies":["mod/$","mod/polyfill.promise"]}