export function calculateUserStakingRewards(blockchain, mainRenderData, stakingAmount) {
    let pbaasItem = mainRenderData.pbaasList.filter((item) => { return item.blockchain === blockchain })[0];
    let circulatingSupply = parseFloat(pbaasItem.circulatingSupply.replace(/,/g, ''));
    let stakingSupply = parseFloat(pbaasItem.stakingSupply.replace(/,/g, ''));
    let calculateStakingResult = calculateStakingRewards(pbaasItem.blocktime, pbaasItem.blockReward, circulatingSupply, stakingSupply, stakingAmount, pbaasItem.nativePrice);

    pbaasItem.stakingAmount = calculateStakingResult.stakingAmount;
    pbaasItem.stakingRewardsDaily = calculateStakingResult.stakingRewardsDaily;
    pbaasItem.stakingRewardsDailyUSD = calculateStakingResult.stakingRewardsDailyUSD;
    pbaasItem.stakingRewardsMonthly = calculateStakingResult.stakingRewardsMonthly;
    pbaasItem.stakingRewardsMonthlyUSD = calculateStakingResult.stakingRewardsMonthlyUSD;
    pbaasItem.stakingRewardsYearly = calculateStakingResult.stakingRewardsYearly;
    pbaasItem.stakingRewardsYearlyUSD = calculateStakingResult.stakingRewardsYearlyUSD;
}

export function calculateStakingRewards(blocktime, blockReward, totalSupply, stakingSupply, stakingAmountUnencoded, nativePrice) {
    let result = {};
    let stakingAmount = 100;
    if (stakingAmountUnencoded) {
        stakingAmount = parseInt(decodeURIComponent(stakingAmountUnencoded));
    }

    result.stakingAmount = stakingAmount;
    result.stakingPct = stakingSupply / totalSupply * 100;
    let apy = (24 * (3600 / blocktime) / 2) * blockReward * 365 / stakingSupply;
    result.stakingApy = Math.round(apy * 10000) / 100;

    result.stakingRewardsDaily = Math.round(apy * stakingAmount / 365 * 10000) / 10000;
    result.stakingRewardsDailyUSD = Math.round(apy * stakingAmount / 365 * nativePrice * 10000) / 10000;

    result.stakingRewardsMonthly = Math.round(apy * stakingAmount / 12 * 10000) / 10000;
    result.stakingRewardsMonthlyUSD = Math.round(apy * stakingAmount / 12 * nativePrice * 10000) / 10000;

    result.stakingRewardsYearly = Math.round(apy * stakingAmount * 10000) / 10000;
    result.stakingRewardsYearlyUSD = Math.round(apy * stakingAmount * nativePrice * 10000) / 10000;

    result.oneDailyStakeAmount = Math.round(blockReward / apy * 365);
    result.oneMonthlyStakeAmount = Math.round(blockReward / apy * 12);
    result.oneYearlyStakeAmount = Math.round(blockReward / apy);
    result.oneDailyStakeAmountUSD = Math.round(blockReward / apy * 365 * nativePrice);
    result.oneMonthlyStakeAmountUSD = Math.round(blockReward / apy * 12 * nativePrice);
    result.oneYearlyStakeAmountUSD = Math.round(blockReward / apy * nativePrice);

    return result;
}

export function calculateUserMiningRewards(blockchain, mainRenderData, miningHashInput) {
    let pbaasItem = mainRenderData.pbaasList.filter((item) => { return item.blockchain === blockchain })[0];
    let networkHashrate = parseInt(pbaasItem.networkHashrate.replace(/,/g, '')) * 1000000000;
    let calculateMiningResult = calculateMiningRewards(pbaasItem.blocktime, pbaasItem.blockReward, networkHashrate, miningHashInput, pbaasItem.nativePrice);
    pbaasItem.miningHash = calculateMiningResult.miningHash;
    pbaasItem.miningRewardsDaily = calculateMiningResult.miningRewardsDaily;
    pbaasItem.miningRewardsDailyUSD = calculateMiningResult.miningRewardsDailyUSD;
    pbaasItem.miningRewardsMonthly = calculateMiningResult.miningRewardsMonthly;
    pbaasItem.miningRewardsMonthlyUSD = calculateMiningResult.miningRewardsMonthlyUSD;
    pbaasItem.miningRewardsYearly = calculateMiningResult.miningRewardsYearly;
    pbaasItem.miningRewardsYearlyUSD = calculateMiningResult.miningRewardsYearlyUSD;
}

