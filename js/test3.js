// Define the dimensions of the SVG container
let svgWidth = 500;
let svgHeight = 400;

// Define margins
let margin = {top: 10, right: 30, bottom: 50, left: 50};

// Adjust the width and height to account for margins
let maxWidth = svgWidth - margin.left - margin.right;
let maxHeight = svgHeight - margin.top - margin.bottom;

// Load the data
d3.json("combined_data.json").then(function(data) {
    // let preparedData = prepareCountryData(data, "LU");
    // let preparedData = prepareAllCountriesData(data);

    // for (let country in preparedData) {
    //     let countryData = preparedData[country];
    //     let svg = createSvgContainer();
    //     let chart = createChart(svg);
    //     let {xScale, yScale} = createScales(countryData);

    //     createAxes(chart, xScale, yScale, Object.keys(countryData).map(year => new Date(year)), maxHeight);
    //     let lineGenerators = createLineGenerators(data, xScale, yScale);

    //     let colorForLeaning = d3.scaleOrdinal(d3.schemeCategory10);
    //     createLines(chart, countryData, lineGenerators, colorForLeaning);
    //     // createLegend(chart, lineGenerators, xScale, yScale, countryData, colorForLeaning);
    //     addGridlines(chart, yScale, maxWidth);
    // }

    let aggregatedData = aggregateData(data);
    console.log(aggregatedData)

    let preparedData = [];
    for (let orientation in aggregatedData) {
      for (let year in aggregatedData[orientation]) {
        preparedData.push({
          orientation: orientation,
          year: year,
          value: aggregatedData[orientation][year]
        });
      }
    }

    // Create scales
    let xScale = d3.scalePoint()
    .domain(["oldest", "3rd latest", "2nd latest", "latest"])
    .range([0, maxWidth]);

    // // linear scale for y axis
    // let yScale = d3.scaleLinear()
    // .domain([0, d3.max(preparedData, d => d.value)])
    // .range([maxHeight, 0]);

    // log scale for y axis
    let yScale = d3.scaleLog()
    .domain([d3.min(preparedData, d => d.value), d3.max(preparedData, d => d.value)])
    .range([maxHeight, 0]);

    // Create line generator
    let lineGenerator = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.value));

    // Create SVG and chart
    let svg = createSvgContainer();
    let chart = createChart(svg);

    // Create axes
    createAxes(chart, xScale, yScale, ["oldest", "3rd latest", "2nd latest", "latest"], maxHeight);

    // Create lines
    let orientations = Array.from(new Set(preparedData.map(d => d.orientation)));
    let colorForLeaning = d3.scaleOrdinal(d3.schemeCategory10).domain(orientations);

    for (let orientation of orientations) {
        let orientationData = preparedData.filter(d => d.orientation === orientation);
        createLines(chart, orientationData, lineGenerator, colorForLeaning, orientation);
    }

    // Add gridlines
    addGridlines(chart, yScale, maxWidth);

    // Create legend
    let chartWidth = maxWidth - margin.left - margin.right;
    createLegend(chart, orientations, colorForLeaning, chartWidth);
})

function createSvgContainer() {
    // Create the SVG container
    let svg = d3.select("body")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g");

    d3.select("svg").style("overflow", "visible");

    return svg
}

function createChart(svg) {
    let chart = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    return chart;
}

function createScales(preparedData) {
    let dates =  Object.keys(preparedData).map(year => new Date(year));
    let xScale = d3.scaleTime()
        .domain(d3.extent(dates))
        .range([0, Math.min(svgWidth, maxWidth)]);
    let yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([maxHeight, 0]);

    return {xScale, yScale};
}

// function createAxes(chart, xScale, yScale, dates, maxHeight) {
//     // Create the X Axis
//     chart.append("g")
//         .attr("transform", "translate(0," + maxHeight + ")")
//         .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")).tickValues(dates));

//     // Create the Y Axis
//     chart.append("g")
//         .call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")));
// }

function createAxes(chart, xScale, yScale, labels, maxHeight) {
    // Create the X Axis
    chart.append("g")
        .attr("transform", "translate(0," + maxHeight + ")")
        .call(d3.axisBottom(xScale).tickValues(labels));

    // Create the Y Axis
    chart.append("g")
        .call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")));
}

function createLineGenerators(data, xScale, yScale) {
    let lineGenerators = {};
    for (let leaning in data["BE"]["leaning_data"]) {
        lineGenerators[leaning] = d3.line()
            .x((d) => xScale(d.year))
            .y((d) => yScale(d[leaning]));
    }

    return lineGenerators;
}

// function createLines(chart, preparedData, lineGenerators, colorForLeaning) {
//     for (let leaning in lineGenerators) {
//         chart.append("path")
//             .datum(Object.entries(preparedData).map(([year, data]) => ({year: new Date(year), ...data})))
//             .attr("fill", "none")
//             .attr("stroke", colorForLeaning(leaning)) // Define this function to return a color for each leaning
//             .attr("stroke-width", 1.5)
//             .attr("d", lineGenerators[leaning]);
//     }
// }

function createLines(chart, preparedData, lineGenerator, colorForLeaning, orientation) {
    chart.append("path")
      .datum(preparedData)
      .attr("fill", "none")
      .attr("stroke", colorForLeaning(orientation))
      .attr("stroke-width", 1.5)
      .attr("d", lineGenerator);
  }

// function createLegend(chart, lineGenerators, xScale, yScale, preparedData, colorForLeaning) {
//     // Create the legend
//     let legend = chart.selectAll(".legend")
//         .data(Object.keys(lineGenerators))
//         .enter().append("g")
//         .attr("class", "legend");

