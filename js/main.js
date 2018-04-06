mapboxgl.accessToken = 'pk.eyJ1IjoiYWFraW1zIiwiYSI6ImNqZmQ1bm4yaDF4NnQzdW8xem54dmNzYXQifQ.VfaDRyNApyLYnCVL7PcpzA';

var mapStyle = 'mapbox://styles/aakims/cjfgej20o1t452smsp0rysgsi'

//create a map using the Mapbox Dark theme, zoomed in to Philly
var defaultMap = new mapboxgl.Map({
    container: 'map',
    style: mapStyle,
    zoom: 11,
    center: [-75.1652, 39.9526]
});

defaultMap.addControl(new mapboxgl.NavigationControl());

var tripIndex; // define trip number 1~11
var indexFields = ["trip", "olive"],
    timeField = ["ftime"],
    displayFields = ["dust", "light", "tempF", "GINI_IND"],
    dataFields = ["unixt", "trip", "olive", "ftime", "dust", "light", "tempF", "GINI_IND"];
var mapCenterCoor;
var defineMapCenter = function() {
    var midIndex = thisData.length / 2;
    mapCenterCorr = thisData[midIndex].geometry.coordinates;
};

var selectFields = _.uniq(_.union(indexFields, timeField, displayFields, dataFields));

var graphTitles = ["Air Quality", "Light Level", "Temperature", "Gini Index"];
var graphVars = ["chart1", "chart2", "chart3", "chart4"];
var chart1, chart2, chart3, chart4;
var thisData = [];
var lineData;
// DEFINE TRIP DATA 

var defineData = function(tripIndex) {
    thisData = _.chain(sdata.features)
        .filter(function(feature) {
            //console.log(sdata.features[1])
            return ((feature.properties["trip"] === tripIndex) && (feature.properties["olive"] > 5))
        })
        .map(function(feature) {
            feature.properties = _.pick(feature.properties, selectFields);
            //console.log(feature.properties);
            //console.log(feature);
            return feature;
        })
        .map(function(feature) {
            feature.properties["gtime"] = new Date(feature.properties["unixt"] * 1000 + 18000000);
            return feature;
        })
        .value();

    console.log(thisData[1]);
    return thisData;

};

var graphWidth = 600;
var graphHeight = 130;
var graphMargin = { top: 20, right: 20, bottom: 20, left: 40 };

/* setting map object extent 
var mapWidth = 800,
    mapHeight = 650,
    mapMargin = { top: 20, right: 10, bottom: 30, left: 20 };


var center = [2.5725, 39.957049],
    offset = [mapWidth / 2, mapHeight / 2],
    scale = 700000,
    PennSouthProjection = d3.geoConicConformal().scale(scale)
    .parallels([39 + 56 / 60, 40 + 58 / 60])
    .rotate([77 + 45 / 60, 0])
    .center(center)
    .translate(offset);

*/

// x and y axis setup
var x = d3.scaleTime().range([0, graphWidth]);
var y = d3.scaleLinear().range([graphHeight, 0]);

var graphSeries, graphItems, thisIndex;

var setupCanvas = function(thisItem) {

    chart = d3.select("#" + thisItem).append("svg")
        .attr("width", graphWidth + graphMargin.left + graphMargin.right)
        .attr("height", graphHeight + graphMargin.top + graphMargin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + graphMargin.left + "," + graphMargin.top + ")");

    chart.append("text")
        .attr("x", graphWidth - 70)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "teal")
        .style("text-decoration", "underline")
        .text(graphTitles[thisIndex]);

};

var parseTime = d3.timeParse("%x");

