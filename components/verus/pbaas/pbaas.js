import dotenv from 'dotenv';
dotenv.config();

import { getPbaasConfig } from './pbaasConfig.js';
import { getCurrenciesConfig } from './../currencies/currenciesConfig.js';

import { getMiningInfo, getCoinSupply, getCurrency } from "../api/api.js";


export async function getAllPbaas() {
    const pbaasConfig = getPbaasConfig();
    const currenciesConfig = getCurrenciesConfig();

    let pbaasArray = [];

    for (let i = 0; i < pbaasConfig.length; i++) {
        console.log(pbaasConfig[i].name)
        const miningInfo = await getMiningInfo(pbaasConfig[i].rpcBaseUrl);
        const currencyInfo = await getCurrency(pbaasConfig[i].rpcBaseUrl, pbaasConfig[i].name)
        const marketCapStats = await getMarketCapStats(miningInfo, currencyInfo, pbaasConfig[i])


        let currenciesOnBlockchain = currenciesConfig.filter((currency) => {
            return currency.blockchain === pbaasConfig[i].name
        })

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
            maxSupply: Math.round(marketCapStats.maxSupply).toLocaleString(),
            priceAddrToAddr: pbaasConfig[i].priceAddrToAddr,
            priceBasketToReserve: pbaasConfig[i].priceBasketToReserve,
            priceReserveToReserve: pbaasConfig[i].priceReserveToReserve,
            priceId1RefNotYours: pbaasConfig[i].priceId1RefNotYours,
            priceId1RefYours: pbaasConfig[i].priceId1RefYours,
            priceId2RefAllYours: pbaasConfig[i].priceId2RefAllYours,
            priceId3RefAllYours: pbaasConfig[i].priceId3RefAllYours == null ? "" : pbaasConfig[i].priceId3RefAllYours,
            priceSubId: pbaasConfig[i].priceSubId,
            priceStorage: pbaasConfig[i].priceStorage,
            priceCurrency: pbaasConfig[i].priceCurrency,
            pricePbaas: pbaasConfig[i].pricePbaas == null ? "" : Math.round(pbaasConfig[i].pricePbaas).toLocaleString(),

            priceAddrToAddrUSD: Math.round(pbaasConfig[i].priceAddrToAddr * pbaasConfig[i].nativeBasePrice).toLocaleString(),
            priceId1RefNotYoursUSD: Math.round(pbaasConfig[i].priceId1RefNotYours * pbaasConfig[i].nativeBasePrice).toLocaleString(),
            priceId1RefYoursUSD: Math.round(pbaasConfig[i].priceId1RefYours * pbaasConfig[i].nativeBasePrice).toLocaleString(),
            priceId2RefAllYoursUSD: Math.round(pbaasConfig[i].priceId2RefAllYours * pbaasConfig[i].nativeBasePrice).toLocaleString(),
            priceId3RefAllYoursUSD: pbaasConfig[i].priceId3RefAllYours == null ? "" : "$ " + Math.round(pbaasConfig[i].priceId3RefAllYours * pbaasConfig[i].nativeBasePrice).toLocaleString(),
            priceSubIdUSD: Math.round(pbaasConfig[i].priceSubId * pbaasConfig[i].nativeBasePrice).toLocaleString(),
            priceStorageUSD: Math.round(pbaasConfig[i].priceStorage * pbaasConfig[i].nativeBasePrice).toLocaleString(),
            priceCurrencyUSD: Math.round(pbaasConfig[i].priceCurrency * pbaasConfig[i].nativeBasePrice).toLocaleString(),
            pricePbaasUSD: pbaasConfig[i].pricePbaas == null ? "" : "$ " + Math.round(pbaasConfig[i].pricePbaas).toLocaleString()
        })

    }

    return pbaasArray;
}

