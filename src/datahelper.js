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

function aggregateSurveyMeansForAllCountries(data) {
    var surveyMeans = {};

    for (var country in newCountryCodes) {
        var countryData = data[newCountryCodes[country]];
        var allSurveyYears = Object.keys(countryData[dataTypes.survey]).map(Number);
        var earliestYear = Math.min(...allSurveyYears);
        console.log(`earliest year: ${earliestYear}`)
        var latestYear = Math.max(...allSurveyYears);
        surveyMeans[newCountryCodes[country]] = calculateSurveyMeans(countryData, earliestYear, latestYear);
    }

        // Create a blob from the JSON string
        var blob = new Blob([JSON.stringify(surveyMeans, null, 2)], {type: "application/json"});
        // Create a URL for the blob
        var url = URL.createObjectURL(blob);

        // Create a hidden link and trigger a click on it to start the download
        var link = document.createElement('a');
        link.href = url;
        link.download = 'surveyMeans.json';
        link.click();

        return surveyMeans;
    
}

function aggregateElectionDataForAllCountries(data) { 
    var electionData = {};

    for (var country in newCountryCodes) {
        var countryData = data[newCountryCodes[country]];
        var allElectionYears = Object.keys(countryData[dataTypes.election]).map(Number);
        var earliestYear = Math.min(...allElectionYears);
        var latestYear = Math.max(...allElectionYears);
        electionData[newCountryCodes[country]] = calculatePercentagesLeaning(countryData, earliestYear, latestYear);
    }

    // Create a blob from the JSON string
    var blob = new Blob([JSON.stringify(electionData, null, 2)], {type: "application/json"});
    // Create a URL for the blob
    var url = URL.createObjectURL(blob);

    // Create a hidden link and trigger a click on it to start the download
    var link = document.createElement('a');
    link.href = url;
    link.download = 'electionData.json';
    link.click();

    return electionData;

}

function calculatePercentagesLeaning(countryData, year1, year2) {
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

    return aggregatedElectionDataPerYearAndLeaning;
}

function calculateSurveyMeans(countryData, year1, year2) {
    var allSurveyYears = Object.keys(countryData[dataTypes.survey]).map(Number);
    var surveyYears = allSurveyYears.filter(year => year >= year1 && year <= year2);
    
    var surveyData = {};
    var yearData = countryData[dataTypes.survey];
    var surveyMeans = {};

    // Initialize surveyData for each year before the loop
    for (var year of surveyYears) {
        surveyData[year] = {};
    }
    
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
    
            // Calculate mean for each category
            for (var column in surveyData[year][leaning]) {
                var values = surveyData[year][leaning][column];
                var mean = values.reduce((a, b) => a + b, 0) / values.length;

                // Check if surveyMeans[year] exists, if not, create it
                if (!surveyMeans[year]) {
                    surveyMeans[year] = {};
                }

                // Check if surveyMeans[year][leaning] exists, if not, create it
                if (!surveyMeans[year][leaning]) {
                    surveyMeans[year][leaning] = {};
                }

                // Now you can safely assign the mean value
                surveyMeans[year][leaning][column] = mean;
            }
        }
    }

    return surveyMeans;
}


function get_percentage_leaning_data_between(data, country, from, to) {

    var countryData = data[country];

    var newData = Object.keys(countryData)
        .filter(key => parseInt(key) >= from && parseInt(key) <= to)
        .reduce((obj, key) => {
            obj[key] = countryData[key];
            return obj;
        }, {});

    return newData;
}

function get_all_dates(data, country) {
    return Object.keys(data[country]);
}