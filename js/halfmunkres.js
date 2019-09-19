// Convert diagrams.
var allDiags = [];
for (let i = 0; i < bourrinpd.length; ++i)
{
    let min = 0; // pi / 2 - .5;
    let max = Math.PI / 2 + .6 + .3 + .1825 - .5;
    let range = (max - min);

    let t1 = 2 * Math.PI * i / nbDiagBourrin;
    let currentDiag = bourrinpd[i];
    let data = [];
    for (let j = 0; j < currentDiag.length; ++j) {
        let p1 = currentDiag[j][0];
        let p2 = currentDiag[j][1];
        let whichEx = currentDiag[j][2];

        let x1 = p1[0] * 4 / sizeX - 2;
        let y1 = p1[1] * 4 / sizeY - 2;
        let x2 = p2[0] * 4 / sizeX - 2;
        let y2 = p2[1] * 4 / sizeY - 2;
        let val1 = multisineT(t1, x1, y1);
        let val2 = multisineT(t1, x2, y2);
        if (val1 > val2) {
            let tt = val1; val1 = val2; val2 = val1;
        }
        let xx = 0.8 * (Math.min(val1, val2) - min) / range;
        let yy = 0.8 * (Math.abs(val1 - val2) - min) / range;
        data.push({x: xx, y: yy, i: j, x12d: x1, x22d: x2, y12d: y1, y22d: y2, whichEx: whichEx});
    }

    allDiags.push(data);
}

let TTT = [];
let TT = [];
for (let i = 0; i < bourrinpd.length - 2; ++i) {
    let pdData1 = allDiags[i];
    let pdData2 = allDiags[i+1];
    let size1 = pdData1.length;
    let size2 = pdData2.length;

    var [gridDataHalf, maxHalf] =
        getGrid(pdData1, pdData2, size1, size2, elementSize, elementSize, "half");
    var costMatrixHalf = new Array(size1 + 1);
    for (let i = 0; i < size1 + 1; ++i) {
        costMatrixHalf[i] = new Float32Array(size2 + 1);
        for (let j = 0; j < size2 + 1; ++j) {
            let cost = 0;
            if (gridDataHalf[i][j]) cost = gridDataHalf[i][j].cost;
            costMatrixHalf[i][j] = cost;
        }
    }

    var pdElementH1 = "#pd1";
    var pdElementH2 = "#pd2";
    var gridElementH = "#grid";
    //var d1HM = drawDiagram(pdData2, pdElementH2, size2 * elementSize, size2 * elementSize, 1, false, i);
    var d2HM = drawDiagram(pdData1, pdElementH1, size1 * elementSize, size1 * elementSize, 1, false, i);
    var gH = drawGrid(gridDataHalf, gridElementH, size2 + 1, size1 + 1, elementSize, "half", i);

    reinitHalfMunkres(size1 + 1, size2 + 1, costMatrixHalf);
    while (!isHalfMunkresOver()) {
        runHalfMunkresRound();
    }

    // Assign.
    let bp1 = bourrinpd[i];
    let bp2 = bourrinpd[i+1];
    let m = new Map();
    let seg = [];
    let t1 = 2 * Math.PI * i / nbDiagBourrin;
    let t2 = 2 * Math.PI * (i+1) / nbDiagBourrin;

    for (let a = 0; a < size1; ++a) {
        for (let b = 0; b < size2; ++b) {
            if (M[a][b] === 1) {
                let pair1 = bp1[a];
                let x10 = pair1[0][0];
                let y10 = pair1[0][1];
                let x11 = pair1[1][0];
                let y11 = pair1[1][1];
                let type1 = pair1[2] === 0 ? 'min' : 'sad';
                let type2 = pair1[2] === 0 ? 'sad' : 'min';
                let x1, y1;
                if (type1 === 'max' && type2 === 'min') {
                    x1 = x10*4/sizeX-2;
                    y1 = y10*4/sizeY-2;
                } else if (type1 === 'min' && type2 === 'max') {
                    x1 = x11*4/sizeX-2;
                    y1 = y11*4/sizeY-2;
                } else if (type1 === 'max' || type1 === 'min') {
                    x1 = x10*4/sizeX-2;
                    y1 = y10*4/sizeY-2;
                } else if (type2 === 'min' || type2 === 'max') {
                    x1 = x11*4/sizeX-2;
                    y1 = y11*4/sizeY-2;
                }
                let v1 = multisineT(t1, x1, y1);

                let pair2 = bp2[b];
                let x20 = pair2[0][0];
                let y20 = pair2[0][1];
                let x21 = pair2[1][0];
                let y21 = pair2[1][1];
                let x2, y2;
                let type10 = pair2[2] === 0 ? 'min' : 'sad';
                let type20 = pair2[2] === 0 ? 'sad' : 'min';
                if (type10 === 'max' && type20 === 'min') {
                    x2 = x20*4/sizeX-2;
                    y2 = y20*4/sizeY-2;
                } else if (type10 === 'min' && type20 === 'max') {
                    x2 = x21*4/sizeX-2;
                    y2 = y21*4/sizeY-2;
                } else if (type10 === 'max' || type10 === 'min') {
                    x2 = x20*4/sizeX-2;
                    y2 = y20*4/sizeY-2;
                } else if (type20 === 'min' || type20 === 'max') {
                    x2 = x21*4/sizeX-2;
                    y2 = y21*4/sizeY-2;
                }

                let v2 = multisineT(t2, x2, y2);
                let dist = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
                if (dist < 0.3) {
                    seg.push([x1, y1, v1, x2, y2, v2]);
                }
            }
        }
    }

    TTT.push(seg);
}

