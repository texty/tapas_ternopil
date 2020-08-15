const detail_margin = {top: 40, right: 20, bottom: 30, left: 150},
      detail_width = d3.select("#chart_2").node().getBoundingClientRect().width - detail_margin.left - detail_margin.right,
      detail_height = 500 - detail_margin.top - detail_margin.bottom;


const svg_2 = d3.select("#chart_2")
    .attr("class", "svgWrapper")
    .attr("width", detail_width + detail_margin.left + detail_margin.right)
    .attr("height", detail_height + detail_margin.top + detail_margin.bottom)
    .append("g")
    .attr("transform", "translate(150,30)");

var detail_xScale = d3.scaleLinear();
var detail_yScale = d3.scaleBand().range([0, detail_height]);

//Add group for the x axis
svg_2
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(" + 0 + "," + (-10) + ")");

//Add group for the y axis
svg_2.append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(-5,0)");


function draw_detail(df){
    var new_width =  d3.select("#grid-clone").select("#col-2-clone").node().getBoundingClientRect().width - detail_margin.left - detail_margin.right;

    d3.select("#chart_2")
        .attr("width", new_width + detail_margin.left + detail_margin.right);


    //Update the scales
    detail_xScale
        .range([0, new_width])
        .domain([0, d3.max(df, function (d) { return d.sum;  })]);

    detail_yScale
        .range([0, 17 * df.length])
        .domain(df.map(function (d) { return d.category; }));


    svg_2.select(".y-axis")
        .transition()
        .duration(zero_duration)
        .call(d3.axisLeft(detail_yScale)
            .tickSize(0)
            .tickSizeOuter(0)
            .tickFormat(function(d) {
                return d.substring(0, 15) + "...";
            })
           );

    svg_2.select(".x-axis")
        .transition()
        .duration(transition_time)
        .call(d3.axisTop(detail_xScale)
            .ticks(3)
            .tickSizeOuter(0)
            .tickFormat(d3.format(".2s"))
        );


    var detail_bar = svg_2.selectAll(".detail")
            .data(df, function (d) {
                return d.key;
            });

    detail_bar
        .attr("height", detail_yScale.bandwidth() - 3)
        .attr("y", function (d, i) { return detail_yScale(d.category);  })
        .transition().duration(zero_duration)
        .attr("width", function (d) { return detail_xScale(d.sum);  })
        .attr("data-tippy-content", function(d) { return d3.format(".2s")(d.sum)});

    detail_bar.enter().append("rect")
        .attr("data-tippy-content", function(d) { return d3.format(".2s")(d.sum)})
        .attr("class", "detail tip")
        .attr("xVal", function (d) { return detail_yScale(d.category) })
        .attr("x", 0)
        .attr("y", function (d, i) { return detail_yScale(d.category); })
        .attr("height", detail_yScale.bandwidth() - 3)
        .attr("rx", 6)
        .attr("ry", 6)
        .style("fill", saturatedBlue)
        .attr("width", 0 )
        .transition().duration(zero_duration)
        .attr("width", function (d) { return detail_xScale(d.sum);  });

    detail_bar.exit().remove();        
}