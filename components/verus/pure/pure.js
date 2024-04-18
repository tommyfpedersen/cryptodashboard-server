const { isBlockInVolumeArray } = require("../utils/utils");



let volumeInDollarsPureArray = [];
async function pureVolume(fromBlock, toBlock) {
    if (volumeInDollarsPureArray.length > 0) {
        volumeInDollarsPureArray.sort((a, b) => b.height - a.height);
        let latestVolumeBlockHeight = volumeInDollarsPureArray[0].height;
        toBlock = toBlock;
        fromBlock = latestVolumeBlockHeight;

        // clean up - delete all beyond 33 days
        volumeInDollarsPureArray = volumeInDollarsPureArray.filter((item) => {
            return item.height > toBlock - 1440 * 33;
        })
    }

    let vrscReserveIn = 0;
    let vrscReserveInLastValue = -1;
    let vrscReserveOut = 0;
    let vrscReserveOutLastValue = -1;
    let vrscReserveInDollars = 0;

    let tBTCvETHReserveIn = 0;
    let tBTCvETHReserveInLastValue = -1;
    let tBTCvETHReserveOut = 0;
    let tBTCvETHReserveOutLastValue = -1;
    let tBTCvETHReserveInDollars = 0;

    for (let i = fromBlock; i <= toBlock; i++) {
        const getcurrencystateResponse = await fetch("http://localhost:9009/multichain/getcurrencystate/pure/" + i);
        const getcurrencystateResult = await getcurrencystateResponse.json();
        let getcurrencystate = getcurrencystateResult.result[0];

        if (getcurrencystate) {
            getcurrencystate = getcurrencystateResult.result[0];
            const getcurrencystateVRSC = getcurrencystate.currencystate.currencies.i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV;
            const getcurrencystatetBTCvETH = getcurrencystate.currencystate.currencies.iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU;


            // VRSC in
            if (getcurrencystateVRSC.reservein !== vrscReserveInLastValue) {
                vrscReserveIn = vrscReserveIn + getcurrencystateVRSC.reservein;

                let vrscReserves = 0;
                let tBTCvETHReserves = 0;

                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                        vrscReserves = currency.reserves;
                    }
                    if (currency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                        tBTCvETHReserves = currency.reserves;
                    }
                })
                vrscReserveInDollars = vrscReserveInDollars + getcurrencystateVRSC.reservein * (tBTCvETHReserves / vrscReserves);
                if (isBlockInVolumeArray(volumeInDollarsPureArray, getcurrencystate.height, "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", "reservein")) {
                    volumeInDollarsPureArray.push({
                        currencyid: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
                        dollars: getcurrencystateVRSC.reservein * 1,//(tBTCvETHReserves / vrscReserves),
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
                let tBTCvETHReserves = 0;
                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                        vrscReserves = currency.reserves;
                    }
                    if (currency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                        tBTCvETHReserves = currency.reserves;
                    }
                })
                vrscReserveInDollars = vrscReserveInDollars + getcurrencystateVRSC.reserveout * (tBTCvETHReserves / vrscReserves);
                if (isBlockInVolumeArray(volumeInDollarsPureArray, getcurrencystate.height, "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", "reserveout") === false) {
                    volumeInDollarsPureArray.push({
                        currencyid: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
                        dollars: getcurrencystateVRSC.reserveout * 1,//tBTCvETHReserves / vrscReserves),
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reserveout"
                    })
                }
            }

            vrscReserveInLastValue = getcurrencystateVRSC.reservein;
            vrscReserveOutLastValue = getcurrencystateVRSC.reserveout;

            // tBTCvETH in
            if (getcurrencystatetBTCvETH.reservein !== tBTCvETHReserveInLastValue) {
                tBTCvETHReserveIn = tBTCvETHReserveIn + getcurrencystatetBTCvETH.reservein;

                let vrscReserves = 0;
                let tBTCvETHReserves = 0;
                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                        vrscReserves = currency.reserves;
                    }
                    if (currency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                        tBTCvETHReserves = currency.reserves;
                    }
                })
                tBTCvETHReserveInDollars = tBTCvETHReserveInDollars + getcurrencystatetBTCvETH.reservein * 1;
                if (isBlockInVolumeArray(volumeInDollarsPureArray, getcurrencystate.height, "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU", "reservein") === false) {
                    volumeInDollarsPureArray.push({
                        currencyid: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU",
                        dollars: getcurrencystatetBTCvETH.reservein * (vrscReserves / tBTCvETHReserves),
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reservein"
                    })
                }
            }
            // tBTCvETH out
            if (getcurrencystatetBTCvETH.reserveout !== tBTCvETHReserveOutLastValue) {
                tBTCvETHReserveOut = tBTCvETHReserveOut + getcurrencystatetBTCvETH.reserveout;

                let vrscReserves = 0;
                let tBTCvETHReserves = 0;
                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                        vrscReserves = currency.reserves;
                    }
                    if (currency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                        tBTCvETHReserves = currency.reserves;
                    }
                })
                tBTCvETHReserveInDollars = tBTCvETHReserveInDollars + getcurrencystatetBTCvETH.reserveout * 1;
                if (isBlockInVolumeArray(volumeInDollarsPureArray, getcurrencystate.height, "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU", "reserveout") === false) {
                    volumeInDollarsPureArray.push({
                        currencyid: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU",
                        dollars: getcurrencystatetBTCvETH.reserveout * (vrscReserves / tBTCvETHReserves),
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reserveout"
                    })
                }
            }
            tBTCvETHReserveInLastValue = getcurrencystatetBTCvETH.reservein;
            tBTCvETHReserveOutLastValue = getcurrencystatetBTCvETH.reserveout;
        }
    }
    let totalVolumenInDollars = 0;
    volumeInDollarsPureArray.forEach((elm) => {
        totalVolumenInDollars = totalVolumenInDollars + elm.dollars;
    })
    return volumeInDollarsPureArray;
}

