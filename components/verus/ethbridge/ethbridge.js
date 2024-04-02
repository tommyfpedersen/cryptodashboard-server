const { isBlockInVolumeArray } = require("../utils/utils");

let volumeInDollarsArray = [];
async function vrscEthBridgeVolume(fromBlock, toBlock) {
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

    let daiReserveIn = 0;
    let daiReserveInLastValue = -1;
    let daiReserveOut = 0;
    let daiReserveOutLastValue = -1;
    let daiReserveInDollars = 0;

    let mkrReserveIn = 0;
    let mkrReserveInLastValue = -1;
    let mkrReserveOut = 0;
    let mkrReserveOutLastValue = -1;
    let mkrReserveInDollars = 0;

    let ethReserveIn = 0;
    let ethReserveInLastValue = -1;
    let ethReserveOut = 0;
    let ethReserveOutLastValue = -1;
    let ethReserveInDollars = 0;

    for (let i = fromBlock; i <= toBlock; i++) {
        const getcurrencystateResponse = await fetch("http://localhost:9009/multichain/getcurrencystate/bridge.veth/" + i);
        const getcurrencystateResult = await getcurrencystateResponse.json();
        let getcurrencystate = getcurrencystateResult.result[0];

        if (getcurrencystate) {
            getcurrencystate = getcurrencystateResult.result[0];
            const getcurrencystateVRSC = getcurrencystate.currencystate.currencies.i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV;
            const getcurrencystateDAI = getcurrencystate.currencystate.currencies.iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM;
            const getcurrencystateMKR = getcurrencystate.currencystate.currencies.iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4;
            const getcurrencystateETH = getcurrencystate.currencystate.currencies.i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X;

            // VRSC in
            if (getcurrencystateVRSC.reservein !== vrscReserveInLastValue) {
                vrscReserveIn = vrscReserveIn + getcurrencystateVRSC.reservein;

                let vrscReserves = 0;
                let daiReserves = 0;

                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                        vrscReserves = currency.reserves;
                    }
                    if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                        daiReserves = currency.reserves;
                    }
                })
                vrscReserveInDollars = vrscReserveInDollars + getcurrencystateVRSC.reservein * (daiReserves / vrscReserves);
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", "reservein")) {
                    volumeInDollarsArray.push({
                        currencyid: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
                        dollars: getcurrencystateVRSC.reservein * (daiReserves / vrscReserves),
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
                let daiReserves = 0;
                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                        vrscReserves = currency.reserves;
                    }
                    if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                        daiReserves = currency.reserves;
                    }
                })
                vrscReserveInDollars = vrscReserveInDollars + getcurrencystateVRSC.reserveout * (daiReserves / vrscReserves);
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", "reserveout") === false) {
                    volumeInDollarsArray.push({
                        currencyid: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
                        dollars: getcurrencystateVRSC.reserveout * (daiReserves / vrscReserves),
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reserveout"
                    })
                }
            }

            vrscReserveInLastValue = getcurrencystateVRSC.reservein;
            vrscReserveOutLastValue = getcurrencystateVRSC.reserveout;

            // DAI in
            if (getcurrencystateDAI.reservein !== daiReserveInLastValue) {
                daiReserveIn = daiReserveIn + getcurrencystateDAI.reservein;

                let daiReserves = 0;
                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                        daiReserves = currency.reserves;
                    }
                })
                daiReserveInDollars = daiReserveInDollars + getcurrencystateDAI.reservein * 1;
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM", "reservein") === false) {
                    volumeInDollarsArray.push({
                        currencyid: "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM",
                        dollars: getcurrencystateDAI.reservein * 1,
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reservein"
                    })
                }
            }
            // DAI out
            if (getcurrencystateDAI.reserveout !== daiReserveOutLastValue) {
                daiReserveOut = daiReserveOut + getcurrencystateDAI.reserveout;

                let daiReserves = 0;
                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                        daiReserves = currency.reserves;
                    }
                })
                daiReserveInDollars = daiReserveInDollars + getcurrencystateDAI.reserveout * 1;
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM", "reserveout") === false) {
                    volumeInDollarsArray.push({
                        currencyid: "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM",
                        dollars: getcurrencystateDAI.reserveout * 1,
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reserveout"
                    })
                }
            }
            daiReserveInLastValue = getcurrencystateDAI.reservein;
            daiReserveOutLastValue = getcurrencystateDAI.reserveout;

            // MKR in
            if (getcurrencystateMKR.reservein !== mkrReserveInLastValue) {
                mkrReserveIn = mkrReserveIn + getcurrencystateMKR.reservein;

                let mkrReserves = 0;
                let daiReserves = 0;

                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4") {
                        mkrReserves = currency.reserves;
                    }
                    if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                        daiReserves = currency.reserves;
                    }
                })
                mkrReserveInDollars = mkrReserveInDollars + getcurrencystateMKR.reservein * (daiReserves / mkrReserves);
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4", "reservein") === false) {
                    volumeInDollarsArray.push({
                        currencyid: "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4",
                        dollars: getcurrencystateMKR.reservein * (daiReserves / mkrReserves),
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reservein"
                    })
                }
            }
            // MKR out
            if (getcurrencystateMKR.reserveout !== mkrReserveOutLastValue) {
                mkrReserveOut = mkrReserveOut + getcurrencystateMKR.reserveout;
                let mkrReserves = 0;
                let daiReserves = 0;
                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4") {
                        mkrReserves = currency.reserves;
                    }
                    if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                        daiReserves = currency.reserves;
                    }
                })
                mkrReserveInDollars = mkrReserveInDollars + getcurrencystateMKR.reserveout * (daiReserves / mkrReserves);
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4", "reserveout") === false) {
                    volumeInDollarsArray.push({
                        currencyid: "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4",
                        dollars: getcurrencystateMKR.reserveout * (daiReserves / mkrReserves),
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reserveout"
                    })
                }
            }

            mkrReserveInLastValue = getcurrencystateMKR.reservein;
            mkrReserveOutLastValue = getcurrencystateMKR.reserveout;

            // ETH in
            if (getcurrencystateETH.reservein !== ethReserveInLastValue) {
                ethReserveIn = ethReserveIn + getcurrencystateETH.reservein;

                let ethReserves = 0;
                let daiReserves = 0;

                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
                        ethReserves = currency.reserves;
                    }
                    if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                        daiReserves = currency.reserves;
                    }
                })
                ethReserveInDollars = ethReserveInDollars + getcurrencystateETH.reservein * (daiReserves / ethReserves);
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X", "reservein") === false) {
                    volumeInDollarsArray.push({
                        currencyid: "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X",
                        dollars: getcurrencystateETH.reservein * (daiReserves / ethReserves),
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reservein"
                    })
                }
            }
            // ETH out
            if (getcurrencystateETH.reserveout !== ethReserveOutLastValue) {
                ethReserveOut = ethReserveOut + getcurrencystateETH.reserveout;
                let ethReserves = 0;
                let daiReserves = 0;
                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4") {
                        ethReserves = currency.reserves;
                    }
                    if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                        daiReserves = currency.reserves;
                    }
                })
                ethReserveInDollars = ethReserveInDollars + getcurrencystateETH.reserveout * (daiReserves / ethReserves);
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X", "reserveout") === false) {
                    volumeInDollarsArray.push({
                        currencyid: "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X",
                        dollars: getcurrencystateETH.reserveout * (daiReserves / ethReserves),
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reserveout"
                    })
                }
            }
            ethReserveInLastValue = getcurrencystateETH.reservein;
            ethReserveOutLastValue = getcurrencystateETH.reserveout;
        }
    }
    let totalVolumenInDollars = 0;
    volumeInDollarsArray.forEach((elm) => {
        totalVolumenInDollars = totalVolumenInDollars + elm.dollars;
    })
    return volumeInDollarsArray;
}

