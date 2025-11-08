import client from './redisClient.js';
import { getBlockchainData } from './components/data/fetchBlockchainData.js';

/* Main data loop - no user inputs - get data from verus daemon and add to cache (redis) */
console.log("cache server running");
client.set("cacheready", JSON.stringify(false));


//let result = await client.get("data");
let latestFetchedVRSCBlock = 0;
let currentBlock = 0;
let vrscstatus = {};
let syncTroubleTimestamp = 0;
let syncTroubleTimestampActivated = false;
let syncTroubleThreshold = 1000*60*10;
let syncTimeInterval = 120000;
  
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
  let pbaas = fetchedData.pbaasList.filter(elm=>elm.blockchain==="VRSC") || [];
  
  if(pbaas.lenght > 0){
     currentBlock = pbaas.blockheight;
  }
 

  if(currentBlock === latestFetchedVRSCBlock){

    if(syncTroubleTimestampActivated === true && syncTroubleTimestamp + syncTroubleThreshold  < Date.now()  ){
      console.log("verusd out of sync", currentBlock );
      vrscstatus.currentBlock = currentBlock;
      vrscstatus.outofsync = true;
      vrscstatus.message = "Verus blockchain data may be out of sync";
    }
   
    if(syncTroubleTimestampActivated === false){
      syncTroubleTimestamp = Date.now();
      syncTroubleTimestampActivated = true;
    }
   
  }else{
      latestFetchedVRSCBlock = currentBlock;
      vrscstatus.currentBlock = currentBlock;
      vrscstatus.outofsync = false;
      vrscstatus.message = "";  
      syncTroubleTimestampActivated = false;
  }

  // client.set("vrscstatus", JSON.stringify(vrscstatus));
  fetchedData.vrscstatus = vrscstatus;

  client.set("data", JSON.stringify(fetchedData));
  client.set("cacheready", JSON.stringify(true));
  client.set("timestamp", JSON.stringify(Date.now()));
}