function mostpopularleaning(cdata, div_id) {

     // Barchart Leaning
        // First, select the div where you want to append the SVG
        const div2 = d3.select(div_id);
 
        const leaningData = getLeaningDataAtIndex(cdata, countryCodes[selectedCountry], selectedElectionYearIndex_To);
        var data = Object.keys(leaningData).map(function(key) {
            return { party: key, value: leaningData[key] };
        });

        var svgWidth = cellSize, svgHeight = cellSize;
        var margin = { top: 20, right: 20, bottom: 70, left: 50 };
        var width = svgWidth - margin.left - margin.right;
        var height = svgHeight - margin.top - margin.bottom;

        var svg2 = d3.select(div_id)
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var x = d3.scaleBand().range([0, width]).padding(0.1),
        y = d3.scaleLinear().range([height, 0]);

        x.domain(data.map(function(d) { return d.party; }));
        y.domain([0, d3.max(data, function(d) { return d.value; })]);

        svg2.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

        svg2.append('g')
        .call(d3.axisLeft(y));

        // Draw the bars
        svg2.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) { return x(d.party); })
        .attr('y', function(d) { return y(d.value); })
        .attr('width', x.bandwidth())
        .attr('height', function(d) { return height - y(d.value); })
        .attr('fill', 'steelblue');

        svg2.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", 5) 
        .attr("text-anchor", "middle")
        .style("font-size", "1.5rem") 
        .text("Leanings");

}