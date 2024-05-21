require('dotenv').config();
const { saveVolumeDataToFile, getVolumeDataFromFile } = require("../cache/cache");
const { isBlockInVolumeArray } = require("../utils/utils");

let volumeInDollarsArrayLoadFromCache = false;
let volumeInDollarsArray = [];



async function kaijuVolume(fromBlock, toBlock) {
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

    let usdtReserveIn = 0;
    let usdtReserveInLastValue = -1;
    let usdtReserveOut = 0;
    let usdtReserveOutLastValue = -1;
    let usdtReserveInDollars = 0;

    let tBTCReserveIn = 0;
    let tBTCReserveInLastValue = -1;
    let tBTCReserveOut = 0;
    let tBTCReserveOutLastValue = -1;
    let tBTCReserveInDollars = 0;

    let ethReserveIn = 0;
    let ethReserveInLastValue = -1;
    let ethReserveOut = 0;
    let ethReserveOutLastValue = -1;
    let ethReserveInDollars = 0;

    for (let i = fromBlock; i <= toBlock; i++) {
        const getcurrencystateResponse = await fetch(process.env.VERUS_REST_API+ "multichain/getcurrencystate/kaiju/" + i);
        const getcurrencystateResult = await getcurrencystateResponse.json();
        let getcurrencystate = getcurrencystateResult.result[0];

        if (getcurrencystate) {
            getcurrencystate = getcurrencystateResult.result[0];
            const getcurrencystateVRSC = getcurrencystate.currencystate.currencies.i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV;
            const getcurrencystateUSDT = getcurrencystate.currencystate.currencies.i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY;
            const getcurrencystateTBTC = getcurrencystate.currencystate.currencies.iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU;
            const getcurrencystateETH = getcurrencystate.currencystate.currencies.i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X;

            // VRSC in
            if (getcurrencystateVRSC.reservein !== vrscReserveInLastValue) {
                vrscReserveIn = vrscReserveIn + getcurrencystateVRSC.reservein;

                let vrscReserves = 0;
                let usdtReserves = 0;

                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                        vrscReserves = currency.reserves;
                    }
                    if (currency.currencyid === "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY") {
                        usdtReserves = currency.reserves;
                    }
                })
                vrscReserveInDollars = vrscReserveInDollars + getcurrencystateVRSC.reservein * (usdtReserves / vrscReserves);
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", "reservein")) {
                    volumeInDollarsArray.push({
                        currencyid: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
                        dollars: getcurrencystateVRSC.reservein * (usdtReserves / vrscReserves),
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
                let usdtReserves = 0;
                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                        vrscReserves = currency.reserves;
                    }
                    if (currency.currencyid === "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY") {
                        usdtReserves = currency.reserves;
                    }
                })
                vrscReserveInDollars = vrscReserveInDollars + getcurrencystateVRSC.reserveout * (usdtReserves / vrscReserves);
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", "reserveout") === false) {
                    volumeInDollarsArray.push({
                        currencyid: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
                        dollars: getcurrencystateVRSC.reserveout * (usdtReserves / vrscReserves),
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reserveout"
                    })
                }
            }

            vrscReserveInLastValue = getcurrencystateVRSC.reservein;
            vrscReserveOutLastValue = getcurrencystateVRSC.reserveout;

            // USDT in
            if (getcurrencystateUSDT.reservein !== usdtReserveInLastValue) {
                usdtReserveIn = usdtReserveIn + getcurrencystateUSDT.reservein;

                let usdtReserves = 0;
                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY") {
                        usdtReserves = currency.reserves;
                    }
                })
                usdtReserveInDollars = usdtReserveInDollars + getcurrencystateUSDT.reservein * 1;
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY", "reservein") === false) {
                    volumeInDollarsArray.push({
                        currencyid: "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY",
                        dollars: getcurrencystateUSDT.reservein * 1,
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reservein"
                    })
                }
            }
            // USDT out
            if (getcurrencystateUSDT.reserveout !== usdtReserveOutLastValue) {
                usdtReserveOut = usdtReserveOut + getcurrencystateUSDT.reserveout;

                let usdtReserves = 0;
                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY") {
                        usdtReserves = currency.reserves;
                    }
                })
                usdtReserveInDollars = usdtReserveInDollars + getcurrencystateUSDT.reserveout * 1;
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY", "reserveout") === false) {
                    volumeInDollarsArray.push({
                        currencyid: "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY",
                        dollars: getcurrencystateUSDT.reserveout * 1,
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reserveout"
                    })
                }
            }
            usdtReserveInLastValue = getcurrencystateUSDT.reservein;
            usdtReserveOutLastValue = getcurrencystateUSDT.reserveout;

            // TBTC in
            if (getcurrencystateTBTC.reservein !== tBTCReserveInLastValue) {
                tBTCReserveIn = tBTCReserveIn + getcurrencystateTBTC.reservein;

                let tBTCReserves = 0;
                let usdtReserves = 0;

                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                        tBTCReserves = currency.reserves;
                    }
                    if (currency.currencyid === "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY") {
                        usdtReserves = currency.reserves;
                    }
                })
                tBTCReserveInDollars = tBTCReserveInDollars + getcurrencystateTBTC.reservein * (usdtReserves / tBTCReserves);
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU", "reservein") === false) {
                    volumeInDollarsArray.push({
                        currencyid: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU",
                        dollars: getcurrencystateTBTC.reservein * (usdtReserves / tBTCReserves),
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reservein"
                    })
                }
            }
            // TBTC out
            if (getcurrencystateTBTC.reserveout !== tBTCReserveOutLastValue) {
                tBTCReserveOut = tBTCReserveOut + getcurrencystateTBTC.reserveout;
                let tBTCReserves = 0;
                let usdtReserves = 0;
                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                        tBTCReserves = currency.reserves;
                    }
                    if (currency.currencyid === "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY") {
                        usdtReserves = currency.reserves;
                    }
                })
                tBTCReserveInDollars = tBTCReserveInDollars + getcurrencystateTBTC.reserveout * (usdtReserves / tBTCReserves);
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU", "reserveout") === false) {
                    volumeInDollarsArray.push({
                        currencyid: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU",
                        dollars: getcurrencystateTBTC.reserveout * (usdtReserves / tBTCReserves),
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reserveout"
                    })
                }
            }

            tBTCReserveInLastValue = getcurrencystateTBTC.reservein;
            tBTCReserveOutLastValue = getcurrencystateTBTC.reserveout;

            // ETH in
            if (getcurrencystateETH.reservein !== ethReserveInLastValue) {
                ethReserveIn = ethReserveIn + getcurrencystateETH.reservein;

                let ethReserves = 0;
                let usdtReserves = 0;

                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
                        ethReserves = currency.reserves;
                    }
                    if (currency.currencyid === "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY") {
                        usdtReserves = currency.reserves;
                    }
                })
                ethReserveInDollars = ethReserveInDollars + getcurrencystateETH.reservein * (usdtReserves / ethReserves);
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X", "reservein") === false) {
                    volumeInDollarsArray.push({
                        currencyid: "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X",
                        dollars: getcurrencystateETH.reservein * (usdtReserves / ethReserves),
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
                let usdtReserves = 0;
                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
                        ethReserves = currency.reserves;
                    }
                    if (currency.currencyid === "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY") {
                        usdtReserves = currency.reserves;
                    }
                })
                ethReserveInDollars = ethReserveInDollars + getcurrencystateETH.reserveout * (usdtReserves / ethReserves);
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X", "reserveout") === false) {
                    volumeInDollarsArray.push({
                        currencyid: "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X",
                        dollars: getcurrencystateETH.reserveout * (usdtReserves / ethReserves),
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

    volumeInDollarsArrayLoadFromCache = true;
    return volumeInDollarsArray;
}

async function currencyReserveKaiju(priceArray) {
    let result = {};

    /* KAIJU reserves */
    const getcurrencyResponse = await fetch(process.env.VERUS_REST_API+ "multichain/getcurrency/kaiju");
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let currencyKaijuArray = [];
    let ethereumKaijuPrice = 0;
    let tBTCKaijuPrice = 0;
    let vrscKaijuPrice = 0;
    let usdtReserve = 0;
    let estimatedKaijuValue = 0;
    let estimatedKaijuSupply = getcurrency.bestcurrencystate.supply;
    let estimatedKaijuValueUSD = 0;
    let estimatedKaijuValueVRSC = 0;

    if (getcurrency) {
        let currencyIdArray = Object.values(getcurrency.currencies);
        let currencyNames = Object.entries(getcurrency.currencynames);

        /* find usdt value*/
        currencyIdArray.forEach((currencyId) => {
            currencyNames.forEach((item) => {
                let currency = {}
                if (item[0] === currencyId) {
                    getcurrency.bestcurrencystate.reservecurrencies.forEach((reservesCurrency) => {
                        if (reservesCurrency.currencyid === "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY") {
                            usdtReserve = reservesCurrency.reserves;
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
                            currency.price = Math.round(usdtReserve / currency.reserves * 100) / 100;
                            currency.origin = "Kaiju";
                            currency.network = "vrsc";

                            if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                vrscKaijuPrice = Math.round(usdtReserve / currency.reserves * 100) / 100;
                            }
                            if (currencyId === "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4") {
                                ethereumKaijuPrice = Math.round(usdtReserve / currency.reserves * 100) / 100;
                            }
                            if (currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                                tBTCKaijuPrice = Math.round(usdtReserve / currency.reserves * 100) / 100;
                            }
                        }

                        if (priceArray.length > 0) {
                            priceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                }
                            })
                        }


                        if (reservesCurrency.currencyid === "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY") {
                            estimatedKaijuValue = (Math.round(reservesCurrency.reserves * 4 * 100) / 100).toLocaleString();
                            estimatedKaijuValueUSD = (Math.round(reservesCurrency.reserves * 4 / estimatedKaijuSupply *100)/ 100).toLocaleString();
                            estimatedKaijuValueVRSC = (Math.round(reservesCurrency.reserves * 4 / estimatedKaijuSupply / vrscKaijuPrice *100000000)/ 100000000).toLocaleString();
                        }
                    })
                    currency.currencyId = currencyId;
                    currency.currencyName = item[1];
                    currencyKaijuArray.push(currency);
                }
            })
        })
    }

    /* estimated value of kaiju */
    currencyKaijuArray.forEach((currency) => {
        currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 8 });
    })

    result.currencyKaijuArray = currencyKaijuArray;
    result.estimatedKaijuValue = estimatedKaijuValue;
    result.vrscKaijuPrice = vrscKaijuPrice;
    result.ethereumKaijuPrice = ethereumKaijuPrice;
    result.tBTCKaijuPrice = tBTCKaijuPrice; 
    result.estimatedKaijuValueUSD = estimatedKaijuValueUSD;
    result.estimatedKaijuValueVRSC = estimatedKaijuValueVRSC;
    return result;
}

module.exports = { kaijuVolume, currencyReserveKaiju}