async function currencyReservePure(priceArray, vrscBridgePrice) {
    let result = {};

    /* Pure reserves */
    const getcurrencyResponse = await fetch(`http://localhost:9009/multichain/getcurrency/pure`);
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let currencyPureArray = [];

    let tBTCvETHCoingeckoPrice = 0;
    let vrscCoingeckoPrice = 0;
    let vrscReserve = 0;
    let tBTCvETHReserve = 0;
    let estimatedPureValueUSDBTC = 0;
    let estimatedPureValueUSDVRSC = 0;
    let estimatedPureValueVRSC = 0;
    let estimatedPureSupply = getcurrency.bestcurrencystate.supply;
    let estimatedPureValueUSD = 0;

    priceArray.forEach((priceElm) => {
        if (priceElm.currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
            vrscCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
            tBTCvETHCoingeckoPrice = priceElm.price;
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
                            //currency.price = Math.round(vrscReserve / currency.reserves * 100) / 100;

                            if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                currency.price = Math.round(tBTCvETHReserve / currency.reserves * 100000000) / 100000000;
                                currency.pricelabel = "tBTCvETH";
                                currency.dollarprice = Math.round(tBTCvETHCoingeckoPrice * currency.price * 100) / 100;
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
                                    if(currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV"){
                                        currency.coingeckoprice = Math.round(vrscBridgePrice * 100) / 100;
                                        currency.coingeckoLabel = "Bridge.vETH";
                                    }
                                    if(currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU"){
                                        currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                        currency.coingeckoLabel = "Coingecko";
                                    } 
                                }
                            })
                        }


                        if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            estimatedPureValueUSDVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 * 100) / 100).toLocaleString();
                            estimatedPureValueUSD = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 / estimatedPureSupply *100)/ 100).toLocaleString();
                            estimatedPureValueVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 / estimatedPureSupply /vrscBridgePrice *100000000)/ 100000000).toLocaleString();
                        }
                        if (reservesCurrency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                            estimatedPureValueUSDBTC = (Math.round(tBTCvETHCoingeckoPrice * reservesCurrency.reserves * 2 * 100) / 100).toLocaleString();
                        }
                    })
                    currency.currencyId = currencyId;
                    currency.currencyName = item[1];
                    currencyPureArray.push(currency);
                }
            })
        })
    }

    /* estimated value of Pure */
    currencyPureArray.forEach((currency) => {
        currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 8 });
    })

    result.currencyPureArray = currencyPureArray;
    result.estimatedPureValueUSDBTC = estimatedPureValueUSDBTC;
    result.estimatedPureValueUSDVRSC = estimatedPureValueUSDVRSC;
    result.estimatedPureValueUSD = estimatedPureValueUSD;
    result.estimatedPureValueVRSC = estimatedPureValueVRSC;
    return result;
}

module.exports = { pureVolume, currencyReservePure}