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

var leanings = ["far-left", "left", "center-left", "center", "center-right", "right", "far-right", "Other parties"];

var dataTypes = {
    "election": "election_data",
    "leaning": "leaning_data",
    "survey": "ess_data"
}

d3.json("../json/ess_data_all.json").then(function(data) {
    var countries = Object.keys(data);
    var years = mapYears(data,countries);

    var d0 = getAllCountriesYearDataAtIndex(data,dataTypes["election"],0);
    // var d7 = getAllCountriesYearDataAtIndex(data,dataTypes["election"],7);
    getGeoJsonData(d0).then(function(geojson) {
    });

    // console.log(getYearDataAtIndex(data,countryCodes["Belgium"],dataTypes["survey"],0));
    
    // console.log(getLeaningDataAtIndex(data,countryCodes["Belgium"],0));
    // console.log(getMostPopularLeaningData(data,countryCodes["Belgium"],0));
    // console.log(getBestGrowingLeaningData(data,countryCodes["Belgium"],0));

    var aggregatedsurveyData = aggregateSurveyData(data,years);
    // console.log(aggregatedsurveyData);
    var q1 = querySurveyDataCountryYearColumn(aggregatedsurveyData,years,countryCodes["Greece"],2,"happy");

    var splittedSurveyData = splitSurveyData(data,years);
    // console.log(splittedSurveyData);
   var q2 = querySurveyDataCountryYearLeaningColumn(splittedSurveyData,years,countryCodes["Belgium"],0,"far-left","happy");
});

// query the aggregated survey data for a specific country, year and column
function querySurveyDataCountryYearColumn(surveyData,mapYears,country,year,column) {
    var y = mapYears[country].surveyYears[year];
    return surveyData[country][y][column];
}


// query the splitted survey data for a specific country, year, leaning and column
function querySurveyDataCountryYearLeaningColumn(surveyData,mapYears,country,year,leaning,column) {
    var y = mapYears[country].surveyYears[year];
    return surveyData[country][y][leaning].map(d => d[column]);
}

// split all the ess survey data for each country, each year and for each leaning
// saves all rows (= 1 datapoint) that hold all the column values
function splitSurveyData(data, mapYears) {
    var countries = Object.keys(data);
    var splitData = {};

    countries.forEach(c => {
        splitData[c] = {};
        Object.keys(mapYears[c].surveyYears).forEach((i) => {
            var y = mapYears[c].surveyYears[i];
            splitData[c][y] = {                        
                "far-left": [],
                "left": [],
                "center-left": [],
                "center": [],
                "center-right": [],
                "right": [],
                "far-right": []        
            };

            var surveyData = getYearDataAtIndex(data,c,dataTypes["survey"],i);
            var rowLength = surveyData["leaning"].length;

            for (var i=0; i<rowLength; i++) {
                var row = {};
                for (var column in surveyData) {
                    row[column] = surveyData[column][i];
                }

                splitData[c][y][row["leaning"]].push(row);
            }
        });
    });

    return splitData; 
}

// return the best growing leaning for a specific country and year (= index)
// compared to the previous year (= index+1)
function getBestGrowingLeaningData(data,country,index) {
    var leaningData = getLeaningDataAtIndex(data,country,index);
    var previousLeaningData = getLeaningDataAtIndex(data,country,index+1);

    var maxGrowth = 0;
    var bestGrowingLeaning = "";
    for (var leaning in leaningData) {
        var growth = leaningData[leaning] - previousLeaningData[leaning];
        if (growth > maxGrowth) {
            maxGrowth = growth;
            bestGrowingLeaning = leaning;
        }
    }

    return bestGrowingLeaning;
}

// return the most popular leaning for a specific country and year (= index)
function getMostPopularLeaningData(data,country,index) {
    var leaningData = getLeaningDataAtIndex(data,country,index);
    
    var maxPercentage = 0;
    var mostPopularLeaning = "";
    for (var leaning in leaningData) {
        if (leaningData[leaning] > maxPercentage) {
            maxPercentage = leaningData[leaning];
            mostPopularLeaning = leaning;
        }
    }

    return mostPopularLeaning;
}

