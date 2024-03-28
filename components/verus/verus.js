
const { convertToAxisString } = require("../../utils/stringUtil");

async function getNodeStatus() {
    let result = {};
    const mininginfo = await getMiningInfo();
    result.online = false;
    result.statusMessage = "Updating Verus Node...";
    if (mininginfo) {
        result.online = true;
        result.statusMessage = "Verus Node Running";
    }
    return result;
}

async function getBlockAndFeePoolRewards() {
    let result = {};
    result.blockLastSend = "";
    result.block = 0;
    let blockFeeReward = 0;
    let feeReward = "";

    const peerinfo = await getPeerInfo();
    if (Array.isArray(peerinfo) && peerinfo.length > 0) {
        result.blockLastSend = new Date(peerinfo[0].lastsend * 1000).toLocaleString();
        const miningInfo = await getMiningInfo();
        result.block = miningInfo.blocks;
        const block = await getBlock(miningInfo.blocks);
        const blocksubsidy = await getBlockSubsidy(miningInfo.blocks);
        block.tx[0].vout.map((item) => {
            blockFeeReward = blockFeeReward + item.value;
        })
        feeReward = Math.round((blockFeeReward - blocksubsidy?.miner) * 100000000) / 100000000;
        result.blockReward = blocksubsidy.miner;
        result.feeReward = feeReward;
        result.averageblockfees = miningInfo.averageblockfees
    }
    return result;
}

async function getAddressBalance(address) {
    result = {};
    let getAddressBalanceArray = [];
    let verusAddress = "";
    if (address) {
        verusAddress = decodeURIComponent(address);
    } else {
        verusAddress = "none";//"RCdXBieidGuXmK8Tw2gBoXWxi16UgqyKc7";
    }
    const getAddressBalanceResponse = await fetch("http://localhost:9009/addressindex/getaddressbalance/" + verusAddress);
    const getAddressBalanceResult = await getAddressBalanceResponse.json();
    const getAddressBalance = getAddressBalanceResult.result;

    if (getAddressBalance?.currencybalance) {
        let currencyIdArray = Object.keys(getAddressBalance.currencybalance);

        currencyIdArray.forEach((item) => {
            if ("i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV" === item) {
                getAddressBalanceArray.push({ currencyName: "VRSC", amount: getAddressBalance.currencybalance.i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV })
            }
            if ("iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM" === item) {
                getAddressBalanceArray.push({ currencyName: "DAI.vETH", amount: getAddressBalance.currencybalance.iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM })
            }
            if ("iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4" === item) {
                getAddressBalanceArray.push({ currencyName: "MKR.vETH", amount: getAddressBalance.currencybalance.iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4 })
            }
            if ("i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X" === item) {
                getAddressBalanceArray.push({ currencyName: "vETH", amount: getAddressBalance.currencybalance.i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X })
            }
            if ("i3f7tSctFkiPpiedY8QR5Tep9p4qDVebDx" === item) {
                getAddressBalanceArray.push({ currencyName: "Bridge.vETH", amount: getAddressBalance.currencybalance.i3f7tSctFkiPpiedY8QR5Tep9p4qDVebDx })
            }
        })
    }
    result.verusAddress = verusAddress;
    result.getAddressBalanceArray = getAddressBalanceArray;
    return result;
}

async function getCurrencyVolume(currencyName, blockcount) {
    const miningInfo = await getMiningInfo();
    let result;
    let volumeArray;
    if (currencyName === "bridge.veth") {
        volumeArray = await getVrscEthBridgeVolume(miningInfo.blocks - blockcount, miningInfo.blocks);
        result = await calculateCurrencyVolume(volumeArray, miningInfo.blocks);
    }
    if (currencyName === "pure") {
        volumeArray = await getPureVolume(miningInfo.blocks - blockcount, miningInfo.blocks);
        result = await calculateCurrencyVolume(volumeArray, miningInfo.blocks);
    }

    return result;
}

