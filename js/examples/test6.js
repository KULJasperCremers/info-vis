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


// Setting up the svg element for D3 to draw in
let width = 1300, height = 700

let svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height)

let europeProjection = d3.geoMercator()
  .center([ 13, 52 ])
  .scale([ width / 1.5 ])
  .translate([ width / 2, height / 2 ])


let pathGenerator = d3.geoPath().projection(europeProjection)
let geoJsonUrl = "https://gist.githubusercontent.com/spiker830/3eab0cb407031bf9f2286f98b9d0558a/raw/7edae936285e77be675366550e20f9166bed0ed5/europe_features.json"




var valueLower = document.getElementById('slider-value-lower');
var valueUpper = document.getElementById('slider-value-upper');

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
                d3.select(this)
                    .attr("cursor", "pointer") // Change the cursor to indicate it's clickable
                    .on("mouseover", function(event) {
                        
                        var yearLower = parseInt(document.getElementById('slider-value-lower').innerHTML);
                        var yearUpper =  parseInt(document.getElementById('slider-value-upper').innerHTML);

                        var countryData = cdata[countryCodes[d.properties.name]];
                        var years = Object.keys(countryData["election_data"]).map(year => parseInt(year));

                        console.log(years)

                        var lower = years.filter(year => year <= yearLower)
                        var higher = years.filter(year => year >= yearUpper)

                        if (lower.length === 0) {
                            lower = lower.concat([ Math.min(...years) ])
                        }
                        if (higher.length === 0) {
                            higher = higher.concat([ Math.max(...years) ])
                        }

                        var from_election = lower[lower.length - 1]
                        var to_election = higher[0]

                        var from_election_data = countryData["election_data"][from_election.toString()]
                        var to_election_data = countryData["election_data"][to_election.toString()]


                        console.log(from_election_data, to_election_data)

                        function get_change(from, to, party) {
                            var f = from[party] === undefined ? 0 : parseFloat(from[party]);
                            var t = to[party] === undefined ? 0 : parseFloat(to[party]);
                            return Math.round(t - f);
                        }

                        var values = Object.values(to_election_data)
                        var keys = Object.keys(to_election_data).map(p => p + " " + get_change(from_election_data, to_election_data, p) + "%")
                        var changes = Object.keys(to_election_data).map(p => get_change(from_election_data, to_election_data, p));

                        values_changes = values.map((value, index) => {
                            return { value: value, change: changes[index] };
                        });

                        console.log(values)

                        tooltip
                        .transition()
                        .duration(200)
                        .style('opacity', 1)
                        .style("display", null)
                        .style('left', d3.event.pageX + 'px')
                        .style('top', d3.event.pageY + 'px')
                        .style("height", values.length * 26.5 + 'px')

                        d3.select("#tooltipText").html('<strong>' + d.properties.name + '</strong>');

                        // Clear previous graph
                        d3.select("#tooltipGraph").selectAll("*").remove();

                        var graphHeight = values.length * 25; 
                        d3.select("#tooltipGraph").attr("height", graphHeight);


                        // Create a scale for the bars
                        var x = d3.scaleLinear()
                            .domain([0, d3.max(values)]) // Assuming values are numeric
                            .range([0, 200]); // Adjust the range based on the desired width

                        function interpolateColorForD3(value, min, max, colorStart, colorEnd) {
                            // Ensure the value is within the min-max range
                            value = Math.max(min, Math.min(max, value));
                        
                            // Normalize the value to a 0 to 1 scale based on the min-max range
                            const normalizedValue = (value - min) / (max - min);
                        
                            // Get an interpolator between the two colors
                            const colorInterpolator = d3.interpolate(colorStart, colorEnd);
                        
                            // Use the interpolator to get the color corresponding to the normalized value
                            return colorInterpolator(normalizedValue);
                        }

                        const minValue = Math.min(...changes);
                        const maxValue = Math.max(...changes);

                        console.log(minValue, maxValue)

                        const startColor = "#ff0000"; // Red
                        const endColor = "#00ff00"; // Green


                        // Create or update bars for the bar chart within the SVG
                        d3.select("#tooltipGraph").selectAll("rect")
                            .data(values_changes)
                            .enter()
                            .append("rect")
                            .attr("width", d => x(d.value))
                            .attr("height", 20) // Fixed height for each bar
                            .attr("y", (d, i) => i * 25) // Position bars with spacing
                            .attr("fill", d => { 
                                if (d.change == 0) {
                                    return "gray";                                    
                                }
                                return interpolateColorForD3(d.change, minValue, maxValue, startColor, endColor);
                            });
                        
                        d3.select("#tooltipGraph").selectAll("text")
                            .data(keys)
                            .enter()
                            .append("text")
                            .text(d => d)
                            .attr("x", 0) 
                            .attr("y", (d, i) => i * 25 + 15)
                            .attr("fill", "black")
                            .attr("font-size", "12px");


                        d3.select(this).attr("fill", "blue");
                    })
                
                    .on("mouseout", function(event) {
                        d3.select('#tooltip').style('opacity', 0)
                    
                        d3.select(this).attr("fill", "white");
                    });
            }
        });
    });
});

let tooltip = d3.select('body')
    .append('div')
    .attr('id', 'tooltip')
    .attr('class', 'tooltip') // Use a class for styling
    .style('opacity', 0);

tooltip.append("div").attr("id", "tooltipText");
tooltip.append("svg").attr("id", "tooltipGraph").attr("width", 200).attr("height", 100);


var slider = document.getElementById('slider');

noUiSlider.create(slider, {
    start: [2000, 2024], // Initial values: [lower, upper]
    connect: true, // Display a colored bar between the handles
    range: {
        'min': 2000,
        'max': 2024
    }
});

slider.noUiSlider.on('update', function (values, handle) {
    var valueLower = document.getElementById('slider-value-lower');
    var valueUpper = document.getElementById('slider-value-upper');

    valueLower.innerHTML = Math.round(values[0]);
    valueUpper.innerHTML = Math.round(values[1]);
});