// Process trackings.
//console.log(bourrinpd);
//console.log(TTT);
TT.push(TTT[0]);
for (let i = 0; i < TTT.length - 2; ++i) {
    let newT = [];
    let currentT = TT[i];
    let nextT = TTT[i+1];
    let foundJ = new Array(nextT.length);
    foundJ.fill(false);
    for (let k = 0; k < currentT.length; ++k) {
        if (!currentT[k]) continue;
        let foundK = false;
        for (let j = 0; j < nextT.length; ++j) { // this is so ugly
            if (foundJ[j]) continue; // ugh
            if (currentT[k][3] === nextT[j][0] && currentT[k][4] === nextT[j][1] && currentT[k][5] === nextT[j][2])
            {
                newT[k] = nextT[j];
                foundK = true;
                foundJ[j] = true;
                break;
            }
        }
    }
    for (let j = 0; j < nextT.length; ++j) {
        if (!foundJ[j]) {
            let s = Math.max(nextT.length, newT.length);
            for (let h = 0; h < TT.length; ++h) {
                s = Math.max(s, TT[h].length);
            }
            newT[s] = nextT[j];
        }
    }
    TT.push(newT);
}
let largest = 0;
for (let i = 0; i < TT.length; ++i) {
    if (TT[i].length > largest) largest = TT[i].length;
}
for (let i = 0; i < TT.length; ++i) {
    let TTT = TT[i];

    for (let k = 0; k < largest; ++k) {
        let cur = TTT[k];

        if (!cur) {
            let firstId = 0;
            let first;
            let lastId = TT.length - 1;
            let last;
            for (let j = 0; j < TT.length; ++j) {
                if (TT[j][k]) {
                    firstId = j;
                    first = TT[j][k];
                    break;
                }
            }
            for (let j = TT.length - 1; j >= 0; --j) {
                if (TT[j][k]) {
                    lastId = j;
                    last = TT[j][k];
                    break;
                }
            }
            for (let j = 0; j < TT.length; ++j) {
                if (!TT[j][k]) {
                    if (j < firstId) TT[j][k] = first;
                    if (j > lastId) TT[j][k] = last;
                }
            }
        }
    }
}
console.log(TT);

