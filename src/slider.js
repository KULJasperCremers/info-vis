function setupSlider(slider, dates, years) {
    console.log(`years: ${years}`)
    var sliderOptions = {
        margin: 0.5,
        start: [timestamp(dates.at(0)), timestamp(dates.at(-1))],
        connect: true, 
        range: {
            'min': timestamp(dates.at(0)),
            'max': timestamp(dates.at(-1))
        },
        pips: {
            mode: 'values',
            values: years,
            density: dates.length,
            snap: true 
        }
    };

    if (slider.noUiSlider) {
        slider.noUiSlider.destroy();
    }
        
    noUiSlider.create(slider, sliderOptions);

    var previousValues = slider.noUiSlider.get().map(Number);

    function handleSlideOrClick(years) {
        var values = slider.noUiSlider.get().map(Number);
        var toMove;
        var indexToMove;
        if (values[0] !== previousValues[0]) {
            toMove = values[0];
            indexToMove = 0;
        } else if (values[1] !== previousValues[1]) { 
            toMove = values[1];
            indexToMove = 1;
        }

        if ((years[0] === previousValues[0] && years[1] === previousValues[1] && toMove > years[0] && indexToMove == 0) || 
            (years[years.length - 2] === previousValues[0] && years[years.length - 1] === previousValues[1] && toMove < years[years.length - 1] && indexToMove == 1)) {
            slider.noUiSlider.set(previousValues);
            return;
        }

        for (var i = 1; i < years.length - 2; i++) {
            if ((years[i] === previousValues[0] && years[i + 1] === previousValues[1] && toMove < years[i]) || 
                (years[i] === previousValues[1] && years[i + 1] === previousValues[0] && toMove > years[i + 1])) {
                slider.noUiSlider.set(previousValues);
                return;
            }
        }      

        console.log(`years after: ${years}`)
        var closestYear = years.reduce((prev, curr) => Math.abs(curr - toMove) < Math.abs(prev - toMove) ? curr : prev);
    
        if (values[1 - indexToMove] === closestYear) {
            var yearsWithoutClosest = years.filter(year => year !== closestYear);
            closestYear = yearsWithoutClosest.reduce((prev, curr) => Math.abs(curr - toMove) < Math.abs(prev - toMove) ? curr : prev);
        }
    
        values[indexToMove] = closestYear;

        if (years.includes(values[0]) && years.includes(values[1])) {
            slider.noUiSlider.set(values);
            previousValues = slider.noUiSlider.get().map(Number);
        }
    
        selectedFromDate = Math.min(...values);
        selectedToDate = Math.max(...values);
    
        colorMap();
        displayGraphs();
        userActionInProgress = false;
    }

    slider.noUiSlider.on('slide', () => handleSlideOrClick(years));
}
