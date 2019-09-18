// Init libs
var mathbox = mathBox({
    plugins: ['core', 'controls', 'cursor', 'mathbox'],
    controls: {
        klass: THREE.OrbitControls // Orbit controls, i.e. Euler angles, with gimbal lock
        //klass: THREE.TrackballControls // Trackball controls, i.e. Free quaternion rotation
    }
});

if (mathbox.fallback) throw "WebGL not supported";
var three = mathbox.three;
three.renderer.setClearColor(new THREE.Color(256.0, 256.0, 256.0), 1.0);
var camera = mathbox.camera({proxy: true, position: [0, 0, 15]});
var view = mathbox.cartesian({range: [[-2, 2], [-2, 2], [-2, 2]], scale: [4, 4, 2]});
mathbox.set('focus', 3);

/** ############## MATH */
var sizeX = 50;
var sizeY = 25;
//var sizeX = 40;
//var sizeY = 20;
var elementSize = 5; // pixels

function upperNeighbors(octoPoint, f)
{
    let i = octoPoint[0];
    let j = octoPoint[1];
    let val = f(i, j);
    var neighbors = [];
    if (i === 0)                {if (f(i+1, j) >= val) neighbors.push([i+1, j]);}
    else if (i === sizeX - 1)   {if (f(i-1, j) >= val) neighbors.push([i-1, j]);}
    else                        {if (f(i+1, j) >= val) neighbors.push([i+1, j]);
                                 if (f(i-1, j) >= val) neighbors.push([i-1, j]);}
    if (j === 0)                {if (f(i, j+1) >= val) neighbors.push([i, j+1]);}
    else if (j === sizeY - 1)   {if (f(i, j-1) >= val) neighbors.push([i, j-1]);}
    else                        {if (f(i, j+1) >= val) neighbors.push([i, j+1]);
                                 if (f(i, j-1) >= val) neighbors.push([i, j-1]);}
    if (i > 0 && j > 0)         {if (f(i-1, j-1) >= val) neighbors.push([i-1, j-1]);}
    if (i < sizeX - 1 && j < sizeY - 1)
                                {if (f(i+1, j+1) >= val) neighbors.push([i+1, j+1]);}
    return neighbors;
}

function getCriticalType(s1, s2, i, j, f)
{
    // Compute critical points
    let currentValue = f(i, j);
    let nBools = [
        f(i + 1, j)     > currentValue || (f(i + 1, j)     === currentValue && (i+1) * s1 + j < i * s1 + j) ,
        f(i + 1, j + 1) > currentValue || (f(i + 1, j + 1) === currentValue && (i+1) * s1 + j+1 < i * s1 + j) ,
        f(i, j + 1)     > currentValue || (f(i, j + 1)     === currentValue && (i) * s1 + j+1 < i * s1 + j) ,
        f(i - 1, j)     > currentValue || (f(i - 1, j)     === currentValue && (i-1) * s1 + j < i * s1 + j) ,
        f(i - 1, j - 1) > currentValue || (f(i - 1, j - 1) === currentValue && (i-1) * s1 + j-1 < i * s1 + j) ,
        f(i, j - 1)     > currentValue || (f(i, j - 1)     === currentValue && (i) * s1 + j-1 < i * s1 + j) ,
    ];
    let nbPlus = 0;
    let nbMinus = 0;
    let currentPlus = false;
    let currentMinus = false;
    let nbComponentPlus = 0;
    let nbComponentMinus = 0;
    for (let k = 0; k < nBools.length; ++k) {
        if (nBools[k]) {
            nbPlus++;
            if (!currentPlus) nbComponentPlus++;
            currentPlus = true;
            if (currentMinus) currentMinus = false;
        } else {
            nbMinus++;
            if (!currentMinus) nbComponentMinus++;
            currentMinus = true;
            if (currentPlus) currentPlus = false;
        }
    }
    // Don't forget to test modulo k!
    if (nBools[0]) {
        if (currentPlus && nbComponentMinus > 0) nbComponentPlus--;
    } else {
        if (currentMinus && nbComponentPlus > 0) nbComponentMinus--;
    }

    let type = "reg";
    if (nbComponentPlus === 0 && nbComponentMinus > 0) {
        type = "max";
    }
    if (nbComponentPlus > 0 && nbComponentMinus === 0) {
        type = "min";
    }
    if (nbComponentPlus + nbComponentMinus > 2) {
        type = "sad";
    }
    if (nbComponentMinus === 0 && nbComponentPlus === 0)
        console.log('No neighbors?');
    if (nbComponentMinus + nbComponentPlus > 4) {
        type = "mul";
    }

    return type;
}

