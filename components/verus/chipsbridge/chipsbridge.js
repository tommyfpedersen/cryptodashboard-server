import dotenv from 'dotenv';
dotenv.config();
// import { saveVolumeDataToFile, getVolumeDataFromFile } from "../cache/cache.js";

let volumeInDollarsArrayLoadFromCache = false;


export async function currencyReserveBridgeChips(priceArray, vrscBridgePrice) {
    let result = {};

    /* VRSC-ETH Bridge reserves */
    const getcurrencyResponse = await fetch(process.env.VERUS_REST_API + "multichain/getcurrency/bridge.chips");
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let currencyBridgeChipsArray = [];
    let vrscCoingeckoPrice = 0;
    let chipsCoingeckoPrice = 0;
    let chipsBasketPrice = 0;
    let vrscReserve = 0;
    let chipsReserve = 0;
    let estimatedBridgeValue = 0;
    let estimatedBridgeChipsValueUSDBridgeChips = 0;
    let estimatedBridgeChipsValueUSDCHIPS = 0;
    let estimatedBridgeChipsValueUSDVRSC = 0;
    let estimatedBridgeChipsValueVRSC = 0;
    let estimatedBridgeChipsSupply = getcurrency.bestcurrencystate.supply;
    let estimatedBridgeChipsValueUSD = 0;


    priceArray.forEach((priceElm) => {
        if (priceElm.currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
            vrscCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP") {
            chipsCoingeckoPrice = priceElm.price;
        }
    })

    if (getcurrency) {
        let currencyIdArray = Object.values(getcurrency.currencies);
        let currencyNames = Object.entries(getcurrency.currencynames);

        /* find vrsc and bridge.chips reserve*/
        currencyIdArray.forEach((currencyId) => {
            currencyNames.forEach((item) => {
                let currency = {}
                if (item[0] === currencyId) {
                    getcurrency.bestcurrencystate.reservecurrencies.forEach((reservesCurrency) => {
                        if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            vrscReserve = reservesCurrency.reserves;
                        }
                        if (reservesCurrency.currencyid === "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP") {
                            chipsReserve = reservesCurrency.reserves;
                        }
                    })
                }
            })
        })


        currencyIdArray.forEach((currencyId) => {
            currencyNames.forEach((item) => {
                let currency = {}
                if (item[0] === currencyId) {
                    getcurrency.bestcurrencystate.reservecurrencies.forEach((reservesCurrency) => {
                        if (reservesCurrency.currencyid === currencyId) {
                            currency.reserves = reservesCurrency.reserves;//(reservesCurrency.reserves).toLocaleString(undefined, { minimumFractionDigits: 8 });
                            currency.weight = reservesCurrency.weight * 100;
                            currency.priceinreserve = reservesCurrency.priceinreserve;
                            currency.origin = "Bridge.CHIPS";
                            currency.network = "CHIPS";

                            if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                currency.priceNative = Math.round(chipsReserve / currency.reserves * 1000) / 1000;
                                currency.pricelabel = "CHIPS";
                                currency.price = vrscBridgePrice;
                            }
                            if (currencyId === "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP") {
                                currency.priceNative = (Math.round(vrscReserve / currency.reserves * 1000) / 1000).toFixed(4);
                                currency.pricelabel = "VRSC";
                                currency.price = chipsBasketPrice = (vrscBridgePrice * currency.priceNative).toFixed(2);
                            }
                        }

                        if (priceArray.length > 0) {
                            priceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                        currency.coingeckoprice = Math.round(vrscBridgePrice * 100) / 100;
                                        currency.coingeckoLabel = "Bridge.vETH";
                                    }
                                    if (currencyId === "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP") {
                                        currency.coingeckoprice = (Math.round(price.price * 1000) / 1000).toFixed(2);//Math.round(price.price.toFixed(10) * 10000) / 10000;//Math.round(price.price * 100000000) / 100000000;
                                        currency.coingeckoLabel = "Coingecko";
                                    }
                                }
                            })
                        }

                        if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            estimatedBridgeChipsValueUSDVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2)).toLocaleString();
                            estimatedBridgeChipsValueUSD = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 / estimatedBridgeChipsSupply * 100) / 100).toLocaleString();
                            estimatedBridgeChipsValueVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 / estimatedBridgeChipsSupply / vrscBridgePrice * 100) / 100).toLocaleString();
                        }
                        if (reservesCurrency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                            estimatedBridgeChipsValueUSDCHIPS = (Math.round(chipsCoingeckoPrice * reservesCurrency.reserves * 2)).toLocaleString();
                        }


                        // if (reservesCurrency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                        //     estimatedBridgeValue = (Math.round(reservesCurrency.reserves * 4)).toLocaleString();
                        //     estimatedBridgeValueUSD = (Math.round(reservesCurrency.reserves * 4 / estimatedBridgeSupply * 100) / 100).toLocaleString();
                        //     estimatedBridgeValueVRSC = (Math.round(reservesCurrency.reserves * 4 / estimatedBridgeSupply / vrscBridgePrice * 100000000) / 100000000).toLocaleString();
                        // }
                    })
                    currency.currencyId = currencyId;
                    currency.currencyName = item[1];
                    currencyBridgeChipsArray.push(currency);
                }
            })
        })
    }

    /* estimated value of bridge */
    currencyBridgeChipsArray.forEach((currency) => {
        currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 4 });
    })

    result.estimatedBridgeChipsSupply = estimatedBridgeChipsSupply;
    result.currencyBridgeChipsArray = currencyBridgeChipsArray;
    result.estimatedBridgeChipsValueUSDSuperVRSC = estimatedBridgeChipsValueUSDBridgeChips;
    result.estimatedBridgeChipsValueUSDVRSC = estimatedBridgeChipsValueUSDVRSC;
    result.estimatedBridgeChipsValueUSD = estimatedBridgeChipsValueUSD;
    result.estimatedBridgeChipsValueVRSC = estimatedBridgeChipsValueVRSC;
    return result;
}