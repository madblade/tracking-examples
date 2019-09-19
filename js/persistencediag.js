import {getColor} from "./color";
import * as d3 from "d3";

function drawDiagram(pdData, pdElement, width, height, offset, pullRight, index)
{
    var diagSize = pdData.length;

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
        .attr("stroke-width", "1")
        .attr("class", "bar")
        .attr("x1", function(d) { return 2+Math.floor(offset + width * d.x); })
        .attr("y1", function(d) { return 4+Math.floor(height * (offset - d.x)); })
        .attr("x2", function(d) { return 2+Math.floor(offset + width * d.x); })
        .attr("y2", function(d) { return 4+Math.floor(height * (offset - d.x - d.y)); });

    var diag = pers.append("line")
        .attr("fill", "none")
        .attr("stroke", "#222")
        .attr("stroke-width", "1")
        .attr("class", "bar")
        .attr("x1", function() { return 2+Math.floor(offset + width * pdData[diagSize-1].x); })
        .attr("y1", function() { return 2+Math.floor(offset + width * pdData[diagSize-1].x); })
        .attr("x2", function() { return 2+Math.floor(offset + width * pdData[diagSize-1].x); })
        .attr("y2", function() { return 2+Math.floor(offset + width * pdData[diagSize-1].x); });

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

export { drawDiagram };