function computePersistenceDiagram(s1, s2, f)
{
    var cps = [];
    let pointType = new Array(s1);
    for (let i = 0; i < s1; ++i) pointType[i] = new Array(s2);
    let criticalPoints = [];

    // Compute critical points
    for (let i = 0; i < s1; ++i) {
        for (let j = 0; j < s2; ++j) {
            let currentValue = f(i, j);
            let nBools = [
                f(i + 1, j)     > currentValue || (f(i + 1, j)     === currentValue && (i+1) * s1 + j < i * s1 + j) ,
                f(i + 1, j + 1) > currentValue || (f(i + 1, j + 1) === currentValue && (i+1) * s1 + j+1 < i * s1 + j) ,
                f(i, j + 1)     > currentValue || (f(i, j + 1)     === currentValue && (i) * s1 + j+1 < i * s1 + j) ,
                f(i - 1, j)     > currentValue || (f(i - 1, j)     === currentValue && (i-1) * s1 + j < i * s1 + j) ,
                f(i - 1, j - 1) > currentValue || (f(i - 1, j - 1) === currentValue && (i-1) * s1 + j-1 < i * s1 + j) ,
                f(i, j - 1)     > currentValue || (f(i, j - 1)     === currentValue && (i) * s1 + j-1 < i * s1 + j) ,
            ];
            let nbPlus = 0;
            let nbMinus = 0;
            let currentPlus = false;
            let currentMinus = false;
            let nbComponentPlus = 0;
            let nbComponentMinus = 0;
            for (let k = 0; k < nBools.length; ++k) {
                if (nBools[k]) {
                    nbPlus++;
                    if (!currentPlus) nbComponentPlus++;
                    currentPlus = true;
                    if (currentMinus) currentMinus = false;
                } else {
                    nbMinus++;
                    if (!currentMinus) nbComponentMinus++;
                    currentMinus = true;
                    if (currentPlus) currentPlus = false;
                }
            }
            // Don't forget to test modulo k!
            if (nBools[0]) {
                if (currentPlus && nbComponentMinus > 0) nbComponentPlus--;
            } else {
                if (currentMinus && nbComponentPlus > 0) nbComponentMinus--;
            }

            if (nbComponentPlus === 0 && nbComponentMinus > 0) {
                pointType[i][j] = "max";
                criticalPoints.push([i, j, 'max', currentValue]);
            }
            if (nbComponentPlus > 0 && nbComponentMinus === 0) {
                pointType[i][j] = "min";
                criticalPoints.push([i, j, 'min', currentValue]);
            }
            if (nbComponentPlus + nbComponentMinus > 2) {
                pointType[i][j] = "sad";
                criticalPoints.push([i, j, 'sad', currentValue]);
            }
            if (nbComponentMinus === 0 && nbComponentPlus === 0)
                console.log('No neighbors?');
            if (nbComponentMinus + nbComponentPlus > 4) {
                pointType[i][j] = "mul";
                console.log('Multi-saddle?');
            }
            if (!pointType[i][j])
                pointType[i][j] = "reg";
        }
    }

    // Sort critical points
    criticalPoints.sort(function(a, b) { return a[3] - b[3]; });
    // console.log(criticalPoints);
    cps = criticalPoints;
    let criticalPointsId = 0;

    // Build level-sets (keep track of current level)
    // (progressive BFS on each level)
    // close each level
    let persistenceDiagram = [];

    // +1 level BFS
    let processedCritical = new Set();
    // let starters = [criticalPoints[criticalPointsId]];
    let starters = new Map();
    let globalMin = criticalPoints[criticalPointsId]; // I know it's matched with the global max.
    criticalPointsId++;
    let secondMin = criticalPoints[criticalPointsId];
    starters.set(criticalPointsId, [secondMin]);
    criticalPointsId++;
    let nbMaxNotAssigned = 0;
    let globalMax = criticalPoints[criticalPoints.length - 1];
    while (starters.size > 0)
    {
        let lowestRoundValue = Number.MAX_VALUE;
        // New BFS round.
        let nextRoundStarters = new Map();
        for (const k of starters.keys()) {
            let currentLowestRoundValue = Number.MIN_VALUE;
            let currentStarterKit = starters.get(k);

            // 0-level BFS
            let starter = criticalPoints[k];
            let starterType = pointType[starter[0]][starter[1]];
            processedCritical.add(starter[0] * sizeX + starter[1]); // critical point hash.
            let nextStarterKit = [];

            let processed = new Set();
            let inlist = new Set();
            let builtPair = false;

            while (!builtPair && currentStarterKit.length > 0) {
                // Get min element.
                let currentElement = currentStarterKit.shift();
                let hashCurrentElement = currentElement[0] * sizeX + currentElement[1];
                processed.add(hashCurrentElement);
                nextStarterKit = [];

                // Check if min has unprocessed neighbors.
                let ns = upperNeighbors(currentElement, f, s1, s2);
                if (ns.length > 0) {
                    for (let n = 0; n < ns.length; ++n) {
                        let cn = ns[n];
                        let hash1 = cn[0] * sizeX + cn[1];
                        if (!processed.has(hash1) && !processedCritical.has(hash1) && !inlist.has(hash1))
                        {
                            inlist.add(hash1);
                            nextStarterKit.push(cn);
                        }
                    }
                }
                currentStarterKit = currentStarterKit.concat(nextStarterKit);
                currentStarterKit.sort(function(a, b) {return f(a[0], a[1]) - f(b[0], b[1]);});

                if (processedCritical.has(hashCurrentElement)) continue;
                if (currentElement[0] === starter[0] && currentElement[1] === starter[1]) {
                    processedCritical.add(hashCurrentElement);
                }
                if (!currentElement) {
                    console.log('No more neighbors to visit and no critical point encountered.');
                    nextRoundStarters.delete(k);
                    currentStarterKit = [];
                    continue;
                }

                let cn = currentElement;
                let firstVal = f(cn[0], cn[1]);
                currentLowestRoundValue = currentLowestRoundValue < firstVal ? firstVal : currentLowestRoundValue;
                let hash2 = cn[0] * sizeX + cn[1];
                if (processedCritical.has(hash2)) continue;

                processed.add(hash2);
                // scan for critical
                let ct = pointType[cn[0]][cn[1]];
                if (ct === "reg") {
                } else if (ct === "max") {
                    if (starterType === "min") {
                        // Completed the global min-max pair.
                        if (k === 0 && cn[0] === globalMax[0] && cn[1] === globalMax[1]) {
                            processedCritical.add(hash2);
                            persistenceDiagram.push([[starter[0], starter[1]], [cn[0], cn[1]], 1]);
                            builtPair = true;
                            console.log('Should only happen once: min matched max.');
                        } else {
                            console.log('Reached a max before a saddle.');
                        }
                    }
                    else if (starterType === "sad") {
                        // Completed current sad-max pair.
                        processedCritical.add(hash2);
                        persistenceDiagram.push([[starter[0], starter[1]], [cn[0], cn[1]], 1]);
                        builtPair = true;
                    }
                } else if (ct === "sad") {
                    if (starterType === "min") {
                        // Completed current min-sad pair.
                        processedCritical.add(hash2);
                        // Not considering min-sad pairs!
                        persistenceDiagram.push([[starter[0], starter[1]], [cn[0], cn[1]], 0]);
                        builtPair = true;
                    } else if (starterType === "sad"){
                        // console.log('I don\'t know if this should happen often. two saddles are linked.');
                    }
                } else if (ct === "min") {
                    console.log('Error: should not have encountered a min.');
                }

                if (builtPair) {
                    nextStarterKit = [];
                    currentStarterKit = [];
                    break;
                }

                if (currentStarterKit.length > 0 && !builtPair) {
                    if (lowestRoundValue > currentLowestRoundValue)
                        lowestRoundValue = currentLowestRoundValue;
                } else {
                    currentStarterKit = [];
                }
            }

            nextRoundStarters.delete(k);
        }

        // Review non-visited criticalPoints.
        for (let i = criticalPointsId; i < criticalPoints.length; ++i)
        {
            let c = criticalPoints[i];
            let hash = c[0] * sizeX + c[1];
            if (!processedCritical.has(hash)) {
                if (c[3] > lowestRoundValue && nextRoundStarters.size > 0) break;

                let ct = pointType[c[0]][c[1]];
                if (ct === 'max') {
                    nbMaxNotAssigned++;
                    if (nbMaxNotAssigned > 1)
                    console.log('A max was not assigned, this should only happen on the border.');
                }
                else if (ct === 'min' || ct === 'sad')
                {
                    criticalPointsId = i;
                    if (nextRoundStarters.has(i))
                        console.log('Error: an unvisited critical is already present in the next round starter list.');
                    nextRoundStarters.set(i, [criticalPoints[i]]);
                    break;
                }
            }
        }

        starters = nextRoundStarters;
    }

    // Dirtily remove saddle-global assignments
    for (let i = persistenceDiagram.length - 1; i >= 0; --i) {
        let pp = persistenceDiagram[i];
        let pp1 = pp[0];
        let pp2 = pp[1];
        if (pp1[0] === globalMin[0] && pp1[1] === globalMin[1] ||
            pp2[0] === globalMin[0] && pp2[1] === globalMin[1] ||
            pp1[0] === globalMax[0] && pp1[1] === globalMax[1] ||
            pp2[0] === globalMax[0] && pp2[1] === globalMax[1])
        {
            persistenceDiagram.splice(i, 1);
        }
    }

    persistenceDiagram.unshift([[globalMin[0], globalMin[1]], [globalMax[0], globalMax[1]], 1]);
    return [cps, persistenceDiagram];
}

