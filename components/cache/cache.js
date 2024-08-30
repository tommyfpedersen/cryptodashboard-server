
//import fs from 'fs/promises';
import client from '../../redisClient.js';

let data = {};

export async function writeToCache(fileName, dataObject) {
  data = JSON.stringify(dataObject);
  client.set("data", data);

  // try {
  //   const dataString = JSON.stringify(dataObject);
  //   await fs.writeFile(fileName, dataString, 'utf8');
  //   console.log('Data written to cache successfully.');
  // } catch (error) {
  //   console.error('Failed to write to cache:', error);
  // }
}

export async function readFromCache(fileName) {
  let result = await client.get("data");
  return await JSON.parse(result);

  // try {
  //   const dataString = await fs.readFile(fileName, 'utf8');
  //   const dataObject = JSON.parse(dataString);
  //   console.log('Data read from cache successfully.');
  //   return dataObject;
  // } catch (error) {
  //   console.error('Failed to read from cache:', error);
  //   return null; // or throw the error, depending on your error handling strategy
  // }
}

export async function isCacheReady() {
  let result = false;
  let ready = await client.get("cacheready");
  let cacheTimestamp = await client.get("timestamp");

  if(ready === true && Date.now() < cacheTimestamp + 80000){
    result = true;
  }
  return result;
}