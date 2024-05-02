var countryCodes = {
    "Austria": "AT",
    "Belgium": "BE",
    "Germany": "DE",
    "Denmark": "DK",
    "Greece": "EL",
    "Spain": "ES",
    "Finland": "FI",
    "France": "FR",
    "Ireland": "IE",
    "Italy": "IT",
    "Luxembourg": "LU",
    "Netherlands": "NL",
    "Portugal": "PT",
    "Sweden": "SE",
}

var colors = {
    'far-left': 'red',
    'left': '#ff7f7f',
    'center-left': '#ff4d4d',
    'center': 'gray',
    'center-right': '#4dff4d',
    'right': '#7fff7f',
    'far-right': 'green'
};


// Request the GeoJSON
d3.json("../json/ess_data_all.json").then(function(cdata) {

    const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height")
    
    const flattenedCircles = getPercentageCircles(cdata, "BE", 0, width, height)

    // Draw circles
    svg.selectAll("circle")
        .data(flattenedCircles)
        .enter().append("circle")
        .attr("cx", d => d.cx)
        .attr("cy", d => d.cy)
        .attr("r", d => d.radius)
        .style("fill", (d, i) => d.color)
        .on("mouseover", function(event, d) { 

            tooltip
                .transition()
                .duration(200)
                .style('opacity', 1)
                .style("display", null)
                .style('left', d3.event.pageX + 'px')
                .style('top', d3.event.pageY + 'px')
                .style("height", '15px')

                d3.select("#tooltipText").html('<strong>' + flattenedCircles[d].party + '</strong>');

        }).on("mouseout", function(event, d) { 

            d3.select('#tooltip').style('opacity', 0)

        });

});


let tooltip = d3.select('body')
    .append('div')
    .attr('id', 'tooltip')
    .attr('class', 'tooltip') // Use a class for styling
    .style('opacity', 0);

tooltip.append("div").attr("id", "tooltipText");