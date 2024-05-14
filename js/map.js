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
    "Netherlands": "NL",
    "Portugal": "PT",
    "Sweden": "SE",
}

let filteredFeatures;

let europeProjection;
let pathGenerator;

function colorMap(htmlId, colorFunc, showGrowthGradient = false) {
    let svg = d3.select(htmlId).select("svg");  // Select the existing SVG by HTML ID

    var colorFuncOutputs = {}

    for (let key in countryCodes) {
        colorFuncOutputs[key] = colorFunc(key);
    }

    console.log("t")

    svg.selectAll("path")
       .attr("fill", function(d) {
        var countryExists = countryCodes.hasOwnProperty(d.properties.name);
        if (colorFunc !== undefined && countryExists) {
            return colorFuncOutputs[d.properties.name][1];
        }
        else {
            if (d.properties.name == "Iceland") {
                return  "rgba(211, 211, 211, 0)";
            }
            return countryExists ? "white" : "rgba(211, 211, 211, 1)";
        }
    })

    if (!filteredFeatures) {
        return;
    }
    
    svg.selectAll("text").remove(); 
    svg.selectAll("text")
    .data(filteredFeatures)
    .enter()
    .append("text")
    .attr("transform", function(d) { 
        const centroid = pathGenerator.centroid(d);
        return `translate(${centroid[0]}, ${centroid[1]})`;
    })
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "central")
    .attr("fill", "black") // You can change the color based on conditions or keep it fixed
    .text(function(d) {
        var countryExists = countryCodes.hasOwnProperty(d.properties.name);
        if (colorFunc !== undefined && countryExists) {
            return colorFuncOutputs[d.properties.name][0];
        }
    })
    .style("font-size", "10px") // Adjust size as needed
    .style("pointer-events", "none"); // Prevents the label from interfering with mouse events on the map

    svg.selectAll("defs").remove();

    if (showGrowthGradient) {

        var defs = svg.append("defs");
        var linearGradient = defs.append("linearGradient")
            .attr("id", "linear-gradient")
            .attr("x1", "0%")
            .attr("y1", "100%")  // Start at the bottom
            .attr("x2", "0%")
            .attr("y2", "0%");   // End at the top
        linearGradient.append("stop").attr("offset", "0%").attr("stop-color", "red");  // Color starts at the bottom
        linearGradient.append("stop").attr("offset", "100%").attr("stop-color", "green");  // Color ends at the top


        // Append and position the rectangle, and use raise to ensure it's on top
        svg.append("rect")
            .attr("x", 10)
            .attr("y", 20)
            .attr("width", 20)
            .attr("height", 100)
            .style("fill", "url(#linear-gradient)")
            .raise(); // Ensure the rectangle is on top

            svg.append("text")
            .attr("x", 10 + 10)  // x position, center of the rectangle
            .attr("y", 15)       // y position, slightly above the rectangle
            .attr("text-anchor", "middle") // Center the text horizontally
            .style("font-size", "12px")
            .style("font-family", "Arial, sans-serif")
            .text("Growth");
        
        // Append text for "Decline" at the bottom of the rectangle
        svg.append("text")
            .attr("x", 10 + 10)  // x position, center of the rectangle
            .attr("y", 20 + 100 + 10) // y position, slightly below the rectangle
            .attr("text-anchor", "middle") // Center the text horizontally
            .style("font-size", "12px")
            .style("font-family", "Arial, sans-serif")
            .text("Decline");

    }

}

function AppendMap(htmlId, onHoverCountryFunc, onClickCountryFunc, colorFunc = undefined, width = 900, height = 500) {
    let svg = d3.select(htmlId).append("svg")
    .attr("width", width)
    .attr("height", height)

   

    europeProjection = d3.geoMercator()
    .center([ 13, 52 ])
    .scale([ width ])
    .translate([ width / 2, height / 2 ])

    pathGenerator = d3.geoPath().projection(europeProjection)
    let geoJsonUrl = "../json/geojson.json"

    // Request the GeoJSON
    d3.json(geoJsonUrl).then(geojson => {
        
        svg.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", pathGenerator)
        .attr("stroke", function(d) { return d.properties.name !== "Iceland" ? "grey" : "rgba(211, 211, 211, 0)" })
        .attr("fill", function(d) {
                var countryExists = countryCodes.hasOwnProperty(d.properties.name);
                if (d.properties.name == "Iceland") {
                    return  "rgba(211, 211, 211, 0)";
                }
                return countryExists ? "white" : "rgba(211, 211, 211, 1)";
        })
        .each(function(d) {
            if (countryCodes.hasOwnProperty(d.properties.name)) {
                const countryCode  = d.properties.name;

                d3.select(this)
                    .attr("cursor", "pointer") // Change the cursor to indicate it's clickable
                    .on("mouseover", function(event) {
                        //d3.select(this).attr("fill", "#87443a");

                        onHoverCountryFunc(countryCode);
                    })
                    .on("mouseout", function(event) {
                        //d3.select(this).attr("fill", "white");
                    }) 
                    .on("click", function(event) {
                        onClickCountryFunc(countryCode);
                    });
            }


            filteredFeatures = geojson.features.filter(d => countryCodes.hasOwnProperty(d.properties.name));
            svg.selectAll("text")
            .data(filteredFeatures)
            .enter()
            .append("text")
            .attr("transform", function(d) { 
                const centroid = pathGenerator.centroid(d);
                return `translate(${centroid[0]}, ${centroid[1]})`;
            })
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central")
            .attr("fill", "black") // You can change the color based on conditions or keep it fixed
            .text(function(d) {
                var countryExists = countryCodes.hasOwnProperty(d.properties.name);
                if (countryExists) {
                    return "";
                }
            })
            .style("font-size", "10px") // Adjust size as needed
            .style("pointer-events", "none"); // Prevents the label from interfering with mouse events on the map
        });
    });

    return svg
}





