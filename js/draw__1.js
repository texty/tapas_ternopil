/**
 * Created by yevheniia on 11.08.20.
 */

var svg_1,
    defs,
    gBrush,
    brush,
    main_xScale,
    mini_xScale,
    main_yScale,
    mini_yScale,
    main_yZoom,
    main_xAxis,
    main_yAxis,
    handle;

var zoomer = d3.zoom().on("zoom", null);

var main_margin = {top: 30, right: 10, bottom: 30, left: 30},
    main_width = d3.select("#chart_1").node().getBoundingClientRect().width - main_margin.left - main_margin.right,
    main_height = 500 - main_margin.top - main_margin.bottom,
    mini_margin = {top: 30, right: 10, bottom: 30, left: 10},
    mini_height = 500 - mini_margin.top - mini_margin.bottom,
    mini_width = 30 - mini_margin.left - mini_margin.right;


svg_1 = d3.select("#chart_1")
    .attr("class", "svgWrapper")
    .attr("width", main_width + main_margin.left + main_margin.right + mini_width + mini_margin.left + mini_margin.right)
    .attr("height", main_height + main_margin.top + main_margin.bottom)
    .call(zoomer)
    .on("wheel.zoom", scroll)
    .on("mousedown.zoom", null)
    .on("touchstart.zoom", null)
    .on("touchmove.zoom", null)
    .on("touchend.zoom", null);

var mainGroup = svg_1.append("g")
    .attr("class", "mainGroupWrapper")
    .attr("transform", "translate(" + (mini_width + 10) + "," + mini_margin.top + ")")
    .append("g")
    .attr("clip-path", "url(#clip)")
    .style("clip-path", "url(#clip)")
    .attr("class", "mainGroup");

var miniGroup = svg_1.append("g")
    .attr("class", "miniGroup")
    .attr("transform", "translate(" + 0 + "," + main_margin.top + ")");


var brushGroup = svg_1.append("g")
    .attr("class", "brushGroup")
    .attr("transform", "translate(" + 0 + "," + main_margin.top + ")");

// scales
main_xScale = d3.scaleLinear().range([0, main_width]);
mini_xScale = d3.scaleLinear().range([0, mini_width]);

main_yScale = d3.scaleBand().range([0, main_height]);
mini_yScale = d3.scaleBand().range([0, mini_height]);

//Based on the idea from: http://stackoverflow.com/questions/21485339/d3-brushing-on-grouped-bar-chart
main_yZoom = d3.scaleLinear()
    .range([0, main_height])
    .domain([0, main_height]);

//Create x axis object
main_xAxis = d3.axisTop(main_xScale)
    .ticks(2)
    .tickSizeOuter(0)
    //.tickFormat(function(d){ return d/1000})
    .tickFormat(nFormatter)
;

//Add group for the x axis
d3.select(".mainGroupWrapper")
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + 0 + "," + (-10) + ")");

//Create y axis object
main_yAxis = d3.axisLeft(main_yScale)
    .tickSize(0)
    .tickSizeOuter(0)
    .tickFormat(function (d) {
        return ""
    });

//Add group for the y axis
mainGroup.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(-5,0)");

defs = svg_1.append("defs");

//Add the clip path for the main bar chart
defs.append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", -main_margin.left)
    .attr("width", main_width + main_margin.left)
    .attr("height", main_height);






