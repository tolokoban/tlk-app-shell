{"intl":"var _=function(){var D={\"en\":{}},X=require(\"$\").intl;function _(){return X(D,arguments);}_.all=D;return _}();\n","src":"/** @module tfw.message */require( 'tfw.message', function(require, module, exports) { var _=function(){var D={\"en\":{}},X=require(\"$\").intl;function _(){return X(D,arguments);}_.all=D;return _}();\n    /**\n * @module tfw.message\n *\n * @description\n * Display a evanescing message at the top of the screen.\n * This messge will fade out after 5 seconds, or if tapped.\n *\n * @example\n * var Msg = require('tfw.message');\n * Msg.error( 'There is a problem!' );\n * Msg.info( 'Trace saved.' );\n * Msg.info( 'Visible for 3500 ms.', 3500 );\n */\nvar $ = require(\"dom\");\n\n\nvar G = {\n    lastMsg: null\n};\n\nfunction show( className, text, delay ) {\n    if (G.lastMsg) {\n        // Remove an already displayed message because a new one must take its place.\n        $.detach( G.lastMsg );\n        G.lastMsg = null;\n    }\n    \n    if( typeof delay !== 'number' ) delay = 5000;\n    var div = $.div( 'tfw-message', className, 'theme-elevation-24' );\n    $.textOrHtml( div, text );\n    G.lastMsg = div;\n    document.body.appendChild( div );\n    function hide() {\n        $.removeClass( div, 'show' );\n        window.setTimeout( $.detach.bind( $, div ), 300 );\n        G.lastMsg = null;\n    }\n    var id = window.setTimeout(hide, delay);\n    window.setTimeout(function() {\n        $.addClass( div, 'show' );\n        $.on( div, function() {\n            hide();\n            window.clearTimeout( id );\n            G.lastMsg = null;\n        });\n    });\n}\n\n\nexports.info = show.bind( null, 'info' );\nexports.error = show.bind( null, 'error' );\n\n\n  \nmodule.exports._ = _;\n/**\n * @module tfw.message\n * @see module:$\n * @see module:dom\n\n */\n});","zip":"require(\"tfw.message\",function(n,t,e){function o(n,t,e){function o(){s.removeClass(l,\"show\"),window.setTimeout(s.detach.bind(s,l),300),i.lastMsg=null}i.lastMsg&&(s.detach(i.lastMsg),i.lastMsg=null),\"number\"!=typeof e&&(e=5e3);var l=s.div(\"tfw-message\",n,\"theme-elevation-24\");s.textOrHtml(l,t),i.lastMsg=l,document.body.appendChild(l);var a=window.setTimeout(o,e);window.setTimeout(function(){s.addClass(l,\"show\"),s.on(l,function(){o(),window.clearTimeout(a),i.lastMsg=null})})}var l=function(){function t(){return o(e,arguments)}var e={en:{}},o=n(\"$\").intl;return t.all=e,t}(),s=n(\"dom\"),i={lastMsg:null};e.info=o.bind(null,\"info\"),e.error=o.bind(null,\"error\"),t.exports._=l});\n//# sourceMappingURL=tfw.message.js.map","map":{"version":3,"file":"tfw.message.js","sources":["tfw.message.js"],"sourcesContent":["/** @module tfw.message */require( 'tfw.message', function(require, module, exports) { var _=function(){var D={\"en\":{}},X=require(\"$\").intl;function _(){return X(D,arguments);}_.all=D;return _}();\n    /**\n * @module tfw.message\n *\n * @description\n * Display a evanescing message at the top of the screen.\n * This messge will fade out after 5 seconds, or if tapped.\n *\n * @example\n * var Msg = require('tfw.message');\n * Msg.error( 'There is a problem!' );\n * Msg.info( 'Trace saved.' );\n * Msg.info( 'Visible for 3500 ms.', 3500 );\n */\nvar $ = require(\"dom\");\n\n\nvar G = {\n    lastMsg: null\n};\n\nfunction show( className, text, delay ) {\n    if (G.lastMsg) {\n        // Remove an already displayed message because a new one must take its place.\n        $.detach( G.lastMsg );\n        G.lastMsg = null;\n    }\n    \n    if( typeof delay !== 'number' ) delay = 5000;\n    var div = $.div( 'tfw-message', className, 'theme-elevation-24' );\n    $.textOrHtml( div, text );\n    G.lastMsg = div;\n    document.body.appendChild( div );\n    function hide() {\n        $.removeClass( div, 'show' );\n        window.setTimeout( $.detach.bind( $, div ), 300 );\n        G.lastMsg = null;\n    }\n    var id = window.setTimeout(hide, delay);\n    window.setTimeout(function() {\n        $.addClass( div, 'show' );\n        $.on( div, function() {\n            hide();\n            window.clearTimeout( id );\n            G.lastMsg = null;\n        });\n    });\n}\n\n\nexports.info = show.bind( null, 'info' );\nexports.error = show.bind( null, 'error' );\n\n\n  \nmodule.exports._ = _;\n});"],"names":["require","module","exports","show","className","text","delay","hide","$","removeClass","div","window","setTimeout","detach","bind","G","lastMsg","textOrHtml","document","body","appendChild","id","addClass","on","clearTimeout","_","X","D","arguments","en","intl","all","info","error"],"mappings":"AAA0BA,QAAS,cAAe,SAASA,EAASC,EAAQC,GAqB5E,QAASC,GAAMC,EAAWC,EAAMC,GAY5B,QAASC,KACLC,EAAEC,YAAaC,EAAK,QACpBC,OAAOC,WAAYJ,EAAEK,OAAOC,KAAMN,EAAGE,GAAO,KAC5CK,EAAEC,QAAU,KAdZD,EAAEC,UAEFR,EAAEK,OAAQE,EAAEC,SACZD,EAAEC,QAAU,MAGK,gBAAVV,KAAqBA,EAAQ,IACxC,IAAII,GAAMF,EAAEE,IAAK,cAAeN,EAAW,qBAC3CI,GAAES,WAAYP,EAAKL,GACnBU,EAAEC,QAAUN,EACZQ,SAASC,KAAKC,YAAaV,EAM3B,IAAIW,GAAKV,OAAOC,WAAWL,EAAMD,EACjCK,QAAOC,WAAW,WACdJ,EAAEc,SAAUZ,EAAK,QACjBF,EAAEe,GAAIb,EAAK,WACPH,IACAI,OAAOa,aAAcH,GACrBN,EAAEC,QAAU,SA5C+D,GAAIS,GAAE,WAA+C,QAASA,KAAI,MAAOC,GAAEC,EAAEC,WAA5D,GAAID,IAAGE,OAASH,EAAE1B,EAAQ,KAAK8B,IAAiD,OAARL,GAAEM,IAAIJ,EAASF,KAc3LjB,EAAIR,EAAQ,OAGZe,GACAC,QAAS,KAgCbd,GAAQ8B,KAAO7B,EAAKW,KAAM,KAAM,QAChCZ,EAAQ+B,MAAQ9B,EAAKW,KAAM,KAAM,SAIjCb,EAAOC,QAAQuB,EAAIA"},"dependencies":["mod/$","mod/dom"]}