export async function getMarketCapStats(miningInfo, currencyInfo, pbaasConfig) {
    let result = {};
    let circulatingSupply = 0;
    let circulatingSupplyPercentage = 0;
    let halvingCounter = 0;


    if (currencyInfo.preallocations) {
        console.log("preallocations - " + pbaasConfig.name)

        /*    let currentEraFound = false;
            let blockCounter = 0;
            let eraBlockCounter = 0;
            let blockHeight = miningInfo.blocks;
            let rewardCounter = 0;
    
    
            currencyInfo.eras.forEach((era, index) => {
    
                if (currentEraFound === true) {
                    return;
                }
    
                rewardCounter = era.reward;
    
                if (blockHeight < era.eraend && era.eraend !== 0) {
                    circulatingSupply = circulatingSupply + (blockHeight - eraBlockCounter) * rewardCounter / 100000000;
                    halvingCounter = halvingCounter + era.halving;
                    currentEraFound = true;
                    console.log("low blockheight eraBlockCounter", eraBlockCounter, "circulatingSupply", circulatingSupply, "blockHeight", blockHeight, "rewardCounter", rewardCounter)
                    return;
                }
    
                if (blockHeight > era.eraend && era.eraend !== 0) {
                    eraBlockCounter = eraBlockCounter + (era.eraend - eraBlockCounter);
                    circulatingSupply = circulatingSupply + era.eraend * rewardCounter / 100000000;
                    halvingCounter = halvingCounter + era.halving;
                    console.log("high blockheight eraBlockCounter", eraBlockCounter, "circulatingSupply", circulatingSupply, "blockHeight", blockHeight, "rewardCounter", rewardCounter)
                    return;
                }
    
                if (era.eraend === 0) {
    
    
    
                    let blockHeightIsBiggerThanHalving = true;
                    let rewardCounter = era.reward;
                    let halvingCounter = era.halving;
    
                    console.log("blockHeight", blockHeight, "era.reward", era.reward)
    
                    if (blockHeight < era.halving) {
                        circulatingSupply = circulatingSupply + blockHeight * rewardCounter / 100000000;
                    } 
                    if(blockHeight > era.halving) {
                        while (blockHeightIsBiggerThanHalving) {
    
                            if (blockHeight > halvingCounter) {
                                circulatingSupply = circulatingSupply + era.halving * rewardCounter / 100000000;
                                halvingCounter = halvingCounter + era.halving;
                                rewardCounter = rewardCounter / 2;
                             console.log(index, "era.halving", era.halving, "halvingCounter", halvingCounter, "circulatingSupply", circulatingSupply, "rewardCounter", rewardCounter);
                              //  halving = halving + era.halving;
    
                            } else {
                                let deltaHeight = blockHeight - era.halving;
                                console.log( "blockHeight",blockHeight,"deltaHeight", deltaHeight, "era.halving", era.halving,  "circulatingSupply", circulatingSupply, "rewardCounter", rewardCounter);
                                circulatingSupply = circulatingSupply + deltaHeight * rewardCounter / 100000000;
                                console.log("--> circulatingSupply", circulatingSupply)
                                blockHeightIsBiggerThanHalving = false;
                            }
                        }
                    }
    
    
                }
    
    
            })*/

        // result.circulatingSupply = circulatingSupply;
        // result.circulatingSupplyPercentage = circulatingSupply / pbaasConfig.maxSupply * 100;
        // result.marketCap = circulatingSupply * pbaasConfig.nativeBasePrice;
        // result.maxSupply = pbaasConfig.maxSupply;
        // result.fullyDilutedMarketCap = pbaasConfig.maxSupply * pbaasConfig.nativeBasePrice;

        circulatingSupply = pbaasConfig.maxSupply * 0.99
        result.circulatingSupply = circulatingSupply;
        result.circulatingSupplyPercentage = circulatingSupply / pbaasConfig.maxSupply * 100;
        result.marketCap = circulatingSupply * pbaasConfig.nativeBasePrice;
        result.maxSupply = pbaasConfig.maxSupply;
        result.fullyDilutedMarketCap = pbaasConfig.maxSupply * pbaasConfig.nativeBasePrice;


    } else {
        const coinSupplyInfo = await getCoinSupply(pbaasConfig.rpcBaseUrl, miningInfo.blocks);
        let circulatingSupply = coinSupplyInfo.total;
        if (coinSupplyInfo.result === "success") {
            result.totalSupply = circulatingSupply;
            result.circulatingSupply = circulatingSupply;
            result.circulatingSupplyPercentage = circulatingSupply / pbaasConfig.maxSupply * 100;
            result.marketCap = circulatingSupply * pbaasConfig.nativeBasePrice;
            result.maxSupply = pbaasConfig.maxSupply;
            result.fullyDilutedMarketCap = pbaasConfig.maxSupply * pbaasConfig.nativeBasePrice;
        } else {
            result.totalSupply = "syncing";
            result.circulatingSupply = "syncing";
            result.circulatingSupplyPercentage = "syncing";
            result.marketCap = "syncing";
            result.maxSupply = "syncing";
            result.fullyDilutedMarketCap = "syncing";
        }
    }

    return result;
}