import { getCurrenciesConfig } from './currenciesConfig.js';

export function getCurrenciesAddresses(allCurrenciesFromBaskets) {
    // TODO
    const resultArray = [];
    return result
}
export function getBasketsInfo(allCurrenciesFromBaskets) {
    const resultArray = [];

    let basketReserve = 0
    let bitcoinInReserve = 0;
    let bitcoinInReserveUSD = 0;
    let ethereumInReserve = 0;
    let ethereumInReserveUSD = 0;
    let vrscInReserve = 0;
    let vrscInReserveUSD = 0;
    let stableCoinsInReserve = 0;
    let stableCoinsInReserveUSD = 0;

    let stableCoinArray = ["DAI.vETH", "scrvUSD.vETH", "EURC.vETH", "vUSDT.vETH", "vUSDC.vETH"]


    allCurrenciesFromBaskets.forEach((item) => {
        // console.log(item)
        basketReserve = basketReserve + item.currencyReserve.basketValueAnchorCurrencyUSD;

        item.currencyReserve.basketCurrencyArray.forEach((basketCurrency) => {

            if (basketCurrency.currencyName === 'tBTC.vETH') {
                bitcoinInReserve = bitcoinInReserve + basketCurrency.reserves
                bitcoinInReserveUSD = bitcoinInReserveUSD + basketCurrency.reservePriceUSD;
            }

            if (basketCurrency.currencyName === 'vETH') {
                ethereumInReserve = ethereumInReserve + basketCurrency.reserves
                ethereumInReserveUSD = ethereumInReserveUSD + basketCurrency.reservePriceUSD;
            }

            if (basketCurrency.currencyName === 'VRSC') {
                vrscInReserve = vrscInReserve + basketCurrency.reserves
                vrscInReserveUSD = vrscInReserveUSD + basketCurrency.reservePriceUSD;
            }
            if (stableCoinArray.includes(basketCurrency.currencyName)) {
                stableCoinsInReserve = stableCoinsInReserve + basketCurrency.reserves
                stableCoinsInReserveUSD = stableCoinsInReserveUSD + basketCurrency.reservePriceUSD
            }
            //console.log(basketCurrency)
        })
    })

    let resultObject = {
        currencySupplyPriceUSD: Number(basketReserve.toFixed(0)).toLocaleString(),
        bitcoinInReserve: Math.round(bitcoinInReserve).toLocaleString(),
        bitcoinInReserveUSD: Math.round(bitcoinInReserveUSD).toLocaleString(),
        ethereumInReserve: Math.round(ethereumInReserve).toLocaleString(),
        ethereumInReserveUSD: Math.round(ethereumInReserveUSD).toLocaleString(),
        vrscInReserve: Math.round(vrscInReserve).toLocaleString(),
        vrscInReserveUSD: Math.round(vrscInReserveUSD).toLocaleString(),
        stableCoinsInReserve: Math.round(stableCoinsInReserve).toLocaleString(),
        stableCoinsInReserveUSD: Math.round(stableCoinsInReserveUSD).toLocaleString()
    }
    resultArray.push(resultObject)

    return resultArray
}

export function getTotalBasketsVolume(allCurrenciesFromBaskets) {
    const resultArray = [];
    let totalVolume24HoursUSD = 0;
    let totalVolume7DaysUSD = 0;
    let totalVolume30DaysUSD = 0;

    allCurrenciesFromBaskets.forEach((item) => {

        if (item.currencyVolume24Hours.totalVolumeUSD) {
            totalVolume24HoursUSD = totalVolume24HoursUSD + item.currencyVolume24Hours.totalVolumeUSD
        }
        if (item.currencyVolume7Days.totalVolumeUSD) {
            totalVolume7DaysUSD = totalVolume7DaysUSD + item.currencyVolume7Days.totalVolumeUSD
        }
        if (item.currencyVolume30Days.totalVolumeUSD) {
            totalVolume30DaysUSD = totalVolume30DaysUSD + item.currencyVolume30Days.totalVolumeUSD
        }
    })

    let resultObject = {
        totalVolume24HoursUSD: Math.round(totalVolume24HoursUSD).toLocaleString(),
        totalVolume7DaysUSD: Math.round(totalVolume7DaysUSD).toLocaleString(),
        totalVolume30DaysUSD: Math.round(totalVolume30DaysUSD).toLocaleString()
    }
    resultArray.push(resultObject)

    return resultArray
}





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
                        coingeckoprice: item.currencyReserve.coingeckoprice,
                        currencyType: "Basket",
                        currencyStartBlock: item.currencyReserve.currencyStartBlock,
                        currencyInPreconversion: item.currencyReserve.currencyInPreconversion
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
                            basketVolume30Days: Number(item.currencyVolume30Days.totalVolumeUSD.toFixed(0)).toLocaleString(),
                            currencyType: "Token"
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

