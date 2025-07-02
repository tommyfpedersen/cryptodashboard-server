import dotenv from 'dotenv';
dotenv.config();

import { getPbaasConfig } from './pbaasConfig.js';
import { getCurrenciesConfig } from './../currencies/currenciesConfig.js';

import { getMiningInfo, getCoinSupply, getCurrency, } from "../api/api.js";


export async function getAllPbaas() {
    const pbaasConfig = getPbaasConfig();
    const currenciesConfig = getCurrenciesConfig();

    let pbaasArray = [];



    for (let i = 0; i < pbaasConfig.length; i++) {
        console.log(pbaasConfig[i].name)
        const miningInfo = await getMiningInfo(pbaasConfig[i].rpcBaseUrl);
        const currencyInfo = await getCurrency(pbaasConfig[i].rpcBaseUrl, pbaasConfig[i].name)
        const marketCapStats = await getMarketCapStats(miningInfo.blocks, pbaasConfig[i])

        let circulatingSupply = 0;
        let halvingCounter = 0;
        currencyInfo.eras.forEach((era,index) => {

            if (era.reward === 0) {
                halvingCounter = halvingCounter + era.eraend;
            }


            if (era.eraend < miningInfo.blocks && era.reward !== 0 && era.eraend !== 0) {

                halvingCounter = halvingCounter + era.halving;//(era.halving > 1 ? era.halving : 0);
                let rewardCounter = era.reward;

                circulatingSupply = circulatingSupply + halvingCounter * era.reward / 100000000;

               /// circulatingSupply = circulatingSupply + era.reward / 100000000 * era.halving + ((era.eraend - era.halving) * (era.reward / 100000000 / 2))
                console.log(index, "halvingCounter first", halvingCounter, "circulatingSupply", circulatingSupply, "era.reward", era.reward)
                // VRSC 16,588,800
                // VRSC 35,112,960

                //  console.log(era.reward/100000000, circulatingSupply, era.halving, miningInfo.blocks);


                let eraHalvingCounter = halvingCounter;
                let eraHalvingCounterIsBiggerThanEraEnd = true;

                while (eraHalvingCounterIsBiggerThanEraEnd) {
                    if (eraHalvingCounter < era.eraend) {

                        
                        eraHalvingCounter = eraHalvingCounter + era.halving;
                        rewardCounter = rewardCounter / 2;

                        circulatingSupply = circulatingSupply + era.halving * rewardCounter / 100000000;

                        console.log(index, "era.halving", era.halving, "eraHalvingCounter", eraHalvingCounter, "circulatingSupply", circulatingSupply, "rewardCounter", rewardCounter);
                    } else {
                        eraHalvingCounterIsBiggerThanEraEnd = false;
                    }
                }



            }

            if (era.eraend === 0) {
                let halvingIsBiggerThanBlocks = true;
                let rewardCounter = era.reward;
                let halving = era.halving// + halvingCounter;

                let eraHalvingCounter = halvingCounter;

                while (halvingIsBiggerThanBlocks) {

                    if (halving < miningInfo.blocks) {
                        //halvingCounter = halvingCounter + era.halving;
                        eraHalvingCounter = eraHalvingCounter + era.halving;
                        rewardCounter = rewardCounter / 2;
                        circulatingSupply = circulatingSupply + era.halving * rewardCounter / 100000000;
                        console.log(index, "era.halving", era.halving, "eraHalvingCounter", eraHalvingCounter, "circulatingSupply", circulatingSupply, "rewardCounter", rewardCounter);

                        halving = halving + era.halving;

                        //circulatingSupply = circulatingSupply + rewardCounter / 100000000 * era.halving;
                    } else {
                        let deltaHeight = halvingCounter - miningInfo.blocks;

                        console.log(index, "halvingCounter last", halvingCounter, "miningInfo.blocks", miningInfo.blocks, "deltaHeight", deltaHeight, circulatingSupply + rewardCounter / 100000000 * deltaHeight)
                        ///       console.log("halvingCounter", halving, "rewardCounter" , rewardCounter, "true")

                        //coins = delta blockheight and halving

                        // VRSC height 3,381,840 

                        halvingIsBiggerThanBlocks = false;
                    }
                }
            }
        });


        /*
 "eras": [
    {
      "reward": 0,
      "decay": 100000000,
      "halving": 1,
      "eraend": 10080
    },
    {
      "reward": 38400000000,
      "decay": 0,
      "halving": 43200,
      "eraend": 226080
    },
    {
      "reward": 2400000000,
      "decay": 0,
      "halving": 1051920,
      "eraend": 0
    }
  ],
        */

        // console.log("circulatingSupply", circulatingSupply)
        // console.log("circulatingSupply", circulatingSupply / 100000000)

        const eras = currencyInfo.eras;

        console
        // console.log(pbaasConfig[i].name);
        // console.log(marketCapStats);

        let currenciesOnBlockchain = currenciesConfig.filter((currency) => {
            return currency.blockchain === pbaasConfig[i].name
        })

        // vrscNetworkHash: (Math.round(blockandfeepoolrewards.networkhashps) / 1000000000).toLocaleString(),

        pbaasArray.push({
            blockchain: pbaasConfig[i].name,
            blockheight: miningInfo.blocks,
            blocktime: currencyInfo.blocktime,
            networkHashrate: (Math.round(miningInfo.networkhashps) / 1000000000).toLocaleString(),
            currenciesCount: currenciesOnBlockchain.length,
            marketCap: Math.round(marketCapStats.marketCap).toLocaleString(),
            fullyDilutedMarketCap: Math.round(marketCapStats.fullyDilutedMarketCap).toLocaleString(),
            circulatingSupplyPercentage: Math.round(marketCapStats.circulatingSupplyPercentage),
            circulatingSupply: Math.round(marketCapStats.circulatingSupply).toLocaleString(),
            maxSupply: Math.round(marketCapStats.maxSupply).toLocaleString()
        })

    }


    return pbaasArray;
}

export async function getMarketCapStats(block, config) {
    let result = {};
    let totalSupply = null;
    // let maxSupply = 83540184;

    const coinSupply = await getCoinSupply(config.rpcBaseUrl, block);

    if (coinSupply) {
        totalSupply = coinSupply.total;
        result.totalSupply = totalSupply;
        result.circulatingSupply = totalSupply;
        result.circulatingSupplyPercentage = totalSupply / config.maxSupply * 100;
        result.marketCap = totalSupply * config.nativeBasePrice;
        result.maxSupply = config.maxSupply;
        result.fullyDilutedMarketCap = config.maxSupply * config.nativeBasePrice;
    } else {
        result.totalSupply = "syncing";
        result.circulatingSupply = "syncing";
        result.circulatingSupplyPercentage = "syncing";
        result.marketCap = "syncing";
        result.maxSupply = "syncing";
        result.fullyDilutedMarketCap = "syncing";
    }


    return result;
}