var halfMunkresRunningInterval;
function launchHalfMunkres(
    s1, s2, drawable, gridData,
    gridElement, costMatrix, deltaT,
    maxValue, drawableDiag1, drawableDiag2,
    callback)
{
    if (halfMunkresRunningInterval) return;
    reinitHalfMunkres(s1 + 1, s2 + 1, costMatrix); // + 1 for diagonal col+row
    halfMunkresRunningInterval = setInterval(function() {
        solveHalfMunkres(
            s1 + 1, s2 + 1, costMatrix,
            gridData, drawable, gridElement, elementSize,
            maxValue, drawableDiag1, drawableDiag2,
            callback);
    }, deltaT);
}

function demoHalfMunkres(
    s1, s2,
    drawableDiag1, drawableDiag2, drawableGrid,
    gridData, gridElement, costMatrixHalf, deltaT,
    maxValue,
    callback)
{
    var offset = 1;
    var el = elementSize; // I want H=200
    var width = s1 * el;
    var height = s2 * el;

    drawableDiag1[0]
        .transition()
        .delay(1000)
        .duration(1000)
        .attr("x1", function (d) {
            return 2 + Math.floor(0.5 * el + offset + el * d.i);
        })
        .attr("y1", function (d) {
            return 4 + Math.floor(height * (offset - d.x));
        })
        .attr("x2", function (d) {
            return 2 + Math.floor(0.5 * el + offset + el * d.i);
        })
        .attr("y2", function (d) {
            return 4 + Math.floor(height * (offset - d.x - d.y));
        })
        .on('end', _ =>
            launchHalfMunkres(
                s1, s2, drawableGrid,
                gridData, gridElement, costMatrixHalf, deltaT,
                maxValue, drawableDiag1, drawableDiag2,
                callback));

    drawableDiag1[3]
        .transition()
        .delay(1000)
        .duration(1000)
        .attr("cx", function (d) {
            return 2 + Math.floor(0.5 * el + offset + el * d.i);
        })
        .attr("cy", function (d) {
            return 4 + Math.floor(height * (offset - d.x - d.y));
        });
    drawableDiag1[2]
        .transition()
        .delay(1000)
        .duration(1000)
        .attr("cx", function (d) {
            return 2 + Math.floor(0.5 * el + offset + el * d.i);
        })
        .attr("cy", function (d) {
            return 4 + Math.floor(height * (offset - d.x));
        });
    drawableDiag1[1]
        .transition()
        .delay(1000)
        .duration(1000)
        .style('opacity', 0);

    drawableDiag2[0]
        .transition()
        .delay(1000)
        .duration(1000)
        .attr("x1", function (d) {
            return 4 + Math.floor(width * (offset - d.x));
        })
        .attr("y1", function (d) {
            return 2 + Math.floor(0.5 * el + offset + el * d.i);
        })
        .attr("x2", function (d) {
            return 4 + Math.floor(width * (offset - d.x - d.y));
        })
        .attr("y2", function (d) {
            return 2 + Math.floor(0.5 * el + offset + el * d.i);
        });
    drawableDiag2[1]
        .transition()
        .delay(1000)
        .duration(1000)
        .style('opacity', 0);
    drawableDiag2[3]
        .transition()
        .delay(1000)
        .duration(1000)
        .attr("cy", function (d) {
            return 2 + Math.floor(0.5 * el + offset + el * d.i);
        })
        .attr("cx", function (d) {
            return 4 + Math.floor(width * (offset - d.x - d.y));
        });
    drawableDiag2[2]
        .transition()
        .delay(1000)
        .duration(1000)
        .attr("cy", function (d) {
            return 2 + Math.floor(0.5 * el + offset + el * d.i);
        })
        .attr("cx", function (d) {
            return 4 + Math.floor(width * (offset - d.x));
        });
}

