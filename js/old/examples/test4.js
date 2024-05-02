d3.json("../json/ess_data2.json").then(function(data) {
    var latestElection = Object.keys(data["BE"]["election_data"]).sort();
    var latestElectionYear = latestElection.pop();
    var votePercentages = data["BE"]["election_data"][latestElectionYear];

    var leaningData = data["BE"]["leaning_data"];

    var latestEss = Object.keys(data["BE"]["ess_data"]).sort();
    var latestEssYear = latestEss.pop();
    var essData = data["BE"]["ess_data"][latestEssYear];

    var leaningVotePercentages = {
        "far-left": 0,
        "left": 0,
        "center-left": 0,
        "center": 0,
        "center-right": 0,
        "right": 0,
        "far-right": 0
    };

    for (var leaning in leaningData) {
        for (var i=0; i < leaningData[leaning].length; i++) {
            var party = leaningData[leaning][i];
            if (votePercentages[party] !== undefined) {
                leaningVotePercentages[leaning] += votePercentages[party];
            }
        }
    }

    var transformedData = essData["leaning"].map(function(_, i) {
        return {
            "leaning": essData["leaning"][i],
            "happy": essData["happy"][i],
            "satisfaction": essData["satisfaction"][i],
            "trust_country": essData["trust_country"][i],
            "trust_eu": essData["trust_eu"][i]
        };
    }); 

    var margin = {top: 25, right: 25, bottom: 10, left: 75},
        width = 1000 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    createParallelCoordinatesPlot(svg, width, height, transformedData, null);

});

function createParallelCoordinatesPlot(svg, width, height, transformedData, selectedLeaning=null) {
    var x = d3.scalePoint().range([0, width]),
        y = {};

    var xLeaning = d3.scalePoint().range([0, height]);
    xLeaning.domain(["far-left", "left", "center-left", "center", "center-right", "right", "far-right"]);
    y["leaning"] = xLeaning;
    x.domain(dimensions = d3.keys(transformedData[0]).filter(function(d) {
        return (y[d] = d === "leaning" ? xLeaning : d3.scaleLinear()
            .domain([0, 10])
            .range([height, 0]));
    }));

    var g = svg.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { 
            return "translate(" + x(d) + ")"; 
        });
    
    g.append("g")
        .attr("class", "axis")
        .each(function(d) { 
            d3.select(this).call(d3.axisLeft(y[d])); 
            if (d === "leaning") {
                d3.select(this).selectAll(".tick text")
                    .on("click", function(d) {
                        var selectedLeaning = d3.select(this).text();
                        var filteredData = transformedData.filter(function(d) {
                            return d.leaning === selectedLeaning;
                        });
                        console.log(`Plotting ${filteredData.length} data points from the ${selectedLeaning} leaning.`);
                        svg.selectAll(".brush").remove();
                        d3.selectAll(".foreground").remove();
                        createParallelCoordinatesPlot(svg, width, height, filteredData, selectedLeaning);
                        // Add a brush to each axis
                        g.append("g")
                            .attr("class", "brush")
                            .each(function(d) {
                                if (d !== "leaning") {
                                d3.select(this).call(y[d].brush = d3.brushY()
                                    .extent([[-8, y[d].range()[1]], [8, y[d].range()[0]]])
                                    .on("brush", brush)
                                    .on("end", brushEnd));
                                }
                            })
                            .selectAll("rect")
                            .attr("x", -8)
                            .attr("width", 16);   
                    });
            }
        })
        .append("text")
        .style("text-anchor", "middle")
        .attr("fill", "black") 
        .attr("font-size", "12px")
        .attr("y", -10)
        .text(function(d) { return d; });

    if (selectedLeaning) {
        transformedData = transformedData.filter(function(d) {
            return d.leaning === selectedLeaning;
        });

        svg.append("g")
            .attr("class", "foreground")
            .selectAll("path")
            .data(transformedData)
            .enter().append("path")
            .attr("d", function(d) { return "M" + path(d); })
            .style("stroke", function(d, i) { return d3.schemeCategory10[i % 10]; })
            .style("stroke-width",1)
            .style("stroke-opacity",0.5)
            .style("fill", "none");
    }
 
    // Handle the brush event
    function brush() {
        var actives = [];
        svg.selectAll(".brush")
            .filter(function(d) {
                y[d].brushSelectionValue = d3.brushSelection(this);
                return d3.brushSelection(this);
            })
            .each(function(d) {
                actives.push({
                    dimension: d,
                    extent: d3.brushSelection(this).map(y[d].invert)
                });
            });

        svg.selectAll(".foreground path")
            .style("display", function(d) {
                return actives.every(function(active) {
                    return active.extent[1] <= d[active.dimension] && d[active.dimension] <= active.extent[0];
                }) ? null : "none";
            });
    }

    // Handle the brush end event
    function brushEnd() {
        if (!d3.event.selection) {
            svg.selectAll(".brush")
                .each(function(d) { 
                    if (d !== "leaning" && d3.brushSelection(this) !== null) {
                        console.log(`d: ${d}`);
                        if(y[d] && y[d].brush) { // Check if the brush exists
                            d3.select(this).call(y[d].brush.clear());
                        }
                    }
                });
            svg.selectAll(".foreground path")
                .style("display", null);
        }
    }

    function path(d) {
        return dimensions.map(function(p) { return [x(p), y[p](d[p])]; }).join("L");
    }
}
    
