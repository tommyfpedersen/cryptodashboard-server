import dotenv from 'dotenv';
dotenv.config();

export async function currencyReserveKekFrog(priceArray, vrscBridgePrice) {
    let result = {};

    /* KekFrog reserves */
    const getcurrencyResponse = await fetch(process.env.VERUS_REST_API + "multichain/getcurrency/Kek🐸");
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let currencyKekFrogArray = [];

    let vrscCoingeckoPrice = 0;
    let pepecoinvETHCoingeckoPrice = 0;
    let vrscBasketPrice = 0;

    let vrscReserve = 0;
    let kekFrogvETHReserve = 0;
    let pepecoinvETHReserve = 0;

    // let estimatedKekFrogValueUSDtBTC = 0;
    let estimatedKekFrogReserveValue = 0;
    let estimatedKekFrogValue = 0;
    let estimatedKekFrogValueUSDVRSC = 0;
    let estimatedKekFrogValueVRSC = 0;
    let estimatedKekFrogSupply = getcurrency.bestcurrencystate.supply;
    let estimatedKekFrogValueUSD = 0;

    priceArray.forEach((priceElm) => {
        if (priceElm.currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
            vrscCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "i5VVBEi6efBrXMaeqFW3MTPSzbmpNLysGR") {
            pepecoinvETHCoingeckoPrice = priceElm.price;
        }
    })


    if (getcurrency) {
        let currencyIdArray = Object.values(getcurrency.currencies);
        let currencyNames = Object.entries(getcurrency.currencynames);

        /* find vrsc value*/
        currencyIdArray.forEach((currencyId) => {
            currencyNames.forEach((item) => {
                if (item[0] === currencyId) {
                    getcurrency.bestcurrencystate.reservecurrencies.forEach((reservesCurrency) => {
                        if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            vrscReserve = reservesCurrency.reserves;
                            estimatedKekFrogValueVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 / estimatedKekFrogSupply / vrscBridgePrice * 100) / 100).toLocaleString();
                        }
                        if (reservesCurrency.currencyid === "i5VVBEi6efBrXMaeqFW3MTPSzbmpNLysGR") {
                            pepecoinvETHReserve = reservesCurrency.reserves;

                            estimatedKekFrogReserveValue = pepecoinvETHReserve * pepecoinvETHCoingeckoPrice * 2;
                            estimatedKekFrogValue = (Math.round(estimatedKekFrogReserveValue / estimatedKekFrogSupply * 100) / 100).toLocaleString();
                            estimatedKekFrogValueUSDVRSC = (Math.round(estimatedKekFrogValue / vrscBridgePrice * 100) / 100).toLocaleString();
                            estimatedKekFrogReserveValue = (Math.round(estimatedKekFrogReserveValue)).toLocaleString();
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
                            currency.origin = "Kek🐸";
                            currency.network = "vrsc";

                            if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                currency.priceNative = Math.round(pepecoinvETHReserve / currency.reserves * 100000000) / 100000000;
                                currency.pricelabel = "pepecoinvETH";
                                currency.price = vrscBasketPrice = Math.round(pepecoinvETHCoingeckoPrice * currency.priceNative * 100) / 100;
                            }
                            if (currencyId === "i5VVBEi6efBrXMaeqFW3MTPSzbmpNLysGR") {
                                currency.priceNative = Math.round(vrscReserve / currency.reserves * 100) / 100;
                                currency.pricelabel = "VRSC";
                                currency.price = Math.round(vrscBasketPrice * currency.priceNative * 1000) / 1000;
                            }
                        }

                        if (priceArray.length > 0) {
                            priceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                        currency.coingeckoprice = Math.round(vrscBridgePrice * 100) / 100;
                                        currency.coingeckoLabel = "Bridge.vETH";
                                    }
                                    if (currencyId === "i5VVBEi6efBrXMaeqFW3MTPSzbmpNLysGR") {
                                        currency.coingeckoprice = Math.round(price.price * 1000) / 1000;
                                        currency.coingeckoLabel = "Coingecko";
                                    }
                                }
                            })
                        }


                        if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            estimatedKekFrogValueUSDVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2)).toLocaleString();
                            estimatedKekFrogValueUSD = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 / estimatedKekFrogSupply * 100) / 100).toLocaleString();
                        }

                    })
                    currency.currencyId = currencyId;
                    currency.currencyName = item[1];
                    currencyKekFrogArray.push(currency);
                }
            })
        })
    }

    /* estimated value of KekFrog */
    currencyKekFrogArray.forEach((currency) => {
        currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 4 });
    })

    result.estimatedKekFrogSupply = estimatedKekFrogSupply
    result.currencyKekFrogArray = currencyKekFrogArray;
    result.estimatedKekFrogReserveValue = estimatedKekFrogReserveValue;
    result.estimatedKekFrogValueUSDVRSC = estimatedKekFrogValueUSDVRSC;
    result.estimatedKekFrogValueUSD = estimatedKekFrogValueUSD;
    result.estimatedKekFrogValueVRSC = estimatedKekFrogValueVRSC;
    return result;
}