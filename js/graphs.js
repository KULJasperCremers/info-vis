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

var filteredDataByLeaning;
var xPositions = { 
    "far-right": {},
    "right": {},
    "center-right": {},
    "center": {},
    "center-left": {},
    "left": {},
    "far-left": {}
};

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function displayGraphElection(country, date1, date2, svg) {
    var growthData = [];
    var allYears = [];
    for (var year in data[countryCodes[country]]) {
        if (year >= date1 && year <= date2) {
            for (var leaning in data[countryCodes[country]][year]) {
                var growth = data[countryCodes[country]][year][leaning];
                growthData.push({
                    leaning: leaning,
                    year: year,
                    growth: growth
                })
                allYears.push(year);
            }
        }
    }

    var growthMin = d3.min(growthData, function(d) { return d.growth; });
    var growthMax = d3.max(growthData, function(d) { return d.growth; });

    var growthScale = d3.scaleLinear()
    .domain([growthMin, growthMax + growthMax * 0.1])
        .range([growthMin, growthMax]);

    var graphContainer = document.getElementById('graph').parentNode;

    var width = graphContainer.clientWidth;
    var height = graphContainer.clientHeight - 110;

    svg = d3.select(graphContainer)
    .append("svg")
        .attr("id", "electionGraph")
        .attr("width", width - 25)
        .attr("height", height / 1.75);

    var xAxisMargin = 70;

    x = d3.scalePoint()
    .domain(allYears)
    .range([xAxisMargin, width - 25 - xAxisMargin]); 

    y = d3.scaleLinear()
    .domain([growthMin, growthMax])
    .range([height / 2 - 20, 25]);

    svg.append("g")
    .attr("transform", "translate(" + xAxisMargin + ",0)")
    .call(d3.axisLeft(y).ticks(5));

    svg.selectAll(".grid-line")
        .data(x.domain())
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("stroke", "#ccc")
        .attr("stroke-opacity", 0.9) 
        .attr("y1", 0)
        .attr("y2", y(0))
        .attr("x1", function(d) { return x(d); })
        .attr("x2", function(d) { return x(d); });

    var color = d3.scaleOrdinal()
    .domain(["far-left", "left", "center-left", "center", "center-right", "right", "far-right"])
    .range(["#e31a1c", "#fb9a99", "#b2df8a", "#33a02c", "#a6cee3", "#1f78b4", "#fdbf6f"]);

    var line = d3.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.growth); });

    var dataByLeaning = Array.from(d3.group(growthData, d => d.leaning));

    dataByLeaning = dataByLeaning.map(([key, values]) => {
        return [key, values.map(d => ({...d, growth: growthScale(d.growth)}))];
    });

    filteredDataByLeaning = dataByLeaning.filter(function([key, values]) {
        for (var l in selectedLeanings) {
            if (leaning_mapper[selectedLeanings[l]] == key) {
                return true;
            }
        }
        return false;
    });

    filteredDataByLeaning.forEach(function([key, values]) {
        values.forEach(function(d) {
            var xPos = x(d.year);
            var yPos = y(d.growth)-10;
            xPositions[key][d.year] = {x: xPos, y: yPos}
        });

        svg.append("path")
        .datum(values)
        .attr("fill", "none")
        .attr("stroke", color(key))
        .attr("stroke-width", 4)
        .attr("class", "line " + key.replace(/\s+/g, '-')) 
        .attr("d", line)
        .on("mouseover", function() {
            colorMap(key);
            d3.selectAll(".line").style("opacity", 0.1);  
            d3.selectAll("." + key.replace(/\s+/g, '-')).style("opacity", 1);  // Highlight the hovered line

            values.forEach(function(d) {
                var xPos = x(d.year);
                var yPos = y(d.growth)-10;
                svg.append("text")
                .attr("x", xPos) 
                .attr("y", yPos) 
                .attr("class", "x-value")
                .text(d.growth.toFixed(1));
            });
    
            var checkboxes = document.querySelectorAll('#radio-leanings .form-check-input[type="checkbox"]');
            checkboxes.forEach(element => {
                if (element.id !== "radio-" + key) {
                    element.disabled = true;
                }
            });

            // Barchart switch!!
            displayGraphs(true, key);
            radios.forEach((radio) => {
                if (radio.checked) {
                    previousSelection = radio;
                    radio.checked = false;
                }
            });
        })
        .on("mouseout", function() {
            colorMap();
            d3.selectAll(".line").style("opacity", 1);

            d3.selectAll(".x-value").remove();

            var checkboxes = document.querySelectorAll('#radio-leanings .form-check-input[type="checkbox"]');
            checkboxes.forEach(element => {
                    element.disabled = false;
            });

            // Barchart switch!!
            displayGraphs()
            if (previousSelection) {
                previousSelection.checked = true;
            }
        });
    });

    var xAxis = svg.append("g")
    .attr("transform", "translate(0," + y(0) + ")")
    .call(d3.axisBottom(x));

    xAxis.selectAll("text")
    .attr("dy", "1em");

    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 20)
    .attr("x",0 - (height / 4))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Vote Percentages");

    svg.append("rect")
        .attr("x",  (width * 1.5) / 4) 
        .attr("y", 0)
        .attr("width", width / 4) 
        .attr("height", 50) 
        .attr("fill", "#e2e2e2"); 


        svg.append("text")
        .attr("x", (width - 25) / 2) 
        .attr("y", 30) 
        .attr("text-anchor", "middle") 
        .style("font-size", "24px") 
        .text("Election Growth"); 

    return svg
}