function computeD3PersistenceDiagram(sizeX, sizeY, pd, f)
{
    let pers = [];
    for (let i = 0; i < pd.length; ++i) {
        let cpd = pd[i];
        let min = cpd[0];
        let max = cpd[1];
        let x = f(min[0], min[1]);
        let y = f(max[0], max[1]) - x;
        pers.push({x: x, y: y, i: i});
    }
    return pers;
}

var stretcher = 1.0;

function mainFunction(x, y) {
    let xx = x * stretcher;
    let yy = y * stretcher;
    return 0.5 + (1 / stretcher) * (π / 2
        + .6 * Math.sin(xx - yy + 2 * Math.sin(yy))
        + .3 * Math.sin(xx * 2 + yy * 2 * 1.81)
        + .1825 * Math.sin(xx * 3 - yy * 2 * 2.18)) - .5;
}

// My function:
// 1.570796 + .6 * sin(x - y + 2 * sin(y)) + .3 * sin(x * 2 + y * 2 * 1.81) + .1825 * sin(x * 3 - y * 2 * 2.18)) -.5
function multisine(x, y) {
    let xx = x * stretcher;
    let yy = y * stretcher;
    return 0.5 + (1 / stretcher) * (π / 2
        + .6 *    Math.sin(xx - yy + 2 * Math.sin(yy))
        + .3 *    Math.sin(xx * 2 + yy * 2 * 1.81)
        + .1825 * Math.sin(xx * 3 - yy * 2 * 2.18)) - .5
}

