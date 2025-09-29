import dotenv from 'dotenv';
dotenv.config();

import { getPbaasConfig } from './pbaasConfig.js';
import { getCurrenciesConfig } from './../currencies/currenciesConfig.js';

import { getMiningInfo, getCoinSupply, getCurrency, getBlockSubsidy, getBlock, getPeerInfo } from "../api/api.js";


export async function getAllPbaas(allCurrenciesFromBaskets) {
    const pbaasConfig = getPbaasConfig();
    const currenciesConfig = getCurrenciesConfig();


    let pbaasArray = [];

    for (let i = 0; i < pbaasConfig.length; i++) {
        const nativeCurrencyFromBasket = allCurrenciesFromBaskets.filter((item)=>{return item.blockchain === pbaasConfig[i].name });
        
        let nativePrice = 0;
        if(nativeCurrencyFromBasket.length > 0){
            nativePrice = nativeCurrencyFromBasket[0].currencyReserve.nativeCurrencyBasePrice;
        }

        const miningInfo = await getMiningInfo(pbaasConfig[i].rpcBaseUrl);
        const currencyInfo = await getCurrency(pbaasConfig[i].rpcBaseUrl, pbaasConfig[i].name)
        const marketCapStats = await getMarketCapStats(miningInfo, currencyInfo, pbaasConfig[i], nativePrice)
        const blockAndFeePoolRewards = await getBlockAndFeePoolRewards(miningInfo, pbaasConfig[i]);

        if (currencyInfo) {
            const stakingRewards = await calculateStakingRewards(currencyInfo.blocktime, blockAndFeePoolRewards.blockReward, marketCapStats.circulatingSupply, miningInfo.stakingsupply, null, nativePrice)
            const miningRewards = await calculateMiningRewards(currencyInfo.blocktime, blockAndFeePoolRewards.blockReward, miningInfo.networkhashps, null, nativePrice)

            let currenciesOnBlockchain = currenciesConfig.filter((currency) => {
                return currency.blockchain === pbaasConfig[i].name
            })

            pbaasArray.push({
                blockchain: pbaasConfig[i].name,
                blockheight: miningInfo.blocks,
                blocktime: currencyInfo.blocktime,
                networkHashrate: (Math.round(miningInfo.networkhashps) / 1000000000).toFixed(0).toLocaleString(),
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

                priceAddrToAddrUSD: Math.round(pbaasConfig[i].priceAddrToAddr * nativePrice).toLocaleString(),
                priceId1RefNotYoursUSD: Math.round(pbaasConfig[i].priceId1RefNotYours * nativePrice).toLocaleString(),
                priceId1RefYoursUSD: Math.round(pbaasConfig[i].priceId1RefYours * nativePrice).toLocaleString(),
                priceId2RefAllYoursUSD: Math.round(pbaasConfig[i].priceId2RefAllYours * nativePrice).toLocaleString(),
                priceId3RefAllYoursUSD: pbaasConfig[i].priceId3RefAllYours == null ? "" :  Math.round(pbaasConfig[i].priceId3RefAllYours * nativePrice).toLocaleString(),
                priceSubIdUSD: Math.round(pbaasConfig[i].priceSubId * nativePrice).toLocaleString(),
                priceStorageUSD: Math.round(pbaasConfig[i].priceStorage * nativePrice).toLocaleString(),
                priceCurrencyUSD: Math.round(pbaasConfig[i].priceCurrency * nativePrice).toLocaleString(),
                pricePbaasUSD: pbaasConfig[i].pricePbaas == null ? "" :  Math.round(pbaasConfig[i].pricePbaas * nativePrice).toLocaleString(),

                icon: pbaasConfig[i].icon,
                links: pbaasConfig[i].links,

                blockReward: blockAndFeePoolRewards.blockReward,
                feeReward: blockAndFeePoolRewards.feeReward,
                averageblockfees: blockAndFeePoolRewards.averageblockfees,
                blockRewardUSD: (Math.round(blockAndFeePoolRewards.blockReward * nativePrice * 10000) / 10000).toFixed(4).toLocaleString(),
                feeRewardUSD: (Math.round(blockAndFeePoolRewards.feeReward * nativePrice * 10000) / 10000).toFixed(4).toLocaleString(),
                averageblockfeesUSD: (Math.round(blockAndFeePoolRewards.averageblockfees * nativePrice * 10000) / 10000).toFixed(4).toLocaleString(),
                blockLastSend: blockAndFeePoolRewards.blockLastSend,
                stakingApy: (stakingRewards.stakingApy).toFixed(2).toLocaleString(),
                stakingPct: Math.round(stakingRewards.stakingPct),
                stakingSupply: Math.round(blockAndFeePoolRewards.stakingSupply).toLocaleString(),
                stakingRewardsDaily: stakingRewards.rewardsDaily,
                stakingRewardsDailyUSD: stakingRewards.rewardsDailyUSD,
                stakingRewardsMonthly: stakingRewards.rewardsMonthly,
                stakingRewardsMonthlyUSD: stakingRewards.rewardsMonthlyUSD,
                stakingRewardsYearly: stakingRewards.rewardsYearly,
                stakingRewardsYearlyUSD: stakingRewards.rewardsYearlyUSD,
                stakingRewardsOneDailyStakeAmount: stakingRewards.oneDailyStakeAmount,
                stakingRewardsOneMonthlyStakeAmount: stakingRewards.oneMonthlyStakeAmount,
                stakingRewardsOneYearlyStakeAmount: stakingRewards.oneYearlyStakeAmount,
                stakingRewardsOneDailyStakeAmountUSD: stakingRewards.oneDailyStakeAmountUSD,
                stakingRewardsOneMonthlyStakeAmountUSD: stakingRewards.oneMonthlyStakeAmountUSD,
                stakingRewardsOneYearlyStakeAmountUSD: stakingRewards.oneYearlyStakeAmountUSD,
                stakingNote: pbaasConfig[i].stakingNote,


                miningRewardsDaily: miningRewards.rewardsDaily,
                miningRewardsDailyUSD: miningRewards.rewardsDailyUSD,
                miningRewardsMonthly: miningRewards.rewardsMonthly,
                miningRewardsMonthlyUSD: miningRewards.rewardsMonthlyUSD,
                miningRewardsYearly: miningRewards.rewardsYearly,
                miningRewardsYearlyUSD: miningRewards.rewardsYearlyUSD,
                miningRewardsOneDailyMiningHashReward: miningRewards.oneDailyMiningHashReward,
                miningRewardsOneMonthlyMiningHashReward: miningRewards.oneMonthlyMiningHashReward,
                miningRewardsOneYearlyMiningHashReward: miningRewards.oneYearlyMiningHashReward,

            })
        }
    }


    // pbaasArray.push(apyArray);

    // sort pbaas list by market cap
    pbaasArray.sort((a, b) => parseFloat(b.networkHashrate.replace(/,/g, '')) - parseFloat(a.networkHashrate.replace(/,/g, '')));

    return pbaasArray;
}

