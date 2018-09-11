function getPersistenceDiagram(
    nbPairs,
    sparseCoeff)
{
    var rng = Math.random;
    var data = [];

    data.push({x: 0, y: 1, i: 0, x2D: 0.5, y2D: 0.5, xx2D: 0.6, yy2D: 0.7});
    for (var i = 0; i < nbPairs - 2; ++i) {
        var x = rng();
        var y = rng();
        if (y < x) {
            var t = y;
            y = x;
            x = t;
        }
        y -= x;

        var x2D = rng();
        var y2D = rng();
        var xx2D = x2D + 0.5 * rng() * (1.0 - sparseCoeff);
        var yy2D = x2D + 0.5 * rng() * (1.0 - sparseCoeff);

        data.push({
            x: x,
            y: y * (1.0 - sparseCoeff),
            i: i+1,
            x2D: x2D,
            y2D: y2D,
            xx2D: xx2D,
            yy2D: yy2D
        });
    }
    data.push({x: 0.9999999, y: 0.0000001, i: nbPairs - 1, x2D: 0.7, y2D: 0.7, xx2D: 0.4, yy2D: 0.7});

    data.sort(function(a, b) {return a.x - b.x});
    for (let i = 0; i < data.length; ++i)
        data[i].i = i;

    return data;
}

// Animation attributes.

function updatePersitenceDiagramDrawable(
    masks, s1, s2, diag1, diag2, type)
{
    let d1Affected;
    let d2Affected;

    if (type === "full") {
        d1Affected = new Array(s1);
        d2Affected = new Array(s2);
        for (let i = 0; i < s1; ++i) {
            for (let j = 0; j < s2; ++j) {
                if (masks[i][j]) {
                    d1Affected[j] = true;
                    d2Affected[i] = true;
                }
            }
        }
    } else if (type === "half") {
        d1Affected = new Array(s1 - 1);
        d2Affected = new Array(s2 - 1);
        for (let i = 0; i < s1 - 1; ++i) {
            for (let j = 0; j < s2 - 1; ++j) {
                if (masks[i][j]) {
                    d1Affected[j] = true;
                    d2Affected[i] = true;
                }
            }
        }
    } else if (type === "auction") {
        d1Affected = new Array(s1);
        d2Affected = new Array(s2);
        let degenerateI = Array(s1).fill(0);
        let degenerateJ = Array(s2).fill(0);
        for (let i = 0; i < s1; ++i) {
            let indexJ = assignment[i];
            if (indexJ >= 0) {
                degenerateI[i]++;
                degenerateJ[indexJ]++;
            }
        }
        for (let i = 0; i < s1; ++i) {
            for (let j = 0; j < s2; ++j) {
                if (degenerateI[i] > 1 || degenerateJ[j] > 1) continue;
                if (masks[i] === j) {
                    d1Affected[j] = true;
                    d2Affected[i] = true;
                }
            }
        }
    }

    diag1[0]
        .transition()
        .duration(0)
        .attr("stroke", function(d) {
           return d1Affected[d.i] ? "#0f0" : "#222";
        });

    diag2[0]
        .transition()
        .duration(0)
        .attr("stroke", function(d) {
           return d2Affected[d.i] ? "#0f0" : "#222";
        });
}

