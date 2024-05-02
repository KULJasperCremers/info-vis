function countryLeaningGrowthColorFunc(country, params) {

    let cdata = params['cdata'];

    console.log(params)

    var fromData = getLeaningDataAtIndex(cdata, countryCodes[country], selectedElectionYearIndex_From);
    var toData =  getLeaningDataAtIndex(cdata, countryCodes[country], selectedElectionYearIndex_To);

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

}