export async function getBlockAndFeePoolRewards(miningInfo, pbaasConfig) {
    let result = {};
    result.blockLastSend = "";
    result.block = 0;
    let blockFeeReward = 0;
    let feeReward = "";

    if (miningInfo) {
        const peerinfo = await getPeerInfo(pbaasConfig.rpcBaseUrl);
        if (Array.isArray(peerinfo) && peerinfo.length > 0) {
            result.blockLastSend = new Date(peerinfo[0].lastsend * 1000).toLocaleString();
            result.block = miningInfo.blocks;
            result.stakingSupply = miningInfo.stakingsupply;
            result.networkhashps = miningInfo.networkhashps;
            const block = await getBlock(pbaasConfig.rpcBaseUrl, miningInfo.blocks);
            const blocksubsidy = await getBlockSubsidy(pbaasConfig.rpcBaseUrl, miningInfo.blocks);
            block.tx[0].vout.map((item) => {
                blockFeeReward = blockFeeReward + item.value;
            })
            feeReward = Math.round((blockFeeReward - blocksubsidy?.miner) * 100000000) / 100000000;
            result.blockReward = blocksubsidy.miner;
            result.feeReward = feeReward;
            result.averageblockfees = miningInfo.averageblockfees
        }
    }

    return result;
}

export async function calculateStakingRewards(blocktime, blockReward, totalSupply, stakingSupply, stakingAmountUnencoded, vrscPrice) {
    let result = {};
    let stakingAmount = 100;
    if (stakingAmountUnencoded) {
        stakingAmount = decodeURIComponent(stakingAmountUnencoded);
    }
    result.stakingAmount = stakingAmount;
    result.stakingPct = stakingSupply / totalSupply * 100;
    let apy = (24 * (3600 / blocktime) / 2) * blockReward * 365 / stakingSupply;
    result.stakingApy = Math.round(apy * 10000) / 100;

    result.rewardsDaily = Math.round(apy * stakingAmount / 365 * 10000) / 10000;
    result.rewardsDailyUSD = Math.round(apy * stakingAmount / 365 * vrscPrice * 10000) / 10000;

    result.rewardsMonthly = Math.round(apy * stakingAmount / 12 * 10000) / 10000;
    result.rewardsMonthlyUSD = Math.round(apy * stakingAmount / 12 * vrscPrice * 10000) / 10000;

    result.rewardsYearly = Math.round(apy * stakingAmount * 10000) / 10000;
    result.rewardsYearlyUSD = Math.round(apy * stakingAmount * vrscPrice * 10000) / 10000;

    result.oneDailyStakeAmount = Math.round(blockReward / apy * 365);
    result.oneMonthlyStakeAmount = Math.round(blockReward / apy * 12);
    result.oneYearlyStakeAmount = Math.round(blockReward / apy);
    result.oneDailyStakeAmountUSD = Math.round(blockReward / apy * 365 * vrscPrice);
    result.oneMonthlyStakeAmountUSD = Math.round(blockReward / apy * 12 * vrscPrice);
    result.oneYearlyStakeAmountUSD = Math.round(blockReward / apy * vrscPrice);

    return result;
}

