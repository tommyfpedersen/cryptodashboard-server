const fs = require('node:fs');

async function saveVolumeDataToFile(volumeData, fileName) {
  const content = JSON.stringify(volumeData);
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, content, err => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        // file written successfully
        console.log("file saved");
        resolve();
      }
    });
  });
}

async function getVolumeDataFromFile(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}

module.exports = { saveVolumeDataToFile, getVolumeDataFromFile }