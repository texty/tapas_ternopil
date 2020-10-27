var scatter_margin = {top: 120, right: 20, bottom: 50, left: 200},
    scatter_margin2 = {top: 20, right: 20, bottom: 30, left: 200},
    scatter_width = d3.select("#chart-block-4").select(".col-1-2").node().getBoundingClientRect().width - scatter_margin.left - scatter_margin.right,
    scatter_height = 500 - scatter_margin.top - scatter_margin.bottom,
    scatter_height2 = 100 - scatter_margin2.top - scatter_margin2.bottom;


var scatter_x = d3.scaleTime(),
    scatter_x2 = d3.scaleTime(),
    scatter_y = d3.scaleBand(),
    scatter_y2 = d3.scaleBand();

var scatter_rScale = d3.scaleSqrt().range([5, 10]);

var scatter_svg = d3.select("#chart_5")
    .attr("class", "svgWrapper")
    .attr("width", scatter_width + scatter_margin.left + scatter_margin.right)
    .attr("height", scatter_height + scatter_margin.top + scatter_margin.bottom);

var clip5def = scatter_svg.append("defs")
    .append("clipPath")
    .attr("id", "clip5")
    .append("rect")
    .attr("transform", "translate(0,-30)");



var focus = scatter_svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + scatter_margin.left + "," + scatter_margin.top + ")");

focus.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + scatter_height + ")");

focus.append("g")
    .attr("class", "axis axis--y");



var context = scatter_svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + scatter_margin2.left + "," + scatter_margin2.top + ")");

context.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + scatter_height2 + ")");

context.append("g")
    .attr("class", "brush");


var focusDotsContainer = focus.append("g")
    .attr("transform", "translate(0,5)");


var brushDotsContainer = context.append("g");


function draw_scatter(data){

    var itemHeight = 15;

    var parseDate = d3.timeParse("%Y-%m-%d");
    scatter_width = d3.select("#chart-block-4").select(".col-1-2").node().getBoundingClientRect().width - scatter_margin.left - scatter_margin.right;
    scatter_height = data.y_domain.length * itemHeight;

    var filtered = Array.from(data.data);

    filtered.forEach(function(d){
        return d.parsedDate = parseDate(d.date)
    });

    d3.select("#chart_5")
        .attr("width", scatter_width + scatter_margin.left + scatter_margin.right)
        .attr("height", scatter_height + scatter_margin.top + scatter_margin.bottom);

    scatter_x
        .range([0, scatter_width])
        .domain(d3.extent(filtered, function (d) { return d.parsedDate; }));

    scatter_x2
        .range([0, scatter_width])
        .domain(scatter_x.domain());

    scatter_y
        .range([0, data.y_domain.length * itemHeight])
        .domain(data.y_domain);

    scatter_y2
        .range([scatter_height2, 0])
        .domain(scatter_y.domain());

    scatter_rScale.domain([0, d3.max(filtered, function(d) { return d.valueAmount })]);

    var brush = d3.brushX()
        .extent([[0, 0], [scatter_width, scatter_height2]])
        .on("brush", brushed);

    clip5def
        .attr("width", scatter_width)
        .attr("height", scatter_height + 30);


    focus.select(".axis.axis--x")
        .attr("transform", "translate(" + 0 + "," + scatter_height + ")")
        .transition()
        .duration(500)
        .call(d3.axisBottom(scatter_x)
            .ticks(5)
            .tickFormat(function(d) {
                return d3.timeFormat("%b")(d)
            }));

    focus.select(".axis.axis--y")
        .transition()
        .duration(500)
        .call(d3.axisLeft(scatter_y)
            .tickFormat(function(d) {
                if(d.length <= 25){
                    return d;
                }  else {
                    return d.substring(0, 25) + "...";
                }

            })
        );


    context.select(".axis.axis--x")
        .attr("transform", "translate(" + 0 + "," + scatter_height2 + ")")
        .transition()
        .duration(500)
        .call(d3.axisBottom(scatter_x2)
            .tickFormat(function(d) {
                return d3.timeFormat("%b")(d)
            })
            .tickSizeOuter(0)
        );


    context.select(".brush")
        .call(brush)
        .call(brush.move, [0, 50]);



    focusDotsContainer
        .attr("clip-path", "url(#clip5)");


    var focusDots = focusDotsContainer
        .selectAll(".focus-dot")
        .data(filtered);

    focusDots.exit().remove();

    focusDots
        .transition()
        .duration(500)
        .attr("r", function(d){ return scatter_rScale(d.valueAmount) })
        .attr("cx", function (d) {
            return scatter_x(d.parsedDate);
        })
        .attr("cy", function (d) {
            return scatter_y(d.wide_cat);
        })
        .attr("data-tippy-content", function(d) {
            return d.parsedDate
        });



    focusDots
            .enter().append("circle")
            .attr('class', 'focus-dot tip')
            .style("fill", "#007EFF80")
            .style("stroke", "#007EFF")
            //.attr("r", 5)
            .attr("r", function(d){ return scatter_rScale(d.valueAmount) })
            .style("opacity", 1)
            .attr("cx", function (d) {
                return scatter_x(d.parsedDate);
            })
            .attr("cy", function (d) {
                return scatter_y(d.wide_cat);
            })
            .attr("data-tippy-content", function(d) {
                return d.parsedDate
            })
            .on("mouseover", function(d){
                d3.selectAll(".focus-dot").attr("r", function(d){ return scatter_rScale(d.valueAmount) });
                d3.select(this).attr("r", 10);
            })
            .on("mouseout", function(d){
                d3.selectAll(".focus-dot")
                    .attr("r", function(d){ return scatter_rScale(d.valueAmount) });
            })
    ;




   // append scatter plot to brush chart area

    brushDotsContainer
        .attr("clip-path", "url(#clip5)");

    var brushDots = brushDotsContainer
        .selectAll(".dot-context")
        .data(filtered);

    brushDots
        .transition()
        .duration(500)
        .attr("r", 3)
        .style("opacity", 0.5)
        .attr("cx", function (d) {
            return scatter_x2(d.parsedDate);
        })
        .attr("cy", function (d) {
            return scatter_y2(d.wide_cat);
        });

    brushDots
        .enter().append("circle")
            .attr("class", "dot-context")
            .style("fill", "#007EFF80")
            // .style("stroke", "#007EFF")
            .attr("r", 3)
            .style("opacity", .5)
            .attr("cx", function (d) {
                return scatter_x2(d.parsedDate);
            })
            .attr("cy", function (d) {
                return scatter_y2(d.wide_cat);
            });

    brushDots.exit().remove();



//create brush function redraw scatterplot with selection
    function brushed() {
        var selection = d3.event.selection;

        scatter_x.domain(selection.map(scatter_x2.invert, scatter_x2));
        focus.selectAll(".focus-dot")
            .attr("cx", function (d) {
                return scatter_x(d.parsedDate);
            })
            .attr("cy", function (d) {
                return scatter_y(d.wide_cat);
            });
        focus.select(".axis--x").call(
            d3.axisBottom(scatter_x)
                .tickFormat(function(d) {
                    return d3.timeFormat("%b, %d")(d)
                })
                .ticks(5)
        );
    }

    //
    // function type(d) {
    //     d.date = parseDate(d.parsedDate);
    //     return d;
    // }
}