export async function getAddressBalance(rpcBaseUrl, address) {
    let result = {};
    let getAddressBalanceArray = [];
    let getAddressBalance = {};
    let verusAddress = "";
    if (address) {
        verusAddress = decodeURIComponent(address);
    } else {
        verusAddress = "none";//"RCdXBieidGuXmK8Tw2gBoXWxi16UgqyKc7";
    }

    // vrsc
    try {
        const getAddressBalanceResponse = await fetch(rpcBaseUrl + "addressindex/getaddressbalance/" + verusAddress);
        const getAddressBalanceResult = await getAddressBalanceResponse.json();
        getAddressBalance = getAddressBalanceResult.result;
    } catch (error) {
        console.log("no verus api connected...")
    }


    if (getAddressBalance?.currencybalance) {

        let currencyIdArray = Object.keys(getAddressBalance.currencybalance);

        currencyIdArray.forEach((item) => {

            if (getAddressBalance.currencybalance < 0.000001) {
                return;
            }

            if ("i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV" === item) {

                getAddressBalanceArray.push({ currencyName: "VRSC", amount: getAddressBalance.currencybalance.i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV })
            }
            if ("iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM" === item) {
                getAddressBalanceArray.push({ currencyName: "DAI.vETH", amount: getAddressBalance.currencybalance.iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM })
            }
            if ("iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4" === item) {
                getAddressBalanceArray.push({ currencyName: "MKR.vETH", amount: getAddressBalance.currencybalance.iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4 })
            }
            if ("i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X" === item) {
                if (getAddressBalance.currencybalance.i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X < 0.00001) {
                    return;
                }
                getAddressBalanceArray.push({ currencyName: "vETH", amount: getAddressBalance.currencybalance.i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X })
            }
            if ("i3f7tSctFkiPpiedY8QR5Tep9p4qDVebDx" === item) {
                getAddressBalanceArray.push({ currencyName: "Bridge.vETH", amount: getAddressBalance.currencybalance.i3f7tSctFkiPpiedY8QR5Tep9p4qDVebDx })
            }
            if ("iHax5qYQGbcMGqJKKrPorpzUBX2oFFXGnY" === item) {
                getAddressBalanceArray.push({ currencyName: "Pure", amount: getAddressBalance.currencybalance.iHax5qYQGbcMGqJKKrPorpzUBX2oFFXGnY })
            }
            if ("iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU" === item) {
                getAddressBalanceArray.push({ currencyName: "tBTC.vETH", amount: getAddressBalance.currencybalance.iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU })
            }
            if ("i4Xr5TAMrDTD99H69EemhjDxJ4ktNskUtc" === item) {
                getAddressBalanceArray.push({ currencyName: "Switch", amount: getAddressBalance.currencybalance.i4Xr5TAMrDTD99H69EemhjDxJ4ktNskUtc })
            }
            if ("i61cV2uicKSi1rSMQCBNQeSYC3UAi9GVzd" === item) {
                getAddressBalanceArray.push({ currencyName: "vUSDC.vETH", amount: getAddressBalance.currencybalance.i61cV2uicKSi1rSMQCBNQeSYC3UAi9GVzd })
            }
            if ("iC5TQFrFXSYLQGkiZ8FYmZHFJzaRF5CYgE" === item) {
                getAddressBalanceArray.push({ currencyName: "EURC.vETH", amount: getAddressBalance.currencybalance.iC5TQFrFXSYLQGkiZ8FYmZHFJzaRF5CYgE })
            }
            if ("iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2" === item) {
                getAddressBalanceArray.push({ currencyName: "vARRR", amount: getAddressBalance.currencybalance.iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2 })
            }
            if ("i9kVWKU2VwARALpbXn4RS9zvrhvNRaUibb" === item) {
                getAddressBalanceArray.push({ currencyName: "Kaiju", amount: getAddressBalance.currencybalance.i9kVWKU2VwARALpbXn4RS9zvrhvNRaUibb })
            }
            if ("iRt7tpLewArQnRddBVFARGKJStK6w5pDmC" === item) {
                getAddressBalanceArray.push({ currencyName: "NATI", amount: getAddressBalance.currencybalance.iRt7tpLewArQnRddBVFARGKJStK6w5pDmC })
            }
            if ("iL62spNN42Vqdxh8H5nrfNe8d6Amsnfkdx" === item) {
                getAddressBalanceArray.push({ currencyName: "NATI.vETH", amount: getAddressBalance.currencybalance.iL62spNN42Vqdxh8H5nrfNe8d6Amsnfkdx })
            }
            if ("iHnYAmrS45Hb8GVgyzy7nVQtZ5vttJ9N3X" === item) {
                getAddressBalanceArray.push({ currencyName: "SUPERVRSC", amount: getAddressBalance.currencybalance.iHnYAmrS45Hb8GVgyzy7nVQtZ5vttJ9N3X })
            }
            if ("i6SapneNdvpkrLPgqPhDVim7Ljek3h2UQZ" === item) {
                getAddressBalanceArray.push({ currencyName: "SUPERNET", amount: getAddressBalance.currencybalance.i6SapneNdvpkrLPgqPhDVim7Ljek3h2UQZ })
            }
            if ("iAik7rePReFq2t7LZMZhHCJ52fT5pisJ5C" === item) {
                getAddressBalanceArray.push({ currencyName: "vYIELD", amount: getAddressBalance.currencybalance.iAik7rePReFq2t7LZMZhHCJ52fT5pisJ5C })
            }
            if ("i9nLSK4S1U5sVMq4eJUHR1gbFALz56J9Lj" === item) {
                getAddressBalanceArray.push({ currencyName: "scrvUSD.vETH", amount: getAddressBalance.currencybalance.i9nLSK4S1U5sVMq4eJUHR1gbFALz56J9Lj })
            }
            if ("iCDjBN71SbSppgsNTpwwMBT69399DpV4hA" === item) {
                getAddressBalanceArray.push({ currencyName: "Kek🐸", amount: getAddressBalance.currencybalance.iCDjBN71SbSppgsNTpwwMBT69399DpV4hA })
            }
            if ("i5VVBEi6efBrXMaeqFW3MTPSzbmpNLysGR" === item) {
                getAddressBalanceArray.push({ currencyName: "pepecoin.vETH", amount: getAddressBalance.currencybalance.i5VVBEi6efBrXMaeqFW3MTPSzbmpNLysGR })
            }
            if ("i3nokiCTVevZMLpR3VmZ7YDfCqA5juUqqH" === item) {
                getAddressBalanceArray.push({ currencyName: "Bridge.CHIPS", amount: getAddressBalance.currencybalance.i3nokiCTVevZMLpR3VmZ7YDfCqA5juUqqH })
            }
            if ("iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP" === item) {
                getAddressBalanceArray.push({ currencyName: "CHIPS", amount: getAddressBalance.currencybalance.iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP })
            }
            if ("iFPazWbwUnTHQYUiH5upZMqBtcEhfRdE4v" === item) {
                getAddressBalanceArray.push({ currencyName: "SUPER🛒", amount: getAddressBalance.currencybalance.iFPazWbwUnTHQYUiH5upZMqBtcEhfRdE4v })
            }
        })
    }
    result.verusAddress = verusAddress;
    result.getAddressBalanceArray = getAddressBalanceArray;
    return result;
}