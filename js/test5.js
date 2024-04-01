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

// Load the data and the map
// d3.json("../json/ess_data3.json").then(function(data) {
d3.json("../json/ess_data_all.json").then(function(data) {
    d3.json("../json/geojson.json").then(function(geojson) {
        // Filter the GeoJSON data to only include European countries and exclude features outside the geographical range of mainland Europe
        geojson.features = geojson.features.filter(function(d) {

            return data.hasOwnProperty(countryCodes[d.properties.name]);
        });

        var dropdown = d3.select("body")
        .append("select")
        .on("change", function() {
            update(svg, dropdown, path, tooltip, geojson);
        });

        // // Popular
        // var options = ["Latest Election", "Second Latest Election", "Third Latest Election", "Oldest Election"];
        //     dropdown.selectAll("option")
        //         .data(options)
        //         .enter()
        //         .append("option")
        //         .attr("value", function(d) { return d; })
        //         .text(function(d) { return d; });

        // Growing
        var options = ["Latest Election", "Second Latest Election", "Third Latest Election"];
            dropdown.selectAll("option")
                .data(options)
                .enter()
                .append("option")
                .attr("value", function(d) { return d; })
                .text(function(d) { return d; });

        var margin = {top: 25, right: 25, bottom: 10, left: 75},
        width = 1000 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;


        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var projection = d3.geoMercator().fitSize([width, height], geojson);
        var path = d3.geoPath().projection(projection);
    
        var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

        update(svg,dropdown,path,tooltip,geojson);
    });

    function update(svg,dropdown,path,tooltip,geojson) {
        var selectedOption = dropdown.property("value");

        svg.selectAll("*").remove();

        var electionData;
        // // Popular
        // switch(selectedOption) {
        //     case "Latest Election":
        //         electionData = getPopularElectionData(data,1);
        //         break;
        //     case "Second Latest Election":
        //         electionData = getPopularElectionData(data,2);
        //         break;
        //     case "Third Latest Election":
        //         electionData = getPopularElectionData(data,3);
        //         break;
        //     case "Oldest Election":
        //         electionData = getPopularElectionData(data,4);
        //         break;
        // }
        // Growing
        switch(selectedOption) {
            case "Latest Election":
                electionData = getGrowingElectionData(data, 1);
                break;
            case "Second Latest Election":
                electionData = getGrowingElectionData(data, 2);
                break;
            case "Third Latest Election":
                electionData = getGrowingElectionData(data, 3);
                break;
        }

        svg.selectAll("path")
            .data(geojson.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("stroke", "#111")
            .attr("stroke-width", 1)
            // // Popular
            // .attr("fill", function(d) {
            //     var countryData = electionData[countryCodes[d.properties.name]];
            //     var maxLeaning = Object.keys(countryData).reduce(function(a, b) {
            //         return countryData[a] > countryData[b] ? a : b;
            //     });
            //     return colors[maxLeaning];
            // })
            // Growing
            .attr("fill", function(d) {
                var countryData = electionData[countryCodes[d.properties.name]];
                if (countryData) {
                    return colors[countryData.leaning];
                } else {
                    return "#ccc";
                }
            })        
            .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(countryCodes[d.properties.name])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            })
            .on("click", function(d) {
            var countryData = data[countryCodes[d.properties.name]];
            });

        svg.selectAll("text")
            .data(geojson.features)
            .enter()
            .append("text")
            .attr("transform", function(d) {
                return "translate(" + path.centroid(d) + ")";
            })
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "black")
            // // Popular
            // .text(function(d) {
            //     var countryData = electionData[countryCodes[d.properties.name]];
            //     var maxLeaning = Object.keys(countryData).reduce(function(a, b) {
            //         return countryData[a] > countryData[b] ? a : b;
            //     });
            //     return Math.round(countryData[maxLeaning]) + "%";
            // })
            // Growing
            .text(function(d) {
                var countryData = electionData[countryCodes[d.properties.name]];
                // return countryData.leaning + ": " + Math.round(countryData.growth) + "%";
                return Math.round(countryData.growth) + "%";
            })
            .style("font-weight", "bold");
        };

    function getPopularElectionData(data,n) {
        var leanings = ['far-left', 'left', 'center-left', 'center', 'center-right', 'right', 'far-right'];

        var countryData = {};
        
        for (var country in data) {
            var elections = data[country].election_data;
            var leaningData = data[country].leaning_data;
        
            var sortedElectionYears = Object.keys(elections).sort();
            var nthLatestElectionYear = sortedElectionYears[sortedElectionYears.length - n];
            var nthLatestElection = elections[nthLatestElectionYear];
        
            var totalVotes = 0;
            var leaningVotes = {};
            for (var i = 0; i < leanings.length; i++) {
                leaningVotes[leanings[i]] = 0;
            }
        
            for (var party in nthLatestElection) {
                var partyVotes = nthLatestElection[party];
                totalVotes += partyVotes;
        
                for (var i = 0; i < leanings.length; i++) {
                    var leaning = leanings[i];
                    var partiesInLeaning = leaningData[leaning];
        
                    if (partiesInLeaning.includes(party)) {
                        leaningVotes[leaning] += partyVotes;
                    }
                }
            }
        
            var leaningPercentages = {};
            var totalLeaningVotes = 0;
            for (var leaning in leaningVotes) {
                totalLeaningVotes += leaningVotes[leaning];
            }
            for (var leaning in leaningVotes) {
                leaningPercentages[leaning] = (leaningVotes[leaning] / totalLeaningVotes) * 100;
            }

            countryData[country] = leaningPercentages;
        }
        return countryData;
    } 

    function getGrowingElectionData(data, n) {
        var leanings = ['far-left', 'left', 'center-left', 'center', 'center-right', 'right', 'far-right'];
    
        var countryData = {};
        
        for (var country in data) {
            var elections = data[country].election_data;
            var leaningData = data[country].leaning_data;
        
            var sortedElectionYears = Object.keys(elections).sort();
            var nthLatestElectionYear = sortedElectionYears[sortedElectionYears.length - n];
            var nthLatestElection = elections[nthLatestElectionYear];
            var previousElectionYear = sortedElectionYears[sortedElectionYears.length - n - 1];
            var previousElection = elections[previousElectionYear];
        
            var totalVotes = 0;
            var leaningVotes = {};
            var previousLeaningVotes = {};
            for (var i = 0; i < leanings.length; i++) {
                leaningVotes[leanings[i]] = 0;
                previousLeaningVotes[leanings[i]] = 0;
            }
        
            for (var party in nthLatestElection) {
                var partyVotes = nthLatestElection[party];
                totalVotes += partyVotes;
        
                for (var i = 0; i < leanings.length; i++) {
                    var leaning = leanings[i];
                    var partiesInLeaning = leaningData[leaning];
        
                    if (partiesInLeaning.includes(party)) {
                        leaningVotes[leaning] += partyVotes;
                    }
                }
            }
        
            for (var party in previousElection) {
                var partyVotes = previousElection[party];
        
                for (var i = 0; i < leanings.length; i++) {
                    var leaning = leanings[i];
                    var partiesInLeaning = leaningData[leaning];
        
                    if (partiesInLeaning.includes(party)) {
                        previousLeaningVotes[leaning] += partyVotes;
                    }
                }
            }
        
            var leaningGrowth = {};
            for (var leaning in leaningVotes) {
                var currentPercentage = (leaningVotes[leaning] / totalVotes) * 100;
                var previousPercentage = (previousLeaningVotes[leaning] / totalVotes) * 100;
                leaningGrowth[leaning] = currentPercentage - previousPercentage;
            }
    
            var maxGrowthLeaning = Object.keys(leaningGrowth).reduce(function(a, b) {
                return leaningGrowth[a] > leaningGrowth[b] ? a : b;
            });
    
            countryData[country] = {
                leaning: maxGrowthLeaning,
                growth: leaningGrowth[maxGrowthLeaning]
            };
        }
        return countryData;
    };
});
