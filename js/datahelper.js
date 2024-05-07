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

var newCountryCodes = {
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

var leanings = ["far-left", "left", "center-left", "center", "center-right", "right", "far-right", "Other parties"];

var dataTypes = {
    "election": "election_data",
    "leaning": "leaning_data",
    "survey": "ess_data"
}

function aggregateDashboardDataForAllCountries(data) {
    var allCountryData = {};

    for (var country in newCountryCodes) {
        var countryData = data[newCountryCodes[country]];
        var allElectionYears = Object.keys(countryData[dataTypes.election]).map(Number);
        var earliestYear = Math.min(...allElectionYears);
        var latestYear = Math.max(...allElectionYears);
        var countryData = data[newCountryCodes[country]];
        allCountryData[newCountryCodes[country]] = aggregateDashboardDataForCountryBetweenYears(countryData, earliestYear, latestYear);
    }

    // Create a blob from the JSON string
    var blob = new Blob([JSON.stringify(allCountryData, null, 2)], {type: "application/json"});
    // Create a URL for the blob
    var url = URL.createObjectURL(blob);

    // Create a hidden link and trigger a click on it to start the download
    var link = document.createElement('a');
    link.href = url;
    link.download = 'allCountryData.json';
    link.click();

    return allCountryData;
}

function aggregateDashboardDataForCountryBetweenYears(countryData,year1,year2) {
    var allElectionYears = Object.keys(countryData[dataTypes.election]).map(Number);
    var electionYears = allElectionYears.filter(year => year >= year1 && year <= year2);

    var aggregatedElectionDataPerYearAndLeaning = {};
    for (var year of electionYears) {
        var yearData = countryData[dataTypes.election][year];
        // Initialize leaningTotals with each leaning set to 0
        var leaningTotals = leanings.reduce((totals, leaning) => {
            totals[leaning] = 0;
            return totals;
        }, {});
        for (var party in yearData) {
            if (party === "Other parties") {
                leaningTotals["Other parties"] = (leaningTotals["Other parties"] || 0) + yearData[party];
            } else {
                for (var leaning in countryData[dataTypes.leaning]) {
                    if (countryData[dataTypes.leaning][leaning].includes(party)) {
                        leaningTotals[leaning] += yearData[party];
                    }
                }
            }
        }
        aggregatedElectionDataPerYearAndLeaning[year] = leaningTotals;
    }

    console.log(aggregatedElectionDataPerYearAndLeaning)

    // Second pass to calculate normalized growth and relative growth
    var electionGrowth = {};
    for (var i = 1; i < electionYears.length; i++) {
        var year = electionYears[i];
        var yearData = aggregatedElectionDataPerYearAndLeaning[year];
        var previousYearData = aggregatedElectionDataPerYearAndLeaning[electionYears[i - 1]];
        for (var leaning in yearData) {
            var growth = (yearData[leaning] - previousYearData[leaning]);
            var relativeGrowth;
            if (previousYearData[leaning] !== 0) {
                relativeGrowth = ((yearData[leaning] - previousYearData[leaning]) / previousYearData[leaning]) * 100;
            } else {
                relativeGrowth = growth;
            }
            if (!electionGrowth[year]) {
                electionGrowth[year] = {};
            }
            if (!electionGrowth[year][leaning]) {
                electionGrowth[year][leaning] = {};
            }
            electionGrowth[year][leaning] = {
                absolute: growth,
                relative: relativeGrowth
            };
        }
    }

    var allSurveyYears = Object.keys(countryData[dataTypes.survey]).map(Number);
    var surveyYears = allSurveyYears.filter(year => year >= year1 && year <= year2);
    
    var surveyData = {};
    var yearData = countryData[dataTypes.survey];

    // Initialize surveyData for each year before the loop
    for (year of surveyYears) {
        surveyData[year] = {};
    }

    var prevYearMeans = { happy: 0, satisfaction: 0, trust_country: 0, trust_eu: 0 };
    var surveyGrowth = {};
    
    for (year of surveyYears) {
        for (var i = 0; i < yearData[year].leaning.length; i++) {
            var leaning = yearData[year].leaning[i];
            if (!surveyData[year]) {
                surveyData[year] = {};
            }
            if (!surveyData[year][leaning]) {
                surveyData[year][leaning] = {
                    happy: [],
                    satisfaction: [],
                    trust_country: [],
                    trust_eu: []
                };
            }
            surveyData[year][leaning].happy.push(yearData[year].happy[i]);
            surveyData[year][leaning].satisfaction.push(yearData[year].satisfaction[i]);
            surveyData[year][leaning].trust_country.push(yearData[year].trust_country[i]);
            surveyData[year][leaning].trust_eu.push(yearData[year].trust_eu[i]);
    
            // Calculate mean and growth for each category
            for (var column in surveyData[year][leaning]) {
                var values = surveyData[year][leaning][column];
                var mean = values.reduce((a, b) => a + b, 0) / values.length;
    
                // Calculate growth from the second year onwards
                if (prevYearMeans[column] !== 0) {
                    var growth = mean - prevYearMeans[column];
                    var relativeGrowth = ((mean - prevYearMeans[column]) / prevYearMeans[column]) * 100;
                    if (!surveyGrowth[year]) {
                        surveyGrowth[year] = {};
                    }
                    if (!surveyGrowth[year][leaning]) {
                        surveyGrowth[year][leaning] = {};
                    }
                    if (!surveyGrowth[year][leaning][column]) {
                        surveyGrowth[year][leaning][column] = {};
                    }
                    surveyGrowth[year][leaning][column] = {
                        absolute: growth,
                        relative: relativeGrowth
                    };
                }
    
                prevYearMeans[column] = mean;
            }
        }
    }

    return {
        electionGrowth: electionGrowth,
        surveyGrowth: surveyGrowth,
        percentagesLeaning: aggregatedElectionDataPerYearAndLeaning
    };
}