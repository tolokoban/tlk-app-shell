/** @module picture */require( 'picture', function(require, module, exports) { var _=function(){var D={"en":{},"fr":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
    "use strict";


"use strict";

var $ = require("dom");
var DB = require("tfw.data-binding");
var Err = require("tfw.message").error;
var Flex = require("wdg.flex");
var Modal = require("wdg.modal");
var Button = require("wdg.button");
var Patients = require("patients");
var Touchable = require("tfw.touchable");


/**
 * @param {object} value - patient.
 */
var Picture = function(opts) {
    var that = this;
    var elem = $.elem( this, 'img', 'picture', 'theme-elevation-8', {
        width: 192, height: 192
    });

    DB.propRemoveClass( this, 'visible', 'hide' );
    DB.prop( this, 'value' )(function(v) {
        if( v ) {
            that.element.setAttribute( "src", v.picture || "css/picture/unknown.jpg" );
        }
    });
    opts = DB.extend({
        visible: true,
        value: null
    }, opts, this);

    var touchable = new Touchable( elem );
    touchable.tap.add(function() {
        var zoom = 1;
        var W = 192, H = 192;
        var btnTakeSnapshot = new Button({
            icon: "camera", text: "Prendre la photo", enabled: false, wide: true
        });
        var video = $.tag('video');
        var container = $.div( 'picture-container', [video] );
        $.css( video, {
            margin: "4px"
        });
        var result = $.tag( 'img', 'picture', {
            width: W, height: H, src: that.element.getAttribute( "src" )
        });
        var canvas = $.tag( 'canvas', {
            width: W, height: H
        });
        $.css( canvas, { display: "none" } );
        var content = $.div([
            canvas, btnTakeSnapshot,
            new Flex({ content: [container, result] })
        ]);

        var streaming = false;
        video.addEventListener('canplay', function() {
            if (!streaming) {
                btnTakeSnapshot.enabled = true;
                var w = video.videoWidth;
                var h = video.videoHeight;

                if( w > h ) {
                    // Landspace.
                    zoom = H / h;
                    w = w * zoom;
                    h = H;
                } else {
                    // Portrait.
                    zoom = W / w;
                    h = h * zoom;
                    w = W;
                }
                video.setAttribute('width', w);
                video.setAttribute('height', h);
                video.style["margin-left"] = (-w * .5) + "px";
                video.style["margin-top"] = (-h * .5) + "px";
                streaming = true;
            }
        }, false);
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(function(stream) {
                video.srcObject = stream;
                video.play();
                console.info("[picture] video.width, video.height=", video.width, video.height);
            })
            .catch(function(err) {
                console.error("[picture snapshot] An error occured! ", err);
            });

        btnTakeSnapshot.on(function() {
            var ctx = canvas.getContext( '2d' );
            var w = video.videoWidth * zoom;
            var h = video.videoHeight * zoom;
            var x, y;
            if( w > h ) {
                x = (h - w) / 2;
                y = 0;
            } else {
                x = 0;
                y = (w - h) / 2;
            }
            ctx.drawImage( video, x, y, w, h );
            var data = canvas.toDataURL('image/jpeg', .8);
            result.setAttribute('src', data);
        });

        Modal.confirm( content, function() {
            var data = result.getAttribute( 'src' );
            that.element.setAttribute( 'src', data );
            var patient = that.value;
            patient.picture = data;
            Patients.save( patient );
        });
    });
};


module.exports = Picture;


  
module.exports._ = _;
/**
 * @module picture
 * @see module:$
 * @see module:dom
 * @see module:tfw.data-binding
 * @see module:tfw.message
 * @see module:wdg.flex
 * @see module:wdg.modal
 * @see module:wdg.button
 * @see module:patients
 * @see module:tfw.touchable

 */
});