var prepData = function(yDataIndex) {

    //var thisIndex = _.indexOf(graphItems, graphItem);
    lineData = JSON.parse(JSON.stringify(thisData));
    var yData = displayFields[yDataIndex];

    console.log(yData);
    //console.log(thisData[1]);

    var yMin = d3.min(lineData, function(sensObj) { return sensObj.properties[yData]; }),
        yMax = d3.max(lineData, function(sensObj) { return sensObj.properties[yData]; });

    _.map(lineData, function(feature) {
        feature.properties["ftime"] = new Date(feature.properties["unixt"] * 1000 + 18000000);
        return feature;
    })
    var xMin = d3.min(lineData, function(sensObj) { return sensObj.properties["ftime"] });
    var xMax = d3.max(lineData, function(sensObj) {
        var formatted = new Date(sensObj.properties["ftime"]);
        return formatted
    });

    //var xScale = d3.time.scale()
    //.domain([xMin, xMax])
    //.rnage

    console.log(xMin, xMax);
    console.log(yMin, yMax);
    //https://www.quora.com/How-do-I-use-string-content-as-variable-name-in-JS

    console.log(lineData[0]);
    console.log(thisData[0]);

    var xRange = xMax - xMin,
        yRange = yMax - yMin;
    console.log(xRange, yRange);
    x.domain([xMin - (xRange * 0.01), xMax]);
    y.domain([yMin - (yRange * 0.1), yMax]);
    //y.domain([yMin - (yRange * 0.05), yMax + (yRange * 0.05)]);

    // set domain to be extent +- 5%
    //x.domain([xExtent[0] - (xRange * .05), xExtent[1] + (xRange * .05)]);
    //y.domain([yExtent[0] - (yRange * .05), yExtent[1] + (yRange * .05)]);

    graphLine = d3.line()
        .x(function(d) { return x(d.properties["ftime"]) })
        .y(function(d) { return y(d.properties[yData]); })
        .curve(d3.curveBasisOpen);

    lineData = _.map(lineData, function(sensObj) {
        //console.log("in lineData"); 
        sensObj.properties = _.pick(sensObj.properties, "ftime", yData);
        sensObj.properties["ftime"] = +sensObj.properties["ftime"];
        sensObj.properties[yData] = +sensObj.properties[yData];
        return sensObj;
    });
    //console.log(lineData);
};

var renderGraph = function() {

    //console.log("Here");

    var axisY = d3.axisLeft(y);

    axisY.ticks(5);

    chart.append("g")
        .attr("transform", "translate(0," + graphHeight + ")")
        .call(d3.axisBottom(x));

    chart.append("g")
        .call(axisY);

    console.log(lineData);
    chart.append("path")
        .attr("class", "line")
        .attr("d", graphLine(lineData));
};

var filterInput = document.getElementById('filter-input');
var mapTime;

var displayMapbox = function() {

    var dataCenterCoor, dataMidPoint;
    var latExtent, longExtent;
    var defineMapCenter = function() {
        var dataMidPoint = Math.round(_.size(thisData) / 2);
        dataCenterCoor = thisData[dataMidPoint].geometry.coordinates;
    };
    var customZoom = (_.size(thisData) < 100) ? 14.5 : 13.5;
    var markerSize = (customZoom === 14.5) ? 6 : 4;

    defineMapCenter();
    console.log(dataCenterCoor);

    map = new mapboxgl.Map({
        container: 'map',
        style: mapStyle,
        zoom: customZoom,
        center: dataCenterCoor //[-75.1652, 39.9526]
    });

    map.addControl(new mapboxgl.NavigationControl());

    map.on("load", function() {
        map.addSource("sensing-samples", {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": thisData
            }
        });

        map.addLayer({
            "id": "sensing-collection-path",
            "type": "circle",
            "source": "sensing-samples",
            "paint": {
                "circle-radius": markerSize,
                "circle-color": "#db8a83",
                "circle-opacity": 1
            }
        });

        map.addLayer({
            "id": "path-hover",
            "type": "circle",
            "source": "sensing-samples",
            "paint": {
                "circle-radius": markerSize + 3,
                "circle-color": "#54505E",
                "circle-opacity": 1
            },
            "filter": ["==", "unixt", ""]
        });

        map.on("mousemove", "sensing-collection-path", function(e) {

            map.getCanvas().style.cursor = 'pointer';

            //console.log(e.features[0]);
            map.setFilter("path-hover", ["==", "unixt", e.features[0].properties["unixt"]]);
            //map.setFilter("sensing-collection-path", ["==", "unixt", e.features[0].properties["unixt"]])
            mapTime = e.features[0].properties["gtime"];
            console.log(mapTime);
        });

        map.on("mouseleave", "sensing-collection-path", function(e) {
            map.setFilter("path-hover", ["==", "unixt", ""]);
        });



    });
};



var displayGraphs = function(tripIndex) {

    clearData();
    defineData(tripIndex);
    graphSeries = document.getElementsByClassName("graphs");
    graphItems = _.map(graphSeries, function(graphItem) { return graphItem.id });

    //displayMap();
    var map;
    enableToolTips();
    displayMapbox();

    _.each(graphItems, function(graphItem) {

        //(graphItem === "chart1") :
        //defineData(tripIndex); 
        //console.log(thisData);
        thisIndex = _.indexOf(graphItems, graphItem);
        console.log(thisIndex);
        var thisGraph = graphItem;
        var chart, graphLine;
        setupCanvas(graphItem);
        prepData(thisIndex);
        renderGraph();

    });

    console.log($(".mouse-line")[0]);
    //console.log($(".mouse-line")[0].attributes.d.value);
    document.getElementsByClassName("mouse-line").addEventListener('mousemove', function(e) {

        //console.log(JSON.stringify(e.point));
    });



};

