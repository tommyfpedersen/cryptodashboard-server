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
        let dailyEarningsPerGH = parseFloat( item.blockRewardUSD.replace(/,/g, '') + item.feeRewardUSD.replace(/,/g, '')) / parseFloat(item.networkHashrate.replace(/,/g, '')) * (24 * (3600 / item.blocktime) / 2);
        let resultObject = {
            blockchain: item.blockchain,
            dailyEarningsPerGH: (Math.round(dailyEarningsPerGH * 10000) / 10000).toFixed(4)
        }
        resultArray.push(resultObject);
    })
    resultArray.sort((a, b) => b.dailyEarningsPerGH - a.dailyEarningsPerGH);
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

// result.vrscMiningHash = vrscMiningHash;
// let apy = (24 * (3600 / blocktime) / 2) * blockReward * 365 / networkHashPerSecond * 1000000;

// result.rewardsDaily = Math.round(apy * vrscMiningHash / 365 * 10000) / 10000;
// result.rewardsDailyUSD = Math.round(apy * vrscMiningHash / 365 * vrscPrice * 10000) / 10000;
// result.rewardsMonthly = Math.round(apy * vrscMiningHash / 12 * 10000) / 10000;
// result.rewardsMonthlyUSD = Math.round(apy * vrscMiningHash / 12 * vrscPrice * 10000) / 10000;
// result.rewardsYearly = Math.round(apy * vrscMiningHash * 10000) / 10000;
// result.rewardsYearlyUSD = Math.round(apy * vrscMiningHash * vrscPrice * 10000) / 10000;

// result.oneDailyMiningHashReward = Math.round(blockReward /  apy * 365 );
// result.oneMonthlyMiningHashReward = Math.round(blockReward /  apy * 12 );
// result.oneYearlyMiningHashReward = Math.round(blockReward /  apy );