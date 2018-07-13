/**
 * Aggregates GDP and Population Data by Continents
 * @param {*} filePath
 */
const fs = require('fs');
const continents = require('./country-continent.json');

function check(array, continent) {
  // check if continent already exist, is so return the index else -1
  let res = -1;
  for (let i = 0; i < array.length; i += 1) {
    if (array[i][0] === continent) {
      res = i;
    }
  }
  return res;
}

const readfile = function readfilefnc(filePath) {
  return new Promise((resolve) => {
    fs.readFile(filePath, 'utf8', (err, content) => {
      resolve(content);
    });
  });
};


const pro3 = function writefile(resultset) {
  return new Promise(
    (resolve) => {
      fs.writeFile('./output/output.json', resultset, () => {
        resolve();
      });
    },
  );
};


const aggregate = function aggregartfn(filePath) {
  return new Promise((resolve) => {
    readfile(filePath).then((resolved) => {
      let array1 = []; // declare array to split data in lines
      const array2 = [];
      array1 = resolved.split('\n');
      array1.forEach((element) => {
        array2.push(element.split(',')); // convert csv to 2d array
      });
      let reqindex = []; // store index of fields required for operation
      for (let i = 0; i < array2[0].length; i += 1) {
        if (array2[0][i] === '"Country Name"' || array2[0][i] === '"Population (Millions) - 2012"' || array2[0][i] === '"GDP Billions (US Dollar) - 2012"') {
          reqindex.push([array2[0][i], i]);
        }
      }
      reqindex = new Map(reqindex); // convert 2d array to map
      const result = []; // declare an array to store final result
      let conti;
      let population;
      let gdpcountry;
      array2.forEach((item, index) => {
        if (item.length > 1 && index > 0) {
          const country = item[reqindex.get('"Country Name"')];
          conti = continents[country.substring(1, country.lastIndexOf('"'))];
          const checkconti = check(result, conti);
          // check if continent already exists in result set
          if (conti) {
            if (checkconti === -1) { // if row doesnot exist, push the row with required data
              population = item[reqindex.get('"Population (Millions) - 2012"')];
              population = parseFloat(population.substring(1, population.lastIndexOf('"')));
              gdpcountry = item[reqindex.get('"GDP Billions (US Dollar) - 2012"')];
              gdpcountry = parseFloat(gdpcountry.substring(1, gdpcountry.lastIndexOf('"')));
              result.push([conti, gdpcountry, population]);
            } else { // if row exist, update the values for GDP and population
              population = item[reqindex.get('"Population (Millions) - 2012"')];
              gdpcountry = item[reqindex.get('"GDP Billions (US Dollar) - 2012"')];
              population = parseFloat(population.substring(1, population.lastIndexOf('"'))) + result[checkconti][2];
              gdpcountry = parseFloat(gdpcountry.substring(1, gdpcountry.lastIndexOf('"'))) + result[checkconti][1];
              result[checkconti][2] = population;
              result[checkconti][1] = gdpcountry;
            }
          }
        }
      });
      const Keyvalues = []; // pick headers for json from result set
      result.forEach((element) => {
        Keyvalues.push(element[0]);
      });
      let subset = {};
      Keyvalues.forEach((i, j) => {
        subset[i] = {}; // add GDP and Population values to each header
        [subset[i].GDP_2012, subset[i].POPULATION_2012] = [result[j][1], result[j][2]];
      });
      subset = JSON.stringify(subset);
      pro3(subset).then(() => { resolve(); });
      // write the data to local file and send response to main fn
    });
  });
};

module.exports = aggregate;
