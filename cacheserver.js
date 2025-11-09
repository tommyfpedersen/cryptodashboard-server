import client from './redisClient.js';
import { getBlockchainData } from './components/data/fetchBlockchainData.js';

/* Main data loop - no user inputs - get data from verus daemon and add to cache (redis) */
console.log("cache server running");
client.set("cacheready", JSON.stringify(false));

let syncTroubleThreshold = 1000 * 60 * 10;
let syncTimeInterval = 120000;

let pbaasStatusArray = [];
let blockchainOutofsync = false;

await fetchAndUpdateData();

setInterval(async () => {
  await fetchAndUpdateData();
}, syncTimeInterval);

async function fetchAndUpdateData() {
  console.log("get blockchain data: ");
  let getTime = Date.now();
  let fetchedData = await getBlockchainData();
  console.log("saving data to redis", (Date.now() - getTime) / 1000);


  // verusd sync check
  //add data to pbaas array if first time
  if (pbaasStatusArray.length <= 0) {
    fetchedData.pbaasList.forEach((pbaas) => {
      pbaasStatusArray.push({
        name: pbaas.blockchain,
        currentBlock: pbaas.blockheight,
        syncTroubleTimestamp: 0,
        syncTroubleTimestampActivated: false,
        outofsync: false,
        message: ""
      })
    })
  }


  let pbaasList = fetchedData.pbaasList;

  if (pbaasList.length > 0) {

    pbaasList.forEach((pbaas) => {
      let pbaasStatus = pbaasStatusArray.find((item) => item.name === pbaas.blockchain);

      if (pbaas.blockchain === pbaasStatus.name) {
        if (pbaasStatus.currentBlock === pbaas.blockheight) {

          if (pbaasStatus.syncTroubleTimestampActivated === true && pbaasStatus.syncTroubleTimestamp + syncTroubleThreshold < Date.now()) {
            pbaasStatus.currentBlock = pbaasStatus.currentBlock;
            pbaasStatus.outofsync = true;
            pbaasStatus.message = pbaasStatus.name + " blockchain data may be out of sync";
          }

          if (pbaasStatus.syncTroubleTimestampActivated === false) {
            pbaasStatus.syncTroubleTimestamp = Date.now();
            pbaasStatus.syncTroubleTimestampActivated = true;
          }

        } else {
          pbaasStatus.currentBlock = pbaas.blockheight;
          pbaasStatus.outofsync = false;
          pbaasStatus.message = "";
          pbaasStatus.syncTroubleTimestampActivated = false;
          pbaasStatus.syncTroubleTimestamp = Date.now();
        }
      }

    })
  }
  
  blockchainOutofsync = false;

  pbaasStatusArray.forEach((pbaas) => {
    if (pbaas.outofsync === true) {
      blockchainOutofsync = true;
    }
  })

  fetchedData.pbaasStatusList = pbaasStatusArray;
  fetchedData.blockchainOutofsync = blockchainOutofsync;

  client.set("data", JSON.stringify(fetchedData));
  client.set("cacheready", JSON.stringify(true));
  client.set("timestamp", JSON.stringify(Date.now()));
}