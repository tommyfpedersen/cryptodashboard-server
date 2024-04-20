//const { saveVolumeDataToFile, getVolumeDataFromFile } = require("../cache/cache");
const { isBlockInVolumeArray } = require("../utils/utils");

//let volumeInDollarsArrayLoadFromCache = false;
let volumeInDollarsArray = [];



async function vrscVarrrBridgeVolume(fromBlock, toBlock) {

    // if(volumeInDollarsArrayLoadFromCache === false){
    //     console.log("syncing volume data...");
    //     let arr = await getVolumeDataFromFile("ethBridge.json");

    //     if(arr !== undefined){
    //        volumeInDollarsArray = arr;
    //     }

    // }

    if (volumeInDollarsArray.length > 0) {
        volumeInDollarsArray.sort((a, b) => b.height - a.height);
        let latestVolumeBlockHeight = volumeInDollarsArray[0].height;
        toBlock = toBlock;
        fromBlock = latestVolumeBlockHeight;

        // clean up - delete all beyond 33 days
        volumeInDollarsArray = volumeInDollarsArray.filter((item) => {
            return item.height > toBlock - 1440 * 33;
        })
    }

    let vrscReserveIn = 0;
    let vrscReserveInLastValue = -1;
    let vrscReserveOut = 0;
    let vrscReserveOutLastValue = -1;
    let vrscReserveInDollars = 0;

    let varrrReserveIn = 0;
    let varrrReserveInLastValue = -1;
    let varrrReserveOut = 0;
    let varrrReserveOutLastValue = -1;
    let varrrReserveInDollars = 0;

    let vrscBridgeReserveIn = 0;
    let vrscBridgeReserveInLastValue = -1;
    let vrscBridgeReserveOut = 0;
    let vrscBridgeReserveOutLastValue = -1;
    let vrscBridgeReserveInDollars = 0;

    let tBTCReserveIn = 0;
    let tBTCReserveInLastValue = -1;
    let tBTCReserveOut = 0;
    let tBTCReserveOutLastValue = -1;
    let tBTCReserveInDollars = 0;

    for (let i = fromBlock; i <= toBlock; i++) {
        try {
            const getcurrencystateResponse = await fetch("http://localhost:9010/multichain/getcurrencystate/bridge.varrr/" + i);
            const getcurrencystateResult = await getcurrencystateResponse.json();
            let getcurrencystate = getcurrencystateResult.result[0];

            if (getcurrencystate) {
                getcurrencystate = getcurrencystateResult.result[0];
                const getcurrencystateVRSC = getcurrencystate.currencystate.currencies.i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV;
                const getcurrencystateVARRR = getcurrencystate.currencystate.currencies.iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2;
                const getcurrencystateVRSCBRIDGE = getcurrencystate.currencystate.currencies.i3f7tSctFkiPpiedY8QR5Tep9p4qDVebDx;
                const getcurrencystateTBTC = getcurrencystate.currencystate.currencies.iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU;

                // VRSC in
                if (getcurrencystateVRSC.reservein !== vrscReserveInLastValue) {
                    vrscReserveIn = vrscReserveIn + getcurrencystateVRSC.reservein;

                    let vrscReserves = 0;
                    let tBTCReserves = 0;

                    getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                        if (currency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            vrscReserves = currency.reserves;
                        }
                        if (currency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                            tBTCReserves = currency.reserves;
                        }
                    })
                    // vrscReserveInDollars = vrscReserveInDollars + getcurrencystateVRSC.reservein * (tBTCReserves / vrscReserves);
                    if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", "reservein")) {
                        volumeInDollarsArray.push({
                            currencyid: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
                            dollars: getcurrencystateVRSC.reservein * 1,
                            height: getcurrencystate.height,
                            blocktime: getcurrencystate.blocktime,
                            type: "reservein"
                        })
                    }
                }
                // VRSC out
                if (getcurrencystateVRSC.reserveout !== vrscReserveOutLastValue) {
                    vrscReserveOut = vrscReserveOut + getcurrencystateVRSC.reserveout;
                    let vrscReserves = 0;
                    let tBTCReserves = 0;
                    getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                        if (currency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            vrscReserves = currency.reserves;
                        }
                        if (currency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                            tBTCReserves = currency.reserves;
                        }
                    })
                    //   vrscReserveInDollars = vrscReserveInDollars + getcurrencystateVRSC.reserveout * (tBTCReserves / vrscReserves);
                    if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", "reserveout") === false) {
                        volumeInDollarsArray.push({
                            currencyid: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
                            dollars: getcurrencystateVRSC.reserveout * 1,
                            height: getcurrencystate.height,
                            blocktime: getcurrencystate.blocktime,
                            type: "reserveout"
                        })
                    }
                }

                vrscReserveInLastValue = getcurrencystateVRSC.reservein;
                vrscReserveOutLastValue = getcurrencystateVRSC.reserveout;

                // VARRR in
                if (getcurrencystateVARRR.reservein !== varrrReserveInLastValue) {
                    varrrReserveIn = varrrReserveIn + getcurrencystateVARRR.reservein;

                    let vrscReserves = 0;
                    let varrrReserves = 0;
                    getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                        if (currency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            vrscReserves = currency.reserves;
                        }
                        if (currency.currencyid === "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2") {
                            varrrReserves = currency.reserves;
                        }
                    })
                    //   varrrReserveInDollars = varrrReserveInDollars + getcurrencystateVARRR.reservein * (vrscReserves / varrrReserves);
                    if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2", "reservein") === false) {
                        volumeInDollarsArray.push({
                            currencyid: "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2",
                            dollars: getcurrencystateVARRR.reservein * (vrscReserves / varrrReserves),
                            height: getcurrencystate.height,
                            blocktime: getcurrencystate.blocktime,
                            type: "reservein"
                        })
                    }
                }
                // VARRR out
                if (getcurrencystateVARRR.reserveout !== varrrReserveOutLastValue) {
                    varrrReserveOut = varrrReserveOut + getcurrencystateVARRR.reserveout;

                    let vrscReserves = 0;
                    let varrrReserves = 0;
                    getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                        if (currency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            vrscReserves = currency.reserves;
                        }
                        if (currency.currencyid === "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2") {
                            varrrReserves = currency.reserves;
                        }
                    })
                    // daiReserveInDollars = daiReserveInDollars + getcurrencystateDAI.reserveout * 1;
                    if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2", "reserveout") === false) {
                        volumeInDollarsArray.push({
                            currencyid: "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2",
                            dollars: getcurrencystateVARRR.reserveout * (vrscReserves / varrrReserves),
                            height: getcurrencystate.height,
                            blocktime: getcurrencystate.blocktime,
                            type: "reserveout"
                        })
                    }
                }
                varrrReserveInLastValue = getcurrencystateVARRR.reservein;
                varrrReserveOutLastValue = getcurrencystateVARRR.reserveout;

                // VRSC BRIDGE in
                if (getcurrencystateVRSCBRIDGE.reservein !== vrscBridgeReserveInLastValue) {
                    vrscBridgeReserveIn = vrscBridgeReserveIn + getcurrencystateVRSCBRIDGE.reservein;

                    let vrscReserves = 0;
                    let vrscBridgeReserves = 0;

                    getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                        if (currency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            vrscReserves = currency.reserves;
                        }
                        if (currency.currencyid === "i3f7tSctFkiPpiedY8QR5Tep9p4qDVebDx") {
                            vrscBridgeReserves = currency.reserves;
                        }
                    })
                    // mkrReserveInDollars = mkrReserveInDollars + getcurrencystateMKR.reservein * (daiReserves / mkrReserves);
                    if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "i3f7tSctFkiPpiedY8QR5Tep9p4qDVebDx", "reservein") === false) {
                        volumeInDollarsArray.push({
                            currencyid: "i3f7tSctFkiPpiedY8QR5Tep9p4qDVebDx",
                            dollars: getcurrencystateVRSCBRIDGE.reservein * (vrscReserves / vrscBridgeReserves),
                            height: getcurrencystate.height,
                            blocktime: getcurrencystate.blocktime,
                            type: "reservein"
                        })
                    }
                }
                // VRSC BRIDGE out
                if (getcurrencystateVRSCBRIDGE.reserveout !== vrscBridgeReserveInLastValue) {
                    vrscBridgeReserveOut = vrscBridgeReserveOut + getcurrencystateVRSCBRIDGE.reserveout;
                    let vrscReserves = 0;
                    let vrscBridgeReserves = 0;
                    getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                        if (currency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            vrscReserves = currency.reserves;
                        }
                        if (currency.currencyid === "i3f7tSctFkiPpiedY8QR5Tep9p4qDVebDx") {
                            vrscBridgeReserves = currency.reserves;
                        }
                    })
                    //mkrReserveInDollars = mkrReserveInDollars + getcurrencystateMKR.reserveout * (daiReserves / mkrReserves);
                    if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "i3f7tSctFkiPpiedY8QR5Tep9p4qDVebDx", "reserveout") === false) {
                        volumeInDollarsArray.push({
                            currencyid: "i3f7tSctFkiPpiedY8QR5Tep9p4qDVebDx",
                            dollars: getcurrencystateVRSCBRIDGE.reservein * (vrscReserves / vrscBridgeReserves),
                            height: getcurrencystate.height,
                            blocktime: getcurrencystate.blocktime,
                            type: "reserveout"
                        })
                    }
                }

                vrscBridgeReserveInLastValue = getcurrencystateVRSCBRIDGE.reservein;
                vrscBridgeReserveOutLastValue = getcurrencystateVRSCBRIDGE.reserveout;

                // TBTC in
                if (getcurrencystateTBTC.reservein !== tBTCReserveInLastValue) {
                    tBTCReserveIn = tBTCReserveIn + getcurrencystateTBTC.reservein;

                    let vrscReserves = 0;
                    let tBTCReserves = 0;

                    getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                        if (currency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            vrscReserves = currency.reserves;
                        }
                        if (currency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                            tBTCReserves = currency.reserves;
                        }
                    })
                    //ethReserveInDollars = ethReserveInDollars + getcurrencystateETH.reservein * (daiReserves / ethReserves);
                    if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU", "reservein") === false) {
                        volumeInDollarsArray.push({
                            currencyid: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU",
                            dollars: getcurrencystateTBTC.reservein * (vrscReserves / tBTCReserves),
                            height: getcurrencystate.height,
                            blocktime: getcurrencystate.blocktime,
                            type: "reservein"
                        })
                    }
                }
                // TBTC out
                if (getcurrencystateTBTC.reserveout !== tBTCReserveOutLastValue) {
                    tBTCReserveOut = tBTCReserveOut + getcurrencystateTBTC.reserveout;
                    let vrscReserves = 0;
                    let tBTCReserves = 0;
                    getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                        if (currency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            vrscReserves = currency.reserves;
                        }
                        if (currency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                            tBTCReserves = currency.reserves;
                        }
                    })
                    //  tBTCReserveInDollars = tBTCReserveInDollars + getcurrencystateTBTC.reserveout * (daiReserves / ethReserves);
                    if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU", "reserveout") === false) {
                        volumeInDollarsArray.push({
                            currencyid: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU",
                            dollars: getcurrencystateTBTC.reserveout * (vrscReserves / tBTCReserves),
                            height: getcurrencystate.height,
                            blocktime: getcurrencystate.blocktime,
                            type: "reserveout"
                        })
                    }
                }
                tBTCReserveInLastValue = getcurrencystateTBTC.reservein;
                tBTCReserveOutLastValue = getcurrencystateTBTC.reserveout;
            }
        } catch (error) {
            // Handle the error here
            // console.log("Error fetching mining info:", error);
            return null;
        }
    }

    let totalVolumenInDollars = 0;
    volumeInDollarsArray.forEach((elm) => {
        totalVolumenInDollars = totalVolumenInDollars + elm.dollars;
    })
    //  await saveVolumeDataToFile(volumeInDollarsArray, "ethBridge.json");
    volumeInDollarsArrayLoadFromCache = true;
    return volumeInDollarsArray;
}