function redraw2D(embed, d1h, d2h, d1f, d2f, w1, h1, w2, h2, w3, h3, w4, h4, offset, p1, p2, p3, p4)
{
    var ds = [d1h, d2h, d1f, d2f];
    var who = [w1, w2, w3, w4];
    var whd = [h1, h2, h3, h4];
    var pds = [p1, p2, p3, p4];
    for (let i = 0; i < 4; ++i) {
        let width = who[i];
        let height = whd[i];
        var pdData = pds[i];
        var diagSize = pdData.length;

        if (embed)
            ds[i][0]
                .attr("x1", function(d) { return d.x2D; })
                .attr("y1", function(d) { return d.y2D; })
                .attr("x2", function(d) { return d.xx2D; })
                .attr("y2", function(d) { return d.yy2D; });
        else
            ds[i][0]
                .attr("x1", function(d) { return 2+Math.floor(offset + width * d.x); })
                .attr("y1", function(d) { return 4+Math.floor(height * (offset - d.x)); })
                .attr("x2", function(d) { return 2+Math.floor(offset + width * d.x); })
                .attr("y2", function(d) { return 4+Math.floor(height * (offset - d.x - d.y)); });

        if (embed)
            ds[i][1]
                .attr("x1", function(d) { return d.x2D; })
                .attr("y1", function(d) { return d.y2D; })
                .attr("x2", function(d) { return d.xx2D; })
                .attr("y2", function(d) { return d.yy2D; });
        else
            ds[i][1]
                .attr("x1", function() { return 2+0; })
                .attr("y1", function() { return 4+height; })
                .attr("x2", function() { return 2+Math.floor(offset + width * pdData[diagSize-1].x); })
                .attr("y2", function() { return 4+Math.floor(height * (offset - pdData[diagSize-1].x )); });

        if (embed)
            ds[i][2]
                .attr("cx", function(d) { return d.x2D; })
                .attr("cy", function(d) { return d.y2D; });
        else
            ds[i][2]
                .attr("cx", function(d) { return 2+Math.floor(offset + width * d.x); })
                .attr("cy", function(d) { return 4+Math.floor(height * (offset - d.x)); });

        if (embed)
            ds[i][3]
                .attr("cx", function(d) { return d.xx2D; })
                .attr("cy", function(d) { return d.yy2D; });
        else
            ds[i][3]
                .attr("cx", function(d) { return 2+Math.floor(offset + width * d.x); })
                .attr("cy", function(d) { return 4+Math.floor(height * (offset - d.x - d.y)); });
    }
}

function drawDiagram(pdData, pdElement, width, height, offset, pullRight, index)
{
    var diagSize = pdData.length;
    // var width = 500;
    // var height = 500;
    // var offset = 1;

    if (index === 0)
    d3.select(pdElement + "id").remove();

    var pers = d3.select(pdElement)
        .append("svg")
        .attr("id", pdElement.substring(1) + "id")
        .attr("width", (width + 10) + "px")
        .attr("height", (height + 10) + "px");

    if (pullRight) pers.attr("class", "pull-right");

    var bars = pers.selectAll(".bar")
        .data(pdData)
        .enter().append("line")
        .attr("fill", "none")
        .attr("stroke", "#222")
        .attr("stroke-width", "2")
        .attr("class", "bar")
        .attr("x1", function(d) { return 2+Math.floor(offset + width * d.x); })
        .attr("y1", function(d) { return 4+Math.floor(height * (offset - d.x)); })
        .attr("x2", function(d) { return 2+Math.floor(offset + width * d.x); })
        .attr("y2", function(d) { return 4+Math.floor(height * (offset - d.x - d.y)); });

    var diag = pers.append("line")
        .attr("fill", "none")
        .attr("stroke", "#222")
        .attr("stroke-width", "2")
        .attr("class", "bar")
        .attr("x1", function() { return 2+0; })
        .attr("y1", function() { return 4+height; })
        .attr("x2", function() { return 2+Math.floor(offset + width * pdData[diagSize-1].x); })
        .attr("y2", function() { return 4+Math.floor(height * (offset - pdData[diagSize-1].x )); });

    var min = pers.selectAll(".min")
        .data(pdData)
        .enter().append("circle")
        .attr("class", "min")
        .attr("fill", getColor(0))
        .attr("cx", function(d) { return 2+Math.floor(offset + width * d.x); })
        .attr("cy", function(d) { return 4+Math.floor(height * (offset - d.x)); })
        .attr("r", function(d) { return 3; });

    var max = pers.selectAll(".max")
        .data(pdData)
        .enter().append("circle")
        .attr("class", "max")
        .attr("fill", getColor(0.99999))
        .attr("cx", function(d) { return 2+Math.floor(offset + width * d.x); })
        .attr("cy", function(d) { return 4+Math.floor(height * (offset - d.x - d.y)); })
        .attr("r", function(d) { return 3; });

    return [bars, diag, min, max];
}
