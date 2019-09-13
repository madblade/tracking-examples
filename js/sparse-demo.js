
var elementSize = 5; // pixels
var elementSizeDiagram = 3;

var isDemoRunning = false;
var blinkingInterval;
var is2D = false;

function performDemo()
{
    // Filter input.
    if (blinkingInterval) {
        clearInterval(blinkingInterval);
    }
    var selectorGeo = $('#buttongeo');

    var selectorSize1 = $("#d1size");
    var selectorSize2 = $("#d2size");
    var selectorSparseCoeff = $("#sparseCoeff");
    var sparseCoeff = parseInt(selectorSparseCoeff.val());
    var size1 = parseInt(selectorSize1.val()); // 7;
    var size2 = parseInt(selectorSize2.val()); // 7;
    let limitSize = 40;

    if (!size1 || (typeof size1) !== "number") size1 = limitSize;
    if (!size2 || (typeof size2) !== "number") size2 = limitSize;
    if (sparseCoeff > 100 || sparseCoeff < 0) sparseCoeff = 50;

    if (size1 < 4) {
        size1 = 4;
        selectorSize1.val(4);
    }
    if (size2 < 4) {
        size2 = 4;
        selectorSize2.val(4);
    }
    var selectH = $("#halfmunkres");
    var selectF = $("#fullmunkres");
    if (size1 <= limitSize && size2 <= limitSize) {
        selectH.removeClass('col-sm-5').addClass('col-sm-5');
        selectF.removeClass('col-sm-7').addClass('col-sm-7');
    }
    if (size1 > limitSize || size2 > limitSize) {
        selectH.removeClass('col-sm-5');
        selectF.removeClass('col-sm-7');
    }

    // Generate data.
    var pdData1 = getPersistenceDiagram(size1, (100 - sparseCoeff) * 0.01);
    var pdData2 = getPersistenceDiagram(size2, (100 - sparseCoeff) * 0.01);

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

    var [gridDataFull, maxFull] =
        getGrid(pdData1, pdData2, size1, size2, elementSize, elementSize, "full");
    var costMatrixFull = new Array(size1 + size2);
    for (let i = 0; i < size1 + size2; ++i) {
        costMatrixFull[i] = new Float32Array(size1 + size2);
        for (let j = 0; j < size1 + size2; ++j) {
            let cost = 0;
            if (gridDataFull[i][j]) cost = gridDataFull[i][j].cost;
            costMatrixFull[i][j] = cost;
        }
    }

    // Generate visuals.
    var pdElementH1 = "#pd1";
    var pdElementH2 = "#pd2";
    var gridElementH = "#grid";
    var gridElementHS = "#sparse-grid";
    var d1HM = drawDiagram(
        pdData2, pdElementH2, size2 * elementSizeDiagram, size2 * elementSizeDiagram, 1);
    var d2HM = drawDiagram(
        pdData1, pdElementH1, size1 * elementSizeDiagram, size1 * elementSizeDiagram, 1, true);
    var gH = drawGrid(
        gridDataHalf, gridElementH, size2 + 1, size1 + 1, elementSize, "half");
    // var gHS = drawGrid(
    //     gridDataHalf, gridElementHS, size2 + 1, size1 + 1, elementSize, "half-sparse");

    var pdElementF1 = "#pd1f";
    var pdElementF2 = "#pd2f";
    var gridElementF = "#gridf";
    var gridElementFS = "#sparse-gridf";
    var d1FM = drawDiagram(
        pdData2, pdElementF2, size2 * elementSizeDiagram, size2 * elementSizeDiagram, 1);
    var d2FM = drawDiagram(
        pdData1, pdElementF1, size1 * elementSizeDiagram, size1 * elementSizeDiagram, 1, true);
    var dF = drawGrid(
        gridDataFull, gridElementF, size1 + size2, size1 + size2, elementSize, "full");
    var dFS = drawGrid(
        gridDataFull, gridElementFS, size1 + size2, size1 + size2, elementSize, "full-sparse");

    // selectorGeo.off('click');
    // selectorGeo.on('click', function(event) {
    //     event.preventDefault();
    //     if (is2D)
    //     redraw2D(false, d1HM, d2HM, d1FM, d2FM, size2 * elementSizeDiagram, size2 * elementSizeDiagram,
    //         size1 * elementSizeDiagram, size1 * elementSizeDiagram,
    //         size2 * elementSizeDiagram, size2 * elementSizeDiagram,
    //         size1 * elementSizeDiagram, size1 * elementSizeDiagram, 1,
    //         pdData2, pdData1, pdData2, pdData1);
    //     else
    //     redraw2D(true, d1HM, d2HM, d1FM, d2FM, size2 * elementSizeDiagram, size2 * elementSizeDiagram,
    //         size1 * elementSizeDiagram, size1 * elementSizeDiagram,
    //         size2 * elementSizeDiagram, size2 * elementSizeDiagram,
    //         size1 * elementSizeDiagram, size1 * elementSizeDiagram, 1,
    //         pdData2, pdData1, pdData2, pdData1);
    //     is2D = !is2D;
    // });

    let acc = 0;
    blinkingInterval = setInterval(() =>
    {
        animateGrid(gH, acc);
        animateGrid(dF, acc);
        ++acc;
        acc %= 2;
    }, 500);
}