async function currencyReserveVarrrBridge(priceArray, vrscBridgePrice, estimatedBridgeValueUSD) {
    let result = {};

    /* VRSC-ETH Bridge reserves */
    try {
        const getcurrencyResponse = await fetch(`http://localhost:9010/multichain/getcurrency/bridge.varrr`);
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
                                //  currency.price = Math.round(daiReserve / currency.reserves * 100) / 100;

                                if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                    currency.price = Math.round(tBTCvETHReserve / currency.reserves * 100000000) / 100000000;
                                    currency.pricelabel = "tBTCvETH";
                                    currency.dollarprice = Math.round(tBTCvETHCoingeckoPrice * currency.price * 100) / 100;
                                }
                                if (currencyId === "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2") {
                                    currency.price = Math.round(vrscReserve / currency.reserves * 100) / 100;
                                    currency.pricelabel = "VRSC";
                                    currency.dollarprice = Math.round(vrscBridgePrice * currency.price * 100) / 100;
                                }
                                if (currencyId === "i3f7tSctFkiPpiedY8QR5Tep9p4qDVebDx") {
                                    currency.price = Math.round(vrscReserve / currency.reserves * 100) / 100;
                                    currency.pricelabel = "VRSC";
                                    currency.dollarprice = Math.round(vrscBridgePrice * currency.price * 100) / 100;
                                    currency.coingeckoprice = estimatedBridgeValueUSD; //Math.round(vrscBridgePrice * 100) / 100;
                                    currency.coingeckoLabel = "Bridge.vETH";
                                }
                                if (currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                                    currency.price = Math.round(vrscReserve / currency.reserves * 100) / 100;
                                    currency.pricelabel = "VRSC";
                                    currency.dollarprice = Math.round(vrscBridgePrice * currency.price * 100) / 100;
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
                                estimatedVarrrBridgeValueUSDVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 4 * 100) / 100).toLocaleString();
                                estimatedVarrrBridgeValueUSD = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 4 / estimatedVarrrBridgeSupply * 100) / 100).toLocaleString();
                                estimatedVarrrBridgeValueVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 4 / estimatedVarrrBridgeSupply / vrscBridgePrice * 100000000) / 100000000).toLocaleString();
                            }
                            if (reservesCurrency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                                estimatedVarrrBridgeValueUSDBTC = (Math.round(tBTCvETHCoingeckoPrice * reservesCurrency.reserves * 4 * 100) / 100).toLocaleString();
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
            currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 8 });
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

module.exports = { vrscVarrrBridgeVolume, currencyReserveVarrrBridge }