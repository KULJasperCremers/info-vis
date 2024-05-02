function leaning_trend(country) {
         // Satisfaction trend
         var countries = Object.keys(cdata);
         var years = mapYears(cdata,countries);
         // console.log(aggregatedsurveyData);
 
         var fromData = getLeaningDataAtIndex(cdata, countryCodes[selectedCountry], selectedElectionYearIndex_From);
         var toData =  getLeaningDataAtIndex(cdata, countryCodes[selectedCountry], selectedElectionYearIndex_To);
  
         function normalize(data) {
            let t = 0;
            for (let i = 0; i < data.length; i++) {
                t +=  data[i];
            }
            for (let i = 0; i < data.length; i++) {
                data[i] /= t;
            }
            return data
         }
    
         fromDataNormalized = normalize(fromData);
         toDataNormalized = normalize(toData);

         // Growth
         let growthData = [];
         Object.keys(toDataNormalized).forEach(key => {
             growthData.push({
                 name: key,
                 value: toDataNormalized[key] - fromDataNormalized[key]
             });
         });

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

         var xScale = d3.scaleBand()
        .range([0, width])
        .domain(growthData.map(d => d.name))
        .padding(0.1);

        var yScale = d3.scaleLinear()
            .range([height, 0])
            .domain([d3.min(growthData, d => d.value), d3.max(growthData, d => d.value)]).nice();

        // Add bars
        svg4.selectAll(".bar")
            .data(growthData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.name))
            .attr("y", d => yScale(Math.max(0, d.value)))
            .attr("width", xScale.bandwidth())
            .attr("height", d => Math.abs(yScale(d.value) - yScale(0)))
            .attr('fill', function(d) {
                return d.value > 0 ? "#91BFDB" : "#FC8D59";
            });

        // Add axes
        svg4.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")  // select all the text elements for the xaxis
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

        svg4.append("g")
            .call(d3.axisLeft(yScale));

        svg4.append("text")
            .attr("class", "title")
            .attr("x", width / 2)
            .attr("y", 5) 
            .attr("text-anchor", "middle")
            .style("font-size", "1.5rem") 
            .text("Leaning growth");
}