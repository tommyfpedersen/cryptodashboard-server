import dotenv from 'dotenv';
dotenv.config();

import { getMiningInfo, getPeerInfo, getBlock, getBlockSubsidy, getCurrencyState } from "./api/api.js";
import { currencyReserveVarrrBridge }  from "./varrrbridge/varrrbridge.js";
import { convertToAxisString }  from'../../utils/stringUtil.js';

export async function getVarrrNodeStatus() {
    let result = {};
    const mininginfo = await getMiningInfo();
    result.online = false;
    result.statusMessage = "Updating and syncing vARRR PBaaS...";
    if (mininginfo) {
        result.online = true;
        result.statusMessage = "vARRR PBaaS Running";
    }
    return result;
}

export async function getVarrrBlockAndFeePoolRewards() {
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

export async function getVarrrPriceList(varrrPrice) {
    let result = {}
    let priceList = [];

    priceList.push({ label: "Addr <-> Addr", nativePrice: "vARRR 0.0001", price: "$ " +Number.parseFloat(Math.round(varrrPrice * 0.0001)).toFixed(2) })
    priceList.push({ label: "Basket <-> Reserve", nativePrice: "", price: "0.025%" })
    priceList.push({ label: "Reserve <-> Reserve", nativePrice: "", price: "0.050%" })
    priceList.push({ label: "Storage (1k)", nativePrice: "vARRR 0.01", price: "$ " + Math.round(varrrPrice * 0.01*100)/100 })
    priceList.push({ label: "ID no ref", nativePrice: "vARRR 100", price:  "$ " +Math.round(varrrPrice * 100) })
    priceList.push({ label: "ID 1.ref, not yours", nativePrice: "vARRR 80", price:  "$ " +Math.round(varrrPrice * 80) })
    priceList.push({ label: "ID 1.ref, yours", nativePrice: "vARRR 60", price:  "$ " +Math.round(varrrPrice * 60) })
    priceList.push({ label: "ID 2.ref, all yours", nativePrice: "vARRR 40", price:  "$ " +Math.round(varrrPrice * 40) })
    priceList.push({ label: "ID 3.ref, all yours", nativePrice: "vARRR 20", price:  "$ " +Math.round(varrrPrice * 20) })
    priceList.push({ label: "SubID *", nativePrice: "vARRR >0.01", price:  "$ >" +Math.round(varrrPrice * 0.01 * 100) / 100 })
    priceList.push({ label: "Currency", nativePrice: "vARRR 200", price:  "$ " +Math.round(varrrPrice * 200) })
  
    result.priceList = priceList;
    result.note = "* SubId needs a ID and a currency";
    return result;
}

export async function getVarrrAddressBalance(address) {
    let result = {};
    let getAddressBalanceArray = [];
    let getAddressBalance = {};
    let verusAddress = "";
    if (address) {
        verusAddress = decodeURIComponent(address);
    } else {
        verusAddress = "none";//"RCdXBieidGuXmK8Tw2gBoXWxi16UgqyKc7";
    }

    // varrr
    try {
        const getVarrrAddressBalanceResponse = await fetch(process.env.VERUS_REST_API_VARRR + "addressindex/getaddressbalance/" + verusAddress);
        const getVarrrAddressBalanceResult = await getVarrrAddressBalanceResponse.json();
        const getVarrrAddressBalance = getVarrrAddressBalanceResult.result;
        getAddressBalance = getVarrrAddressBalanceResult.result;
    } catch (error) {
        console.log("no varrr api connected")
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
        })
    }
    result.verusAddress = verusAddress;
    result.getAddressBalanceArray = getAddressBalanceArray;
    return result;
}

export async function calculateVarrrStakingRewards(stakingsupply, stakingAmountUnencoded, vrscPrice) {
    let result = {};
    let stakingArray = [];
    let  stakingAmount = 100;
    if (stakingAmountUnencoded) {
        stakingAmount = decodeURIComponent(stakingAmountUnencoded);
    } 
    result.stakingAmount = stakingAmount;
    let apy = 720 * 0.08 * 365 / stakingsupply;
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
export async function calculateVarrrMiningRewards(networkHashPerSecond, varrrMiningHashUnencoded, varrrPrice) {
    let result = {};
    let miningArray = [];
    let varrrMiningHash = 1;
    if (varrrMiningHashUnencoded) {
        varrrMiningHash = decodeURIComponent(varrrMiningHashUnencoded);
    }

    result.varrrMiningHash = varrrMiningHash;
    let apy = 720 * 0.08 * 365 / networkHashPerSecond * 1000000;
    
    let miningRewardsDaily = {
        label: "Daily",
        rewards: Math.round(apy * varrrMiningHash / 365*10000)/10000,
        dollars: Math.round(apy * varrrMiningHash / 365 * varrrPrice *100)/100
    }
    let miningRewardsMonthly = {
        label: "Monthly",
        rewards: Math.round(apy * varrrMiningHash / 12*10000)/10000,
        dollars: Math.round(apy * varrrMiningHash / 12 * varrrPrice *100)/100
    }
    let miningRewardsYearly = {
        label: "Yearly",
        rewards: Math.round(apy * varrrMiningHash *10000)/10000,
        dollars: Math.round(apy * varrrMiningHash * varrrPrice *100)/100
    }
    
    miningArray.push(miningRewardsDaily);
    miningArray.push(miningRewardsMonthly);
    miningArray.push(miningRewardsYearly);
    result.miningArray = miningArray;

    return result;
}
export async function getVarrrCurrencyVolume(currencyName, fromBlock, toBlock, interval, converttocurrency) {
    let result = {};
    let totalVolume = 0;
    let volumeArray = [];
    let yAxisArray = [];

    const currencyState = await getCurrencyState(currencyName, fromBlock, toBlock, interval, converttocurrency);
    
    currencyState.map((item)=>{
        if(item.conversiondata){
            let volume = Math.round(item.conversiondata.volumethisinterval);
            volumeArray.push({volume:volume});
        }
        if(item.totalvolume){
            totalVolume =  Math.round(item.totalvolume).toLocaleString();
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

export async function getVarrrCurrencyReserve(currencyName, priceArray, vrscBridgePrice, estimatedBridgeValueUSD) {
    if (currencyName === "bridge.varrr") {
        return currencyReserveVarrrBridge(priceArray, vrscBridgePrice, estimatedBridgeValueUSD);
    }
}