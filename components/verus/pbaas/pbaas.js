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
        let halving = 0;
        currencyInfo.eras.forEach(era => {

            if (era.eraend < miningInfo.blocks) {
                circulatingSupply = circulatingSupply + (era.reward * miningInfo.blocks);
                halving = era.halving;
                console.log(era.reward, circulatingSupply, era.halving, miningInfo.blocks);
            }

            if (era.eraend === 0) {
                let halvingIsBiggerThanBlocks = false;
                let reward = era.reward;
                let halvingCounter = era.halving;

                while (halvingIsBiggerThanBlocks) {
//todo
                    if (halving < miningInfo.blocks) {

                    } else {
                        halvingIsBiggerThanBlocks = true;
                    }
                }
            }
        });
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