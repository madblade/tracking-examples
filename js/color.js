// Converts a #ffffff hex string into an [r,g,b] array
var h2r = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
};

// Inverse of the above
var r2h = function(rgb) {
    return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
};

// Interpolates two [r,g,b] colors and returns an [r,g,b] of the result
// Taken from the awesome ROT.js roguelike dev library at
// https://github.com/ondras/rot.js
var _interpolateColor = function(color1, color2, factor) {
    if (arguments.length < 3) { factor = 0.5; }
    var result = color1.slice();
    for (var i=0;i<3;i++) {
        result[i] = Math.round(result[i] + factor*(color2[i]-color1[i]));
    }
    return result;
};

var rgb2hsl = function(color) {
    var r = color[0]/255;
    var g = color[1]/255;
    var b = color[2]/255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = (l > 0.5 ? d / (2 - max - min) : d / (max + min));
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
};

function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}

var hsl2rgb = function(color) {
    var l = color[2];

    if (color[1] === 0) {
        l = Math.round(l*255);
        return [l, l, l];
    } else {

        var s = color[1];
        var q = (l < 0.5 ? l * (1 + s) : l + s - l * s);
        var p = 2 * l - q;
        var r = hue2rgb(p, q, color[0] + 1/3);
        var g = hue2rgb(p, q, color[0]);
        var b = hue2rgb(p, q, color[0] - 1/3);
        return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
    }
};

var _interpolateHSL = function(color1, color2, factor) {
    if (arguments.length < 3) { factor = 0.5; }
    var hsl1 = rgb2hsl(color1);
    var hsl2 = rgb2hsl(color2);
    for (var i=0;i<3;i++) {
        hsl1[i] += factor*(hsl2[i]-hsl1[i]);
    }
    return hsl2rgb(hsl1);
};

var lindPaletteRGB = [
    [85, 85, 170],
    [81, 100, 181],
    [99, 171, 242],
    [215, 229, 242],
    [235, 237, 238],
    [238, 238, 238], // Middle
    [238, 236, 235],
    [238, 224, 210],
    [239, 167, 95],
    [180, 99, 81],
    [171, 85, 85]
];

// Must be normalized.
function getColor(val)
{
    if (val !== 0 && !val) {
        console.log(val);
        return "#fff";
    }
    if (val >= 1) return r2h(lindPaletteRGB[10]);
    if (val < -1) return r2h(lindPaletteRGB[0]);
    if (val < 0) return "#0f0";
    var douze = val * 10;
    var tapis = Math.floor(douze); // 0 to 10
    var facteur = douze - tapis;
    var intervalle1 = lindPaletteRGB[tapis];
    var intervalle2 = lindPaletteRGB[tapis + 1];
    if (!intervalle1 || !intervalle2 || intervalle1.length !== 3 || intervalle2.length !== 3)
        console.log('Faillure grossière en la valeur ' + val);
    var interp =
        _interpolateColor(intervalle1, intervalle2, facteur);
    return r2h(interp);
}

export { getColor };