function updateGridData(s1, s2, gdata, costm, markm) {
    let max = 0;
    for (let i = 0; i < s1; ++i) {
        for (let j = 0; j < s2; ++j) {
            max = Math.max(costm[i][j], max);
        }
    }

    for (var i = 0; i < s1; ++i) {
        for (var j = 0; j < s2; ++j) {
            if (i === s1 - 1 && j === s2 - 1) continue;
            if (markm[i][j] === 1)
                gdata[i][j].cost = -1;
            else if (markm[i][j] === 2)
                gdata[i][j].cost = -2;
            else
                gdata[i][j].cost = (1 / max) * costm[i][j];
        }
    }
}

function updateHalfCostDrawable(matrix, masks, s1, s2, id, maxValue)
{
    let cost = 0;
    for (let i = 0; i < s1 - 1; ++i) {
        let isRowComplete = false;
        for (let j = 0; j < s2 - 1; ++j) {
            if (masks[i][j] === 1) {
                isRowComplete = true;
                cost += matrix[i][j];
            }
        }
        if (!isRowComplete)
            cost += matrix[i][s2 - 1];
    }
    for (let j = 0; j < s2; ++j) {
        cost += masks[s1 - 1][j] === 1 ? matrix[s1 - 1][j] : 0;
    }
    $(id).text("Cost = " + cost.toFixed(5));
    $(id + "i").text("Iterations = " + iter);
}

function updateHalfDrawable(gridData, drawable, gridElement, s1, s2, elementSize)
{
    d3.select("#drawablehalf").remove();
    drawGrid(gridData, gridElement, s2, s1, elementSize, "half");
}

function solveHalfMunkres(
    s1, s2, costMatrix, gridData, drawable, gridElement, elementSize,
    maxValue, drawableDiag1, drawableDiag2, callback)
{
    if (isHalfMunkresOver()) {
        clearInterval(halfMunkresRunningInterval);
        if (callback) callback();
        return;
    }

    runHalfMunkresRound();
    updateGridData(s1, s2, gridData, C, M);

    updateHalfCostDrawable(costMatrix, M, s1, s2, "#halfcost", maxValue);
    updateHalfDrawable(gridData, drawable, gridElement, s1, s2, elementSize);
    // updatePersitenceDiagramDrawable(M, s1, s2, drawableDiag1, drawableDiag2, "half");
}

function reinitHalfMunkres(s1, s2, costMatrix) {
    setInput(s1, s2, costMatrix);
}

function isHalfMunkresOver() {
    return done;
}

function runHalfMunkresRound() {
    runHalf(matchings);
}

function displayMatrix(s1, s2, mat) {
    for (let i = 0; i < s1; ++i) {
        var s = "| ";
        for (let j = 0; j < s2; ++j) {
            s += mat[i][j].toFixed(3) + " | "
        }
        console.log(s);
    }
}

// Algo internals

var matchings = [];
var C;
var M;
var rowCover;
var colCover;

var rowLimitsMinus;
var rowLimitsPlus;
var colLimitsMinus;
var colLimitsPlus;

var path;
var createdZeros;

var pathRow0;
var pathCol0;
var pathCount = 0;

var rowSize = 0;
var colSize = 0;

function isZero(t) {
    // return std::abs((double) t) < 1e-15;
    return t === 0.;
}

var globalStep = 1;
var iter = 0;
var done = false;

function setInput(s1, s2, costMatrix) {
    iter = 0;
    globalStep = 1;
    done = false;

    rowSize = s1;
    colSize = s2;
    C = [];
    M = [];
    rowCover = [];
    colCover = [];
    path = [];
    createdZeros = [];
    rowLimitsMinus = [];
    rowLimitsPlus = [];
    colLimitsMinus = [];
    colLimitsPlus = [];

    let nbPaths = 1 + colSize + rowSize;
    for (let i = 0; i < nbPaths; ++i)
        path.push([0, 0]);

    for (let i = 0; i < rowSize; ++i) {
        M.push([]);
        C.push([]);
        for (let j = 0; j < colSize; ++j) {
            M[i].push(0);
            C[i].push(costMatrix[i][j]);
        }
    }

    for (let i = 0; i < rowSize; ++i) {
        rowLimitsMinus.push(0);
        rowLimitsPlus.push(0);
        rowCover.push(false);
    }
    for (let j = 0; j < colSize; ++j) {
        colLimitsMinus.push(0);
        colLimitsPlus.push(0);
        colCover.push(false);
    }
}

