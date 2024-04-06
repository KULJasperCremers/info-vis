function AppendMap(htmlId, onHoverCountryFunc, onClickCountryFunc, width = 900, height = 500) {

    let svg = d3.select(htmlId).append("svg")
    .attr("width", width)
    .attr("height", height)

    let europeProjection = d3.geoMercator()
    .center([ 13, 52 ])
    .scale([ width / 1.5 ])
    .translate([ width / 2, height / 2 ])


    let pathGenerator = d3.geoPath().projection(europeProjection)
    let geoJsonUrl = "https://gist.githubusercontent.com/spiker830/3eab0cb407031bf9f2286f98b9d0558a/raw/7edae936285e77be675366550e20f9166bed0ed5/europe_features.json"

        
    // Request the GeoJSON
    d3.json("../json/ess_data3.json").then(function(cdata) {
        d3.json(geoJsonUrl).then(geojson => {
            svg.selectAll("path")
            .data(geojson.features)
            .enter()
            .append("path")
            .attr("d", pathGenerator)
            .attr("stroke", "grey")
            .attr("fill", function(d) {
                return countryCodes.hasOwnProperty(d.properties.name) ? "white" : "rgba(211, 211, 211, 1)";
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
    });

    return svg
}





