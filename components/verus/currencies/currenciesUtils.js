export function getCurrencyGroupList(allCurrenciesFromBaskets) {
    let currencyGroupList = [];

    const currencyNameList = new Set();

    // Find a list of currencies
    allCurrenciesFromBaskets.forEach((item) => {
        if (item.currencyReserve) {
            currencyNameList.add(item.currencyReserve.currencyName);
            item.currencyReserve.basketCurrencyArray.forEach((basketItem) => {
                currencyNameList.add(basketItem.currencyName);
            })
        }
    })

    // Group currencies by currencies names
    currencyNameList.forEach((currencyName) => {


        let currencyList = [];
        let currencyItem = {};
        let currencySupply = 0;
        let currencySupplyPriceUSD = 0;
        let totalVolume24Hours = 0;
        let totalVolume7Days = 0;
        let totalVolume30Days = 0;

        currencyItem.currencyName = currencyName;
        currencyItem.currencyList = currencyList;


        let coingeckoPriceAdded = [];

        allCurrenciesFromBaskets.forEach((item) => {

            if (item.currencyReserve) {
                if (item.currencyReserve.currencyName === currencyName) {

                    currencyList.push({
                        basketName: item.currencyReserve.currencyName,
                        currencyName: item.currencyReserve.currencyName,
                        currencyPriceUSD: item.currencyReserve.currencyPriceUSD < 1 ? Number(item.currencyReserve.currencyPriceUSD.toFixed(4)).toLocaleString() : Number(item.currencyReserve.currencyPriceUSD.toFixed(2)).toLocaleString(),
                        currencySupply: item.currencyReserve.currencySupply < 1 ? Number(item.currencyReserve.currencySupply.toFixed(4)).toLocaleString() : Number(item.currencyReserve.currencySupply.toFixed(0)).toLocaleString(),
                        currencySupplyPriceUSD: Number(item.currencyReserve.basketValueAnchorCurrencyUSD.toFixed(0)).toLocaleString(),
                        currencyNetwork: item.currencyReserve.nativeCurrencyName,
                        basketVolume24Hours: Number(item.currencyVolume24Hours.totalVolumeUSD.toFixed(0)).toLocaleString(),
                        basketVolume7Days: Number(item.currencyVolume7Days.totalVolumeUSD.toFixed(0)).toLocaleString(),
                        basketVolume30Days: Number(item.currencyVolume30Days.totalVolumeUSD.toFixed(0)).toLocaleString(),
                        coingeckoprice: item.currencyReserve.coingeckoprice
                    })

                    totalVolume24Hours = totalVolume24Hours + item.currencyVolume24Hours.totalVolumeUSD;
                    totalVolume7Days = totalVolume7Days + item.currencyVolume7Days.totalVolumeUSD;
                    totalVolume30Days = totalVolume30Days + item.currencyVolume30Days.totalVolumeUSD;
                    currencySupply = currencySupply + item.currencyReserve.currencySupply;
                    currencySupplyPriceUSD = currencySupplyPriceUSD + item.currencyReserve.basketValueAnchorCurrencyUSD;
                }


                item.currencyReserve.basketCurrencyArray.forEach((basketItem) => {

                    if (basketItem.currencyName === currencyName) {

                        currencyList.push({
                            basketName: item.currencyReserve.currencyName,
                            currencyName: basketItem.currencyName,
                            currencyNetwork: basketItem.network,
                            currencyPriceUSD: basketItem.priceUSD < 1 ? Number(basketItem.priceUSD.toFixed(4)).toLocaleString() : Number(basketItem.priceUSD.toFixed(2)).toLocaleString(),
                            currencySupply: basketItem.reserves < 1 ? Number(basketItem.reserves.toFixed(4)).toLocaleString() : Number(basketItem.reserves.toFixed(0)).toLocaleString(),
                            currencySupplyPriceUSD: Number(basketItem.reservePriceUSD.toFixed(0)).toLocaleString(),
                            basketVolume24Hours: Number(item.currencyVolume24Hours.totalVolumeUSD.toFixed(0)).toLocaleString(),
                            basketVolume7Days: Number(item.currencyVolume7Days.totalVolumeUSD.toFixed(0)).toLocaleString(),
                            basketVolume30Days: Number(item.currencyVolume30Days.totalVolumeUSD.toFixed(0)).toLocaleString()
                        })

                        //add coingecko price if exist
                        if (basketItem.coingeckoprice && !coingeckoPriceAdded.includes(currencyName)) {


                            currencyList.push({
                                basketName: "Coingecko",
                                currencyNetwork: "CEX/DEX",
                                currencyPriceUSD: basketItem.coingeckoprice < 1 ? Number(basketItem.coingeckoprice.toFixed(4)).toLocaleString() : Number(basketItem.coingeckoprice.toFixed(2)).toLocaleString(),
                                currencySupply: "-",
                                currencySupplyPriceUSD: "",
                                basketVolume24Hours: "",
                                basketVolume7Days: "",
                                basketVolume30Days: ""
                            })
                            coingeckoPriceAdded.push(currencyName);
                        }

                        totalVolume24Hours = totalVolume24Hours + item.currencyVolume24Hours.totalVolumeUSD;
                        totalVolume7Days = totalVolume7Days + item.currencyVolume7Days.totalVolumeUSD;
                        totalVolume30Days = totalVolume30Days + item.currencyVolume30Days.totalVolumeUSD;
                        currencySupply = currencySupply + basketItem.reserves;
                        currencySupplyPriceUSD = currencySupplyPriceUSD + basketItem.reservePriceUSD;
                    }
                })
            }
        })

        currencyItem.currencySupply = currencySupply < 1 ? Number(currencySupply.toFixed(4)).toLocaleString() : Number(currencySupply.toFixed(0)).toLocaleString();
        currencyItem.currencySupplyPriceUSD = Number(currencySupplyPriceUSD.toFixed(0)).toLocaleString();
        // sort currency list by price
        currencyItem.currencyList.sort((a, b) => parseFloat(b.currencyPriceUSD.replace(/,/g, '')) - parseFloat(a.currencyPriceUSD.replace(/,/g, '')));

        // total basket volume usd
        currencyItem.totalVolume24Hours = Number(totalVolume24Hours.toFixed(0)).toLocaleString();
        currencyItem.totalVolume7Days = Number(totalVolume7Days.toFixed(0)).toLocaleString();
        currencyItem.totalVolume30Days = Number(totalVolume30Days.toFixed(0)).toLocaleString();

        currencyGroupList.push(currencyItem);
    })

    currencyGroupList.sort((a, b) => parseFloat(b.currencySupplyPriceUSD.replace(/,/g, '')) - parseFloat(a.currencySupplyPriceUSD.replace(/,/g, '')));
    return currencyGroupList;
}