function runHalf(matchings)
{
    let step = globalStep;
    let maxIter = 50000;

    //while (!done) {
        ++ iter;

        if (iter > maxIter) {
            step = 7;
            // Abort. Still found something
            // albeit hardly optimized.
        }

        switch(step)
        {
            case 1:
                step = stepOne(step);
                break;
            case 2:
                step = stepTwo(step);
                break;
            case 3:
                step = stepThree(step);
                break;
            case 4:
                step = stepFour(step);
                break;
            case 5:
                step = stepFive(step);
                break;
            case 6:
                step = stepSix(step);
                break;
            case 7:
                step = stepSeven(step);
                done = true;
                break;
            default:
                break;
        }

        globalStep = step;
    // }

    return 0;
}

// Preprocess cost matrix.
function stepOne(step) // ~ 0% perf
{
    let minInCol;

    // Benefit from the matrix sparsity.
    let maxVal = Number.MAX_VALUE;
    for (let r = 0; r < rowSize - 1; ++r) {
        rowLimitsPlus[r] = -1;
        rowLimitsMinus[r] = -1;
    }
    for (let c = 0; c < colSize - 1; ++c) {
        colLimitsPlus[c] = -1;
        colLimitsMinus[c] = -1;
    }

    let droppedMinus = 0;
    let droppedPlus = 0;

    for (let r = 0; r < rowSize - 1; ++r) {
        for (let c = 0; c < colSize - 1; ++c)
            if (C[r][c] !== maxVal) {
                rowLimitsMinus[r] = c; // Included
                break;
            }
        if (rowLimitsMinus[r] === -1)
        {
            ++droppedMinus;
            rowLimitsMinus[r] = 0;
        } // Included

        for (let c = colSize - 2; c >= 0; --c)
        if (C[r][c] !== maxVal) {
            rowLimitsPlus[r] = c + 1; // Not included
            break;
        }
        if (rowLimitsPlus[r] === -1)
        {
            ++droppedPlus;
            rowLimitsPlus[r] = colSize - 1;
        } // Not included
    }

    if (droppedMinus > 0) {
        console.log("[Munkres] Unexpected non-assignable row " +
            "[minus], dropping optimisation for "
        + droppedMinus + " row(s).");
    }

    if (droppedPlus > 0) {
        console.log("[Munkres] Unexpected non-assignable row " +
            "[plus], dropping optimisation for "
        + droppedPlus + " row(s).");
    }

    droppedMinus = 0;
    droppedPlus = 0;

    for (let c = 0; c < colSize - 1; ++c) {
        for (let r = 0; r < rowSize - 1; ++r)
        if (C[r][c] !== maxVal) {
            colLimitsMinus[c] = r; // Inclusive
            break;
        }
        for (let r = rowSize - 1; r >= 0; --r)
            if (C[r][c] !== maxVal) {
                colLimitsPlus[c] = r + 1; // Exclusive.
                break;
            }
            if (colLimitsPlus[c] === -1) {
                ++droppedPlus;
                colLimitsMinus[c] = 0;
            }
            if (colLimitsMinus[c] === -1) {
                ++droppedMinus;
                colLimitsMinus[c] = rowSize;
            }
        }

    if (droppedMinus > 0) {
        console.log("[Munkres] Unexpected non-assignable" +
            " column [minus], dropping optimisation for "
        + droppedMinus + " column(s).");
    }

    if (droppedPlus > 0) {
        console.log("[Munkres] Unexpected non-assignable" +
            " column [plus], dropping optimisation for "
        + droppedPlus + " column(s).");
    }

    rowLimitsMinus[rowSize - 1] = 0;
    rowLimitsPlus[rowSize - 1] = colSize - 1;

    // Remove last column (except the last element) from all other columns.
    // The last column will then be ignored during the solving.
    for (let r = 0; r < rowSize - 1; ++r) {
        let lastElement = C[r][colSize - 1];
        for (let c = 0; c < colSize - 1; ++c) {
            C[r][c] -= lastElement;
        }
    }

    // Subtract minimum value in every column except the last.
    for (let c = 0; c < colSize - 1; ++c) {
        minInCol = C[0][c];

        for (let r = 0; r < rowSize; ++r)
        if (C[r][c] < minInCol) minInCol = C[r][c];

        for (let r = 0; r < rowSize; ++r)
        C[r][c] -= minInCol;
    }

    step = 2;
    return step;
}