function displayGraphSurvey(country, date1, date2, svg, type) {
    var surveyString = "";
    var growthData = [];
    var allYears = [];
    for (var year in surveyData[countryCodes[country]]) {
        if (year >= date1 && year <= date2) {
            for (var leaning in surveyData[countryCodes[country]][year]) {
                var growth = surveyData[countryCodes[country]][year][leaning];

                if (type === "happy") {
                    growthData.push({
                        leaning: leaning,
                        year: year,
                        growth: growth.happy
                    })
                    surveyString = "Happiness"
                }
                else if (type === "satisfaction") {
                    growthData.push({
                        leaning: leaning,
                        year: year,
                        growth: growth.satisfaction
                    })
                    surveyString = "Satisfaction"
                }
                else if (type === "trust_country") {
                    growthData.push({
                        leaning: leaning,
                        year: year,
                        growth: growth.trust_country
                    })
                    surveyString = "Trust in Country"
                }
                else if (type === "trust_eu") {
                    growthData.push({
                        leaning: leaning,
                        year: year,
                        growth: growth.trust_eu
                    })
                    surveyString = "Trust in EU"
                }
               
                allYears.push(year);
            }
        }
    }

    var growthMin = d3.min(growthData, function(d) { return d.growth; });
    var growthMax = d3.max(growthData, function(d) { return d.growth; });

    var growthScale = d3.scaleLinear()
        .domain([growthMin, growthMax + growthMax * 0.05])
        .range([growthMin, growthMax]);

    var graphContainer = document.getElementById('graph').parentNode;

    var width = graphContainer.clientWidth;
    var height = graphContainer.clientHeight - 210;

    svg = d3.select(graphContainer)
    .append("svg")
        .attr("id", "surveyGraph")
        .attr("width", width - 25)
        .attr("height", height / 1.75);

    var xAxisMargin = 70;

    var x = d3.scalePoint()
    .domain(allYears) 
    .range([xAxisMargin, width - 25 - xAxisMargin]);

    var y = d3.scaleLinear()
    .domain([growthMin, growthMax]) 
    .range([height / 2, 25]); 

    svg.append("g")
    .attr("transform", "translate(" + xAxisMargin + ",0)")
    .call(d3.axisLeft(y).ticks(5));

    svg.selectAll(".grid-line")
    .data(x.domain())
    .enter()
    .append("line")
    .attr("class", "grid-line")
    .attr("stroke", "#ccc")
    .attr("stroke-opacity", 0.9) 
    .attr("y1", 0) // Top of the graph
    .attr("y2", height / 2) // Bottom of the graph
    .attr("x1", function(d) { return x(d); })
    .attr("x2", function(d) { return x(d); });

    var color = d3.scaleOrdinal()
    .domain(["far-left", "left", "center-left", "center", "center-right", "right", "far-right"])
    .range(["#e31a1c", "#fb9a99", "#b2df8a", "#33a02c", "#a6cee3", "#1f78b4", "#fdbf6f"]);

    var line = d3.line()
        .x(function(d) { return x(d.year); }) 
        .y(function(d) { return y(d.growth); });

    var dataByLeaning = Array.from(d3.group(growthData, d => d.leaning));

    dataByLeaning = dataByLeaning.map(([key, values]) => {
        return [key, values.map(d => ({...d, growth: growthScale(d.growth)}))];
    });

    var filteredDataByLeaning2 = []
    
    var filteredDataByLeaning2 = dataByLeaning.filter(function([key, values]) {
        for (var l in selectedLeanings) {
            if (leaning_mapper[selectedLeanings[l]] == key) {
                return true;
            }
        }
        return false;
    });

    filteredDataByLeaning2.forEach(function([key, values]) {
    svg.append("path")
    .datum(values)
    .attr("fill", "none")
    .attr("stroke", color(key))
    .attr("stroke-width", 4)
    .attr("class", "line " + key.replace(/\s+/g, '-'))
    .attr("d", line)
    .on("mouseover", function() {
        colorMap(key);
        d3.selectAll(".line").style("opacity", 0.1);  
        d3.selectAll("." + key.replace(/\s+/g, '-')).style("opacity", 1);  // Highlight the hovered line

        values.forEach(function(d) {
            svg.append("text")
            .attr("x", x(d.year)) 
            .attr("y", y(d.growth)-10) 
            .attr("class", "x-value")
            .text(d.growth.toFixed(1));
        });

        var vals = filteredDataByLeaning.find(([leaning, v]) => key === leaning);
        vals[1].forEach(function(d) {
            var position = xPositions[d.leaning][d.year];
            // console.log(position)
            if (position) {
                graphSvg.append("text")
                .attr("x", position.x) 
                .attr("y", position.y) 
                .attr("class", "x-value")
                .text(d.growth.toFixed(1));
            }
        });

        var checkboxes = document.querySelectorAll('#radio-leanings .form-check-input[type="checkbox"]');
        checkboxes.forEach(element => {
            if (element.id !== "radio-" + key) {
                element.disabled = true;
            }
        });
    })
    .on("mouseout", function() {
        colorMap();
        d3.selectAll(".line").style("opacity", 1);

        d3.selectAll(".x-value").remove();

        var checkboxes = document.querySelectorAll('#radio-leanings .form-check-input[type="checkbox"]');
        checkboxes.forEach(element => {
                element.disabled = false;
        });
    });
    });

    var xAxis = svg.append("g")
    .attr("transform", "translate(0," + height / 2 + ")")
    .call(d3.axisBottom(x));

    xAxis.selectAll("text")
    .attr("dy", "1em"); 

    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 20)
    .attr("x",0 - (height / 4))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(`Scores (0-10)`);

    svg.append("rect")
    .attr("x",  (width * 1.5) / 4)
    .attr("y", 0) 
    .attr("width", width / 4) 
    .attr("height", 50) 
    .attr("fill", "#e2e2e2");

    svg.append("text")
    .attr("x", (width - 25) / 2) 
    .attr("y", 30) 
    .attr("text-anchor", "middle") 
    .style("font-size", "24px") 
    .text(surveyString);
}

