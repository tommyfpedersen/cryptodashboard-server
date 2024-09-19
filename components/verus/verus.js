import dotenv from 'dotenv';
dotenv.config();

import { convertToAxisString } from '../../utils/stringUtil.js';
import { getMiningInfo, getPeerInfo, getBlock, getBlockSubsidy, getCurrencyState, getCoinSupply } from "./api/api.js";
import { currencyReserveEthBridge } from "./ethbridge/ethbridge.js";
import { currencyReserveKaiju } from "./kaiju/kaiju.js";
import { currencyReserveNati } from './nati/nati.js';
import { currencyReservePure } from "./pure/pure.js";
import { currencyReserveSwitch } from "./switch/switch.js";
import { currencyReserveNatiOwl } from './natiOwl/natiOwl.js';

export async function getNodeStatus() {
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

export async function getBlockAndFeePoolRewards() {
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
        result.stakingsupply = miningInfo.stakingsupply;
        result.networkhashps = miningInfo.networkhashps;
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

export async function getMarketCapStats(block, vrscPrice) {
    let result = {};
    let totalSupply = null;
    let maxSupply = 83540184;

    const coinSupply = await getCoinSupply(block);

    if (coinSupply) {
        totalSupply = coinSupply.total;
        result.totalSupply = totalSupply;
        result.circulatingSupply = totalSupply;
        result.circulatingSupplyPercentage = totalSupply / maxSupply * 100;
        result.marketCap = totalSupply * vrscPrice;
        result.maxSupply = maxSupply;
        result.fullyDilutedMarketCap = maxSupply * vrscPrice;
    } else {
        result.totalSupply = "syncing";
        result.circulatingSupply = "syncing";
        result.circulatingSupplyPercentage = "syncing";
        result.marketCap = "syncing";
        result.maxSupply = "syncing";
        result.fullyDilutedMarketCap = "syncing";
    }


    return result;
}

export async function getAddressBalance(address) {
    let result = {};
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
        const getAddressBalanceResponse = await fetch(process.env.VERUS_REST_API + "addressindex/getaddressbalance/" + verusAddress);
        const getAddressBalanceResult = await getAddressBalanceResponse.json();
        getAddressBalance = getAddressBalanceResult.result;
    } catch (error) {
        console.log("no verus api connected...")
    }


    if (getAddressBalance?.currencybalance) {

        let currencyIdArray = Object.keys(getAddressBalance.currencybalance);

        currencyIdArray.forEach((item) => {

            if (getAddressBalance.currencybalance < 0.000001) {
                return;
            }

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
                if (getAddressBalance.currencybalance.i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X < 0.00001) {
                    return;
                }
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
            if ("i9kVWKU2VwARALpbXn4RS9zvrhvNRaUibb" === item) {
                getAddressBalanceArray.push({ currencyName: "Kaiju", amount: getAddressBalance.currencybalance.i9kVWKU2VwARALpbXn4RS9zvrhvNRaUibb })
            }
            if ("iRt7tpLewArQnRddBVFARGKJStK6w5pDmC" === item) {
                getAddressBalanceArray.push({ currencyName: "NATI", amount: getAddressBalance.currencybalance.iRt7tpLewArQnRddBVFARGKJStK6w5pDmC })
            }
            if ("iL62spNN42Vqdxh8H5nrfNe8d6Amsnfkdx" === item) {
                getAddressBalanceArray.push({ currencyName: "NATI.vETH", amount: getAddressBalance.currencybalance.iL62spNN42Vqdxh8H5nrfNe8d6Amsnfkdx })
            }
        })
    }
    result.verusAddress = verusAddress;
    result.getAddressBalanceArray = getAddressBalanceArray;
    return result;
}

export async function calculateStakingRewards(totalSupply, stakingsupply, stakingAmountUnencoded, vrscPrice) {
    let result = {};
    let stakingArray = [];
    let stakingAmount = 100;
    if (stakingAmountUnencoded) {
        stakingAmount = decodeURIComponent(stakingAmountUnencoded);
    }
    result.stakingAmount = stakingAmount;
    result.stakingPercentage = stakingsupply / totalSupply * 100;
    let apy = 720 * 6 * 365 / stakingsupply;
    result.apy = apy;

    let stakingRewardsDaily = {
        label: "Daily",
        rewards: Math.round(apy * stakingAmount / 365 * 10000) / 10000,
        dollars: Math.round(apy * stakingAmount / 365 * vrscPrice * 100) / 100
    }
    let stakingRewardsMonthly = {
        label: "Monthly",
        rewards: Math.round(apy * stakingAmount / 12 * 10000) / 10000,
        dollars: Math.round(apy * stakingAmount / 12 * vrscPrice * 100) / 100
    }
    let stakingRewardsYearly = {
        label: "Yearly",
        rewards: Math.round(apy * stakingAmount * 10000) / 10000,
        dollars: Math.round(apy * stakingAmount * vrscPrice * 100) / 100
    }
    stakingArray.push(stakingRewardsDaily);
    stakingArray.push(stakingRewardsMonthly);
    stakingArray.push(stakingRewardsYearly);
    result.stakingArray = stakingArray;

    return result;
}
export async function calculateMiningRewards(networkHashPerSecond, vrscMiningHashUnencoded, vrscPrice) {
    let result = {};
    let miningArray = [];
    let vrscMiningHash = 1;
    if (vrscMiningHashUnencoded) {
        vrscMiningHash = decodeURIComponent(vrscMiningHashUnencoded);
    }

    result.vrscMiningHash = vrscMiningHash;
    let apy = 720 * 6 * 365 / networkHashPerSecond * 1000000;

    let miningRewardsDaily = {
        label: "Daily",
        rewards: Math.round(apy * vrscMiningHash / 365 * 10000) / 10000,
        dollars: Math.round(apy * vrscMiningHash / 365 * vrscPrice * 100) / 100
    }
    let miningRewardsMonthly = {
        label: "Monthly",
        rewards: Math.round(apy * vrscMiningHash / 12 * 10000) / 10000,
        dollars: Math.round(apy * vrscMiningHash / 12 * vrscPrice * 100) / 100
    }
    let miningRewardsYearly = {
        label: "Yearly",
        rewards: Math.round(apy * vrscMiningHash * 10000) / 10000,
        dollars: Math.round(apy * vrscMiningHash * vrscPrice * 100) / 100
    }

    miningArray.push(miningRewardsDaily);
    miningArray.push(miningRewardsMonthly);
    miningArray.push(miningRewardsYearly);
    result.miningArray = miningArray;

    return result;
}

export async function getCurrencyVolume(currencyName, fromBlock, toBlock, interval, converttocurrency) {
    let result = {};
    let totalVolume = 0;
    let volumeArray = [];
    let yAxisArray = [];

    const currencyState = await getCurrencyState(currencyName, fromBlock, toBlock, interval, converttocurrency);

    if (currencyState.length > 0) {
        currencyState.map((item) => {
            if (item.conversiondata) {
                let volume = Math.round(item.conversiondata.volumethisinterval);
                volumeArray.push({ volume: volume });
            }
            if (item.totalvolume) {
                totalVolume = Math.round(item.totalvolume).toLocaleString();
            }
        })
    }


    let volumeArrayMax = Math.max(...volumeArray.map(o => o.volume));
    yAxisArray.push({ value: convertToAxisString(volumeArrayMax) });
    yAxisArray.push({ value: convertToAxisString(volumeArrayMax / 2) });
    yAxisArray.push({ value: 0 });

    volumeArray.forEach((item) => {
        item.barPCT = Math.round((item.volume / volumeArrayMax) * 100);
        item.volume = convertToAxisString(item.volume);
    })
    result.totalVolume = totalVolume;
    result.volumeArray = volumeArray;
    result.yAxisArray = yAxisArray;

    return result;
}

export async function getCurrencyReserve(currencyName, priceArray, vrscBridgePrice) {
    if (currencyName === "bridge.veth") {
        return currencyReserveEthBridge(priceArray);
    }
    if (currencyName === "kaiju") {
        return currencyReserveKaiju(priceArray, vrscBridgePrice);
    }
    if (currencyName === "pure") {
        return currencyReservePure(priceArray, vrscBridgePrice);
    }
    if (currencyName === "switch") {
        return currencyReserveSwitch(priceArray, vrscBridgePrice);
    }
    if (currencyName === "nati") {
        return currencyReserveNati(priceArray, vrscBridgePrice);
    }
    if (currencyName === "nati🦉") {
        return currencyReserveNatiOwl(priceArray, vrscBridgePrice);
    }
}