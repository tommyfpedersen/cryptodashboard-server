

import fs from 'fs/promises';

export async function writeToCache(fileName, dataObject) {
  try {
    const dataString = JSON.stringify(dataObject);
    await fs.writeFile(fileName, dataString, 'utf8');
    console.log('Data written to cache successfully.');
  } catch (error) {
    console.error('Failed to write to cache:', error);
  }
}

export async function readFromCache(fileName) {
    try {
      const dataString = await fs.readFile(fileName, 'utf8');
      const dataObject = JSON.parse(dataString);
      console.log('Data read from cache successfully.');
      return dataObject;
    } catch (error) {
      console.error('Failed to read from cache:', error);
      return null; // or throw the error, depending on your error handling strategy
    }
  }
// module.exports = { writeToCache, readFromCache };