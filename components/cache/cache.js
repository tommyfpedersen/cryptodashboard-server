
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
  let cachetimestamp = await client.get("timestamp");
  let resultParsed = await JSON.parse(result);

  resultParsed.outofsync = Date.now() > (Number(cachetimestamp) + (5*60000)) ? true : false;
  resultParsed.cachetimestamp = new Date(Number(cachetimestamp)).toLocaleString();

  // Calculate the time difference
  let now = Date.now();
  let cacheTime = Number(cachetimestamp);
  let timeDifference = now - cacheTime;
  // Convert the time difference to a human-readable format
  let timeAgo = formatTimeDifference(timeDifference);

  resultParsed.timeAgo = timeAgo;

  return resultParsed;

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
  let result = false

  let ready = await client.get("cacheready");
  let cacheTimestamp = await client.get("timestamp");

  if (ready === "true" && Date.now() < cacheTimestamp + 80000) {
    result = true;
  }
  return result;
}

function formatTimeDifference(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  }
}