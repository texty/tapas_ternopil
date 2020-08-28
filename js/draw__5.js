/**
 * Created by yevheniia on 12.08.20.
 */
const scatter_margin = {top: 40, right: 10, bottom: 30, left: 120},
    //scatter_width = d3.select("#chart_3").node().getBoundingClientRect().width - scatter_margin.left - scatter_margin.right,
    scatter_height = 500 - scatter_margin.top - scatter_margin.bottom;


const pre_svg = d3.select("#chart_5")
    .attr("class", "svgWrapper")
    //.attr("width", scatter_width + scatter_margin.left + scatter_margin.right)
    .attr("height", scatter_height + scatter_margin.top + scatter_margin.bottom);


const svg_5 = pre_svg
    .append("g")
    .attr("transform", "translate(" + scatter_margin.left + "," + 0 + ")");


var scatter_x1 = d3.scaleBand().padding([0.2]);
var scatter_x2 = d3.scaleBand()

var scatter_yScale = d3.scaleBand();

var scatter_rScale = d3.scaleSqrt()
    .range([3, 10]);

//Add group for the x axis
svg_5
    .append("g")
    .attr("class", "x-axis");
    

//Add group for the y axis
var scatter_yAxis = svg_5.append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(" + 0 + "," + 20 + ")");


var clip = scatter_yAxis.append("rect")
    .attr("x", -120)
    .attr("y", 0)
    .attr("fill", charts_background)

;


function draw_scatter(df){
    //Update the scales

    var tips = [1,2,3,4,5,6,7,8,9,10,11,12];
    var tips_to_show = ["січ", "лют", "бер", "кві", "тра", "чер", "лип", "сер", "вер", "жов", "лис","гру"];

    var new_width = d3.select("#chart-block-4").select(".col-1-2").node().getBoundingClientRect().width - scatter_margin.left - scatter_margin.right;
    var new_height = df.y_domain.length * 17 + scatter_margin.top;


    pre_svg.call(zoom);


    clip
        .attr("width", 120)
        .attr("height", new_height);


// Pan and zoom
    d3.select("#chart_5")
        .attr("width", new_width + scatter_margin.left + scatter_margin.right)
        .attr("height", new_height + stacked_margin.top);

    scatter_x1
        .range([0, new_width])
        .domain([1,2,3,4,5,6,7,8,9,10,11,12])
        ;

    scatter_x2
        .domain([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31])
        .range([0, scatter_x1.bandwidth()])
      ;

    scatter_yScale
        .rangeRound([0, df.y_domain.length * 17])
        .domain(df.y_domain);

    scatter_rScale
        // .domain([0, d3.max(df.data, function(array) {
        //     return d3.max(array.values, function(d){
        //         return  d.sum })
        //     })
        // ])
        .domain([0, 1000000]);


    svg_5.select(".x-axis")
        .attr("transform", "translate(" + 0 + "," + new_height + ")")
        .transition()
        .duration(transition_time)
        .call(d3.axisBottom(scatter_x1)
            .tickFormat(function(d){
                let ind = tips.indexOf(d);
                return tips_to_show[ind]

                })
            .tickSizeOuter(0));

    var group = svg_5.selectAll("g.group")
        .data(df.data);

    group.exit().remove();

    group
        .attr("transform", function(d){
            let key = parseInt(d.key);
            return `translate(${scatter_x1(key)}, 30)`
    });

    group.enter()
        .append("g")
        .attr("class", "group")
        .attr("transform", function(d){
            let key = parseInt(d.key);
            return `translate(${scatter_x1(key)}, 30)`
        });


    var circles = svg_5.selectAll("g.group")
        .selectAll("circle")
        .data(function (d) {
            return d.values;
        });


    circles
        .transition().duration(transition_time)
        .attr("cx", function (k) {
            return scatter_x2(k.day)}
        )
        .attr("cy", function (k) { return scatter_yScale(k.category);  })
        .attr("r", function(d){ return scatter_rScale(d.sum)})
        .attr("data-tippy-content", function(d) {
            return "<b>"+d.category + '</b><br>' + d.day + "/" + d.month + ": " + d3.format(".2s")(d.sum)
        });


    circles.enter().append("circle")
        .attr("class", "circle tip")        
        .style("fill", "#007EFF80")
        .style("stroke", "#007EFF")
        .style("opacity", 1)
        .transition().duration(transition_time)
        .attr("cx", function (k) {
            return scatter_x2(k.day)
        })
        .attr("cy", function (k) { return scatter_yScale(k.category);  })
        //.attr("r", 3)
        .attr("r", function(d){ return scatter_rScale(d.sum)})
        .attr("data-tippy-content", function(d) {
              return "<b>"+d.category + '</b><br>' + d.day + "/" + d.month + ": " + d3.format(".2s")(d.sum)
        })
    ;


    circles.exit().remove();


    svg_5.select(".y-axis").raise()
        .transition()
        .duration(zero_duration)
        .call(d3.axisLeft(scatter_yScale)
            .tickSize(0)
            .tickFormat(function(d) {
                return d.substring(0, 12) + "...";
            })
            .tickSizeOuter(0)
        );

    function zoom() {
        const extent = [[0, 0], [new_width, new_height]];

        pre_svg.call(d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent(extent)
            .extent(extent)
            .on("zoom", zoomed));

        function zoomed() {
            scatter_x1
                .range([0, new_width]
                .map(function(d) { return d3.event.transform.applyX(d) } ));

            scatter_x2
                .domain([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31])
                .range([0, scatter_x1.bandwidth()])
            ;

            svg_5.select(".x-axis")
                .attr("transform", "translate(" + 0 + "," + new_height + ")")
                .transition()
                .duration(transition_time)
                .call(d3.axisBottom(scatter_x1)
                    .tickFormat(function(d){
                        let ind = tips.indexOf(d);
                        return tips_to_show[ind]

                    })
                    .tickSizeOuter(0));

            d3.select("#chart_5").selectAll(".group").attr("transform", function(d){
                let key = parseInt(d.key);
                return `translate(${scatter_x1(key)}, 30)`
            });

            d3.select("#chart_5").selectAll(".circle")
                .attr("cx", function (k) {
                    return scatter_x2(k.day)}
                )
        }
    }

}