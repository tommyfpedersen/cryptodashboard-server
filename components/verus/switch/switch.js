const { isBlockInVolumeArray } = require("../utils/utils");

let volumeInDollarsArray = [];
async function vrscSwitchVolume(fromBlock, toBlock) {
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

    let usdcReserveIn = 0;
    let usdcReserveInLastValue = -1;
    let usdcReserveOut = 0;
    let usdcReserveOutLastValue = -1;
    let usdcReserveInDollars = 0;

    let eurcReserveIn = 0;
    let eurcReserveInLastValue = -1;
    let eurcReserveOut = 0;
    let eurcReserveOutLastValue = -1;
    let eurcReserveInDollars = 0;

    for (let i = fromBlock; i <= toBlock; i++) {
        const getcurrencystateResponse = await fetch("http://localhost:9009/multichain/getcurrencystate/switch/" + i);
        const getcurrencystateResult = await getcurrencystateResponse.json();
        let getcurrencystate = getcurrencystateResult.result[0];

        if (getcurrencystate) {
            getcurrencystate = getcurrencystateResult.result[0];
            const getcurrencystateVRSC = getcurrencystate.currencystate.currencies.i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV;
            const getcurrencystateDAI = getcurrencystate.currencystate.currencies.iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM;
            const getcurrencystateUSDC = getcurrencystate.currencystate.currencies.i61cV2uicKSi1rSMQCBNQeSYC3UAi9GVzd;
            const getcurrencystateEURC = getcurrencystate.currencystate.currencies.iC5TQFrFXSYLQGkiZ8FYmZHFJzaRF5CYgE;

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

            // USDC in
            if (getcurrencystateUSDC.reservein !== usdcReserveInLastValue) {
                usdcReserveIn = usdcReserveIn + getcurrencystateUSDC.reservein;

                let usdcReserves = 0;
                let daiReserves = 0;

                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "i61cV2uicKSi1rSMQCBNQeSYC3UAi9GVzd") {
                        usdcReserves = currency.reserves;
                    }
                    if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                        daiReserves = currency.reserves;
                    }
                })
                usdcReserveInDollars = usdcReserveInDollars + getcurrencystateUSDC.reservein * (daiReserves / usdcReserves);
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "i61cV2uicKSi1rSMQCBNQeSYC3UAi9GVzd", "reservein") === false) {
                    volumeInDollarsArray.push({
                        currencyid: "i61cV2uicKSi1rSMQCBNQeSYC3UAi9GVzd",
                        dollars: getcurrencystateUSDC.reservein * (daiReserves / usdcReserves),
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reservein"
                    })
                }
            }
            // USDC out
            if (getcurrencystateUSDC.reserveout !== usdcReserveOutLastValue) {
                usdcReserveOut = usdcReserveOut + getcurrencystateUSDC.reserveout;
                let usdcReserves = 0;
                let daiReserves = 0;
                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "i61cV2uicKSi1rSMQCBNQeSYC3UAi9GVzd") {
                        usdcReserves = currency.reserves;
                    }
                    if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                        daiReserves = currency.reserves;
                    }
                })
                usdcReserveInDollars = usdcReserveInDollars + getcurrencystateUSDC.reserveout * (daiReserves / usdcReserves);
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "i61cV2uicKSi1rSMQCBNQeSYC3UAi9GVzd", "reserveout") === false) {
                    volumeInDollarsArray.push({
                        currencyid: "i61cV2uicKSi1rSMQCBNQeSYC3UAi9GVzd",
                        dollars: getcurrencystateUSDC.reserveout * (daiReserves / usdcReserves),
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reserveout"
                    })
                }
            }

            usdcReserveInLastValue = getcurrencystateUSDC.reservein;
            usdcReserveOutLastValue = getcurrencystateUSDC.reserveout;

            // EURC in
            if (getcurrencystateEURC.reservein !== eurcReserveInLastValue) {
                eurcReserveIn = eurcReserveIn + getcurrencystateEURC.reservein;

                let eurcReserves = 0;
                let daiReserves = 0;

                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "iC5TQFrFXSYLQGkiZ8FYmZHFJzaRF5CYgE") {
                        eurcReserves = currency.reserves;
                    }
                    if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                        daiReserves = currency.reserves;
                    }
                })
                eurcReserveInDollars = eurcReserveInDollars + getcurrencystateEURC.reservein * (daiReserves / eurcReserves);
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "iC5TQFrFXSYLQGkiZ8FYmZHFJzaRF5CYgE", "reservein") === false) {
                    volumeInDollarsArray.push({
                        currencyid: "iC5TQFrFXSYLQGkiZ8FYmZHFJzaRF5CYgE",
                        dollars: getcurrencystateEURC.reservein * (daiReserves / eurcReserves),
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reservein"
                    })
                }
            }
            // EURC out
            if (getcurrencystateEURC.reserveout !== eurcReserveOutLastValue) {
                eurcReserveOut = eurcReserveOut + getcurrencystateEURC.reserveout;
                let eurcReserves = 0;
                let daiReserves = 0;
                getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
                    if (currency.currencyid === "iC5TQFrFXSYLQGkiZ8FYmZHFJzaRF5CYgE") {
                        eurcReserves = currency.reserves;
                    }
                    if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                        daiReserves = currency.reserves;
                    }
                })
                eurcReserveInDollars = eurcReserveInDollars + getcurrencystateEURC.reserveout * (daiReserves / eurcReserves);
                if (isBlockInVolumeArray(volumeInDollarsArray, getcurrencystate.height, "iC5TQFrFXSYLQGkiZ8FYmZHFJzaRF5CYgE", "reserveout") === false) {
                    volumeInDollarsArray.push({
                        currencyid: "iC5TQFrFXSYLQGkiZ8FYmZHFJzaRF5CYgE",
                        dollars: getcurrencystateEURC.reserveout * (daiReserves / eurcReserves),
                        height: getcurrencystate.height,
                        blocktime: getcurrencystate.blocktime,
                        type: "reserveout"
                    })
                }
            }
            eurcReserveInLastValue = getcurrencystateEURC.reservein;
            eurcReserveOutLastValue = getcurrencystateEURC.reserveout;
        }
    }
    let totalVolumenInDollars = 0;
    volumeInDollarsArray.forEach((elm) => {
        totalVolumenInDollars = totalVolumenInDollars + elm.dollars;
    })
    return volumeInDollarsArray;
}