async function calculateCurrencyVolume(volumeArray, miningInfoBlocks) {
    let result = {};
    let volumeInDollars24Hours = 0;
    let volumeInDollars24HoursArray = [];
    let volumeInDollars24HoursArrayYAxis = [];
    let volumeInDollars7Days = 0;
    let volumeInDollars7DaysArray = [];
    let volumeInDollars7DaysArrayYAxis = [];
    let volumeInDollars30Days = 0;
    let volumeInDollars30DaysArray = [];
    let volumeInDollars30DaysArrayYAxis = [];

    let getblock = await getBlock(miningInfoBlocks);

    //   // 24 hour
    const blockInterval24H = 60;
    let snapShootInterval24H = 0;
    let volumeInDollarsCounter24H = 0;
    let counter = -1;
    let totalVol = 0;

    volumeArray
        .sort((a, b) => b.height - a.height)
        .filter((item) => {
            return item.height > getblock.height - 1440;
        })
        .forEach((elm) => {
            if (elm.height > getblock.height - 1440) {
                if (elm.height < (getblock.height - snapShootInterval24H)) {
                    snapShootInterval24H = snapShootInterval24H + blockInterval24H;
                    volumeInDollars24HoursArray.push({ price: volumeInDollarsCounter24H, label: counter + " hours ago" })

                    volumeInDollarsCounter24H = 0;
                    counter++;
                }
                volumeInDollarsCounter24H += elm.dollars;
                volumeInDollars24Hours = volumeInDollars24Hours + elm.dollars;
            }
        })
    volumeInDollars24HoursArray.reverse();

    let volumeInDollars24HoursArrayMax = Math.max(...volumeInDollars24HoursArray.map(o => o.price));
    volumeInDollars24HoursArrayYAxis.push({ value: convertToAxisString(volumeInDollars24HoursArrayMax) });
    volumeInDollars24HoursArrayYAxis.push({ value: convertToAxisString(volumeInDollars24HoursArrayMax / 2) });
    volumeInDollars24HoursArrayYAxis.push({ value: 0 });

    volumeInDollars24HoursArray.forEach((item) => {
        item.barPCT = (item.price / volumeInDollars24HoursArrayMax) * 100;
        item.price = convertToAxisString(item.price)
    })

    volumeInDollars24Hours = (Math.round(volumeInDollars24Hours * 100) / 100).toLocaleString();

    result.volumeInDollars24Hours = volumeInDollars24Hours;
    result.volumeInDollars24HoursArray = volumeInDollars24HoursArray;
    result.volumeInDollars24HoursArrayYAxis = volumeInDollars24HoursArrayYAxis;

    // 7 days
    const blockInterval7D = 1440;
    let snapShootInterval7D = 0;
    let volumeInDollarsCounter7D = 0;
    counter = -1;
    totalVol = 0;

    volumeArray
        .sort((a, b) => b.height - a.height)
        .filter((item) => {
            return item.height > getblock.height - 1440 * 8;
        })
        .forEach((elm) => {

            if (elm.height > getblock.height - 1440 * 8) {
                if (elm.height < (getblock.height - snapShootInterval7D)) {
                    snapShootInterval7D = snapShootInterval7D + blockInterval7D;
                    volumeInDollars7DaysArray.push({ price: volumeInDollarsCounter7D, label: counter + " days ago" })

                    volumeInDollarsCounter7D = 0;
                    counter++;
                }
                volumeInDollarsCounter7D += elm.dollars;
                volumeInDollars7Days = volumeInDollars7Days + elm.dollars;
            }
        })
    volumeInDollars7DaysArray.reverse();

    let volumeInDollars7DaysArrayMax = Math.max(...volumeInDollars7DaysArray.map(o => o.price));
    volumeInDollars7DaysArrayYAxis.push({ value: convertToAxisString(volumeInDollars7DaysArrayMax) });
    volumeInDollars7DaysArrayYAxis.push({ value: convertToAxisString(volumeInDollars7DaysArrayMax / 2) });
    volumeInDollars7DaysArrayYAxis.push({ value: 0 });

    volumeInDollars7DaysArray.forEach((item) => {
        item.barPCT = (item.price / volumeInDollars7DaysArrayMax) * 100;
        item.price = convertToAxisString(item.price)
    })

    volumeInDollars7Days = (Math.round(volumeInDollars7Days * 100) / 100).toLocaleString();

    result.volumeInDollars7Days = volumeInDollars7Days;
    result.volumeInDollars7DaysArray = volumeInDollars7DaysArray;
    result.volumeInDollars7DaysArrayYAxis = volumeInDollars7DaysArrayYAxis;

    //   // 30 days
    const blockInterval30D = 1440;
    let snapShootInterval30D = 0;
    let volumeInDollarsCounter30D = 0;
    counter = -1;
    totalVol = 0;

    volumeArray
        .sort((a, b) => b.height - a.height)
        .filter((item) => {
            return item.height > getblock.height - 1440 * 31;
        })
        .forEach((elm) => {
            if (elm.height > getblock.height - 1440 * 31) {
                if (elm.height < (getblock.height - snapShootInterval30D)) {
                    snapShootInterval30D = snapShootInterval30D + blockInterval30D;
                    volumeInDollars30DaysArray.push({ price: volumeInDollarsCounter30D, label: counter + " days ago" })

                    volumeInDollarsCounter30D = 0;
                    counter++;
                }
                volumeInDollarsCounter30D += elm.dollars;
                volumeInDollars30Days = volumeInDollars30Days + elm.dollars;
            }
        })
    volumeInDollars30DaysArray.reverse();

    let volumeInDollars30DaysArrayMax = Math.max(...volumeInDollars30DaysArray.map(o => o.price));
    volumeInDollars30DaysArrayYAxis.push({ value: convertToAxisString(volumeInDollars30DaysArrayMax) });
    volumeInDollars30DaysArrayYAxis.push({ value: convertToAxisString(volumeInDollars30DaysArrayMax / 2) });
    volumeInDollars30DaysArrayYAxis.push({ value: 0 });

    volumeInDollars30DaysArray.forEach((item) => {
        item.barPCT = (item.price / volumeInDollars30DaysArrayMax) * 100;
        item.price = convertToAxisString(item.price)
    })

    volumeInDollars30Days = (Math.round(volumeInDollars30Days * 100) / 100).toLocaleString();

    result.volumeInDollars30Days = volumeInDollars30Days;
    result.volumeInDollars30DaysArray = volumeInDollars30DaysArray;
    result.volumeInDollars30DaysArrayYAxis = volumeInDollars30DaysArrayYAxis;

    return result;
}


