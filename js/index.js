import '../css/style.css';
import '../cdn/mathbox.css';
import './mathbox-bundle.min';
import './color';
import './grid';
import './persistencediag';
import './persitence-sparse-demo';
import './halfmunkres';
import { TTT } from './halfmunkres';
import {
    dataCritMax,
    dataCritMin,
    dataCritSad, emitCriticalMax, emitCriticalMin, emitCriticalPath, emitCriticalSad,
    emitSurfaceBlop, emitSurfaceBlopTime, emitTrackingFix,
    pathMinToMax, pd,
    sizeX,
    sizeY
} from './persitence-sparse-demo';
import OrbitControls from "./OrbitControls";
import { Color } from 'three';
import * as jquery from "jquery";

// Init libs
var mathbox = mathBox({
    plugins: ['core', 'controls', 'cursor', 'mathbox'],
    controls: {
        klass: OrbitControls
    }
});

if (mathbox.fallback) throw "WebGL not supported";
var three = mathbox.three;
three.renderer.setClearColor(new Color( 0xffff00 ), 1.0);

mathbox.camera({proxy: true, position: [0, 0, 15]});
mathbox.cartesian({range: [[-2, 2], [-2, 2], [-2, 2]], scale: [4, 4, 2]});
mathbox.set('focus', 3);

var present = mathbox.present({index: 0});
var slide = present.clock().slide({id: 'top'});

// Axes + grid
slide.cartesian({ range: [[-2, 2], [-2, 2], [-2, 2]], scale: [4, 4, 2], position: [0, -.55]})
    .axis({axis: 1, width: 3, detail: 256})
    .axis({axis: 2, width: 3, detail: 256})
    .axis({axis: 3, width: 3, detail: 256})
    .grid({width: 2, divideX: 20, divideY: 20
    });

mathbox.select('axis').set('color', 'black');
slide
    .cartesian({ range: [[-2, 2], [-2, 2], [-2, 2]], scale: [4, 4, 2], position: [0, -.55]})
    .slide()
    .area({ id: 'surfaceArea0', axes: [1, 3], width: sizeX, height: sizeY, channels: 3, expr: emitSurfaceBlop})
    .surface({ zBias: 3, shaded: true, color: '#ff9d00', opacity: 0.8})
    .slide()
    .array({ id: 'sampler2', length: dataCritMin.length, data: dataCritMin, items: 3, channels: 3 })
    .point({ color: '#0000ff', size: 20, zIndex: 2})
    .slide()
    .array({ id: 'sampler3', length: dataCritMax.length, data: dataCritMax, items: 3, channels: 3})
    .point({ color: '#ff0b00', size: 20, zIndex: 2})
    .slide()
    .array({ id: 'sampler4', length: dataCritSad.length, data: dataCritSad, items: 3, channels: 3 })
    .point({ color: '#ffffff', size: 20, zIndex: 2})
    .slide()
    .area({ axes: [1, 3], channels: 3, width: 20, height: pd.length, expr: pathMinToMax })
    .line({color: '#f8fffd', size: 15, opacity: 1, zIndex: 2 })
    .end().end().end().end().end()
    .slide()
    .area({ id: 'surfaceArea1', axes: [1, 3], width: 193, height: 97, channels: 3, expr: emitSurfaceBlopTime })
    .surface({ zBias: 3, shaded: true, color: '#ff9d00', opacity: 0.8})
    .slide()
    .array({ id: 'sampler5', length: 100, expr: emitCriticalMin, items: 3, channels: 3 })
    .point({ color: '#0000ff', size: 20, zIndex: 2})
    .slide()
    .array({ id: 'sampler6', length: 100, expr: emitCriticalMax, items: 3, channels: 3 })
    .point({ color: '#ff0009', size: 20, zIndex: 2})
    .slide()
    .array({ id: 'sampler7', length: 100, expr: emitCriticalSad, items: 3, channels: 3 })
    .point({ color: '#fffbfe', size: 20, zIndex: 2})
    .slide()
    .area({ axes: [1, 3], channels: 3, width: 20, height: pd.length, expr: emitCriticalPath })
    .line({color: '#f8fffd', size: 15, opacity: 1, zIndex: 2 })
    .slide()
    .area({ axes: [1, 3], channels: 3, width: 2, height: 1024, expr: emitTrackingFix(TTT) })
    .line({color: '#ff0000', size: 20, opacity: 1, zIndex: 2})
    .slide();

let nbSlides = 15;

jquery('#halfmunkres').hide();
top.onkeydown = function(e) {
    switch (e.keyCode) {
        case 33: // page up
        case 37: // left arrow
        case 65: // a
        case 81: // q
            let a = present[0].get('index');
            if (a < 14) {
                jquery('#halfmunkres').hide();
            }
            return present[0].set('index', Math.max(present[0].get('index') - 1, 0));

        case 34: // page down
        case 39: // right arrow
        case 68: // d
            let b = present[0].get('index') + 1;
            if (b > 12) {
                jquery('#halfmunkres').show();
            }
            console.log("Next slide.");
            return present[0].set('index', Math.min(present[0].get('index') + 1, nbSlides));
    }
};

document
    .getElementById('rightbutton')
    .addEventListener('click',
        () => top.onkeydown({keyCode: 39}), false);
document
    .getElementById('leftbutton')
    .addEventListener('click',
        () => top.onkeydown({keyCode: 37}), false);
