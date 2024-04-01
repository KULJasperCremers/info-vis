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

d3.json("../json/ess_data_all.json").then(function(data) {
    var countries = Object.keys(data);
    var years = mapYears(data,countries);
    console.log(years);

    getYearDataAtIndex(data,countryCodes["Belgium"],dataTypes["election"],0);

    var d0 = getAllCountriesYearDataAtIndex(data,dataTypes["election"],0);
    // var d7 = getAllCountriesYearDataAtIndex(data,dataTypes["election"],7);
    getGeoJsonData(d0).then(function(geojson) {
        console.log(geojson);
    });

    console.log(getLeaningDataAtIndex(data,countryCodes["Belgium"],0));

    console.log(getAllCountriesLeaningDataAtIndex(data,7));
});

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