// aggregate all the ess survey data for each country, each year and for each column (leaning, happy, satisfaction, trust country & trust eu)
// for leaning column returns the sum of each leaning
// for numerical columns returns the sum of each score [0..10] and the mean
function aggregateSurveyData(data, mapYears) {
    var countries = Object.keys(data);
    var aggregatedData = {};

    countries.forEach(c => {
        aggregatedData[c] = {};
        Object.keys(mapYears[c].surveyYears).forEach((i) => {
            var y = mapYears[c].surveyYears[i];
            aggregatedData[c][y] = {};

            var surveyData = getYearDataAtIndex(data,c,dataTypes["survey"],i);
            for (var column in surveyData) {
                var columnData = surveyData[column];

                if (column === "leaning") {
                    aggregatedData[c][y][column] = {
                        "far-left": 0,
                        "left": 0,
                        "center-left": 0,
                        "center": 0,
                        "center-right": 0,
                        "right": 0,
                        "far-right": 0,
                    };

                    for (var i=0; i<columnData.length; i++) {
                        aggregatedData[c][y][column][columnData[i]]++;
                    }
                } else {
                    aggregatedData[c][y][column] = {
                        "count": columnData.length,
                        'sum': {
                            '0': 0,
                            '1': 0,
                            '2': 0,
                            '3': 0,
                            '4': 0,
                            '5': 0,
                            '6': 0,
                            '7': 0,
                            '8': 0,
                            '9': 0,
                            '10': 0
                        },
                        "mean": 0
                    };

                    for (var i=0; i<columnData.length; i++) {
                        aggregatedData[c][y][column]["sum"][columnData[i].toString()]++;
                    }

                    aggregatedData[c][y][column]["mean"] = columnData.reduce((a,b) => a+b,0) / columnData.length;
                }
            }
        });
    });

    return aggregatedData;
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


// get the leaning data for all countries of a specific year (index)
// index: youngest data = 0, second youngest data = 1,...
function getAllCountriesLeaningDataAtIndex(data,index) {
    var countries = Object.keys(data);
    var allCountriesLeaningData = {};

    countries.forEach(c => {
        var leaningData = getLeaningDataAtIndex(data,c,index);
        if (leaningData !== null) {
            allCountriesLeaningData[c] = leaningData;
        }
    });

    return allCountriesLeaningData;
}

// get the leaning data for a specific country of a specific year (index)
// index: youngest data = 0, second youngest data = 1,...
function getLeaningDataAtIndex(data,country,index) {
    var electionData = getYearDataAtIndex(data,country,dataTypes["election"],index);
    if (electionData === null) {
        return null;
    }
    var leaningData = {};
    leanings.forEach(l => leaningData[l]=0);

    var parties = Object.keys(electionData);
    parties.forEach(p => {
        if (p === "Other parties") {
            leaningData["Other parties"] += electionData[p];
        } else {
            var leaning = getPartyLeaning(data[country].leaning_data,p);
            if (leaning) {
                leaningData[leaning] += electionData[p];
            }
        }
    });

    return leaningData;
}

function getPartyLeaning(data,party) {
    for (var leaning in data) {
        if (data[leaning].includes(party)) {
            return leaning;
        }
    }
    return null
}

// return the geojson data of the specified countries 
function getGeoJsonData(countries) {
    return d3.json("../json/geojson.json").then(function(geojson) {
        geojson.features = geojson.features.map(function(d) {
            return countries.hasOwnProperty(countryCodes[d.properties.name]);
        });

        return geojson;
    });
}

// get the data for all countries, of a specific type and from a specific year (index)
// index: youngest data = 0, second youngest data = 1,...
function getAllCountriesYearDataAtIndex(data,type,index) {
    var countries = Object.keys(data);
    var allYearData = {};

    countries.forEach(function(country) {
        var yearData = getYearDataAtIndex(data,country,type,index);
        if (yearData !== null) {
            allYearData[country] = yearData;
        }
    });

    return allYearData;
}

// get the data for a specific country, of a specific type and from a specific year (index) 
// index: youngest data = 0, second youngest data = 1,...
function getYearDataAtIndex(data,country,type,index) {
    var years = Object.keys(data[country][type]).sort().reverse();
    var year = years[index];

    if (year) {
        return data[country][type][year];
    } else {
        return null;
    }
}

// get the # of election years and survey years for each country
function mapYears(data,countries) {
    var years = {};
    countries.forEach(function(country) {
        var electionYears = Object.keys(data[country]["election_data"]);
        var surveyYears = Object.keys(data[country]["ess_data"])

        years[country] = {
            "electionYears": electionYears.reverse(),
            "surveyYears": surveyYears.reverse()
        };
    });

    
    return years;
}

// get the # of election years and survey years for each country
function getElectionYears(data, country) {
    return  Object.keys(data[country]["election_data"]);
}

function getPercentageCircles(data, country, election, width, height) {
    centerX = width / 2,
    centerY = height / 2;

    const layers = 5; // Number of layers
    const maxCircles = 100; // Total circles
    let currentLayer = 1;
    let remainingCircles = maxCircles;

    const layerRadiusIncrement = 30; // Adjust for spacing
    let currentRadius = 100; // Initial radius of the innermost layer

    var circlesColums = [];

    while (currentLayer <= layers && remainingCircles > 0) {
        const layerCircles = Math.ceil(remainingCircles / (layers - currentLayer + 1));
        const angleIncrement = Math.PI / (layerCircles - 1); // Half circle

        for (let i = 0; i < layerCircles; i++) {
            const angle = angleIncrement * i;
            const x = centerX + currentRadius * Math.cos(angle);
            const y = centerY - currentRadius * Math.sin(angle);

            // Ensure there's an array to push to for each column
            if (!circlesColums[i]) {
                circlesColums[i] = []; // Create a new column if it doesn't exist
            }

            circlesColums[i].push({ cx: x, cy: y, radius: 5, color: "steelblue", party: "" });
        }

        remainingCircles -= layerCircles;
        currentLayer++;
        currentRadius += layerRadiusIncrement;
    }

    const flattenedCircles = circlesColums.flat().reverse();

    var leanings = getLeaningDataAtIndex(data, country, election)

    var entry = 0;
    Object.entries(leanings).forEach(([key, value]) => {
        
        for (let i = 0; i < value; i++) {

            if (entry < flattenedCircles.length) {
                flattenedCircles[entry].color = colors[key]
                flattenedCircles[entry].party = key
                entry += 1;
            }
        }
    });

    return flattenedCircles;
}
