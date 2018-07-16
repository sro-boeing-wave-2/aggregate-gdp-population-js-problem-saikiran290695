/**
 * Aggregates GDP and Population Data by Continents
 * @param {*} filePath
 */
const fs = require('fs');
const continents = require('./country-continent.json');
// function to read file from local
const readfile = function readfilefnc(filePath) {
  return new Promise((resolve) => {
    fs.readFile(filePath, 'utf8', (err, content) => { resolve(content); });
  });
};
const aggregate = function process(filePath) {
  return new Promise((resolve) => {
    readfile(filePath).then((resolved) => {
      let rows = []; // declare array to split data in lines
      rows = (resolved.replace(/["]+/g, '')).split('\n');
      const countryIndex = (rows[0].split(',')).indexOf('Country Name');
      const populationIndex = (rows[0].split(',')).indexOf('Population (Millions) - 2012');
      const gdpcountryIndex = (rows[0].split(',')).indexOf('GDP Billions (US Dollar) - 2012');
      const result = {}; // declare an object to store final result
      let continent;
      let population;
      let gdpcountry;
      rows.forEach((item, index) => {
        if (item.length > 1 && index > 0) {
          const datarow = item.split(','); // convert csv to 2d array
          const country = datarow[countryIndex];
          continent = continents[country];
          // check if continent already exists in result set
          if (continent) {
            if (result[continent] === undefined) {
              // if continent doesnot exist, add the object with required data
              population = parseFloat(datarow[populationIndex]);
              gdpcountry = parseFloat(datarow[gdpcountryIndex]);
              result[continent] = {};
              result[continent].GDP_2012 = gdpcountry;
              result[continent].POPULATION_2012 = population;
            } else { // if continent exist, update the values for GDP and population
              population = parseFloat(datarow[populationIndex]) + result[continent].POPULATION_2012;
              gdpcountry = parseFloat(datarow[gdpcountryIndex]) + result[continent].GDP_2012;
              result[continent].POPULATION_2012 = population;
              result[continent].GDP_2012 = gdpcountry;
            }
          }
        }
      });
      fs.writeFile('./output/output.json', JSON.stringify(result), () => { resolve(); });
      // write the data to local file and send response to main fn
    });
  });
};

module.exports = aggregate;