function multisineT(t, x, y) {
    let xx = x * stretcher;
    let yy = y * stretcher;
    return 0.5 + (1 / stretcher) * (π / 2
        + .6 * Math.sin(xx + t - yy + 2 * Math.sin(yy))
        + .3 * Math.sin(xx * 2 + t + yy * 2 * 1.81)
        + .1825 * Math.sin(xx * 3 + t - yy * 2 * 2.18)) - .5;
}

var emitSurfaceBlop = function (emit, x, y, i, j) {
    return emit(x, y, multisine(x, y));
};

var emitSurfaceBlopTime = function (emit, x, y, i, j, t) {
    let t1 = t % (2 * Math.PI);
    return emit(x, y, multisineT(t1, x, y));
};

let bourrinpd = [];
let bourrincrit = [];
let nbDiagBourrin = 100;
for (let i = 0; i < nbDiagBourrin; ++i) {
    let t1 = 2 * Math.PI * i / nbDiagBourrin;
    let pdandcrit = computePersistenceDiagram(sizeX, sizeY, (x, y) => multisineT(t1, x*4/sizeX-2, y*4/sizeY-2));
    bourrincrit.push(pdandcrit[0]);
    bourrinpd.push(pdandcrit[1]);
    console.log(i + ' th persistence diagram computed...');
}

