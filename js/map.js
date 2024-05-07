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

function AppendMap(htmlId, onHoverCountryFunc, onClickCountryFunc, colorFunc = undefined, width = 900, height = 500) {
    let svg = d3.select(htmlId).append("svg")
    .attr("width", width)
    .attr("height", height)

    let europeProjection = d3.geoMercator()
    .center([ 13, 52 ])
    .scale([ width ])
    .translate([ width / 2, height / 2 ])


    let pathGenerator = d3.geoPath().projection(europeProjection)
    let geoJsonUrl = "../json/geojson.json"

    // Request the GeoJSON
    d3.json(geoJsonUrl).then(geojson => {
        svg.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", pathGenerator)
        .attr("stroke", "grey")
        .attr("fill", function(d) {
            var countryExists = countryCodes.hasOwnProperty(d.properties.name);
            if (colorFunc !== undefined && countryExists) {
                return colorFunc(d.properties.name);
            }
            else {
                return countryExists ? "white" : "rgba(211, 211, 211, 1)";
            }
        })
        .each(function(d) {
            if (countryCodes.hasOwnProperty(d.properties.name)) {
                const countryCode  = d.properties.name;

                d3.select(this)
                    .attr("cursor", "pointer") // Change the cursor to indicate it's clickable
                    .on("mouseover", function(event) {
                        d3.select(this).attr("fill", "#87443a");

                        onHoverCountryFunc(countryCode);
                    })
                    .on("mouseout", function(event) {
                        d3.select(this).attr("fill", "white");
                    }) 
                    .on("click", function(event) {
                        onClickCountryFunc(countryCode);
                    });
            }
        });
    });

    return svg
}





