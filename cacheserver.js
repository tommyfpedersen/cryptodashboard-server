import client from './redisClient.js';

/* Main data loop - no user inputs - get data from verus daemon and add to cache (redis) */

let fetchedData = {};

//let result = await client.get("data");
//console.log("get data: ",result);

setInterval(async () => {
   // client.set("data", JSON.stringify(fetchedData));
   fetchData();
    let result = await client.get("data");
    console.log("get data: ",result);
}, 2000);

function fetchData() {
  console.log("fetching data");
}