function displayBarGraphSurvey(country, date1, date2, svgBarChart, leaning) {
    var growthData = [];
    var allYears = [];
    for (var year in surveyData[countryCodes[country]]) {
        if (year >= date1 && year <= date2) {
            var growth = surveyData[countryCodes[country]][year][leaning];
            growthData.push({
                leaning: leaning,
                year: year,
                happy: growth.happy,
                satisfaction: growth.satisfaction,
                trust_country: growth.trust_country,  
                trust_eu: growth.trust_eu  
                
            })
            allYears.push(year);
        }
    }

    var graphContainer = document.getElementById('graph').parentNode;

    var width = graphContainer.clientWidth;
    var height = graphContainer.clientHeight - 210;

    svgBarChart = d3.select(graphContainer)
        .append("svg")
        .attr("id", "surveyGraph")
        .attr("width", width - 25)
        .attr("height", height / 1.75);

    var xAxisMargin = 70;

    var x0 = d3.scaleBand()
        .domain(allYears)
        .rangeRound([xAxisMargin, width - 25 - xAxisMargin])
        .paddingInner(0.1);

    var x1 = d3.scaleBand()
        .domain(["happy", "satisfaction", "trust_country", "trust_eu"])
        .rangeRound([0, x0.bandwidth()])
        .padding(0.05);

    var y = d3.scaleLinear()
        .domain([0, 10])
        .range([height / 2, 25]);

    var color = d3.scaleOrdinal()
        .domain(["happy", "satisfaction", "trust_country", "trust_eu"])
        .range(["#FFCC0D", "#00796B", "#BF2669", "#637d92"]);

    var transformedData = growthData.map(function(d) {
        var values = [
            {category: "happy", value: d.happy},
            {category: "satisfaction", value: d.satisfaction},
            {category: "trust_country", value: d.trust_country},
            {category: "trust_eu", value: d.trust_eu}
        ];
        values.sort(function(a, b) { return a.value - b.value; });
        console.log(values)
        return {
            year: d.year,
            values: values
        };
    });

    svgBarChart.selectAll(".year")
    .data(transformedData)
    .enter().append("g")
    .attr("class", "year")
    .attr("transform", function(d) { return "translate(" + x0(d.year) + ",0)"; })
    .each(function(d) {
        // Update the x1 scale domain for each year based on the sorted values
        x1.domain(d.values.map(function(v) { return v.category; }));
        d3.select(this).selectAll("rect")
            .data(d.values)
            .enter().append("rect")
            .attr("width", x1.bandwidth())
            .attr("x", function(v) { return x1(v.category); })
            .attr("y", function(v) { return y(v.value); })
            .attr("height", function(v) { return height / 2 - y(v.value); })
            .attr("fill", function(v) { return color(v.category); });
    });
        
    var xAxis = svgBarChart.append("g")
        .attr("transform", "translate(0," + y(0) + ")")
        .call(d3.axisBottom(x0));

    xAxis.selectAll("text")
        .attr("dy", "1em"); 

    svgBarChart.append("g")
        .attr("transform", "translate(" + xAxisMargin + ",0)")
        .call(d3.axisLeft(y));

    svgBarChart.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 20)
    .attr("x",0 - (height / 4))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Scores (0-10)");

    var yAxis = svgBarChart.append("g")
    .attr("transform", "translate(" + xAxisMargin + ",0)")
    .call(d3.axisLeft(y));

    yAxis.selectAll("g.tick")
        .append("line")
        .classed("grid-line", true)
        .attr("stroke", "#ccc")
        .attr("opacity", 0.5)
        .attr("x1", 0)
        .attr("x2", width - 2 * xAxisMargin);

        svgBarChart.append("rect")
        .attr("x",  (width * 1.5) / 4)
        .attr("y", 0) 
        .attr("width", width / 4 - 40) 
        .attr("height", 50) 
        .attr("fill","#e2e2e2");

        svgBarChart.append("text")
            .attr("x", (width - 25) / 2) 
            .attr("y", 40) 
            .attr("text-anchor", "middle") 
            .style("font-size", "24px") 
            .text("All Surveys");
}