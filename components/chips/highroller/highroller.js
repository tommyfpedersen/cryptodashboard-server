import dotenv from 'dotenv';
dotenv.config();

export async function currencyReserveHighroller(priceArray, vrscBasePrice, chipsBasePrice) {
    let result = {};

    /* Highroller reserves */
    const getcurrencyResponse = await fetch(process.env.VERUS_REST_API_CHIPS + "multichain/getcurrency/highroller.chips");
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let currencyHighrollerArray = [];

    let chipsCoingeckoPrice = 0;
    let ethereumCoingeckoPrice = 0;
    let tBTCvETHCoingeckoPrice = 0;

    let chipsReserve = 0;
    let vETHReserve = 0;
    let tBTCReserve = 0;


    let estimatedHighrollerValueUSDCHIPS = 0;
    let estimatedHighrollerValueCHIPS = 0;
    let estimatedHighrollerReserveValueUSDCHIPS = 0;
    let estimatedHighrollerReserveValueUSD = 0
    let estimatedHighrollerValueUSDtBTC = 0;
    let estimatedHighrollerReserveValueUSDtBTC = 0;


    let estimatedHighrollerValueUSDVRSC = 0;
    let estimatedHighrollerValueVRSC = 0;
    let estimatedHighrollerSupply = getcurrency.bestcurrencystate.supply;
    let estimatedHighrollerValueUSD = 0;
    let estimatedHighrollerReserveValueUSDVRSC = 0;

    priceArray.forEach((priceElm) => {
        if (priceElm.currencyId === "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP") {
            chipsCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
            ethereumCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
            tBTCvETHCoingeckoPrice = priceElm.price;
        }
    })


    if (getcurrency) {
        let currencyIdArray = Object.values(getcurrency.currencies);
        let currencyNames = Object.entries(getcurrency.currencynames);


        currencyIdArray.forEach((currencyId) => {
            currencyNames.forEach((item) => {
                let currency = {}
                if (item[0] === currencyId) {
                    getcurrency.bestcurrencystate.reservecurrencies.forEach((reservesCurrency) => {
                        if (reservesCurrency.currencyid === "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP") {
                            chipsReserve = reservesCurrency.reserves;
                        }
                        if (reservesCurrency.currencyid === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
                            vETHReserve = reservesCurrency.reserves;
                        }
                        if (reservesCurrency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                            tBTCReserve = reservesCurrency.reserves;
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
                            currency.reserves = reservesCurrency.reserves;
                            currency.weight = reservesCurrency.weight * 100;
                            currency.priceinreserve = reservesCurrency.priceinreserve;
                            currency.origin = "Highroller.CHIPS";
                            currency.network = "CHIPS";

                            if (currencyId === "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP") {
                                currency.priceNative = Math.round((tBTCReserve * 1 / 0.25) / (currency.reserves * 1 / 0.50) * 100000000) / 100000000;
                                currency.priceLabel = "tBTCvETH";
                                currency.price = (Math.round(tBTCvETHCoingeckoPrice * currency.priceNative * 100) / 100).toFixed(2);
                                currency.coingeckoPrice = Math.round(chipsBasePrice * 100) / 100;
                                currency.coingeckoLabel = "Bridge.CHIPS";
                            }
                            if (currencyId === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
                                currency.priceNative = Math.round((tBTCReserve * 1 / 0.25) / (currency.reserves * 1 / 0.25) * 100000000) / 100000000;
                                currency.priceLabel = "tBTCvETH";
                                currency.price = Math.round(tBTCvETHCoingeckoPrice * currency.priceNative * 100) / 100;
                            }
                            if (currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                                currency.priceNative = Math.round((vETHReserve * 1 / 0.25) / (currency.reserves * 1 / 0.25) * 100000000) / 100000000;
                                currency.priceLabel = "vETH";
                                currency.price = Math.round(ethereumCoingeckoPrice * currency.priceNative * 100) / 100;
                            }
                           
                        }

                        if (priceArray.length > 0) {
                            priceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    if (currencyId === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
                                        currency.coingeckoPrice = Math.round(price.price * 100) / 100;
                                        currency.coingeckoLabel = "Coingecko";
                                    }
                                    if (currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                                        currency.coingeckoPrice = Math.round(price.price * 100) / 100;
                                        currency.coingeckoLabel = "Coingecko";
                                    }
                                }
                            })
                        }


                         if (reservesCurrency.currencyid === "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP") {
                             estimatedHighrollerValueUSDCHIPS = (Math.round(chipsBasePrice * reservesCurrency.reserves * 4)).toLocaleString();
                             estimatedHighrollerValueCHIPS = (Math.round(chipsBasePrice * reservesCurrency.reserves * 4 / estimatedHighrollerSupply / chipsBasePrice * 100000000) / 100000000).toLocaleString();
                             estimatedHighrollerReserveValueUSDCHIPS = (Math.round(chipsBasePrice * reservesCurrency.reserves * 4));
                         }
                        if (reservesCurrency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                            
                            estimatedHighrollerValueUSDtBTC = (Math.round(tBTCvETHCoingeckoPrice * reservesCurrency.reserves * 4 / estimatedHighrollerSupply * 100) / 100).toLocaleString();
                            estimatedHighrollerReserveValueUSDtBTC = (Math.round(tBTCvETHCoingeckoPrice * reservesCurrency.reserves * 4)).toLocaleString();
                        }
                    })
                    currency.currencyId = currencyId;
                    currency.currencyName = item[1];
                    currencyHighrollerArray.push(currency);
                }
            })
        })
    }

    /* estimated value of Highroller */
    currencyHighrollerArray.forEach((currency) => {
        currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 4 });
    })

    result.estimatedHighrollerSupply = estimatedHighrollerSupply
    result.currencyHighrollerArray = currencyHighrollerArray;
    result.estimatedHighrollerValueUSDCHIPS = estimatedHighrollerValueUSDCHIPS;
    result.estimatedHighrollerValueCHIPS = estimatedHighrollerValueCHIPS
    result.estimatedHighrollerValueUSDtBTC = estimatedHighrollerValueUSDtBTC;
    result.estimatedHighrollerReserveValueUSDtBTC = estimatedHighrollerReserveValueUSDtBTC;
    result.estimatedHighrollerReserveValueUSDCHIPS = estimatedHighrollerReserveValueUSDCHIPS;
    //result.estimatedHighrollerValueVRSC = estimatedHighrollerValueVRSC;
    // result.estimatedHighrollerValueUSDVRSC = estimatedHighrollerValueUSDVRSC;
    // result.estimatedHighrollerReserveValueUSDVRSC = estimatedHighrollerReserveValueUSDVRSC;
    return result;
}