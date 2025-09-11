import dotenv from 'dotenv';
dotenv.config();

export async function currencyReserveSuperBasket(priceArray, vrscBridgePrice) {
    let result = {};

    /* SuperBasket reserves */
    const getcurrencyResponse = await fetch(process.env.VERUS_REST_API + "multichain/getcurrency/SUPER🛒");
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let currencySuperBasketArray = [];

    let vrscCoingeckoPrice = 0;
    let tBTCvETHCoingeckoPrice = 0;
    let tBTCvETHBridgePrice = 0;
    let ethereumCoingeckoPrice = 0;
    let ethereumBridgePrice = 0;
    let SuperBasketvETHCoingeckoPrice = 0
    let supernetCoingeckoPrice = 0;
    let varrrCoingeckoPrice = 0;
    let vdexCoingeckoPrice = 0;
    let chipsCoingeckoPrice = 0;
    let scrvusdCoingeckoPrice = 0;

    let vrscBasketPrice = 0;

    let vrscReserve = 0;
    let tBTCvETHReserve = 0;
    let ethereumReserve = 0;

    let SuperBasketvETHReserve = 0;

    let estimatedSuperBasketValueUSDtBTC = 0;
    let estimatedSuperBasketValueUSDVRSC = 0;
    let estimatedSuperBasketValueVRSC = 0;
    let estimatedSuperBasketSupply = getcurrency.bestcurrencystate.supply;
    let estimatedSuperBasketValueUSD = 0;
    let estimatedSuperBasketReserveValueUSDVRSC = 0;

    priceArray.forEach((priceElm) => {
        if (priceElm.currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
            vrscCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
            tBTCvETHCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
            ethereumCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "i6SapneNdvpkrLPgqPhDVim7Ljek3h2UQZ") {
            supernetCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2") {
            varrrCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "iHog9UCTrn95qpUBFCZ7kKz7qWdMA8MQ6N") {
            vdexCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP") {
            chipsCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "i9nLSK4S1U5sVMq4eJUHR1gbFALz56J9Lj") {
            scrvusdCoingeckoPrice = priceElm.price;
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
                        if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            vrscReserve = reservesCurrency.reserves;
                            let priceNative = Math.round(tBTCvETHReserve / reservesCurrency.reserves * 100000000) / 100000000;

                            if (priceNative > 0) {
                                vrscBasketPrice = Math.round(tBTCvETHCoingeckoPrice * priceNative * 100) / 100;
                            }

                        }
                        if (reservesCurrency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                            tBTCvETHReserve = reservesCurrency.reserves;
                        }
                        if (reservesCurrency.currencyid === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
                            ethereumReserve = reservesCurrency.reserves;
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
                            currency.origin = "SUPER🛒";
                            currency.network = "vrsc";


                            if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                currency.priceNative = Math.round((tBTCvETHReserve * 1 / 0.20) / (currency.reserves * 1 / 0.25) * 100000000) / 100000000;
                                currency.pricelabel = "tBTCvETH";
                                currency.price = vrscBasketPrice = Math.round(tBTCvETHCoingeckoPrice * currency.priceNative * 100) / 100;
                            }
                            if (currencyId === "i6SapneNdvpkrLPgqPhDVim7Ljek3h2UQZ") {
                                currency.priceNative = Math.round((tBTCvETHReserve * 1 / 0.20) / (currency.reserves * 1 / 0.25) * 100000000) / 100000000;
                                currency.pricelabel = "tBTCvETH";
                                currency.price = Math.round(tBTCvETHCoingeckoPrice * currency.priceNative * 100) / 100;
                            }
                            if (currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                                currency.priceNative = Math.round((ethereumReserve * 1 / 0.10) / (currency.reserves * 1 / 0.20) * 100) / 100;
                                currency.pricelabel = "vETH";
                                currency.price = Math.round(ethereumCoingeckoPrice * currency.priceNative * 100) / 100;
                            }
                            if (currencyId === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
                                currency.priceNative = Math.round((tBTCvETHReserve * 1 / 0.20) / (currency.reserves * 1 / 0.10) * 100000000) / 100000000;
                                currency.pricelabel = "tBTCvETH";
                                currency.price = Math.round(tBTCvETHCoingeckoPrice * currency.priceNative * 100) / 100;
                            }
                            if (currencyId === "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2") {
                                currency.priceNative = Math.round((tBTCvETHReserve * 1 / 0.20) / (currency.reserves * 1 / 0.05) * 100000000) / 100000000;
                                currency.pricelabel = "tBTCvETH";
                                currency.price = Math.round(tBTCvETHCoingeckoPrice * currency.priceNative * 100) / 100;
                            }
                            if (currencyId === "iHog9UCTrn95qpUBFCZ7kKz7qWdMA8MQ6N") {
                                currency.priceNative = Math.round((tBTCvETHReserve * 1 / 0.20) / (currency.reserves * 1 / 0.05) * 100000000) / 100000000;
                                currency.pricelabel = "tBTCvETH";
                                currency.price = Math.round(tBTCvETHCoingeckoPrice * currency.priceNative * 100) / 100;
                            }
                            if (currencyId === "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP") {
                                currency.priceNative = Math.round((tBTCvETHReserve * 1 / 0.20) / (currency.reserves * 1 / 0.05) * 100000000) / 100000000;
                                currency.pricelabel = "tBTCvETH";
                                currency.price = (Math.round(tBTCvETHCoingeckoPrice * currency.priceNative * 100) / 100).toFixed(2);
                            }
                            if (currencyId === "i9nLSK4S1U5sVMq4eJUHR1gbFALz56J9Lj") {
                                currency.priceNative = Math.round((tBTCvETHReserve * 1 / 0.20) / (currency.reserves * 1 / 0.05) * 100000000) / 100000000;
                                currency.pricelabel = "tBTCvETH";
                                currency.price = Math.round(tBTCvETHCoingeckoPrice * currency.priceNative * 100) / 100;
                            }
                        }

                        if (priceArray.length > 0) {
                            priceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                        currency.coingeckoprice = Math.round(vrscBridgePrice * 100) / 100;
                                        currency.coingeckoLabel = "Bridge.vETH";
                                    }
                                    if (currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                                        currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                        currency.coingeckoLabel = "Coingecko";
                                    }
                                    if (currencyId === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
                                        currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                        currency.coingeckoLabel = "Coingecko";
                                    }
                                    if (currencyId === "i6SapneNdvpkrLPgqPhDVim7Ljek3h2UQZ") {
                                        currency.coingeckoprice = Math.round(price.price * 100000) / 100000;
                                        currency.coingeckoLabel = "Coingecko";
                                    }
                                    if (currencyId === "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2") {
                                        currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                        currency.coingeckoLabel = "Coingecko";
                                    }
                                    if (currencyId === "iHog9UCTrn95qpUBFCZ7kKz7qWdMA8MQ6N") {
                                        currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                        currency.coingeckoLabel = "Coingecko";
                                    }
                                    if (currencyId === "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP") {
                                        currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                        currency.coingeckoLabel = "Coingecko";
                                    }
                                    if (currencyId === "i9nLSK4S1U5sVMq4eJUHR1gbFALz56J9Lj") {
                                        currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                        currency.coingeckoLabel = "Coingecko";
                                    }
                                }
                            })
                        }


                        if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            estimatedSuperBasketValueUSDVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 4)).toLocaleString();
                            estimatedSuperBasketValueUSD = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 4 / estimatedSuperBasketSupply * 100) / 100).toLocaleString();
                            estimatedSuperBasketValueVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 4 / estimatedSuperBasketSupply / vrscBridgePrice * 100000000) / 100000000).toLocaleString();
                            estimatedSuperBasketReserveValueUSDVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 4));
                        }
                        if (reservesCurrency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                            estimatedSuperBasketValueUSDtBTC = (Math.round(tBTCvETHCoingeckoPrice * reservesCurrency.reserves * 5)).toLocaleString();
                        }
                    })
                    currency.currencyId = currencyId;
                    currency.currencyName = item[1];
                    currencySuperBasketArray.push(currency);
                }
            })
        })
    }

    /* estimated value of SuperBasket */
    currencySuperBasketArray.forEach((currency) => {
        currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 4 });
    })

    result.estimatedSuperBasketSupply = estimatedSuperBasketSupply
    result.currencySuperBasketArray = currencySuperBasketArray;
    result.estimatedSuperBasketValueUSDtBTC = estimatedSuperBasketValueUSDtBTC;
    result.estimatedSuperBasketValueUSDVRSC = estimatedSuperBasketValueUSDVRSC;
    result.estimatedSuperBasketValueUSD = estimatedSuperBasketValueUSD;
    result.estimatedSuperBasketValueVRSC = estimatedSuperBasketValueVRSC;
    result.estimatedSuperBasketReserveValueUSDVRSC = estimatedSuperBasketReserveValueUSDVRSC;
    return result;
}