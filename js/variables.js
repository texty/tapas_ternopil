/**
 * Created by yevheniia on 11.08.20.
 */
const charts_background = "#f1e9de";
const saturatedBlue = "#007EFF";
const transparentBlue = "#007EFF33";

const transition_time = 500;
const zero_duration = 0;

function getSelectedValues(parent, df){
    var options = [];
    var update = true;
    var arr;

    if(parent === "#chart-block-1"|| parent === "#chart-block-2" || parent === "#chart-block-4"){
        arr = [
            { key: "year", value: d3.select(parent).select(".year_model").node().value },
            { key: "type", value: d3.select(parent).select(".type_model").node().value  },
            { key: "recipientID", value: d3.select(parent).select(".recipient_model > p").attr("value") }
        ].filter(function (d) { return d.value != "" && d.value !== null; });
    }  else if( parent === "#chart-block-3"){
        arr = [
            { key: "year", value: d3.select(parent).select(".year_model").node().value },
            { key: "recipientID", value: d3.select(parent).select(".recipient_model > p").attr("value") }
        ].filter(function (d) { return d.value != "" && d.value !== null; });
    }

    var filtered_arr;

    if (arr.length === 0) {
        filtered_arr = df;

    } else if (arr.length === 1) {
        if(arr[0].key === 'recipientID'){ update = false }
        filtered_arr = df.filter(function(d, i) {
            return d[arr[0].key] === arr[0].value;
        });

    } else if (arr.length === 2) {
        if(arr[1].key === 'recipientID'){  update = false }
        filtered_arr = df.filter(function(d, i) {
            return (
                d[arr[0].key] === arr[0].value && d[arr[1].key] === arr[1].value
            );
        });

    } else if (arr.length === 3) {
        update = false;
        filtered_arr = df.filter(function(d, i) {
            return (
                d[arr[0].key] === arr[0].value &&
                d[arr[1].key] === arr[1].value &&
                d[arr[2].key] === arr[2].value
            );
        });
    }

    _.uniq(filtered_arr, function (d) {
        return d.recipientName;
    })
        .forEach(function (d) {
            options.push(
                {"recipientID": d.recipientID, "recipientName": d.recipientName}
            );
        });

    return { "data": filtered_arr, "update": update, 'options': options }

}