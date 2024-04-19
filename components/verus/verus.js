const { getMiningInfo, getPeerInfo, getBlock, getBlockSubsidy } = require("./api/api");
const { vrscEthBridgeVolume, currencyReserveEthBridge } = require("./ethbridge/ethbridge");
const { currencyReservePure, pureVolume } = require("./pure/pure");
const { vrscSwitchVolume, currencyReserveSwitch } = require("./switch/switch");
const { calculateCurrencyVolume } = require("./utils/utils");

async function getNodeStatus() {
    let result = {};
    const mininginfo = await getMiningInfo();
    result.online = false;
    result.statusMessage = "Updating and syncing Verus Node...";
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
    let getAddressBalance = {};
    let verusAddress = "";
    if (address) {
        verusAddress = decodeURIComponent(address);
    } else {
        verusAddress = "none";//"RCdXBieidGuXmK8Tw2gBoXWxi16UgqyKc7";
    }

    // vrsc
    try {
        const getAddressBalanceResponse = await fetch("http://localhost:9009/addressindex/getaddressbalance/" + verusAddress);
        const getAddressBalanceResult = await getAddressBalanceResponse.json();
        getAddressBalance = getAddressBalanceResult.result;
    } catch (error) {
        console.log("no verus api connected")
    }
   

    // varrr
    // try {
    //     const getVarrrAddressBalanceResponse = await fetch("http://localhost:9010/addressindex/getaddressbalance/" + verusAddress);
    //     const getVarrrAddressBalanceResult = await getVarrrAddressBalanceResponse.json();
    //     const getVarrrAddressBalance = getVarrrAddressBalanceResult.result;
    //     getAddressBalance.currencybalance = { ...getAddressBalance.currencybalance, ...getVarrrAddressBalance.currencybalance };
    //     // if (getAddressBalance.currencybalance && getVarrrAddressBalance.currencybalance) {
    //     //     Object.keys(getVarrrAddressBalance.currencybalance).forEach((key) => {
    //     //         if (getAddressBalance.currencybalance[key]) {
    //     //             getAddressBalance.currencybalance[key] += getVarrrAddressBalance.currencybalance[key];
    //     //         } else {
    //     //             getAddressBalance.currencybalance[key] = getVarrrAddressBalance.currencybalance[key];
    //     //         }
    //     //     });
    //     // } else if (getVarrrAddressBalance.currencybalance) {
    //     //     getAddressBalance.currencybalance = getVarrrAddressBalance.currencybalance;
    //     // }
    // } catch (error) {
    //     console.log("no varrr api connected")
    // }


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
            if ("iHax5qYQGbcMGqJKKrPorpzUBX2oFFXGnY" === item) {
                getAddressBalanceArray.push({ currencyName: "Pure", amount: getAddressBalance.currencybalance.iHax5qYQGbcMGqJKKrPorpzUBX2oFFXGnY })
            }
            if ("iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU" === item) {
                getAddressBalanceArray.push({ currencyName: "tBTC.vETH", amount: getAddressBalance.currencybalance.iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU })
            }
            if ("i4Xr5TAMrDTD99H69EemhjDxJ4ktNskUtc" === item) {
                getAddressBalanceArray.push({ currencyName: "Switch", amount: getAddressBalance.currencybalance.i4Xr5TAMrDTD99H69EemhjDxJ4ktNskUtc })
            }
            if ("i61cV2uicKSi1rSMQCBNQeSYC3UAi9GVzd" === item) {
                getAddressBalanceArray.push({ currencyName: "vUSDC.vETH", amount: getAddressBalance.currencybalance.i61cV2uicKSi1rSMQCBNQeSYC3UAi9GVzd })
            }
            if ("iC5TQFrFXSYLQGkiZ8FYmZHFJzaRF5CYgE" === item) {
                getAddressBalanceArray.push({ currencyName: "EURC.vETH", amount: getAddressBalance.currencybalance.iC5TQFrFXSYLQGkiZ8FYmZHFJzaRF5CYgE })
            }
            if ("iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2" === item) {
                getAddressBalanceArray.push({ currencyName: "vARRR", amount: getAddressBalance.currencybalance.iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2 })
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
        volumeArray = await vrscEthBridgeVolume(miningInfo.blocks - blockcount, miningInfo.blocks);
        result = await calculateCurrencyVolume(volumeArray, miningInfo.blocks);
    }
    if (currencyName === "pure") {
        volumeArray = await pureVolume(miningInfo.blocks - blockcount, miningInfo.blocks);
        result = await calculateCurrencyVolume(volumeArray, miningInfo.blocks);
    }
    if (currencyName === "switch") {
        volumeArray = await vrscSwitchVolume(miningInfo.blocks - blockcount, miningInfo.blocks);
        result = await calculateCurrencyVolume(volumeArray, miningInfo.blocks);
    }

    return result;
}

async function getCurrencyReserve(currencyName, priceArray, vrscBridgePrice) {
    if (currencyName === "bridge.veth") {
        return currencyReserveEthBridge(priceArray);
    }
    if (currencyName === "pure") {
        return currencyReservePure(priceArray, vrscBridgePrice);
    }
    if (currencyName === "switch") {
        return currencyReserveSwitch(priceArray, vrscBridgePrice);
    }
}

module.exports = { getNodeStatus, getBlockAndFeePoolRewards, getAddressBalance, getCurrencyVolume, getCurrencyReserve };