async function currencyReserveEthBridge(priceArray) {
    let result = {};

    /* VRSC-ETH Bridge reserves */
    const getcurrencyResponse = await fetch(`http://localhost:9009/multichain/getcurrency/bridge.veth`);
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let currencyBridgeArray = [];
    let ethereumBridgePrice = 0;
    let mkrBridgePrice = 0;
    let vrscBridgePrice = 0;
    let daiReserve = 0;
    let estimatedBridgeValue = 0;
    let estimatedBridgeSupply = getcurrency.bestcurrencystate.supply;
    let estimatedBridgeValueUSD = 0;
    let estimatedBridgeValueVRSC = 0;

    if (getcurrency) {
        let currencyIdArray = Object.values(getcurrency.currencies);
        let currencyNames = Object.entries(getcurrency.currencynames);

        /* find dai value*/
        currencyIdArray.forEach((currencyId) => {
            currencyNames.forEach((item) => {
                let currency = {}
                if (item[0] === currencyId) {
                    getcurrency.bestcurrencystate.reservecurrencies.forEach((reservesCurrency) => {
                        if (reservesCurrency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                            daiReserve = reservesCurrency.reserves;
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
                            currency.price = Math.round(daiReserve / currency.reserves * 100) / 100;

                            if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                vrscBridgePrice = Math.round(daiReserve / currency.reserves * 100) / 100;
                            }
                            if (currencyId === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
                                ethereumBridgePrice = Math.round(daiReserve / currency.reserves * 100) / 100;
                            }
                            if (currencyId === "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4") {
                                mkrBridgePrice = Math.round(daiReserve / currency.reserves * 100) / 100;
                            }
                        }

                        if (priceArray.length > 0) {
                            priceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                }
                            })
                        }


                        if (reservesCurrency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                            estimatedBridgeValue = (Math.round(reservesCurrency.reserves * 4 * 100) / 100).toLocaleString();
                            estimatedBridgeValueUSD = (Math.round(reservesCurrency.reserves * 4 / estimatedBridgeSupply *100)/ 100).toLocaleString();
                            estimatedBridgeValueVRSC = (Math.round(reservesCurrency.reserves * 4 / estimatedBridgeSupply / vrscBridgePrice *100000000)/ 100000000).toLocaleString();
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

    result.currencyBridgeArray = currencyBridgeArray;
    result.estimatedBridgeValue = estimatedBridgeValue;
    result.vrscBridgePrice = vrscBridgePrice;
    result.ethereumBridgePrice = ethereumBridgePrice;
    result.mkrBridgePrice = mkrBridgePrice;
    result.estimatedBridgeValueUSD = estimatedBridgeValueUSD;
    result.estimatedBridgeValueVRSC = estimatedBridgeValueVRSC;
    return result;
}

module.exports = { vrscEthBridgeVolume, currencyReserveEthBridge}