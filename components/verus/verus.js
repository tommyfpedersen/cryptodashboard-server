let volumeInDollarsArray = [];

async function getMiningInfo() {
    const getmininginfoResponse = await fetch("http://localhost:9009/mining/getmininginfo")
    const getmininginfoResult = await getmininginfoResponse.json();
    const getmininginfo = getmininginfoResult.result;
    return getmininginfo;
}

async function getBlockSubsidy(block) {
    const getblocksubsidyResponse = await fetch("http://localhost:9009/mining/getblocksubsidy/" + block);
    const getblocksubsidyResult = await getblocksubsidyResponse.json();
    const getblocksubsidy = getblocksubsidyResult.result;
    return getblocksubsidy;
}

async function getBlock(block) {
    const getblockResponse = await fetch("http://localhost:9009/blockchain/getblock/" + block);
    const getblockResult = await getblockResponse.json();
    const getblock = getblockResult.result;
    return getblock;
}

async function getPeerInfo() {
    const getpeerinfoResponse = await fetch("http://localhost:9009/network/getpeerinfo/");
    const getpeerinfoResult = await getpeerinfoResponse.json();
    const getpeerinfo = getpeerinfoResult.result;
    return getpeerinfo;
}

async function getVrscEthBridgeVolume(fromBlock, toBlock) {
    if (volumeInDollarsArray.length > 0) {
        volumeInDollarsArray.sort((a, b) => b.height - a.height);
        let latestVolumeBlockHeight = volumeInDollarsArray[0].height;
        toBlock = toBlock;
        fromBlock = latestVolumeBlockHeight;

        // clean up - delete all beyond 33 days
        volumeInDollarsArray = volumeInDollarsArray.filter((item)=>{
            return item.height > toBlock - 1440*33;
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
                if (isBlockInVolumeArray(getcurrencystate.height, "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", "reservein")) {
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
                if (isBlockInVolumeArray(getcurrencystate.height, "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", "reserveout") === false) {
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
                if (isBlockInVolumeArray(getcurrencystate.height, "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM", "reservein") === false) {
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
                if (isBlockInVolumeArray(getcurrencystate.height, "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM", "reserveout") === false) {
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
                if (isBlockInVolumeArray(getcurrencystate.height, "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4", "reservein") === false) {
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
                if (isBlockInVolumeArray(getcurrencystate.height, "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4", "reserveout") === false) {
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
                if (isBlockInVolumeArray(getcurrencystate.height, "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X", "reservein") === false) {
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
                if (isBlockInVolumeArray(getcurrencystate.height, "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X", "reserveout") === false) {
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

function isBlockInVolumeArray(block, currency, type) {
    let result = false;
    volumeInDollarsArray.forEach((item) => {
        if (item.height === block) {
            if (item.currencyid === currency && item.type === type) {
                result = true;
            }
        }
    })
    return result;
}

module.exports = { getMiningInfo, getBlockSubsidy, getBlock, getPeerInfo, getVrscEthBridgeVolume };