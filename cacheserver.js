import client from './redisClient.js';
import { getBlockchainData } from './components/data/fetchBlockchainData.js';

/* Main data loop - no user inputs - get data from verus daemon and add to cache (redis) */
console.log("cache server running");
client.set("cacheready", JSON.stringify(false));


//let result = await client.get("data");


setInterval(async () => {
  await fetchAndUpdateData();
}, 60000);

async function fetchAndUpdateData() {
  console.log("get blockchain data: ");
  let getTime = Date.now();
  let fetchedData = await getBlockchainData();
  console.log("saving data to redis", (Date.now() - getTime) / 1000);
  client.set("data", JSON.stringify(fetchedData));
  client.set("cacheready", JSON.stringify(true));
  client.set("timestamp", JSON.stringify(Date.now()));
}