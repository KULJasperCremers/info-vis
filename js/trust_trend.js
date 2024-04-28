function trust_trend(cdata, div_id) {
    // Satisfaction trend
    var countries = Object.keys(cdata);
    var years = mapYears(cdata,countries);
    var aggregatedsurveyData = aggregateSurveyData(cdata,years);
    // console.log(aggregatedsurveyData);

    var hapinessDataFrom = querySurveyDataCountryYearColumn(aggregatedsurveyData,years,countryCodes[selectedCountry],selectedElectionYearIndex_From,"trust_country")["sum"];
    var hapinessDataTo =  querySurveyDataCountryYearColumn(aggregatedsurveyData,years,countryCodes[selectedCountry],selectedElectionYearIndex_To,"trust_country")["sum"];

    var hapinessDataFrom = concatd(hapinessDataFrom);
    var hapinessDataTo = concatd(hapinessDataTo);

    var totalFrom = 0;
    var totalTo = 0;
    for (let i = 0; i < 7; i++) {
        totalFrom += hapinessDataFrom[i];
        totalTo += hapinessDataTo[i];
    }

    function concatd(data) {

        var new_data = {}

        for (var i = 0; i < 10; i++) {
            var index = leanings_ess_indices[i];  // Assuming this gets an index for new_data keys
    
            // Check if the key exists in new_data using hasOwnProperty
            if (!new_data.hasOwnProperty(index)) {
                new_data[index] = 0;
            }

            if (data.hasOwnProperty(i)) {  // Check if data has the property i
                new_data[index] += data[i];  // Add the value directly, assuming data[i] is numeric
            }
        }

        console.log(new_data);

        return new_data;
    }

    var data = Object.keys(hapinessDataFrom).map(function(key) {
        return { party: leanings[key], value: ((hapinessDataTo[key] / totalTo) - (hapinessDataFrom[key] / totalFrom)) * 100 };
    });

    console.log(data);


    // First, select the div where you want to append the SVG
    const div4 = d3.select(div_id);
    div4.selectAll("svg").remove();

    var svgWidth = cellSize, svgHeight = cellSize;
    var margin = { top: 20, right: 20, bottom: 70, left: 50 };
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var svg4 = d3.select(div_id)
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x = d3.scaleBand().range([0, width]).padding(0.1),
    y = d3.scaleLinear().range([height, 0]);

    x.domain(data.map(function(d) { return d.party; }));
    y.domain([d3.min(data, function(d) { return d.value; }), d3.max(data, function(d) { return d.value; })]);

    svg4.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

    svg4.append('g')
    .call(d3.axisLeft(y));

    // Draw the bars
    svg4.selectAll('.bar')
    .data(data)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', function(d) { return x(d.party); })
    .attr('y', function(d) {
        // Position starts from zero or from the value depending on the sign
        return d.value > 0 ? y(d.value) : y(0);
    })
    .attr('width', x.bandwidth())
    .attr('height', function(d) {
        return Math.abs(y(d.value) - y(0));
    })
    .attr('fill', function(d) {
        return d.value > 0 ? "#91BFDB" : "#FC8D59";
    });

    svg4.append("line")
    .style("stroke", "black")  
    .style("stroke-width", 1)  
    .attr("x1", 0)             
    .attr("y1", y(0))          
    .attr("x2", width)         
    .attr("y2", y(0)); 

    svg4.append("text")
    .attr("class", "title")
    .attr("x", width / 2)
    .attr("y", 5) 
    .attr("text-anchor", "middle")
    .style("font-size", "1.5rem") 
    .text("Trust");
}