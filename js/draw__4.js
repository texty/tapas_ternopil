/**
 * Created by yevheniia on 12.08.20.
 */



const stacked_margin = {top: 40, right: 10, bottom: 50, left: 150},
    stacked_width = d3.select("#chart_4").node().getBoundingClientRect().width - stacked_margin.left - stacked_margin.right,
    stacked_height = 500 - stacked_margin.top - stacked_margin.bottom;


const svg_4 = d3.select("#chart_4")
    .attr("class", "svgWrapper")
    .attr("width", stacked_width + stacked_margin.left + stacked_margin.right)
    .attr("height", stacked_height + stacked_margin.top + stacked_margin.bottom)
    .append("g")
    .attr("transform", "translate(" + stacked_margin.left + "," + 0 + ")");

var stacked_xScale = d3
    .scaleLinear();


var stacked_yScale = d3
    .scaleBand()
    .paddingInner(0.25);

//Add group for the x axis
svg_4
    .append("g")
    .attr("class", "x-axis");

//Add group for the y axis
svg_4.append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(" + 0 + "," + 0 + ")");

var stacked_color = d3
    .scaleOrdinal()
    .domain(["plans", "budget", "money", "products"])
    .range([
        "#AA2B8E",
        saturatedBlue,
        "#AA2B8E66",
        transparentBlue
    ]);


function tippyContent(d){
    let plans = d.data.plans >= 1000 ? moneyFormat(d.data.plans): Math.round(d.data.plans) ;
    let budget = d.data.budget >= 1000 ? moneyFormat(d.data.budget): Math.round(d.data.budget) ;
    let money = d.data.money >= 1000 ? moneyFormat(d.data.money): Math.round(d.data.money) ;
    let products = d.data.products >= 1000 ? moneyFormat(d.data.products): Math.round(d.data.products) ;

    var html = '';
    html += d.data.wide_cat + ":<br>";
    html += "Заплановані закупівлі: " + plans + " грн <br>";
    html += "Бюджетні кошти: " + budget + " грн <br>";
    html += "Грошові внески: " + money + " грн <br>";
    html += "Негрошові внески: " + products +" грн";

    return(html);
}





function draw_stacked(df){

    const real_groups = ["budget", "money", "products"];
    const desired_groups = ["Бюджетні кошти", "Грошові внески", "Негрошові внески"];


    var new_width = d3.select("#chart-block-3").select(".col-1-2").node().getBoundingClientRect().width - stacked_margin.left - stacked_margin.right;
    var new_height = df.y_domain.length * 17;

    d3.select("#chart_4")
        .attr("width", new_width + stacked_margin.left + stacked_margin.right)
        .attr("height", new_height + stacked_margin.top);


    stacked_xScale
        .rangeRound([0,  new_width])
        .domain([0, df.x_domain]);

    stacked_yScale
        .rangeRound([df.y_domain.length * 17, 0])
        .domain(df.y_domain);


    svg_4.select(".y-axis")
        .transition()
        .duration(zero_duration)
        .call(d3.axisLeft(stacked_yScale)
            .tickFormat(function(d) {
                return d.substring(0, 15) + "...";
            })

        );

    svg_4.select(".x-axis")
        .transition()
        .duration(zero_duration)
        .attr("transform", "translate(0," + (new_height + 5) + ")")
        .call(d3.axisBottom(stacked_xScale)
            .ticks(4)
            .tickFormat(function(d){ return nFormatter(d) })
            //.tickFormat(d3.format(".2s"))
        );



    var group = svg_4.selectAll("g.layer")
        .data(df.layers);

    group.exit().remove();

    group.enter()
        .append("g")
        .classed("layer", true)
        .attr("fill", function (d) { return stacked_color(d.key) })
        .attr("group", function (d) { return d.key });

    var bars = svg_4.selectAll("g.layer")
        .selectAll("rect")
        .data(function (d) { return d; });

    bars.exit().remove();

    bars.enter()
        .append("rect")
        .attr("class", "tip")
        .attr("width", function (d) {
            return stacked_xScale(d[1]) - stacked_xScale(d[0]) })
        .attr("y", function (d) {  return stacked_yScale(d.data.wide_cat) })
        .attr("x", function () { return stacked_xScale(0); })
        .attr("height", stacked_yScale.bandwidth())
        .attr("rx", stacked_yScale.bandwidth() / 2)
        .attr("ry", stacked_yScale.bandwidth() /2 )
        .attr("data-tippy-content", function(d) {
            return  tippyContent(d)
        })
        .merge(bars)
        .attr("height", stacked_yScale.bandwidth())
        .attr("y", function (d) { return stacked_yScale(d.data.wide_cat); })
        .attr("x", function (d) { return stacked_xScale(d[0]); })
        .attr("data-tippy-content", function(d) { return  tippyContent(d)  })
        .transition().duration(transition_time)
        .attr("width", function (d) { return stacked_xScale(d[1]) - stacked_xScale(d[0]) })

    ;



    var plans = svg_4.selectAll(".plans")
        .data(df.layers[0]);

    plans.exit().remove();

    plans.enter()
        .append("rect")
        .attr("class", "plans tip")
        .attr("stroke", "#AA2B8E")
        .attr("fill", "transparent")
        //.style("opacity", "0.5")
        .attr("width", function (d) {  return stacked_xScale(d.data.plans) })
        .attr("y", function (d) {  return stacked_yScale(d.data.wide_cat); })
        .attr("x", 0 )
        .attr("height", stacked_yScale.bandwidth())
        .attr("rx", stacked_yScale.bandwidth() / 2)
        .attr("ry", stacked_yScale.bandwidth() /2 )
        .attr("data-tippy-content", function(d) {
            return  tippyContent(d)
        })
        .merge(plans)
        .attr("y", function (d) { return stacked_yScale(d.data.wide_cat); })
        .attr("x", 0 )
        .attr("height", stacked_yScale.bandwidth())

        .transition().duration(transition_time/2)
        .attr("data-tippy-content", function(d) {
            return  tippyContent(d)
        })
        .attr("width", function (d) {  return stacked_xScale(d.data.plans) });



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