async function currencyReserveSwitch(priceArray, vrscBridgePrice) {
    let result = {};

    /* VRSC-ETH Bridge reserves */
    const getcurrencyResponse = await fetch(`http://localhost:9009/multichain/getcurrency/switch`);
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let currencySwitchArray = [];
    let eurcPrice = 0;
    let usdcPrice = 0;
    let vrscPrice = 0;
    let daiPrice = 0;
    let daiReserve = 0;
    let estimatedSwitchValue = 0;
    let estimatedSwitchReserveValue = 0;
    let estimatedSwitchValueUSDVRSC = 0;
    let estimatedSwitchSupply = getcurrency.bestcurrencystate.supply;
    let estimatedSwitchValueUSD = 0;

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
                            estimatedSwitchReserveValue = daiReserve * 1 / reservesCurrency.weight;
                            estimatedSwitchValue = (Math.round(estimatedSwitchReserveValue / estimatedSwitchSupply * 100) / 100).toLocaleString();
                            estimatedSwitchValueUSDVRSC = (Math.round(estimatedSwitchValue / vrscBridgePrice * 100000000) / 100000000).toLocaleString();
                            estimatedSwitchReserveValue = (Math.round(estimatedSwitchReserveValue * 100) / 100).toLocaleString();
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
                            currency.origin = "Switch";
                            currency.network = "vrsc";

                            if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                vrscPrice = (daiReserve * 1 / 0.21) / (currency.reserves * 1 / 0.16);
                                currency.price = Math.round(vrscPrice * 100) / 100;
                            }
                            if (currencyId === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                                daiPrice = (daiReserve * 1 / 0.21) / (currency.reserves * 1 / 0.21);
                                currency.price = Math.round(daiPrice * 100) / 100;
                            }
                            if (currencyId === "i61cV2uicKSi1rSMQCBNQeSYC3UAi9GVzd") {
                                usdcPrice = (daiReserve * 1 / 0.21) / (currency.reserves * 1 / 0.21);
                                currency.price = Math.round( usdcPrice * 100) / 100;
                            }
                            if (currencyId === "iC5TQFrFXSYLQGkiZ8FYmZHFJzaRF5CYgE") {
                                eurcPrice = (daiReserve * 1 / 0.21) / (currency.reserves * 1 / 0.42);
                                currency.price = Math.round(eurcPrice * 100) / 100;
                            }
                        }
                    })
                
                    if (priceArray.length > 0) {
                        let foundCurrency = null;
                        foundCurrency = priceArray.find(price => price.currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV");
                        if (foundCurrency && currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            currency.coingeckoprice = Math.round(vrscBridgePrice * 100) / 100;
                            currency.coingeckoLabel = "Bridge.vETH";
                        }
                        foundCurrency = priceArray.find(price => price.currencyId === "i61cV2uicKSi1rSMQCBNQeSYC3UAi9GVzd");
                        if (foundCurrency && currencyId === "i61cV2uicKSi1rSMQCBNQeSYC3UAi9GVzd") {
                            currency.coingeckoprice = Math.round(foundCurrency.price * 100) / 100;
                            currency.coingeckoLabel = "Coingecko";
                        }
                        foundCurrency = priceArray.find(price => price.currencyId === "iC5TQFrFXSYLQGkiZ8FYmZHFJzaRF5CYgE");
                        if (foundCurrency && currencyId === "iC5TQFrFXSYLQGkiZ8FYmZHFJzaRF5CYgE") {
                            currency.coingeckoprice = Math.round(foundCurrency.price * 100) / 100;
                            currency.coingeckoLabel = "Coingecko";
                        }
                        foundCurrency = priceArray.find(price => price.currencyId === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM");
                        if (foundCurrency && currencyId === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                            currency.coingeckoprice = Math.round(foundCurrency.price * 100) / 100;
                            currency.coingeckoLabel = "Coingecko";
                        }
                    }

                    currency.currencyId = currencyId;
                    currency.currencyName = item[1];
                    currencySwitchArray.push(currency);
                }
            })
        })
    }

    /* estimated value of Switch */
    currencySwitchArray.forEach((currency) => {
        currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 8 });
    })

    result.currencySwitchArray = currencySwitchArray;
    result.estimatedSwitchValue = estimatedSwitchValue;
    result.estimatedSwitcheReserveValue = estimatedSwitchReserveValue;
    result.estimatedSwitchValueUSDVRSC = estimatedSwitchValueUSDVRSC;
    return result;
}

module.exports = { vrscSwitchVolume, currencyReserveSwitch }