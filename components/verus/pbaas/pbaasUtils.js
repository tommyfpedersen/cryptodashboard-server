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
            priceId1RefYoursUSD: item.priceId1RefYoursUSD
        }
        resultArray.push(resultObject);
    })
    resultArray.sort((a, b) => parseFloat(b.priceId1RefYoursUSD.replace(/,/g, '')) - parseFloat(a.priceId1RefYoursUSD.replace(/,/g, '')));
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
export function getFeePoolRewardArray(pbaasList) {
    const resultArray = [];
    pbaasList.forEach((item) => {
        let resultObject = {
            blockchain: item.blockchain,
            feeReward: (Math.round(item.feeReward*100000000)/100000000).toFixed(8).toLocaleString()
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