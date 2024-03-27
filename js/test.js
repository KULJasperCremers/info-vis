// Load the data
let data = {
    "BE": {
        "2019": {
            "NVA": 16.0,
            "VB": 12.0,
            "PS": 9.5,
            "CDV": 8.9,
            "PVDA": 8.6,
            "OVLD": 8.5,
            "MR": 7.6,
            "SPA": 6.7,
            "Ecolo": 6.1,
            "Groen": 6.0,
            "CDH": 3.7,
            "Other parties": 6.4
        }
    }
};

// Create a SVG container
let svg = d3.select("body").append("svg")
    .attr("width", 800)
    .attr("height", 800);

// Define a pattern for the Belgium flag
svg.append("defs")
    .append("pattern")
    .attr("id", "belgium-flag")
    .attr("width", 100)
    .attr("height", 100)
    .append("image")
    .attr("xlink:href", "flags/BE/be.png")
    .attr("width", 100)
    .attr("height", 100);

// Filter out the data for Belgium's 2019 election
let belgiumData = data["BE"]["2019"];

// Define a scale for the node sizes
let scale = d3.scaleLinear()
    .domain([0, d3.max(Object.values(belgiumData))])
    .range([10, 50]);

// Create a central node for Belgium
let centerNode = svg.append("circle")
    .attr("cx", 400)
    .attr("cy", 400)
    .attr("r", 50)
    .style("fill", "url(#belgium-flag)");

// Create outer nodes for each party
let parties = Object.keys(belgiumData);
let angleStep = 2 * Math.PI / parties.length;
parties.forEach((party, i) => {
    let angle = i * angleStep;
    let cx = 400 + 200 * Math.cos(angle);
    let cy = 400 + 200 * Math.sin(angle);
    svg.append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", scale(belgiumData[party]))
        .style("fill", "blue"); // Replace with party color

    // Create edges from the central node to each party node
    svg.append("line")
        .attr("x1", 400)
        .attr("y1", 400)
        .attr("x2", cx)
        .attr("y2", cy)
        .style("stroke", "black");
});