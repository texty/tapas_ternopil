var locale = d3.timeFormatLocale({
    "dateTime": "%A, %e %B %Y г. %X",
    "date": "%d.%m.%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["неділя", "понеділок", "вівторок", "середа", "четвер", "п'ятница", "субота"],
    "shortDays": ["нд", "пн", "вт", "ср", "чт", "пт", "сб"],
    "months": ["січ", "лют", "бер", "квіт", "трав", "черв", "лип", "серп", "вер", "жовт", "лист", "груд"],
    "shortMonths": ["січ", "лют", "бер", "квіт", "трав", "черв", "лип", "серп", "вер", "жовт", "лист", "груд"]
});

var formatMillisecond = locale.format(".%L"),
    formatSecond = locale.format(":%S"),
    formatMinute = locale.format("%I:%M"),
    formatHour = locale.format("%I %p"),
    formatDay = locale.format("%a %d"),
    formatWeek = locale.format("%b %d"),
    formatMonth = locale.format("%B"),
    formatYear = locale.format("%Y");

function multiFormat(date) {
    return (d3.timeSecond(date) < date ? formatMillisecond
        : d3.timeMinute(date) < date ? formatSecond
        : d3.timeHour(date) < date ? formatMinute
        : d3.timeDay(date) < date ? formatHour
        : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
        : d3.timeYear(date) < date ? formatMonth
        : formatYear)(date);
}

var scatter_margin = {top: 120, right: 20, bottom: 50, left: 200},
    scatter_margin2 = {top: 30, right: 20, bottom: 30, left: 200},
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

scatter_svg.append("text")
    .attr("id", "annotation")
    .attr("x", 200)
    .attr("y", 10)
    .text("Потягніть слайдер, щоб обрати період та змінити масштаб графіка")
    .style("font-size", "11px")
    .style("font-style", "italic")
    .attr('text-anchor', 'start')
;

var clip5def = scatter_svg.append("defs")
    .append("clipPath")
    .attr("id", "clip5")
    .append("rect")
    .attr("transform", "translate(0,-30)")
    ;



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

var gBrush  = context.append("g")
    .attr("class", "brush");



var handle = gBrush.selectAll('.v-brush-handle')
    .data([{ type: 'w' }, { type: 'e' }])
    .enter()
    .append('path')
    .classed('v-brush-handle', true)
    .attr('cursor', 'ew-resize')
    .attr('stroke', 'grey')
        .attr("stroke-width", 1)
    .attr('d', (d) => {
        const e = +(d.type === 'e');
        const h = 20;
        const x = e ? 1 : -1;
        const y = 18;
        return [
            `M ${0.5 * x} ${y}`,
            `A 6 6 0 0 ${e} ${6.5 * x} ${y + 6}`,
            `V ${y + h - 6}`,
            `A 6 6 0 0 ${e} ${0.5 * x} ${y + h}`,
            'Z',
            `M ${2.5 * x} ${y + 8}`,
            `V ${y + h - 8}`,
            `M ${4.5 * x} ${y + 8}`,
            `V ${y + h - 8}`,
        ].join(' ');
});


var brushDotsContainer = context.append("g");

var focusDotsContainer = focus.append("g")
    .attr("transform", "translate(0,5)");

var handleLines = gBrush.selectAll('.c-brush-handle')
    .data([{ type: 'w' }, { type: 'e' }])
    .enter()
    .append('rect')
    .classed('c-brush-handle', true)
    .attr('cursor', 'ew-resize')
    .attr('stroke', '#333')
    .attr("y", 0)
    .attr("height", 50)
    .attr("width", 0.5)
    .attr("x",0)
    ;








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

    var dateExtent =  d3.extent(filtered, function (d) { return d.parsedDate; });
    var start_date = filtered[0].year - 1 + "-12-31";

    scatter_x
        .range([0, scatter_width])
        .domain([new Date(start_date), dateExtent[1]]);

    scatter_x2
        .range([0, scatter_width])
        .domain(scatter_x.domain());

    scatter_y
        .range([0, data.y_domain.length * itemHeight])
        .domain(data.y_domain);

    scatter_y2
        .range([0, scatter_height2])
        .domain(data.y_domain);

    scatter_rScale.domain([0, d3.max(filtered, function(d) { return d.valueAmount })]);

    var brush = d3.brushX()
        .extent([[0, 0], [scatter_width, scatter_height2]])
        .on("brush", brushed);


    clip5def
        .attr("width", scatter_width + 20)
        .attr("height", scatter_height + 30);


    focus.select(".axis.axis--x")
        .attr("transform", "translate(" + 0 + "," + scatter_height + ")")
        .transition()
        .duration(500)
        .call(d3.axisBottom(scatter_x)
            .ticks(5)
            // .tickFormat(function(d) {
            //     return d3.timeFormat("%b")(d)
            // })
            .tickFormat(multiFormat)
        );

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
            .tickFormat(multiFormat)
            // .tickFormat(function(d) {
            //     return d3.timeFormat("%b")(d)
            // })
            .tickSizeOuter(0)
        );


    context.select(".brush")
        .call(brush)
        .call(brush.move, [50, 100]);


    d3.selectAll("path.v-brush-handle")
        .raise();


    d3.selectAll("rect.c-brush-handle")
        .raise();


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
            return "<b>"+d.wide_cat + '</b><br>' + d.date + ": " + d.valueAmount
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
                return "<b>"+d.wide_cat + '</b><br>' + d.date + ": " + d.valueAmount
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
            .attr("r", 2.5)
            .style("opacity", .2)
            .attr("cx", function (d) {
                return scatter_x2(d.parsedDate);
            })
            .attr("cy", function (d) {
                return scatter_y2(d.wide_cat);
            });

    brushDots.exit().remove();





    function brushed() {

        var selection = d3.event.selection;

        //якщо extent менше 30
        if((selection[1] - selection[0]) < 40){
            selection[1] = selection[0] + 40;
            context.select(".brush")
                .call(brush.move, [selection[0], selection[1]]);
        }


        if (selection == null) {
            handle.attr("display", "none");
            handleLines.attr("display", "none");
        } else {
            handleLines.attr("display", null).attr("transform", function(d, i) { return "translate(" + [ selection[i], - 30 / 4] + ")"; });
            handle.attr("display", null).attr("transform", function(d, i) { return "translate(" + [ selection[i], - 30 / 4] + ")"; });
        }

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
                .tickFormat(multiFormat)
                .ticks(5));
    }



    //
    // function type(d) {
    //     d.date = parseDate(d.parsedDate);
    //     return d;
    // }
}