let volumeInDollarsArray = [];
async function getVrscEthBridgeVolume(fromBlock, toBlock) {
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

let volumeInDollarsPureArray = [];
async function getPureVolume(fromBlock, toBlock) {
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
                if (isBlockInVolumeArray(getcurrencystate.height, "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", "reservein")) {
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
                if (isBlockInVolumeArray(getcurrencystate.height, "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", "reserveout") === false) {
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
                if (isBlockInVolumeArray(getcurrencystate.height, "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU", "reservein") === false) {
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
                if (isBlockInVolumeArray(getcurrencystate.height, "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU", "reserveout") === false) {
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

async function getCurrencyReserve(currencyName, priceArray) {
    if (currencyName === "bridge.veth") {
        return calculateCurrencyReserveBridge(priceArray);
    }
    if (currencyName === "pure") {
        return calculateCurrencyReservePure(priceArray);
    }
}

async function calculateCurrencyReserveBridge(priceArray) {
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
    return result;
}

async function calculateCurrencyReservePure(priceArray) {
    let result = {};

    /* VRSC-ETH Bridge reserves */
    const getcurrencyResponse = await fetch(`http://localhost:9009/multichain/getcurrency/pure`);
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let currencyBridgeArray = [];

    let tBTCvETHPrice = 0;
    let vrscBridgePrice = 0;
    let vrscReserve = 0;
    let estimatedBridgeValue = 0;
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
                            currency.price = Math.round(vrscReserve / currency.reserves * 100) / 100;

                            if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                vrscBridgePrice = Math.round(vrscReserve / currency.reserves * 100) / 100;
                            }
                            if (currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                                tBTCvETHPrice = Math.round(vrscReserve / currency.reserves * 100) / 100;
                            }
                        }

                        if (priceArray.length > 0) {
                            priceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                }
                            })
                        }


                        if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            estimatedBridgeValue = (Math.round(reservesCurrency.reserves * 2 * 100) / 100).toLocaleString();
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
    return result;
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

module.exports = { getNodeStatus, getBlockAndFeePoolRewards, getAddressBalance, getCurrencyVolume, getCurrencyReserve, getMiningInfo, getBlockSubsidy, getBlock, getPeerInfo, getVrscEthBridgeVolume };