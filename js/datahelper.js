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
    "survey": "ess_data"
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
            "electionYears": electionYears,
            "surveyYears": surveyYears
        };
    });

    return years;
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