var clearData = function() {
    _.each(graphItems, function(thisItem) {
        $("#" + thisItem).empty();
    });
};

var clearCanvas = function() {

    var defaultMap = new mapboxgl.Map({
        container: 'map',
        style: mapStyle,
        zoom: 11,
        center: [-75.1652, 39.9526]
    });
    // ("#" + thisItem).append("svg")
    clearData();
    //$("#map").append(defaultMap);

    //var items = d3.select('svg').selectAll('.item').data(newData);

    // Remove old elements:
    //items.exit().remove();
};



var tooltipWidth = graphWidth,
    tooltipHeight = $(".graphs-here").height() - graphMargin.top - graphMargin.bottom;

var graphStart = $(".graphs-tool-tip").width() / 2 - (graphWidth / 2) + 15; // 15 hard numb is not ideal but this works on roughly full screen

var tooltipsvg = d3.select(".graphs-tool-tip") //mouseG
    .append("svg")
    .attr("class", "stalker-radius")
    .attr("width", tooltipWidth)
    .attr("height", tooltipHeight)
    .attr("transform",
        "translate(" + graphStart + "," + graphMargin.top + ")");

/* this took unfair amount of time to realize: the stalker-radius adjusts accrodingly depending on the ".graphs-here" class grid when first loaded. As soon as I load the graphs though, they are not responsive, so if the screen size is anything smaller than the full-size, the stalker-radius seems to be shrunk. This should be dealt with all together later when doing @media only responsive CSS adjustments. Proceeding with full-size screen in mind. i.e. stalker-radius will be catered to the full-length of the graphs */


var stalkerG = tooltipsvg.append("g")
    .attr("class", "mouse-over-effects");

var enableToolTips = function() {

stalkerG.append("path")
    .attr("class", "mouse-line")
    .style("stroke", "#54505E")
    .style("stroke-width", "2px")
    .style("opacity", "0");

var lines = document.getElementsByClassName("line");

var stalkerPerLine = stalkerG.selectAll(".mouse-per-line")
    .data(thisData)
    .enter()
    .append("g")
    .attr("class", "mouse-per-line");

stalkerPerLine.append("circle")
    .attr("r", 4)
    .style("stroke", "#54505E")
    .style("fill", "#54505E")
    .style("opacity", "0");

stalkerG.append("svg:rect")
    .attr("width", tooltipWidth)
    .attr("height", tooltipHeight)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mouseout", function() {
        d3.select(".mouse-line").style("opacity", "0");
        d3.selectAll(".mouse-per-line circle").style("opacity", "0");
        //d3.selectAll(".mouse-per-line text").style("opacity", "0");
    })
    .on("mouseover", function() {
        d3.select(".mouse-line").style("opacity", "1");
        d3.selectAll(".mouse-per-line circle").style("opacity", "1");
        //d3.selectAll(".mouse-per-line text").style("opacity", "1");
    })
    .on("mousemove", function() {
        var mouseCo = d3.mouse(this);
        d3.select(".mouse-line")
            .attr("d", function() {
                var d = "M" + mouseCo[0] + "," + tooltipHeight;
                d += " " + mouseCo[0] + "," + 0;
                return d;
            });


        d3.selectAll(".mouse-per-line")
            .attr("transform", function(d, i) {
                console.log(tooltipWidth / mouseCo[0]);
                var xTime = x.invert(mouseCo[0]),
                    bisect = d3.bisector(function(d) { return d["gtime"]; }).right,
                    idx = bisect(d.values, xTime);

                console.log(xTime);

                var beginning = 0,
                    end = lines[i].getTotalLength(),
                    target = null;

                while (true) {
                    target = Math.floor((beginning + end) / 2);
                    pos = lines[i].getPointAtLength(target);
                    if ((target === end || target === beginning) && pos.x !== mouseCo[0]) {
                        break;
                    }
                    if (pos.x > mouseCo[0]) { end = target; } else if (pos.x < mouseCo[0]) { beginning = target; } else break;
                }

                // d3.select(this).select("text")
                // .text(y.invert(pos.y).toFixed(2)); 

                return "translate(" + mouseCo[0] + "," + pos.y + ")";
            });
    });

};
