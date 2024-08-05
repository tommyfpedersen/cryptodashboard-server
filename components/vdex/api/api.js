require('dotenv').config();
async function getMiningInfo() {
    try {
        const getmininginfoResponse = await fetch(process.env.VERUS_REST_API_VDEX + "mining/getmininginfo");
        const getmininginfoResult = await getmininginfoResponse.json();
        const getmininginfo = getmininginfoResult.result;
        return getmininginfo;
    } catch (error) {
        return null;
    }
}

async function getCoinSupply(block) {
    try {
        const getcoinsupplyResponse = await fetch(process.env.VERUS_REST_API_VDEX+ "blockchain/coinsupply/" + block);
        const getcoinsupplyResult = await getcoinsupplyResponse.json();
        const getcoinsupply = getcoinsupplyResult.result;
        return getcoinsupply;
    } catch (error) {
        return null;
    }
}

async function getBlockSubsidy(block) {
    try {
        const getblocksubsidyResponse = await fetch(process.env.VERUS_REST_API_VDEX + "mining/getblocksubsidy/" + block);
        const getblocksubsidyResult = await getblocksubsidyResponse.json();
        const getblocksubsidy = getblocksubsidyResult.result;
        return getblocksubsidy;
    } catch (error) {
        return null;
    }
}

async function getBlock(block) {
    try {
        const getblockResponse = await fetch(process.env.VERUS_REST_API_VDEX + "blockchain/getblock/" + block);
        const getblockResult = await getblockResponse.json();
        const getblock = getblockResult.result;
        return getblock;
    } catch (error) {
        return null;
    }
}

async function getPeerInfo() {
    try {
        const getpeerinfoResponse = await fetch(process.env.VERUS_REST_API_VDEX + "network/getpeerinfo/");
        const getpeerinfoResult = await getpeerinfoResponse.json();
        const getpeerinfo = getpeerinfoResult.result;
        return getpeerinfo;
    } catch (error) {
        return null;
    }
}
async function getCurrencyState(chainname, blockstart, blockend, blockintervals, converttocurrency) {

    try {
        const getcurrencystateResponse = await fetch(process.env.VERUS_REST_API_VDEX+ "multichain/getcurrencystate/"+chainname+"/"+blockstart+"/"+blockend+"/"+blockintervals+"/"+converttocurrency+"/");
        const getcurrencystateResult = await getcurrencystateResponse.json();
        const getcurrencystate = getcurrencystateResult.result;
        return getcurrencystate;
    } catch (error) {
        return null;
    }
}



module.exports = { getMiningInfo, getCoinSupply, getBlockSubsidy, getBlock, getPeerInfo, getCurrencyState }