export function calculateMiningRewards(blocktime, blockReward, networkHashPerSecond, miningHashUnencoded, nativePrice) {
    let result = {};
    let miningHash = 1;
    if (miningHashUnencoded) {
        miningHash = parseInt(decodeURIComponent(miningHashUnencoded));
    }

    result.miningHash = miningHash;
    let apy = (24 * (3600 / blocktime) / 2) * blockReward * 365 /  parseInt(networkHashPerSecond) * 1000000;

    result.miningRewardsDaily = Math.round(apy * miningHash / 365 * 10000) / 10000;
    result.miningRewardsDailyUSD = Math.round(apy * miningHash / 365 * nativePrice * 10000) / 10000;
    result.miningRewardsMonthly = Math.round(apy * miningHash / 12 * 10000) / 10000;
    result.miningRewardsMonthlyUSD = Math.round(apy * miningHash / 12 * nativePrice * 10000) / 10000;
    result.miningRewardsYearly = Math.round(apy * miningHash * 10000) / 10000;
    result.miningRewardsYearlyUSD = Math.round(apy * miningHash * nativePrice * 10000) / 10000;

    result.oneDailyMiningHashReward = Math.round(blockReward / apy * 365);
    result.oneMonthlyMiningHashReward = Math.round(blockReward / apy * 12);
    result.oneYearlyMiningHashReward = Math.round(blockReward / apy);

    return result;
}
export function getMarketCapArray(pbaasList) {
    const resultArray = [];
    pbaasList.forEach((item) => {
        let resultObject = {
            blockchain: item.blockchain,
            marketCap: item.marketCap
        }
        resultArray.push(resultObject);
    })
    resultArray.sort((a, b) => parseFloat(b.marketCap.replace(/,/g, '')) - parseFloat(a.marketCap.replace(/,/g, '')));
    return resultArray;
}
export function getIDPriceListArray(pbaasList) {
    const resultArray = [];
    pbaasList.forEach((item) => {
        let resultObject = {
            blockchain: item.blockchain,
            priceId1RefNotYoursUSD: item.priceId1RefNotYoursUSD
        }
        resultArray.push(resultObject);
    })
    resultArray.sort((a, b) => parseFloat(b.priceId1RefNotYoursUSD.replace(/,/g, '')) - parseFloat(a.priceId1RefNotYoursUSD.replace(/,/g, '')));
    return resultArray;
}
export function getCurrencyPriceListArray(pbaasList) {
    const resultArray = [];
    pbaasList.forEach((item) => {
        let resultObject = {
            blockchain: item.blockchain,
            priceCurrencyUSD: item.priceCurrencyUSD
        }
        resultArray.push(resultObject);
    })
    resultArray.sort((a, b) => parseFloat(b.priceCurrencyUSD.replace(/,/g, '')) - parseFloat(a.priceCurrencyUSD.replace(/,/g, '')));
    return resultArray;
}
export function getAPYArray(pbaasList) {
    const resultArray = [];
    pbaasList.forEach((item) => {
        let resultObject = {
            blockchain: item.blockchain,
            stakingApy: item.stakingApy
        }
        resultArray.push(resultObject);
    })
    resultArray.sort((a, b) => parseFloat(b.stakingApy.replace(/,/g, '')) - parseFloat(a.stakingApy.replace(/,/g, '')));
    return resultArray;
}

export function getDailyEarningsPerGHArray(pbaasList) {
    const resultArray = [];

    pbaasList.forEach((item) => {
        let dailyEarningsPerGH = parseFloat(item.blockRewardUSD.replace(/,/g, '') + item.feeRewardUSD.replace(/,/g, '')) / parseFloat(item.networkHashrate.replace(/,/g, '')) * (24 * (3600 / item.blocktime) / 2);
        let resultObject = {
            blockchain: item.blockchain,
            dailyEarningsPerGH: (Math.round(dailyEarningsPerGH * 10000) / 10000).toFixed(4)
        }
        resultArray.push(resultObject);
    })
    resultArray.sort((a, b) => b.dailyEarningsPerGH - a.dailyEarningsPerGH);
    return resultArray;
}
export function getFeePoolRewardArray(pbaasList) {
    const resultArray = [];
    pbaasList.forEach((item) => {
        let resultObject = {
            blockchain: item.blockchain,
            feeReward: (Math.round(item.feeReward * 100000000) / 100000000).toFixed(8).toLocaleString()
        }
        resultArray.push(resultObject);
    })
    resultArray.sort((a, b) => parseFloat(b.feeReward.replace(/,/g, '')) - parseFloat(a.feeReward.replace(/,/g, '')));
    return resultArray;
}
export function getNetworkHashrateArray(pbaasList) {
    const resultArray = [];
    pbaasList.forEach((item) => {
        let resultObject = {
            blockchain: item.blockchain,
            networkHashrate: item.networkHashrate
        }
        resultArray.push(resultObject);
    })
    resultArray.sort((a, b) => parseFloat(b.networkHashrate.replace(/,/g, '')) - parseFloat(a.networkHashrate.replace(/,/g, '')));
    return resultArray;
}