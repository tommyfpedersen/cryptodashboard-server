require('dotenv').config();
async function getMiningInfo() {
    try {
        const getmininginfoResponse = await fetch(process.env.VERUS_REST_API+ "mining/getmininginfo")
        const getmininginfoResult = await getmininginfoResponse.json();
        const getmininginfo = getmininginfoResult.result;
        return getmininginfo;
    } catch (error) {
        // Handle the error here
        // console.log("Error fetching mining info:", error);
        return null;
    }
}

async function getCoinSupply(block) {
    try {
        const getcoinsupplyResponse = await fetch(process.env.VERUS_REST_API+ "blockchain/coinsupply/" + block);
        const getcoinsupplyResult = await getcoinsupplyResponse.json();
        const getcoinsupply = getcoinsupplyResult.result;
        return getcoinsupply;
    } catch (error) {
        // Handle the error here
        // console.log("Error fetching mining info:", error);
        return null;
    }
}

async function getBlockSubsidy(block) {
    try {
        const getblocksubsidyResponse = await fetch(process.env.VERUS_REST_API+ "mining/getblocksubsidy/" + block);
        const getblocksubsidyResult = await getblocksubsidyResponse.json();
        const getblocksubsidy = getblocksubsidyResult.result;
        return getblocksubsidy;
    } catch (error) {
        // Handle the error here
        // console.log("Error fetching mining info:", error);
        return null;
    }
}

async function getBlock(block) {
    try {
        const getblockResponse = await fetch(process.env.VERUS_REST_API+ "blockchain/getblock/" + block);
        const getblockResult = await getblockResponse.json();
        const getblock = getblockResult.result;
        return getblock;
    } catch (error) {
        // Handle the error here
        // console.log("Error fetching mining info:", error);
        return null;
    }
}

async function getPeerInfo() {
    try {
        const getpeerinfoResponse = await fetch(process.env.VERUS_REST_API+ "network/getpeerinfo/");
        const getpeerinfoResult = await getpeerinfoResponse.json();
        const getpeerinfo = getpeerinfoResult.result;
        return getpeerinfo;
    } catch (error) {
        // Handle the error here
        // console.log("Error fetching mining info:", error);
        return null;
    }
}
async function getCurrencyState(chainname, blockstart, blockend, blockintervals, converttocurrency) {

    try {
        const getcurrencystateResponse = await fetch(process.env.VERUS_REST_API+ "multichain/getcurrencystate/"+chainname+"/"+blockstart+"/"+blockend+"/"+blockintervals+"/"+converttocurrency+"/");
        const getcurrencystateResult = await getcurrencystateResponse.json();
        const getcurrencystate = getcurrencystateResult.result;
        return getcurrencystate;
    } catch (error) {
        // Handle the error here
        // console.log("Error fetching mining info:", error);
        return null;
    }
}


module.exports = { getMiningInfo, getCoinSupply, getBlockSubsidy, getBlock, getPeerInfo, getCurrencyState }