//     legend.append("text") // append a text for each legend
//         .attr("x", d => xScale(d3.max(Object.keys(preparedData), d => new Date(d))) + 45) // 45 positions the text right after the line
//         .attr("y", d => yScale(preparedData[d3.max(Object.keys(preparedData))][d]))
//         .text(d => d)
//         .style("fill", d => colorForLeaning(d));
// }

function createLegend(chart, orientations, colorForLeaning, chartWidth) {
    // Define the size and position of the legend
    const legendWidth = 18;
    const legendHeight = 18;
    const legendSpacing = 4;
    const legendX = chartWidth + 100; // adjust this value to move the legend to the right of the graph

    // Create the legend
    let legend = chart.selectAll(".legend")
        .data(orientations)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * (legendHeight + legendSpacing)})`);

    // Add the color squares
    legend.append("rect")
        .attr("x", legendX)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", colorForLeaning);

    // Add the text labels
    legend.append("text")
        .attr("x", legendX + legendWidth + legendSpacing)
        .attr("y", legendHeight / 2)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d);
}

function addGridlines(chart, yScale, maxWidth) {
    // Add the Y gridlines
    chart.append("g")			
        .attr("class", "grid")
        .call(d3.axisLeft(yScale)
            .tickSize(-maxWidth)
            .tickFormat("")
        )
        .selectAll("line")
        .style("stroke-opacity", 0.1);
}

function aggregateData(data) {
    let aggregatedData = {};

    // let groups = {
    //     "left": ["far-left", "left"],
    //     "center": ["center-left","center","center-right"],
    //     "right": ["far-right", "right"]
    // };

    for (let country in data) {
        let countryData = data[country].election_data;
        let leaningData = data[country].leaning_data;

        let years = Object.keys(countryData).sort().slice(-4); // Get the last 4 election years

        for (let i = 0; i < years.length; i++) {
            let year = years[i];
            let yearData = countryData[year];

            // for (let group in groups) {
            //     if (!aggregatedData[group]) {
            //         aggregatedData[group] = {};
            //     }

            //     let electionYear = `election year ${4 - i}`; // Label the years as "election year 1", "election year 2", etc.

            //     if (!aggregatedData[group][electionYear]) {
            //         aggregatedData[group][electionYear] = 0;
            //     }

            //     let total = groups[group].reduce((total, subgroup) => {
            //         let parties = leaningData[subgroup] || [];
            //         return total + parties.reduce((partyTotal, party) => partyTotal + (yearData[party] || 0), 0);
            //     }, 0);

            //     aggregatedData[group][electionYear] += total;
            // }
            for (let orientation in leaningData) {
                if (!aggregatedData[orientation]) {
                    aggregatedData[orientation] = {};
                }

                let yearMapping = {
                    4: "oldest",
                    3: "3rd latest",
                    2: "2nd latest",
                    1: "latest"
                };
                
                let electionYear = yearMapping[4 - i];

                if (!aggregatedData[orientation][electionYear]) {
                    aggregatedData[orientation][electionYear] = 0;
                }

                let parties = leaningData[orientation] || [];
                let total = parties.reduce((partyTotal, party) => partyTotal + (yearData[party] || 0), 0);

                aggregatedData[orientation][electionYear] += total;
            }
        }
    }

    // Calculate the total for each election group separately
    let totals = {};
    for (let group in aggregatedData) {
        let groupData = aggregatedData[group];
        for (let electionYear in groupData) {
            if (!totals[electionYear]) {
                totals[electionYear] = 0;
            }
            totals[electionYear] += groupData[electionYear];
        }
    }

    // Normalize the data
    for (let group in aggregatedData) {
        let groupData = aggregatedData[group];
        for (let electionYear in groupData) {
            groupData[electionYear] /= totals[electionYear];
        }
    }

    return aggregatedData;
}

function prepareCountryData(data,country) {
    let allCountriesData = {};
    let countryData = data[country];
    let preparedData = {};

    let groups = {
        "left": ["far-left", "left"],
        "center": ["center-left","center","center-right"],
        "right": ["far-right", "right"]
    }

    for (let year in countryData["election_data"]) {
        let electionData = countryData["election_data"][year];
        let yearData = {};
        let yearTotal = 0;

        for (let group in groups) {
            let total = 0
    
            for (let leaning of groups[group]) {
                let parties = countryData["leaning_data"][leaning];

                for (let party of parties) {
                    if (party in electionData) {
                        total += electionData[party];
                    }
                }
            }

            yearData[group] = total;
            yearTotal += total;
        }

        // Normalize the data
        for (let group in yearData) {
            yearData[group] /= yearTotal;
        }    

        preparedData[year] = yearData;
    }

    allCountriesData[country] = preparedData
    return allCountriesData;
}

function prepareAllCountriesData(data) {
    let allCountriesData = {};

    for (let country in data) {
        let countryData = data[country];
        let preparedData = {};

        for (let year in countryData["election_data"]) {
            let electionData = countryData["election_data"][year];
            let yearData = {};
            let yearTotal = 0;
            
            let groups = {
                "left": ["far-left", "left"],
                "center": ["center-left","center","center-right"],
                "right": ["far-right", "right"]
            }

            for (let group in groups) {
                let total = 0
        
                for (let leaning of groups[group]) {
                    let parties = countryData["leaning_data"][leaning];
    
                    for (let party of parties) {
                        if (party in electionData) {
                            total += electionData[party];
                        }
                    }
                }
    
                yearData[group] = total;
                yearTotal += total;
            }

            // Normalize the data
            for (let group in yearData) {
                if (groups.hasOwnProperty(group)) {
                    yearData[group] /= yearTotal;
                }
            }    

            preparedData[year] = yearData;
        }

        allCountriesData[country] = preparedData;
    }

    return allCountriesData;
}