// Find a zero in the matrix,
// star it if it is the only one in its row and col.
function stepTwo(step) // ~ 0% perf
{
    for (let r = 0; r < rowSize - 1; ++r) {
        for (let c = 0; c < colSize - 1; ++c) {
            if (!rowCover[r] && !colCover[c] && isZero(C[r][c])) {
                M[r][c] = 1;
                // Temporarily cover row and column to find independent zeros.
                rowCover[r] = true;
                colCover[c] = true;
            }
        }
    }

    for (let c = 0; c < colSize - 1; ++c)
        if (isZero(C[rowSize-1][c]) && !colCover[c]) {
            M[rowSize-1][c] = 1;
            // Don't ban last row where elements are all independent.
            colCover[c] = true;
        }

    // Remove coverings (temporarily used to find independent zeros).
    for (let r = 0; r < rowSize; ++r)
        rowCover[r] = false;

    for (let c = 0; c < colSize - 1; ++c)
        colCover[c] = false;

    step = 3;
    return step;
}

// Check column coverings.
// If all columns are starred (1 star only per column is possible)
// then the algorithm is terminated.
function stepThree(step) // ~ 10% perf
{
    for (let r = 0; r < rowSize; ++r)
    {
        let start = rowLimitsMinus[r];
        let end = rowLimitsPlus[r];
        for (let c = start; c < end; ++c)
        if (M[r][c] === 1)
            colCover[c] = true;
    }

    let processedCols = 0;

    for (let c = 0; c < colSize - 1; ++c)
    if (colCover[c]) ++processedCols;

    if (processedCols >= colSize - 1)
        step = 7; // end algorithm
    else
        step = 4; // follow prime scheme
    return step;
}

// Find a non covered zero, prime it
// . if current row is last or has no starred zero -> step 5
// . else, cover row and uncover the col with a star
// Repeat until there are no uncovered zero left
// Save smallest uncovered value then -> step 6
function stepFour(step) // ~ 45% perf
{
    let row = -1;
    let col = -1;
    let done = false;

    //while (!done)
    //{
        [row, col] = findZero(row, col);

        if (row === -1) {
            done = true;
            step = 6;
        }

        else {
            M[row][col] = 2;
            let colOfStarInRow = findStarInRow(row);
            // If a star was found and it is not in the last row
            if (colOfStarInRow > -1 && row < rowSize - 1) {
                rowCover[row] = true;
                colCover[colOfStarInRow] = false;
                step = 4;
                // break down the while loop into successive calls for display
            }

            else {
                done = true;
                step = 5;
                pathRow0 = row;
                pathCol0 = col;
            }
        }
    //}

    return step;
}

function findStarInRow(row) {
    let start = rowLimitsMinus[row];
    let end = rowLimitsPlus[row];
    for (let c = start; c < end; ++c)
    if (M[row][c] === 1) return c;
    return -1;
}

function findZero(row, col) {
    row = -1;
    col = -1;

    while (createdZeros.length > 0) {
        let zero = createdZeros.pop();
        let f = zero[0];
        let s = zero[1];
        if (!rowCover[f] && !colCover[s]) {
            row = f;
            col = s;
            return [row, col];
        }
    }

    for (let r = 0; r < rowSize; ++r) {
        let start = rowLimitsMinus[r];
        let end = rowLimitsPlus[r];
        if (rowCover[r]) continue;

        for (let c = start; c < end; ++c) {
            if (colCover[c]) continue;
            if (C[r][c] === 0) {
                row = r;
                col = c;
                return [row, col];
            }
        }
    }

    // console.log("[Munkres] Zero not found");
    return [row, col];
}

