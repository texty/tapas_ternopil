/**
 * Created by yevheniia on 11.08.20.
 */
const time_margin = {top: 40, right: 10, bottom: 30, left: 50},
    time_width = d3.select("#chart_3").node().getBoundingClientRect().width - time_margin.left - time_margin.right,
    time_height = 500 - time_margin.top - time_margin.bottom;

const real_tips = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const desire_tips = ["січень", "лютий", "березень", "квітень", "травень", "червень", "липень", "серпень", "вересень", "жовтень", "листопад","грудень"];

const svg_3 = d3.select("#chart_3")
    .attr("class", "svgWrapper")
    .attr("width", time_width + time_margin.left + time_margin.right)
    .attr("height", time_height + time_margin.top + time_margin.bottom)
    .append("g")
    .attr("transform", "translate(" + time_margin.left + "," + time_margin.top + ")");

var time_xScale = d3.scaleBand().range([0, time_width]).paddingInner(0.4);
var time_yScale = d3.scaleLinear().range([time_height, 0]);

//Add group for the x axis
svg_3
    .append("g")
    .attr("class", "x-axis");


//Add group for the y axis
svg_3.append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(" + 0 + "," + 0 + ")");


function draw_time(df){

    var tips_to_show = ["січ", "лют", "бер", "кві", "тра", "чер", "лип", "сер", "вер", "жов", "лис","гру"];

    var new_width = d3.select("#chart-block-2").select(".col-1-2").node().getBoundingClientRect().width - time_margin.left - time_margin.right;
    var new_height = new_width > 500 ? (500 - time_margin.top - time_margin.bottom) : (300 - time_margin.top - time_margin.bottom);
    
    d3.select("#chart_3")
        .attr("width", new_width + time_margin.left + time_margin.right)
        .attr("height", new_height + time_margin.top + time_margin.bottom);

    //Update the scales
    time_yScale
        .range([new_height, 0])
        .domain([0, d3.max(df, function (d) { return d.sum;  })]);


    time_xScale
        .range([0, new_width])
        .domain(['1','2','3','4','5','6','7','8','9','10','11','12']);


    svg_3.select(".y-axis")
        .transition()
        .duration(transition_time)
        .call(d3.axisLeft(time_yScale)
            .tickSize(-new_width)
            .tickFormat(d3.format(".2s"))

        );

    svg_3.select(".x-axis")
        .attr("transform", "translate(" + 0 + "," + new_height + ")")
        .transition()
        .duration(transition_time)
        .call(d3.axisBottom(time_xScale)
            .tickSizeOuter(0)
            .tickFormat(function(d){
                let ind = real_tips.indexOf(d);
                return tips_to_show[ind]

            })

        );


    var time_bar = svg_3.selectAll(".detail")
        .data(df, function (d) {
            return d.key;
        });

    time_bar
        .transition().duration(transition_time)
        .attr("y", function (d) { return time_yScale(d.sum)})
        .attr("x", function (d, i) { return time_xScale(d.month);  })
        .attr("width",  time_xScale.bandwidth() )
        .attr("height", function (d) { return new_height - time_yScale(d.sum)})
        .attr("rx", time_xScale.bandwidth() / 2 )
        .attr("ry", time_xScale.bandwidth() / 2 )
        .attr("data-tippy-content", function(d) {
            let ind = real_tips.indexOf(d.month);
            return desire_tips[ind] + ": " + d3.format(".2s")(d.sum)
        });

    time_bar.enter().append("rect")
        .attr("class", "detail tip")
        .attr("rx", time_xScale.bandwidth() / 2 )
        .attr("ry", time_xScale.bandwidth() / 2 )
        .style("fill", saturatedBlue)
        .transition().duration(transition_time)
        .attr("y", function (d) { return time_yScale(d.sum)})
        .attr("x", function (d, i) { return time_xScale(d.month);  })
        .attr("width",  time_xScale.bandwidth() )
        .attr("height", function (d) { return new_height - time_yScale(d.sum)})
        .attr("data-tippy-content", function(d) {
            let ind = real_tips.indexOf(d.month);
            return desire_tips[ind] + ": " + d3.format(".2s")(d.sum)
        });


    time_bar.exit().remove();

    // tippy('.tip', {
    //     allowHTML: true,
    //     content: 'Global content',
    //     duration: 0,
    //     onShow(tip) {
    //         tip.setContent(tip.reference.getAttribute('data-tippy-content'))
    //     }
    //
    // });

}