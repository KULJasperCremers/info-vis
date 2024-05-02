function circles(cdata, div_id) {
    const div1 = d3.select(div_id);
        
        const svg1 = div1.append("svg")
        .attr("width", cellSize) 
        .attr("height", cellSize)

        const flattenedCircles = getPercentageCircles(cdata, countryCodes[selectedCountry], selectedElectionYearIndex_To, 1000, 1000)

        // Draw circles
        svg1.selectAll("circle")
            .data(flattenedCircles)
            .enter().append("circle")
            .attr("cx", d => d.cx / 2)
            .attr("cy", d => d.cy / 2)
            .attr("r", d => d.radius)
            .style("fill", (d, i) => d.color);
     
       
}