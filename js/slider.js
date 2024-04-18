var createSlider = function(UIElement, years, option) {
    // Remove old ticks and labels
    $(UIElement).find('.ui-slider-tick-mark, .ui-slider-year-label').remove();

    // If "Single Year" is selected, hide the right handle
    if (option === "Single Year") {
        $(UIElement).find('.ui-slider-handle').last().hide();
    } else {
        $(UIElement).find('.ui-slider-handle').show();
    }


    // Convert years to numbers
    var numericYears = years.map(Number);
    $(UIElement).slider({
        range: option === "Two Years",
        min: numericYears[0],
        max: numericYears[numericYears.length - 1],
        values: option === "Two Years" ? [numericYears[numericYears.length - 2], numericYears[numericYears.length - 1]] : [numericYears[numericYears.length - 1]],

        stop: function(event, ui) {
            var closestYear, index, leftYear, rightYear;
        
            // Calculate the click point in years
            var clickPoint = numericYears[0] + (numericYears[numericYears.length - 1] - numericYears[0]) * (event.clientX - $(this).offset().left) / $(this).width();
        
            // Find the closest year in numericYears to the click point
            closestYear = numericYears.reduce((prev, curr, i) => {
                if (Math.abs(curr - clickPoint) < Math.abs(prev - clickPoint)) {
                    index = i;
                    return curr;
                } else {
                    return prev;
                }
            });
        
            if (option === "Single Year") {
                // Move the handle to the closest year
                $(this).slider('values', 0, closestYear);
        
                // Print the selected year
                console.log("Selected year: " + closestYear);
            } else if (option === "Two Years") {
                // If the click point is closer to the left handle or exactly between the two handles
                if (Math.abs(ui.values[0] - clickPoint) <= Math.abs(ui.values[1] - clickPoint)) {
                    leftYear = closestYear;
                    rightYear = index < numericYears.length - 1 ? numericYears[index + 1] : numericYears[index]; // If there is no next year, keep the current one
                } else { // If the click point is closer to the right handle
                    rightYear = closestYear;
                    leftYear = index > 0 ? numericYears[index - 1] : numericYears[index]; // If there is no previous year, keep the current one
                }
        
                // Move the handles to the closest years
                $(this).slider('values', [leftYear, rightYear]);
        
                // Print the selected years
                console.log("Selected years: " + leftYear + ", " + rightYear);
            }
        }
    });
    

    $.each(numericYears, function(i, year) {
        var tick = $('<span class="ui-slider-tick-mark"></span>').css('left', ((year - numericYears[0]) / (numericYears[numericYears.length - 1] - numericYears[0]) * 100) + '%');
        tick.appendTo(UIElement);
        $('<span class="ui-slider-year-label"></span>').text(String(year).slice(-2)).css({
            'position': 'absolute',
            'left': ((year - numericYears[0]) / (numericYears[numericYears.length - 1] - numericYears[0]) * 100) + '%',
            'top': '20px',
            'transform': 'translateX(-50%)'
        }).appendTo(UIElement);
    });

    $(UIElement).css({
        'width': '500px',
        'margin-left': '50px'
    });
}