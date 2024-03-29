const { getMiningInfo, getPeerInfo, getBlock, getBlockSubsidy } = require("./api/api");
const { vrscEthBridgeVolume, currencyReserveEthBridge } = require("./ethbridge/ethbridge");
const { currencyReservePure, pureVolume } = require("./pure/pure");
const { calculateCurrencyVolume } = require("./utils/utils");

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
        volumeArray = await vrscEthBridgeVolume(miningInfo.blocks - blockcount, miningInfo.blocks);
        result = await calculateCurrencyVolume(volumeArray, miningInfo.blocks);
    }
    if (currencyName === "pure") {
        volumeArray = await pureVolume(miningInfo.blocks - blockcount, miningInfo.blocks);
        result = await calculateCurrencyVolume(volumeArray, miningInfo.blocks);
    }

    return result;
}

// async function getVrscEthBridgeVolume(fromBlock, toBlock) {
//     return vrscEthBridgeVolume(fromBlock, toBlock); 
// }

// async function getPureVolume(fromBlock, toBlock) {
//     return pureVolume(fromBlock, toBlock);
// }

async function getCurrencyReserve(currencyName, priceArray) {
    if (currencyName === "bridge.veth") {
        return currencyReserveEthBridge(priceArray);
    }
    if (currencyName === "pure") {
        return currencyReservePure(priceArray);
    }
}

module.exports = { getNodeStatus, getBlockAndFeePoolRewards, getAddressBalance, getCurrencyVolume, getCurrencyReserve };