import dotenv from 'dotenv';
dotenv.config();

import { getMiningInfo, getPeerInfo, getBlock, getBlockSubsidy, getCurrencyState } from "./api/api.js";
import { currencyReserveChipsBridge } from "./chipsbridge/chipsbridge.js";
import { convertToAxisString } from '../../utils/stringUtil.js';

export async function getChipsNodeStatus() {
    let result = {};
    const mininginfo = await getMiningInfo();
    result.online = false;
    result.statusMessage = "Updating and syncing CHIPS PBaaS...";
    if (mininginfo) {
        result.online = true;
        result.statusMessage = "CHIPS PBaaS Running";
    }
    return result;
}

export async function getChipsBlockAndFeePoolRewards() {
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

export async function getChipsAddressBalance(address) {
    let result = {};
    let getAddressBalanceArray = [];
    let getAddressBalance = {};
    let verusAddress = "";
    if (address) {
        verusAddress = decodeURIComponent(address);
    } else {
        verusAddress = "none";//"RCdXBieidGuXmK8Tw2gBoXWxi16UgqyKc7";
    }

    // chips
    try {
        const getChipsAddressBalanceResponse = await fetch(process.env.VERUS_REST_API_CHIPS + "addressindex/getaddressbalance/" + verusAddress);
        const getChipsAddressBalanceResult = await getChipsAddressBalanceResponse.json();
        const getChipsAddressBalance = getChipsAddressBalanceResult.result;
        getAddressBalance = getChipsAddressBalanceResult.result;
    } catch (error) {
        console.log("no CHIPS api connected")
    }


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
            if ("iHog9UCTrn95qpUBFCZ7kKz7qWdMA8MQ6N" === item) {
                getAddressBalanceArray.push({ currencyName: "vDEX", amount: getAddressBalance.currencybalance.iHog9UCTrn95qpUBFCZ7kKz7qWdMA8MQ6N })
            }
            if ("i3nokiCTVevZMLpR3VmZ7YDfCqA5juUqqH" === item) {
                getAddressBalanceArray.push({ currencyName: "Bridge.CHIPS", amount: getAddressBalance.currencybalance.i3nokiCTVevZMLpR3VmZ7YDfCqA5juUqqH })
            }
            if ("iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP" === item) {
                getAddressBalanceArray.push({ currencyName: "CHIPS", amount: getAddressBalance.currencybalance.iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP })
            }
        })
    }
    result.verusAddress = verusAddress;
    result.getAddressBalanceArray = getAddressBalanceArray;
    return result;
}

export async function getChipsPriceList(chipsPrice) {
    let result = {}
    let priceList = [];

    priceList.push({ label: "Addr <-> Addr", nativePrice: "CHIPS 0.0001", price: "$ " + Number.parseFloat(Math.round(chipsPrice * 0.0001)).toFixed(2) })
    priceList.push({ label: "Basket <-> Reserve", nativePrice: "", price: "0.025%" })
    priceList.push({ label: "Reserve <-> Reserve", nativePrice: "", price: "0.050%" })
    priceList.push({ label: "Storage (1k)", nativePrice: "CHIPS 0.01", price: "$ " + Math.round(chipsPrice * 0.01 * 100) / 100 })
    priceList.push({ label: "ID", nativePrice: "CHIPS 77.7", price: "$ " + Math.round(chipsPrice * 77.7) })
    priceList.push({ label: "SubID *", nativePrice: "CHIPS >0.01", price: "$ >" + Math.round(chipsPrice * 0.01 * 100) / 100 })
    priceList.push({ label: "Currency", nativePrice: "CHIPS 77.7", price: "$ " + Math.round(chipsPrice * 77.7) })
    // priceList.push({ label: "PBaaS", nativePrice: "CHIPS 7777", price:  "$ " +Math.round(chipsPrice * 7777).toLocaleString() })

    result.priceList = priceList;
    result.note = "* SubId needs a ID and a currency";
    return result;
}

export async function calculateChipsStakingRewards(stakingsupply, stakingAmountUnencoded, vrscPrice) {
    let result = {};
    let stakingArray = [];
    let stakingAmount = 100;
    if (stakingAmountUnencoded) {
        stakingAmount = decodeURIComponent(stakingAmountUnencoded);
    }

    result.stakingAmount = stakingAmount;
    let apy = 720* 6 * 0.03968 * 365 / stakingsupply;
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
export async function calculateChipsMiningRewards(networkHashPerSecond, chipsMiningHashUnencoded, chipsPrice) {
    let result = {};
    let miningArray = [];
    let chipsMiningHash = 1;
    if (chipsMiningHashUnencoded) {
        chipsMiningHash = decodeURIComponent(chipsMiningHashUnencoded);
    }

    result.chipsMiningHash = chipsMiningHash;
    let apy = 720 * 6 * 0.03968 * 365 / networkHashPerSecond * 1000000;

    let miningRewardsDaily = {
        label: "Daily",
        rewards: Math.round(apy * chipsMiningHash / 365 * 10000) / 10000,
        dollars: Math.round(apy * chipsMiningHash / 365 * chipsPrice * 100) / 100
    }
    let miningRewardsMonthly = {
        label: "Monthly",
        rewards: Math.round(apy * chipsMiningHash / 12 * 10000) / 10000,
        dollars: Math.round(apy * chipsMiningHash / 12 * chipsPrice * 100) / 100
    }
    let miningRewardsYearly = {
        label: "Yearly",
        rewards: Math.round(apy * chipsMiningHash * 10000) / 10000,
        dollars: Math.round(apy * chipsMiningHash * chipsPrice * 100) / 100
    }

    miningArray.push(miningRewardsDaily);
    miningArray.push(miningRewardsMonthly);
    miningArray.push(miningRewardsYearly);
    result.miningArray = miningArray;

    return result;
}
export async function getChipsCurrencyVolume(currencyName, fromBlock, toBlock, interval, converttocurrency) {
    let result = {};
    let totalVolume = 0;
    let volumeArray = [];
    let yAxisArray = [];

    const currencyState = await getCurrencyState(currencyName, fromBlock, toBlock, interval, converttocurrency);

    currencyState.map((item) => {
        if (item.conversiondata) {
            let volume = Math.round(item.conversiondata.volumethisinterval);
            volumeArray.push({ volume: volume });
        }
        if (item.totalvolume) {
            totalVolume = Math.round(item.totalvolume).toLocaleString();
        }
    })

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

export async function getChipsCurrencyReserve(currencyName, priceArray, vrscBridgePrice, estimatedBridgeValueUSD) {
    if (currencyName === "bridge.chips") {
        return currencyReserveChipsBridge(priceArray, vrscBridgePrice, estimatedBridgeValueUSD);
    }
}