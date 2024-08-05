require('dotenv').config();

async function currencyReserveVdexBridge(priceArray, vrscBridgePrice, estimatedBridgeValueUSD) {
    let result = {};

    /* Bridge vdex reserves */
    try {
        const getcurrencyResponse = await fetch(process.env.VERUS_REST_API_VDEX + "multichain/getcurrency/bridge.vdex");
        const getcurrencyResult = await getcurrencyResponse.json();
        const getcurrency = getcurrencyResult.result;

        let currencyBridgeArray = [];
        let tBTCvETHCoingeckoPrice = 0;
        let vrscCoingeckoPrice = 0;
        let varrrCoingeckoPrice = 0;
        let ethereumBridgePrice = 0;
        // let vrscBridgePrice = 0;

        let vrscReserve = 0;
        let tBTCvETHReserve = 0;

        let estimatedVarrrBridgeValueUSDBTC = 0;
        let estimatedVarrrBridgeValueUSDVRSC = 0;
        let estimatedVarrrBridgeValueVRSC = 0;
        let estimatedVarrrBridgeSupply = getcurrency.bestcurrencystate.supply;
        let estimatedVarrrBridgeValueUSD = 0;

        priceArray.forEach((priceElm) => {
            if (priceElm.currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                vrscCoingeckoPrice = priceElm.price;
            }
            if (priceElm.currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                tBTCvETHCoingeckoPrice = priceElm.price;
            }
            if (priceElm.currencyId === "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2") {
                varrrCoingeckoPrice = priceElm.price;
            }
            // if (priceElm.currencyId === "i3f7tSctFkiPpiedY8QR5Tep9p4qDVebDx") {
            //     vrscBridgePrice = priceElm.price;
            // }
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
                            if (reservesCurrency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                                tBTCvETHReserve = reservesCurrency.reserves;
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
                                currency.priceinreserve = reservesCurrency.priceinreserve;
                                currency.origin = "Bridge.vARRR";
                                currency.network = "vARRR";
                                //  currency.price = Math.round(daiReserve / currency.reserves * 100) / 100;

                                if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                    currency.priceNative = Math.round(tBTCvETHReserve / currency.reserves * 100000000) / 100000000;
                                    currency.pricelabel = "tBTCvETH";
                                    currency.price = Math.round(tBTCvETHCoingeckoPrice * currency.priceNative * 100) / 100;
                                }
                                if (currencyId === "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2") {
                                    currency.priceNative = Math.round(vrscReserve / currency.reserves * 100) / 100;
                                    currency.pricelabel = "VRSC";
                                    currency.price = Math.round(vrscBridgePrice * currency.priceNative * 100) / 100;
                                }
                                if (currencyId === "i3f7tSctFkiPpiedY8QR5Tep9p4qDVebDx") {
                                    currency.priceNative = Math.round(vrscReserve / currency.reserves * 100) / 100;
                                    currency.pricelabel = "VRSC";
                                    currency.price = Math.round(vrscBridgePrice * currency.priceNative * 100) / 100;
                                    currency.coingeckoprice = estimatedBridgeValueUSD; //Math.round(vrscBridgePrice * 100) / 100;
                                    currency.coingeckoLabel = "Bridge.vETH";
                                }
                                if (currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                                    currency.priceNative = Math.round(vrscReserve / currency.reserves * 100) / 100;
                                    currency.pricelabel = "VRSC";
                                    currency.price = Math.round(vrscBridgePrice * currency.priceNative * 100) / 100;
                                }

                            }

                            if (priceArray.length > 0) {
                                priceArray.forEach((price) => {
                                    if (price.currencyId === currencyId) {
                                        if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                            currency.coingeckoprice = Math.round(vrscBridgePrice * 100) / 100;
                                            currency.coingeckoLabel = "Bridge.vETH";
                                        }
                                        if (currencyId === "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2") {
                                            currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                            currency.coingeckoLabel = "Coingecko";
                                        }
                                        if (currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                                            currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                            currency.coingeckoLabel = "Coingecko";
                                        }
                                    }
                                })
                            }

                            if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                estimatedVarrrBridgeValueUSDVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 4 )).toLocaleString();
                                estimatedVarrrBridgeValueUSD = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 4 / estimatedVarrrBridgeSupply * 100) / 100).toLocaleString();
                                estimatedVarrrBridgeValueVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 4 / estimatedVarrrBridgeSupply / vrscBridgePrice * 100000000) / 100000000).toLocaleString();
                            }
                            if (reservesCurrency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                                estimatedVarrrBridgeValueUSDBTC = (Math.round(tBTCvETHCoingeckoPrice * reservesCurrency.reserves * 4 ) ).toLocaleString();
                            }
                        })
                        currency.currencyId = currencyId;
                        currency.currencyName = item[1];
                        currencyBridgeArray.push(currency);
                    }
                })
            })
        }

        /* estimated value of bridge */
        currencyBridgeArray.forEach((currency) => {
            currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 4 });
        })

        result.currencyVarrrBridgeArray = currencyBridgeArray;
        result.estimatedVarrrBridgeValueUSDBTC = estimatedVarrrBridgeValueUSDBTC;
        result.estimatedVarrrBridgeValueUSDVRSC = estimatedVarrrBridgeValueUSDVRSC;
        result.estimatedVarrrBridgeValueUSD = estimatedVarrrBridgeValueUSD;
        result.estimatedVarrrBridgeValueVRSC = estimatedVarrrBridgeValueVRSC;
        return result;
    } catch (error) {
        // Handle the error here
        // console.log("Error fetching mining info:", error);
        return result;
    }
}

module.exports = { currencyReserveVdexBridge }