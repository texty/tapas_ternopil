/**
 * Created by yevheniia on 11.08.20.
 */
const charts_background = "#FFF7E3";
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
            { key: "year", value: d3.select(parent).select(".year_model > p").attr("value") },
            { key: "type", value: d3.select(parent).select(".type_model  > p").attr("value")  },
            { key: "recipientID", value: d3.select(parent).select(".recipient_model > p").attr("value") }
        ].filter(function (d) { return d.value != "" && d.value !== null; });
    }  else if( parent === "#chart-block-3"){
        arr = [
            { key: "year", value: d3.select(parent).select(".year_model > p").attr("value") },
            { key: "recipientID", value: d3.select(parent).select(".recipient_model > p").attr("value") }
        ].filter(function (d) { return d.value != "" && d.value !== null; });
    }



    var filtered_arr;

    if (arr.length === 0) {
        filtered_arr = df;

    } else if (arr.length === 1) {
        if(arr[0].key === 'recipientID'){ update = false }
        filtered_arr = df.filter(function(d, i) {
            // if(d[arr[0].key] === arr[0].value){
            //     console.log("teur");
            // }
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
                {"recipientID": d.recipientID, "recipientName": d.recipientName, "sort": d.sort, "type": d.type }
            );
        });

    options.sort(function(a,b){
        return d3.descending(a.type, b.type) || d3.ascending(a.recipientName[0], b.recipientName[0]) || a.sort - b.sort
    });

    return { "data": filtered_arr, "update": update, 'options': options }

}



function nFormatter(num, digits) {
    var si = [
        { value: 1, symbol: "" },
        { value: 1E3, symbol: " т. " },
        { value: 1E6, symbol: " млн " }

    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}



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



//
var localeMoney = d3.formatLocale({
    decimal: "",
    thousands: " ",
    grouping: [3]
});

var moneyFormat = localeMoney.format(",.2r");
