/**
 * Created by yevheniia on 10.08.20.
 */
const parseDate = d3.timeParse("%Y-%m-%d");
var target_cx;

$(".nav-button").click(function() {
    var href = $(this).attr("link");
    console.log(href);
    $([document.documentElement, document.body]).animate({
        scrollTop: $(href).offset().top 
    }, 2000);
});


Promise.all([
    d3.csv("data/charitable_contribs.csv"),
    d3.csv("data/chart3_data.csv")
]).then(function(input){

    input[0].forEach(function(d) {
        d.valueAmount = +d.valueAmount;
        d.month = d.date
            .substring(0, 7)
            .replace("2019-", "")
            .replace("2020-", "");
        d.day = d.date.replace("2019-", "").replace("2020-", "");
        d.daynumber = parseInt(d.date.replace("2019-", "").replace("2020-", "").substring(3, 5));
        d.month = +d.month;
        d.year = d.year.toString();
        d.recipientID = d.recipientID.toString();
    });

    //додаємо роки в усі блоки
    let  years_options = [...new Set(input[0].map(function(d) { return d.year;}))]

    d3.selectAll("ul.dropdown.year")
        .classed("hidden", true)
        .selectAll(".auto-year")
        .data(years_options)
        .enter()
        .append("li")
        .attr("class", "auto-year")
        .attr("value", function(d){ return d })
        .text(function(d){ return d });

    //додаємо типи в усі блоки
    let  type_options = [...new Set(input[0].map(function(d) { return d.type;}))];

    d3.selectAll("ul.dropdown.type")
        .classed("hidden", true)
        .selectAll(".auto-type")
        .data(type_options)
        .enter()
        .append("li")
        .attr("class", "auto-type")
        .attr("value", function(d){ return d })
        .text(function(d){ return d });


    // //перший графік переключення
    // d3.select("#chart-block-1").selectAll(".year_model, .type_model")
    //     .on("change", function(){
    //         d3.select(this.parentNode.parentNode).select(".recipient_model").select("p").attr("value", "").text("Оберіть опцію зі списку");
    //         draw__1(calculate__1(input[0]));
    //         draw_detail(calculate__2(input[0]));
    //     });
    //
    //
    // //другий графік переключення
    // d3.select("#chart-block-2").selectAll(".year_model, .type_model")
    //     .on("change", function(){
    //        d3.select(this.parentNode.parentNode).select(".recipient_model").select("p").attr("value", "").text("Оберіть опцію зі списку");
    //        draw_time((calculate__3(input[0])))
    //     });
    //
    // //третій графік переключення
    // d3.select("#chart-block-3").select("select.year_model")
    //     .on("change", function(){
    //         d3.select(this.parentNode.parentNode).select(".recipient_model").select("p").attr("value", "").text("Оберіть опцію зі списку");
    //         draw_stacked((calculate__4(input[1])));
    //     });
    //
    // d3.select("#chart-block-4").selectAll(".year_model, .type_model")
    //     .on("change", function(){
    //         d3.select(this.parentNode.parentNode).select(".recipient_model").select("p").attr("value", "").text("Оберіть опцію зі списку");
    //         draw_scatter(calculate__5(input[0]));
    //     });
    //



    //додаємо "назви" в третій селект 1,2,4, графіків
    var  recipient_options = [];
    _.uniq(input[0], function(d){ return d.recipientName }).forEach(function(d){
        recipient_options.push({ "recipientName": d.recipientName, "recipientID": d.recipientID })
    });

    d3.selectAll("#chart-block-1, #chart-block-2, #chart-block-4")
        .selectAll("ul.dropdown.recipient")
        .classed("hidden", true)
        .selectAll(".auto-recipient")
        .data(recipient_options)
        .enter()
        .append("li")
        .attr("class", "auto-recipient")
        .attr("id", function(d){ return d.recipientID })
        .text(function(d){ return d.recipientName });


    //додаємо "назви" в третій селект третього графіка
    var  recipient_block_3 = [];
    _.uniq(input[1], function(d){ return d.recipientName }).forEach(function(d){
        recipient_block_3.push({ "recipientName": d.recipientName, "recipientID": d.recipientID })
    });


    d3.select("#chart-block-3")
        .selectAll("ul.dropdown.recipient")
        .classed("hidden", true)
        .selectAll(".auto-recipient")
        .data(recipient_block_3)
        .enter()
        .append("li")
        .attr("class", "auto-recipient")
        .attr("id", function(d){ return d.recipientID })
        .text(function(d){ return d.recipientName });



    //показуємо і ховаємо випадаючі списки по кліку
    d3.selectAll(".model")
         .on("click", function(e){
             //e.stopPropagation();
             $('ul.dropdown').hide();
             d3.selectAll(".dropdown-line:not(#line_"+ this.id + ")")
                 .classed("dropdown-rainbow", false)
                 .classed("dropdown-passive", true);

             d3.selectAll("ul.dropdown:not(#dropdown_"+ this.id + ")")
                 .classed("hidden", true)
                 .style("display", "none");

             let input = d3.select(this.parentNode).select(".dropdown-line");
             input.classed("dropdown-rainbow", !input.classed("dropdown-rainbow"));
             input.classed("dropdown-passive", !input.classed("dropdown-passive"));

             let dropdown = d3.select(this.parentNode).select("ul.dropdown");
             dropdown.classed("hidden", !dropdown.classed("hidden"));
             dropdown.classed("opened", !dropdown.classed("opened"));
             if(dropdown.classed("hidden") === false) {
                 dropdown.style("display", "block");
             } else {
                 dropdown.style("display", "none");
             }

         });


    /* ховаємо селекти по outside кліку */
    $('html').click(function() {
        $('ul.dropdown').hide();
        d3.selectAll("ul.dropdown").classed("hidden", true);
        d3.selectAll(".dropdown-line").classed("dropdown-rainbow", false).classed("dropdown-passive", true)
    });

   $(".model-wrapper").click(function(e){
        e.stopPropagation();
    });
    /*-----------------------------------------*/


    //функція, що оновлює ul li на зміну року і типу
    function update_list_values(parent, data){
        d3.select(parent).select("ul.dropdown.recipient").selectAll(".auto-recipient").remove();
        d3.select(parent).select("ul.dropdown.recipient")
            .classed("hidden", true)
            .selectAll(".auto-recipient")
            .data(data)
            .enter()
            .append("li")
            .attr("class", "auto-recipient")
            .attr("id", function(d){ return d.recipientID })
            .text(function(d){ return d.recipientName })
            .on("click", function(){
                //прибрали веселку
                d3.selectAll(".dropdown-line").classed("dropdown-rainbow", false).classed("dropdown-passive", true);

                //get clicked value
                var selected_value = d3.select(this).attr("id");
                var selected_name = d3.select(this).text();
                d3.select(parent).select(".recipient_model").select("p").attr("value", selected_value).text(selected_name.substring(0, 30) + "...");

                //hide dropdown
                d3.selectAll(".dropdown").style("display", "none");
                d3.select(parent).select(".dropdown.recipient").classed("hidden", !d3.select(this).classed("hidden"));


                //відмальовуємо графік в задежності від того, в якому контейнері клікнули
                if(parent === "#chart-block-1"){
                    d3.selectAll(".mainGroup > .bar").style("fill", transparentBlue).each(function(){
                        let len = d3.selectAll(".mainGroup > .bar")._groups[0].length;
                        if(selected_value === this.id){
                            let xVal = d3.select(this).attr("xVal");
                            if(len > 26) {
                                brushX(+xVal);
                            }
                            d3.select(this).style("fill", saturatedBlue);

                        }

                    });


                    draw_detail(calculate__2(input[0]));
                } else if(parent === "#chart-block-2"){
                    draw_time((calculate__3(input[0])))
                } else if(parent === "#chart-block-3"){
                    draw_stacked((calculate__4(input[1])))
                } else if(parent === "#chart-block-4"){
                    draw_scatter(calculate__5(input[0]));
                }

                tippy('.tip', {
                    allowHTML: true,
                    content: 'Global content',
                    duration: 0,
                    onShow(tip) {
                        tip.setContent(tip.reference.getAttribute('data-tippy-content'))
                    }

                });
            });
    }




    
    // //коли кліквємо на перший селект "Оберіть опцію..."
    // d3.selectAll(".dropdown > li.small").on("click", function(){
    //     d3.selectAll(".dropdown-line").classed("dropdown-rainbow", false).classed("dropdown-passive", true);
    //     let grandparent = this.parentNode.parentNode.parentNode.parentNode;
    //     let parent = this.parentNode.parentNode;
    //     let grandID = d3.select(grandparent).attr("id");
    //     d3.select(grandparent).select(".recipient_model").select("p").attr("value", "").text("Заклад");
    //     d3.selectAll(".dropdown").style("display", "none");
    //
    //     var selected_value = d3.select(this).attr("value");
    //
    //     d3.select(parent).select(".model").select("p").attr("value", "").text(selected_value);
    //
    //     d3.select(this.parentNode).classed("hidden", !d3.select(this).classed("hidden"));
    //     if(grandID === "chart-block-1"){
    //         d3.selectAll(".mainGroup > .bar").style("fill", transparentBlue);
    //         draw__1(calculate__1(input[0]));
    //         draw_detail(calculate__2(input[0]));
    //     } else if(grandID === "chart-block-2"){
    //         draw_time((calculate__3(input[0])))
    //     } else if(grandID === "chart-block-3"){
    //         draw_stacked((calculate__4(input[1])))
    //     } else if(grandID === "chart-block-4"){
    //         draw_scatter(calculate__5(input[0]));
    //
    //         tippy('.tip', {
    //             allowHTML: true,
    //             content: 'Global content',
    //             duration: 0,
    //             onShow(tip) {
    //                 tip.setContent(tip.reference.getAttribute('data-tippy-content'))
    //             }
    //
    //         });
    //     }
    // });

    //:not(.small) :not(.small)

    d3.selectAll(".year > li, .type > li, .recipient > li.small").on("click", function(){
        let ifSmall = d3.select(this).classed("small");
        console.log(ifSmall);
        d3.selectAll(".dropdown-line").classed("dropdown-rainbow", false).classed("dropdown-passive", true);
        let grandparent = this.parentNode.parentNode.parentNode.parentNode;
        let parent = this.parentNode.parentNode;
        let grandID = d3.select(grandparent).attr("id");
        d3.select(grandparent).select(".recipient_model").select("p").attr("value", "").text("Заклад");
        d3.selectAll(".dropdown").style("display", "none");

        var selected_value = d3.select(this).attr("value");
        var selected_name = d3.select(this).text();

        d3.select(parent).select(".model").select("p")
            .attr("value", ifSmall ===  true ? "" : selected_value)
            .text(ifSmall ===  true ? selected_value : selected_name);

        d3.select(parent).select(".dropdown").classed("hidden", !d3.select(this).classed("hidden"));

        if(grandID === "chart-block-1"){
            d3.selectAll(".mainGroup > .bar").style("fill", transparentBlue);
            draw__1(calculate__1(input[0]));
            draw_detail(calculate__2(input[0]));
        } else if(grandID === "chart-block-2"){
            draw_time((calculate__3(input[0])))
        } else if(grandID === "chart-block-3"){
            draw_stacked((calculate__4(input[1])))
        } else if(grandID === "chart-block-4"){
            draw_scatter(calculate__5(input[0]));
        }

        tippy('.tip', {
            allowHTML: true,
            content: 'Global content',
            duration: 0,
            onShow(tip) {
                tip.setContent(tip.reference.getAttribute('data-tippy-content'))
            }

        });
    });



    /* --------------------------------------
     -----------  calculate__1  ------
     --------------------------------------  */

    function calculate__1(df) {

        var  arr = [
            { key: "year", value: d3.select("#chart-block-1").select(".year_model > p").attr("value") },
            { key: "type", value: d3.select("#chart-block-1").select(".type_model > p").attr("value")  }
            ].filter(function (d) { return d.value != "" && d.value !== null; });

        var filtered_arr;


        if (arr.length === 0) {
            filtered_arr = df;

        } else if (arr.length === 1) {
            filtered_arr = df.filter(function(d, i) {
                return d[arr[0].key] === arr[0].value;
            });

        } else if (arr.length === 2) {
            filtered_arr = df.filter(function (d, i) {
                return (
                    d[arr[0].key] === arr[0].value && d[arr[1].key] === arr[1].value
                );
            });
        }


            var options = [];

            _.uniq(filtered_arr, function (d) {
                return d.recipientName;
            })
                .forEach(function (d) {
                    options.push(
                        {"recipientID": d.recipientID, "recipientName": d.recipientName, "sort": d.sort, "type": d.type }
                    );
                });

        options.sort(function(a,b){
            return d3.descending(a.type, b.type) || d3.ascending(a.recipientName[0], b.recipientName[0]) || a.sort - b.sort
        });

        update_list_values("#chart-block-1", options);

        return d3.nest()
            .key(function (d) { return d.recipientID;  })
            .rollup(function (leaves) {
                return d3.sum(leaves, function (d) {
                    return d.valueAmount;
                });
            })
            .entries(filtered_arr.filter(function (d) {
                return d.valueAmount != null;
            }))
            .map(function (d, i) {
                return {key: i, school_id: d.key, sum: d.value};
            })
            .sort(function (a, b) {
                return b.sum - a.sum;
            });
    }



    /* --------------------------------------
     -----------  calculate__2  ------
     --------------------------------------  */

    function calculate__2(df) {
        var filtered_arr = getSelectedValues("#chart-block-1", df).data;

        return d3.nest()
            .key(function(d) { return d.wide_cat;  })
            .rollup(function(leaves) {
                return d3.sum(leaves, function(d) {
                    return d.valueAmount;
                });
            })
            .entries(filtered_arr)
            .map(function(d, i) {
                return { key: i, category: d.key, sum: d.value };
            })
            .filter(function(d) {
                return d.category != "undefined";
            })
            .sort(function(a, b) {
                return b.sum - a.sum;
            })
            .filter(function(d, i) {
                return i < 26;
            });
    }


    /* --------------------------------------
     -----------  calculate__3  ------
     --------------------------------------  */
    function calculate__3(df) {
        var options = getSelectedValues("#chart-block-2", df).options;        

        var filtered_arr = getSelectedValues("#chart-block-2", df).data;
        var update_list = getSelectedValues("#chart-block-2", df).update;

        if(update_list === true) {
            update_list_values("#chart-block-2", options);
        }

        return d3.nest()
            .key(function(d) { return d.month; })
            .rollup(function(leaves) {
                return d3.sum(leaves, function(d) {
                    return d.valueAmount;
                });
            })
            .entries(
                filtered_arr.sort(function(a, b) {
                    return a.month - b.month;
                })
            )
            .map(function(d, i) {
                return { key: i, month: d.key, sum: d.value };
            });
    }

    /* --------------------------------------
     -----------  calculate__4  ------
     --------------------------------------  */

    function calculate__4(df) {

        var options = getSelectedValues("#chart-block-3", df).options;
        var filtered_arr = getSelectedValues("#chart-block-3", df).data;
        var update_list = getSelectedValues("#chart-block-3", df).update;

        if(update_list === true) {
            update_list_values("#chart-block-3", options);
        }

        var keys = ["budget", "money", "products"];
        var gathered = [];

        [ ...new Set(filtered_arr.map(function(d) {  return d.wide_cat;  }))]
            .forEach(function(cvp) {
                var filtered = filtered_arr.filter(function(d) {
                    return d.wide_cat === cvp;
                });

                //загальна сума бюджету, або к-ть голосів по платформі і капіталу
                var plans = filtered.reduce(function(a, b) {  return a + +b.plans; }, 0);
                var money = filtered.reduce(function(a, b) { return a + +b.money;  }, 0);
                var budget = filtered.reduce(function(a, b) { return a + +b.budget; }, 0) ;
                var products = filtered.reduce(function(a, b) { return a + +b.products;  }, 0);
                var total = budget + money + products;

                //створюємо частину майбутнього рядку: к-ть голосів або бюджет по поточному капіталу

                var ob = {
                    wide_cat: cvp,
                    plans: plans,
                    budget: budget,
                    money: money,
                    products: products,
                    total: total
                };

                //пушиму значення у  новий df
                gathered.push(ob);
            });
        
        gathered = gathered.sort(function(a, b) { return a.total - b.total; });
        

        var max_total = d3.max(gathered, function(d) { return d.total; });
        var max_plans = d3.max(gathered, function(d) { return d.plans; });

        var layers = d3.stack().keys(keys)(gathered);
        var x_domain = max_plans > max_total ? max_plans : max_total;
        var y_domain = [
            ...new Set(
            gathered.map(function(d) {
                return d.wide_cat;
            })
          )
        ]

        
        return { "layers": layers, "x_domain": x_domain, "y_domain": y_domain }
    }


    /* --------------------------------------
     -----------  calculate__5  ------
     --------------------------------------  */
    function calculate__5(df) {

        var filtered_arr = getSelectedValues("#chart-block-4", df).data;
        var update_list = getSelectedValues("#chart-block-4", df).update;
        var options = getSelectedValues("#chart-block-4", df).options;

        if(update_list === true) {
            update_list_values("#chart-block-4", options);
        }


        var nest = d3.nest()
            .key(function(d) { return d.wide_cat;  })
            .key(function(d) { return d.day; })
            .rollup(function(leaves) {
                return d3.sum(leaves, function(d) {
                    return d.valueAmount;
                });
            })
            .entries(
                filtered_arr.filter(function(d) {
                    return d.wide_cat != "undefined";
                })
            )
            .map(function(d, i) {
                return {
                    key: i,
                    category: d.key,
                    values: d.values.map(function(k, i) {
                        return {
                            date_str: k.key.replace("-", "/"),
                            day: parseInt(k.key.substring(3, 5)),
                            month: parseInt(k.key.substring(0, 2)),
                            date: d3.timeParse("%m-%d")(k.key),
                            sum: k.value,
                            category: d.key
                        };
                    })
                };
            });


        var y_domain = [];

       d3.nest()
            .key(function(d) { return d.wide_cat; })
            .rollup(function(v) { return v.length; })
            .entries(filtered_arr)
            .sort(function(a,b){ return b.value - a.value})
            .forEach(function(d){
                y_domain.push(d.key);
            });


        var data = [];
        nest.forEach(function(d) {
            d.values.forEach(function(value) {
                data.push(value);
            });
        });

        data = d3.nest()
            .key(function(d){ return d.month})
            .entries(data);

        return { "data": data, "y_domain": y_domain };
    }


    /* --------------------------------------
     ----------- малюємо  графіки ------
     --------------------------------------  */

    draw_detail(calculate__2(input[0]));
    draw_time((calculate__3(input[0])));
    draw_stacked(calculate__4(input[1]));
    draw_scatter(calculate__5(input[0]));


    d3.select(window).on('resize', function() {
        draw_detail(calculate__2(input[0]));
        draw_time((calculate__3(input[0])));
        draw_stacked(calculate__4(input[1]));
        draw_scatter(calculate__5(input[0]));
    });




    /* --------------------------------------
    ----------- brushable bar chart ---------
    --------- перший чарт створюємо тут------  */

    brush = d3.brushY()
        .extent([[0, 0], [mini_width, mini_height]])
        .on("brush", brushmove);

    //Set up the visual part of the brush
    gBrush = d3.select(".brushGroup")
        .append("g")
        .attr("class", "brush")
        .call(brush);

    gBrush.selectAll("rect")
        .attr("width", mini_width);

    //On a click recenter the brush window
    gBrush.select(".overlay")
        .each(function (d) {
            d.type = "selection";
        })
        .on("click mousedown touchstart", function () {
            brushcenter(this)
        });

    // removes handle to resize the brush
    d3.selectAll('.brush>.handle').remove();

    function brushmove() {
         var extent = d3.event.selection;

         //Which bars are still "selected"
         var selected = mini_yScale.domain()
             .filter(function (d) {
                 return (extent[0] - mini_yScale.bandwidth() + 1e-2 <= mini_yScale(d)) && (mini_yScale(d) <= extent[1] - 1e-2);
             });

         d3.select(".miniGroup").selectAll(".bar")
             .style("fill", charts_background);

         //Reset the part that is visible on the big chart
         var originalRange = main_yZoom.range();
         main_yZoom.domain(extent);

         //Update the domain of the x & y scale of the big bar chart
         main_yScale.domain(calculate__1(input[0]).map(function (d) {
             return d.school_id;
         }));
         main_yScale.range([main_yZoom(originalRange[0]), main_yZoom(originalRange[1])]).paddingInner(0.1);

         //Update the y axis of the big chart
         d3.select(".mainGroup")
             .select(".y.axis")
             .call(main_yAxis);

         //Find the new max of the bars to update the x scale
         var newMaxXScale = d3.max(calculate__1(input[0]), function (d) {
             return selected.indexOf(d.school_id) > -1 ? d.sum : 0;
         });
         main_xScale.domain([0, newMaxXScale]);

         //Update the x axis of the big chart
         d3.select(".mainGroupWrapper")
             .select(".x.axis")
             .transition().duration(transition_time)
             .call(main_xAxis);

         //Update the big bar chart
         update(calculate__1(input[0]));

     }//brushmove

    function draw__1(chart_data) {
         //Update the scales
         main_xScale.domain([0, d3.max(chart_data, function (d) { return d.sum;  })]);
         mini_xScale.domain([0, d3.max(chart_data, function (d) { return d.sum; })]);
         main_yScale.domain(chart_data.map(function (d) { return d.school_id; }));
         mini_yScale.domain(chart_data.map(function (d) { return d.school_id;   }));

         //Create the visual part of the y axis
         d3.select(".mainGroup").select(".y.axis").call(main_yAxis);

         var mini_bar = d3.select(".miniGroup").selectAll(".bar")
             .data(chart_data, function (d) {
                 return d.key;
             });

         mini_bar
             .attr("y", function (d, i) { return mini_yScale(d.school_id);  })
             .attr("width", function (d) { return mini_xScale(d.sum);  })
             .attr("height", mini_yScale.bandwidth() - 3);

         mini_bar.enter().append("rect")
             .attr("class", "bar")
             .attr("xVal", function (d) { return mini_yScale(d.school_id) })
             .attr("x", 0)
             .attr("y", function (d, i) { return mini_yScale(d.school_id); })
             .attr("width", function (d) { return mini_xScale(d.sum);  })
             .attr("height", mini_yScale.bandwidth() - 3)
             .attr("rx", 6)
             .attr("ry", 6);

         mini_bar.exit().remove();

        if(chart_data.length < 26){
            d3.select(".brushGroup").style("display", "none");
            svg_1.on("wheel.zoom", null)
        } else {
            d3.select(".brushGroup").style("display", "block");
            svg_1.on("wheel.zoom", scroll)
        }

         //Start the brush
         gBrush.call(brush.move, [0, 26 * mini_yScale.bandwidth()]);
    } //draw__1 end


    function brushcenter(self) {
         var selection = d3.brushSelection(gBrush.node()),
             size = selection[1] - selection[0],
             range = mini_yScale.range(),
             cx = d3.mouse(self)[1],
             x0 = cx - size / 2,
             x1 = cx + size / 2;
         var y1 = d3.max(range) + mini_yScale.bandwidth();
         var pos = x1 > y1 ? [y1 - size, y1] : x0 < 0 ? [0, size] : [x0, x1];
        //якщо є  brush-scroll, тільки тоді скачемо по селекту закладу
         gBrush.call(brush.move, pos);
    }//brushcenter end


    function brushX(xval) {
        var selection = d3.brushSelection(gBrush.node()),
            size = selection[1] - selection[0],
            range = mini_yScale.range(),
            cx = xval,
            x0 = cx - size / 2,
            x1 = cx + size / 2;
        var y1 = d3.max(range) + mini_yScale.bandwidth();
        var pos = x1 > y1 ? [y1 - size, y1] : x0 < 0 ? [0, size] : [x0, x1];
        //якщо є  brush-scroll, тільки тоді скачемо по селекту закладу
        gBrush.call(brush.move, pos);
    }//brushcenter end


    function scroll() {
         var selection = d3.brushSelection(gBrush.node()),
             size = selection[1] - selection[0],
             range = mini_yScale.range(),
             y0 = d3.min(range),
             y1 = d3.max(range) + mini_yScale.bandwidth(),
             dy = -d3.event.deltaY,
             topSection;

         if (selection[0] - dy < y0) {
             topSection = y0;
         } else if (selection[1] - dy > y1) {
             topSection = y1 - size;
         } else {
             topSection = selection[0] - dy;
         }

         //Make sure the page doesn't scroll as well
         d3.event.stopPropagation();
         d3.event.preventDefault();

         gBrush.call(brush.move, [topSection, topSection + size]);
    }//scroll end



     function update(df) {
         var bar = d3.select(".mainGroup").selectAll(".bar")
             .data(df, function (d) { return d.key;  });

         bar
             .attr("width", function (d) { return main_xScale(d.sum);   })
             // .transition().duration(500)
             .attr("id", function (d) { return d.school_id  })
             .attr("xVal", function (d) { return mini_yScale(d.school_id)  })
             .attr("y", function (d, i) {  return main_yScale(d.school_id);   })
             .attr("height", main_yScale.bandwidth() - 3)
             // .style("fill", transparentBlue)
             .transition().duration(zero_duration)
             .attr("data-tippy-content", function(d) {
                 let name = recipient_options.find(function(k){
                     return k.recipientID === d.school_id
                 });
                    return name.recipientName + ": " + d3.format(".2s")(d.sum) });


         bar.enter().append("rect")
             .attr("class", "bar tip")
             .attr("id", function (d) { return d.school_id  })
             .attr("xVal", function (d) { return mini_yScale(d.school_id)  })
             .style("fill", transparentBlue )
             .attr("data-tippy-content", function(d) {
                 let name = recipient_options.find(function(k){
                     return +k.recipientID === +d.school_id
                 });
                     return name.recipientName + ": " + d3.format(".2s")(d.sum);

             })
             .on("click", function (d) {
                 let id = d3.select(this).attr("id");

                 let name = recipient_options.find(function(d){
                     return d.recipientID === id
                 });
                 d3.select("#chart-block-1").select(".recipient_model > p").attr("value", id).text(name.recipientName.substring(0, 40));
                 draw_detail(calculate__2(input[0]));
                 d3.select(".mainGroup").selectAll(".bar").style("fill", transparentBlue);
                 d3.select(this).style("fill", saturatedBlue);
             })
             .attr("y", function (d, i) {  return main_yScale(d.school_id);   })
             .attr("height", main_yScale.bandwidth() - 3)
             .attr("rx", 6)
             .attr("ry", 6)
             .transition().duration(zero_duration)
             .attr("width", function (d) { return main_xScale(d.sum);   });

         bar.exit()
             .remove();



     } //update end


    draw__1(calculate__1(input[0]));

    tippy('.tip', {
        // trigger: 'click',
        allowHTML: true,
        content: 'Global content',
        duration: 0,
        onShow(tip) {
            tip.setContent(tip.reference.getAttribute('data-tippy-content'))
        }

    });


});