export async function calculateMiningRewards(blocktime, blockReward, networkHashPerSecond, vrscMiningHashUnencoded, vrscPrice) {
    let result = {};
    let vrscMiningHash = 1;
    if (vrscMiningHashUnencoded) {
        vrscMiningHash = decodeURIComponent(vrscMiningHashUnencoded);
    }

    result.vrscMiningHash = vrscMiningHash;
    let apy = (24 * (3600 / blocktime) / 2) * blockReward * 365 / networkHashPerSecond * 1000000;

    result.rewardsDaily = Math.round(apy * vrscMiningHash / 365 * 10000) / 10000;
    result.rewardsDailyUSD = Math.round(apy * vrscMiningHash / 365 * vrscPrice * 10000) / 10000;
    result.rewardsMonthly = Math.round(apy * vrscMiningHash / 12 * 10000) / 10000;
    result.rewardsMonthlyUSD = Math.round(apy * vrscMiningHash / 12 * vrscPrice * 10000) / 10000;
    result.rewardsYearly = Math.round(apy * vrscMiningHash * 10000) / 10000;
    result.rewardsYearlyUSD = Math.round(apy * vrscMiningHash * vrscPrice * 10000) / 10000;

    result.oneDailyMiningHashReward = Math.round(blockReward / apy * 365);
    result.oneMonthlyMiningHashReward = Math.round(blockReward / apy * 12);
    result.oneYearlyMiningHashReward = Math.round(blockReward / apy);

    return result;
}


export async function getMarketCapStats(miningInfo, currencyInfo, pbaasConfig, nativeBasePrice) {
    let result = {};
    let circulatingSupply = 0;
    let circulatingSupplyPercentage = 0;
    let halvingCounter = 0;

    if (currencyInfo) {

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
            result.marketCap = circulatingSupply * nativeBasePrice;
            result.maxSupply = pbaasConfig.maxSupply;
            result.fullyDilutedMarketCap = pbaasConfig.maxSupply * nativeBasePrice;


        } else {
            const coinSupplyInfo = await getCoinSupply(pbaasConfig.rpcBaseUrl, miningInfo.blocks);
            if (coinSupplyInfo) {
                let circulatingSupply = coinSupplyInfo.total;
                if (coinSupplyInfo.result === "success") {
                    result.totalSupply = circulatingSupply;
                    result.circulatingSupply = circulatingSupply;
                    result.circulatingSupplyPercentage = circulatingSupply / pbaasConfig.maxSupply * 100;
                    result.marketCap = circulatingSupply * nativeBasePrice;
                    result.maxSupply = pbaasConfig.maxSupply;
                    result.fullyDilutedMarketCap = pbaasConfig.maxSupply * nativeBasePrice;
                }
            }
            else {
                result.totalSupply = "syncing";
                result.circulatingSupply = "syncing";
                result.circulatingSupplyPercentage = "syncing";
                result.marketCap = "syncing";
                result.maxSupply = "syncing";
                result.fullyDilutedMarketCap = "syncing";
            }
        }
    }
    return result;
}