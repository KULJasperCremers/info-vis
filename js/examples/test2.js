// Load the data
d3.json("data.json").then(function(data) {
    // Define maximum dimensions
    const maxWidth = 1920; // Full HD width
    const maxHeight = 1080; // Full HD height

    // Get window dimensions
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    // Create a SVG container
    let svg = d3.select("body").append("svg")
        .attr("width", Math.min(windowWidth, maxWidth))
        .attr("height", Math.min(windowHeight, maxHeight));
        
    // Define the grid layout
    let countries = Object.keys(data);
    let gridSize = Math.ceil(Math.sqrt(countries.length));
    // Define the width and height of each cell
    let cellWidth = Math.min(windowWidth, maxWidth) / gridSize;
    let cellHeight = Math.min(windowHeight, maxHeight) / gridSize;

    // For each country
    countries.forEach((country, i) => {
        // Calculate the position of the flag
        let x = (i % gridSize) * cellWidth;
        let y = Math.floor(i / gridSize) * cellHeight;

        // Filter out the data for the latest election
        let years = Object.keys(data[country]);
        let latestYear = Math.max(...years);
        let electionData = data[country][latestYear];

        // Define a scale for the node sizes
        let scale = d3.scaleLinear()
        .domain([0, d3.max(Object.values(data[country][latestYear]))])
        .range([1, 10]);    
        
        // Define a pattern for the country flag
        svg.append("defs")
            .append("pattern")
            .attr("id", `${country}-flag`)
            .attr("width", 100)
            .attr("height", 100)
            .append("image")
            .attr("xlink:href", `flags/${country}/${country.toLowerCase()}_small.png`)

        // Create a central node for the country
        let centerNode = svg.append("circle")
            .attr("cx", x + cellWidth / 2)
            .attr("cy", y + cellHeight / 2)
            .attr("r", 50)
            .style("fill", `url(#${country}-flag)`);

        let parties = Object.keys(electionData);
        let angleStep = 2 * Math.PI / parties.length;
        parties.forEach((party, j) => {
            let angle = j * angleStep;
            let cx = x + cellWidth / 2 + 100 * Math.cos(angle);
            let cy = y + cellHeight / 2 + 100 * Math.sin(angle);
            svg.append("circle")
                .attr("cx", cx)
                .attr("cy", cy)
                .attr("r", scale(electionData[party]))
                .style("fill", "blue"); // Replace with party color

            // Create edges from the central node to each party node
            svg.append("line")
                .attr("x1", x + cellWidth / 4)
                .attr("y1", y + cellHeight / 4)
                .attr("x2", cx)
                .attr("y2", cy)
                .style("stroke", "black");
        });
    });
});