// Make path of alternating primed and starred zeros
// 1. uncovered primed found at step 4
// 2. same column, starred (if any)
// 3. same row, primed (always one)
// 4. continue until a primed zero has no starred zero in its column
// Unstar each starred zero in the series, star each primed zero
// in the series,
// erase all primes, uncover every line, return to step 3.
function stepFive(step) // ~ 10% perf
{
    {
        let r;
        let c;

        pathCount = 1;
        path[pathCount - 1][0] = pathRow0;
        path[pathCount - 1][1] = pathCol0;

        let done = false;
        while (!done) {
            r = findStarInCol(path[pathCount - 1][1]);
            if (r === -1)
                done = true;

            else {
                ++pathCount;
                path[pathCount - 1][0] = r;
                path[pathCount - 1][1] = path[pathCount - 2][1];

                c = findPrimeInRow(path[pathCount - 1][0]);
                if (c === -1) {
                    console.log("[Munkres] Did not find an expected prime.");
                }
                ++pathCount;
                path[pathCount - 1][0] = path[pathCount - 2][0];
                path[pathCount - 1][1] = c;
            }
        }
    }

    // process path
    for (let p = 0; p < pathCount; ++p) {
        if (M[path[p][0]][path[p][1]] === 1)
            M[path[p][0]][path[p][1]] = 0;
        else
            M[path[p][0]][path[p][1]] = 1;
    }

    // clear covers
    for (let r = 0; r < rowSize; ++r) rowCover[r] = false;
    for (let c = 0; c < colSize - 1; ++c) colCover[c] = false;

    // erase primes
    for (let r = 0; r < rowSize; ++r)
    {
        let start = rowLimitsMinus[r];
        let end = rowLimitsPlus[r];
        for (let c = start; c < end; ++c)
        if (M[r][c] === 2) M[r][c] = 0;
    }

    step = 3;
    return step;
}

function findStarInCol(col) {
    let start = colLimitsMinus[col];
    let end = colLimitsPlus[col];
    for (let r = start; r < end; ++r)
    if (M[r][col] === 1) return r;

    if (M[rowSize - 1][col] === 1)
        return (rowSize - 1);
    return -1;
}

function findPrimeInRow(row) {
    let start = rowLimitsMinus[row];
    let end = rowLimitsPlus[row];
    for (let c = start; c < end; ++c)
    if (M[row][c] === 2) return c;
    return -1;
}

// Add smallest value to every element of each covered row,
// subtract it from every element of each uncovered col.
// Return to step 4 without altering any stars/primes/covers.
function stepSix(step) // ~ 35% perf
{
    let minVal = Number.MAX_VALUE;

    // find smallest
    for (let r = 0; r < rowSize; ++r) {
        if (rowCover[r]) continue;

        let start = rowLimitsMinus[r];
        let end = rowLimitsPlus[r];

        for (let c = start; c < end; ++c) {
            if (colCover[c]) continue;
            if (C[r][c] < minVal) minVal = C[r][c];
        }
    }

    createdZeros = [];

    // add and subtract
    for (let r = 0; r < rowSize; ++r) {

        let start = rowLimitsMinus[r];
        let end = rowLimitsPlus[r];

        for (let c = start; c < end; ++c) {
            if (rowCover[r])
                C[r][c] = C[r][c] + minVal;
            if (!colCover[c]) {
                C[r][c] = C[r][c] - minVal;
                if (isZero(C[r][c])) {
                    createdZeros.push([r, c]);
                }
            }
        }
    }

    step = 4;
    return step;
}

function stepSeven(step) {
    console.log("[HalfMunkres] " + iter + " iterations.");
    return step;
}
