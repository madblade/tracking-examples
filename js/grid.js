// var cPers = 0.5;

function distagonal(pair)
{
    let x = pair.x;
    let y = pair.y;
    let x12d = pair.x12d;
    let y12d = pair.y12d;
    let x22d = pair.x22d;
    let y22d = pair.y22d;
    return Math.sqrt(0.1 * Math.pow(y, 2) + Math.pow(x12d - x22d, 2) + Math.pow(y12d - y22d, 2));
}

function distance(pair1, pair2)
{
    let x1 = pair1.x;
    let x2 = pair2.x;
    let y1 = pair1.y;
    let y2 = pair2.y;
    let x12d = pair1.x12d;
    let x22d = pair1.x22d;
    let y12d = pair1.y12d;
    let y22d = pair1.y22d;
    let x12d2 = pair2.x12d;
    let x22d2 = pair2.x22d;
    let y12d2 = pair2.y12d;
    let y22d2 = pair2.y22d;

    let whichEx1 = pair1.whichEx;
    let whichEx2 = pair2.whichEx;
    if (whichEx1 === 0) {
        return 1000;
    }

    // let p1x = (x12d + x22d) * 0.5;
    // let p1y = (y12d + y22d) * 0.5;
    // let p2x = (x12d2 + x22d2) * 0.5;
    // let p2y = (y12d2 + y22d2) * 0.5;

    let p1x = whichEx1 === 0 ? x12d : x22d;
    let p1y = whichEx1 === 0 ? y12d : y22d;

    let p2x = whichEx1 === 0 ? x12d2 : x22d2;
    let p2y = whichEx1 === 0 ? y12d2 : y22d2;

    var cBirth = 0.0; //whichEx1 === 0 ? 0.5 : 0.0;
    var cDeath = 0.0; //whichEx1 === 0 ? 0.0 : 0.5;
    var cGX = 5.5;
    var cGY = 0.5;

    return Math.sqrt(cBirth * Math.pow(x1 - x2, 2) + cDeath * Math.pow(y1 - y2, 2) +
            cGX * Math.pow(p1x - p2x, 2) + cGY * Math.pow(p1y - p2y, 2));
}

function getGrid(
    pd1, // first persitence diagram
    pd2, // second persistence diagram
    nbRow,  // nb first
    nbCol,  // nb second
    width,  // pixel width
    height, // pixel height
    gridType) // "half" or "full"
{
    let data = [];
    let xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
    let ypos = 1;
    let click = 0;
    let max = 0;

    // iterate for rows
    for (let row = 0; row < nbRow; row++) {
        data.push([]);

        let distagD = distagonal(pd1[row]);
        max = Math.max(max, distagD);

        // iterate for cells/columns inside rows
        for (let column = 0; column < nbCol; column++) {
            let distD = distance(pd1[row], pd2[column]);
            let distagD2 = distagonal(pd2[column]);
            max = Math.max(max, distD);

            data[row].push({
                x: xpos,
                y: ypos,
                width: width,
                height: height,
                click: click,
                cost: distD,
                costD1: distagD,
                costD2: distagD2
            });

            // increment the x position. I.e. move it over by 50 (width variable)
            xpos += width;
        }

        // Full Munkres
        if (gridType === "full") {
            for (let column = 0; column < nbRow; column++) {
                data[row].push({
                    x: xpos,
                    y: ypos,
                    width: width,
                    height: height,
                    click: click,
                    cost: distagD
                });
                xpos += width;
            }
        } else if (gridType === "half") {
            data[row].push({
                x: xpos,
                y: ypos,
                width: width,
                height: height,
                click: click,
                cost: distagD,
                lastcol: true
            });
            xpos += width;
        }

        // reset the x position after a row is complete
        xpos = 1;
        // increment the y position for the next row. Move it down 50 (height variable)
        ypos += height;
    }

    // Full Munkres: bottom two.
    if (gridType === "full")
    {
        for (let row = 0; row < nbCol; row++) {
            data.push([]);

            // iterate for cells/columns inside rows
            for (let column = 0; column < nbCol; column++) {
                let tempD = distagonal(pd2[column]);
                max = Math.max(max, tempD);
                data[nbRow + row].push({
                    x: xpos,
                    y: ypos,
                    width: width,
                    height: height,
                    click: click,
                    cost: tempD
                });

                // increment the x position. I.e. move it over by 50 (width variable)
                xpos += width;
            }

            // Last square.
            for (let column = 0; column < nbRow; column++) {
                data[nbRow + row].push({
                    x: xpos,
                    y: ypos,
                    width: width,
                    height: height,
                    click: click,
                    cost: 0
                });
                xpos += width;
            }

            // reset the x position after a row is complete
            xpos = 1;
            // increment the y position for the next row. Move it down 50 (height variable)
            ypos += height;
        }
    }
    else if (gridType === "half")
    {
        data.push([]);

        // iterate for cells/columns inside rows
        for (let column = 0; column < nbCol; column++) {
            let tempD = distagonal(pd2[column]);
            max = Math.max(max, tempD);
            data[nbRow].push({
                x: xpos,
                y: ypos,
                width: width,
                height: height,
                click: click,
                cost: tempD,
            });

            // increment the x position. I.e. move it over by 50 (width variable)
            xpos += width;
        }

        // xpos = 1;
        // ypos += height;
    }

    // Normalize grid.
    if (gridType === "full")
        for (let i = 0; i < nbRow + nbCol; ++i) {
            for (let j = 0; j < nbRow + nbCol; ++j) {
                data[i][j].cost /= max;
            }
        }
    else if (gridType === "half") {
        for (let i = 0; i < nbRow + 1; ++i)
            for (let j = 0; j < nbCol + 1; ++j) {
                if (data[i][j])
                    data[i][j].cost /= max;
            }
    }

    return [data, max];
}

