import dotenv from 'dotenv';
import client from '../../../redisClient.js';
dotenv.config();

export async function currencyReserveSuperVRSC(priceArray, vrscBridgePrice) {
    let result = {};

    try {


        /* SUPERVRSC reserves */
        const getcurrencyResponse = await fetch(process.env.VERUS_REST_API + "multichain/getcurrency/supervrsc");
        const getcurrencyResult = await getcurrencyResponse.json();
        const getcurrency = getcurrencyResult.result;

        let currencySuperVRSCArray = [];

        let supernetCoingeckoPrice = 0;
        let vrscCoingeckoPrice = 0;
        let superVRSCBasketPrice = 0;
        let vrscReserve = 0;
        let superVRSCReserve = 0;
        let supernetReserve = 0;
        let estimatedSuperVRSCValueUSDSuperVRSC = 0;
        let estimatedSuperVRSCValueUSDVRSC = 0;
        let estimatedSuperVRSCValueVRSC = 0;
        let estimatedSuperVRSCSupply = getcurrency.bestcurrencystate.supply;
        let estimatedSuperVRSCValueUSD = 0;

        priceArray.forEach((priceElm) => {
            if (priceElm.currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                vrscCoingeckoPrice = priceElm.price;
            }
            if (priceElm.currencyId === "i6SapneNdvpkrLPgqPhDVim7Ljek3h2UQZ") {
                supernetCoingeckoPrice = priceElm.price;
            }
        })


        if (getcurrency) {
            let currencyIdArray = Object.values(getcurrency.currencies);
            let currencyNames = Object.entries(getcurrency.currencynames);

            /* find vrsc value*/
            currencyIdArray.forEach((currencyId) => {
                currencyNames.forEach((item) => {
                    let currency = {}
                    if (item[0] === currencyId) {
                        getcurrency.bestcurrencystate.reservecurrencies.forEach((reservesCurrency) => {
                            if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                vrscReserve = reservesCurrency.reserves;
                            }
                            if (reservesCurrency.currencyid === "i6SapneNdvpkrLPgqPhDVim7Ljek3h2UQZ") {
                                supernetReserve = reservesCurrency.reserves;
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
                                currency.origin = "SUPERVRSC";
                                currency.network = "vrsc";

                                if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                    currency.priceNative = Math.round(supernetReserve / currency.reserves * 1000) / 1000;
                                    currency.pricelabel = "SUPERNET";
                                    currency.price = vrscBridgePrice;
                                }
                                if (currencyId === "i6SapneNdvpkrLPgqPhDVim7Ljek3h2UQZ") {
                                    currency.priceNative = (Math.round(vrscReserve / currency.reserves * 1000) / 1000).toFixed(4);
                                    currency.pricelabel = "VRSC";
                                    currency.price = superVRSCBasketPrice = (vrscBridgePrice * currency.priceNative).toFixed(2);
                                }
                            }

                            if (priceArray.length > 0) {
                                priceArray.forEach((price) => {
                                    if (price.currencyId === currencyId) {
                                        if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                            currency.coingeckoprice = Math.round(vrscBridgePrice * 100) / 100;
                                            currency.coingeckoLabel = "Bridge.vETH";
                                        }
                                        if (currencyId === "i6SapneNdvpkrLPgqPhDVim7Ljek3h2UQZ") {
                                            currency.coingeckoprice = (Math.round(price.price * 1000) / 1000).toFixed(2);//Math.round(price.price.toFixed(10) * 10000) / 10000;//Math.round(price.price * 100000000) / 100000000;
                                            currency.coingeckoLabel = "Coingecko";
                                        }
                                    }
                                })
                            }


                            if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                estimatedSuperVRSCValueUSDVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2)).toLocaleString();
                                estimatedSuperVRSCValueUSD = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 / estimatedSuperVRSCSupply * 100) / 100).toLocaleString();
                                estimatedSuperVRSCValueVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 / estimatedSuperVRSCSupply / vrscBridgePrice * 100) / 100).toLocaleString();
                            }
                            if (reservesCurrency.currencyid === "i6SapneNdvpkrLPgqPhDVim7Ljek3h2UQZ") {
                                estimatedSuperVRSCValueUSDSuperVRSC = (Math.round(supernetCoingeckoPrice * reservesCurrency.reserves * 2)).toLocaleString();
                            }
                        })
                        currency.currencyId = currencyId;
                        currency.currencyName = item[1];
                        currencySuperVRSCArray.push(currency);
                    }

                })
            })
        }

        /* estimated value of SuperVRSC */
        currencySuperVRSCArray.forEach((currency) => {
            currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 4 });
        })

        result.estimatedSuperVRSCSupply = estimatedSuperVRSCSupply;
        result.currencySuperVRSCArray = currencySuperVRSCArray;
        result.estimatedSuperVRSCValueUSDSuperVRSC = estimatedSuperVRSCValueUSDSuperVRSC;
        result.estimatedSuperVRSCValueUSDVRSC = estimatedSuperVRSCValueUSDVRSC;
        result.estimatedSuperVRSCValueUSD = estimatedSuperVRSCValueUSD;
        result.estimatedSuperVRSCValueVRSC = estimatedSuperVRSCValueVRSC;
    }
    catch {
        console.log("supervrsc fetch failed");
        client.set("fetchingerror", JSON.stringify(true));
    }

    return result;
}