var emitCriticalMin = function(a, b, c) {
    return emitCriticalPoints(a, b, c, 'min')
};
var emitCriticalMax = function(a, b, c) {
    return emitCriticalPoints(a, b, c, 'max')
};
var emitCriticalSad = function(a, b, c) {
    return emitCriticalPoints(a, b, c, 'sad')
};

var emitCriticalPoints = function(emit, i, t, type) {
    //let criticalPoints = computeCriticalPoints(sizeX, sizeY, (x, y)=>multisineT(t, x*4/sizeX-2, y*4/sizeY-2));
    //let current = criticalPoints[i];
    let t1 = (t % (2 * Math.PI)) / (2 * Math.PI);
    let it = Math.floor(t1 * nbDiagBourrin);
    let bc = bourrincrit[it];
    if (!bc || !bc[i] || bc[i][2] !== type)
    {
        return emit(Infinity,Infinity,Infinity);
    }
    let bci = bc[i];
    let x = bci[0]*4/sizeX-2;
    let y = bci[1]*4/sizeY-2;
    let v = bci[3];
    // console.log(bci[3]);
    //return emit(x, y, bci[3]);
    return emit(x, y, v);
};

// console.log(bourrinpd);
var emitTrackingBis = function(emit, x, y, i, j) {
    let T = TT[i];
    if (!T) {
        for (let ii = i; ii >= 0; --ii)
        {
            T = TT[ii];
            if (T) break;
        }
        // return emit(0,0,0);
    }
    var sextuplet = T[j];
    if (!sextuplet) {
        for (let jj = j; jj >= 0; --jj) {
            if (T[jj]) {
                sextuplet = T[jj];
                break;
            }
        }
    }
    let x0 = sextuplet[0];
    let y0 = sextuplet[1];
    let z0 = sextuplet[2];
    let x1 = sextuplet[3];
    let y1 = sextuplet[4];
    let z1 = sextuplet[5];
    var newX, newY, newZ;
    var factor = 0;
    newX = x0 + (factor) * (x1 - x0);
    newY = y0 + (factor) * (y1 - y0);
    newZ = z0 + (factor) * (z1 - z0); // multisineT(t, newX, newY);
    return emit(newX, newY, newZ);
};

var emitTracking = function(emit, x, y, i, j, t) {
    let t1 = (t % (2 * Math.PI)) / (2 * Math.PI);
    let it = Math.floor(t1 * nbDiagBourrin);
    let n = it - 100 + i;
    // debugger;

    // let factor = n % 2 === 0 ? 0 : 1;
    let factor = 0;
    if (n < 1) {
        n = 1;
        //emit(10, 10, 10);
        // return emit(0,0,0);
    }
    let T = TT[n];
    if (!T) {
        //emit(10, 10, 10);
        for (let jj = n; jj >= 0; --jj) {
            T = TT[jj];
            if (T) break;
        }
        if (!T) return emit(0, 0, 0);
    }

    var sextuplet = T[j];
    if (!sextuplet) {
        for (let jj = j; jj >= 0; --jj) {
            let st = T[jj];
            if (st) {
                sextuplet = st;
            }
        }
        //emit(10, 10, 10);
        if (!sextuplet) return emit(0, 0, 0);
    }
    let x0 = sextuplet[0];
    let y0 = sextuplet[1];
    let z0 = sextuplet[2];
    let x1 = sextuplet[3];
    let y1 = sextuplet[4];
    let z1 = sextuplet[5];

    var newX, newY, newZ;
    newX = x0 + (factor) * (x1 - x0);
    newY = y0 + (factor) * (y1 - y0);
    newZ = z0 + (factor) * (z1 - z0); // multisineT(t, newX, newY);
    return emit(newX, newY, newZ);
};