function drawGrid(gridData, gridElement, size1, size2, elementSize, gridType, index)
{
    let s1 = size1;
    let s2 =
        gridType === "half" || gridType === "half-sparse" ?
        size2 + 1 : size2;

    let drawid =
        gridType === "half" ? "#drawablehalf" :
        gridType === "full" ? "#drawablefull" :
        gridType === "half-sparse" ? "#drawablehalfsparse" :
        gridType === "full-sparse" ? "#drawablefullsparse" :
            "#drawableauction";

    if (index === 0)
    d3.select(drawid).remove();

    let grid = d3.select(gridElement)
        .append("svg")
        .attr("id",
                gridType === "half" ? "drawablehalf" :
                gridType === "full" ? "drawablefull" :
                gridType === "half-sparse" ? "drawablehalfsparse" :
                gridType === "full-sparse" ? "drawablefullsparse" :
                  "drawableauction")
        .attr("width", s1 * elementSize + 10 + "px")
        .attr("height", s2 * elementSize + 10 + "px");

    let row = grid.selectAll(".row")
        .data(gridData)
        .enter().append("g")
        .attr("class", "row");

    let column = row.selectAll(".square")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("class","square")
        .attr("x", function(d) { return d.cost < -1 ? d.x + 2 : d.x; })
        .attr("y", function(d) { return d.cost < -1 ? d.y + 2 : d.y; })
        .attr("width", function(d) { return d.cost < -1 ? d.width - 4 : d.width; })
        .attr("height", function(d) { return d.cost < -1 ? d.height - 4 : d.height; })
        .attr("style", function(d) {
            if (d.lastcol)
                return "display:none";
            return "fill: " + getColor(d.cost) + ";";
        });

    return column;
}

function animateGrid(column, acc)
{
    column
        // .transition(0)
        .attr("style", function(d) {
            let res = "";
            if (d.lastcol)
                res = "display:none";
            else if (acc === 0 && d.cost && d.costD1 !== undefined && d.costD2 !== undefined &&
                    d.cost > d.costD1 + d.costD2)
                res = "fill:#020202;opacity:0.8;";
            else {
                let col = getColor(d.cost);
                res = "fill: " + col + ";";
            }
            return res;
        });
}