var emitCriticalPath = function(emit, x, y, i, j, t) {
    let t1 = (t % (2 * Math.PI)) / (2 * Math.PI);
    let it = Math.floor(t1 * nbDiagBourrin);
    let bc = bourrinpd[it];
    if (!bc) return emit(0, 0, 0);

    let bbc = bc[j];
    if (!bbc) return;
    var p1, p2;
    var newX, newY, newZ;
    p1 = bbc[0];
    p2 = bbc[1];

    // Draw a line between them...
    newX = p1[0] + (i/9) * (p2[0] - p1[0]);
    newY = p1[1] + (i/9) * (p2[1] - p1[1]);

    newX = newX*4/sizeX-2;
    newY = newY*4/sizeY-2;
    newZ = multisineT(t, newX, newY);
    return emit(newX, newY, newZ);
};

let critAndPd = computePersistenceDiagram(sizeX, sizeY, (x, y)=>multisine(x*4/sizeX-2, y*4/sizeY-2));
let cps = critAndPd[0];
let pd = critAndPd[1];
let d3pd = computeD3PersistenceDiagram(sizeX, sizeY, pd, (x, y)=>multisine(x*4/sizeX-2, y*4/sizeY-2));
// console.log(d3pd);

var d1 = [];
var d2 = [];
var dataAllCrit = [];
for (let i = 0; i < pd.length; ++i) {
    let pt1 = pd[i][0];
    let pt2 = pd[i][1];
    let x1 = pt1[0] * 4.0 / sizeX - 2;
    let y1 = pt1[1] * 4.0 / sizeY - 2;
    let x2 = pt2[0] * 4.0 / sizeX - 2;
    let y2 = pt2[1] * 4.0 / sizeY - 2;
    dataAllCrit.push([x1, y1, multisine(x1, y1)]);
    d1.push([x1, y1, multisine(x1, y1)]);
    dataAllCrit.push([x2, y2, multisine(x2, y2)]);
    d2.push([x2, y2, multisine(x2, y2)]);
}

var dataCritSad = [];
for (let i = 0; i < cps.length; ++i) {
    let ccc = cps[i];
    let x1 = ccc[0] * 4.0 / sizeX - 2;
    let y1 = ccc[1] * 4.0 / sizeY - 2;
    if (ccc[2] === 'sad') dataCritSad.push([x1, y1, multisine(x1, y1)]);
}

var dataCritMax = [];
for (let i = 0; i < cps.length; ++i) {
    let ccc = cps[i];
    let x1 = ccc[0] * 4.0 / sizeX - 2;
    let y1 = ccc[1] * 4.0 / sizeY - 2;
    if (ccc[2] === 'max') dataCritMax.push([x1, y1, multisine(x1, y1)]);
}

var dataCritMin = [];
for (let i = 0; i < cps.length; ++i) {
    let ccc = cps[i];
    let x1 = ccc[0] * 4.0 / sizeX - 2;
    let y1 = ccc[1] * 4.0 / sizeY - 2;
    if (ccc[2] === 'min') dataCritMin.push([x1, y1, multisine(x1, y1)]);
}

pathMinToMax = function(emit, x, y, i, j, t) {
    var p1, p2;
    var newX, newY, newZ;
    p1 = d1[j];
    p2 = d2[j];

    // Draw a line between them...
    newX = p1[0] + (i/9) * (p2[0] - p1[0]);
    newY = p1[1] + (i/9) * (p2[1] - p1[1]);
    newZ = mainFunction(newX, newY);
    return emit(newX, newY, newZ);
};
