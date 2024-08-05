async function getMiningInfo(baseUrlPath) {
    try {
        const getmininginfoResponse = await fetch(baseUrlPath+"/mining/getmininginfo")
        const getmininginfoResult = await getmininginfoResponse.json();
        const getmininginfo = getmininginfoResult.result;
        return getmininginfo;
    } catch (error) {
        return null;
    }
}

async function getBlockSubsidy(baseUrlPath, block) {
    try {
        const getblocksubsidyResponse = await fetch(baseUrlPath+"/mining/getblocksubsidy/" + block);
        const getblocksubsidyResult = await getblocksubsidyResponse.json();
        const getblocksubsidy = getblocksubsidyResult.result;
        return getblocksubsidy;
    } catch (error) {
        return null;
    }
}

async function getBlock(baseUrlPath, block) {
    try {
        const getblockResponse = await fetch(baseUrlPath+"/blockchain/getblock/" + block);
        const getblockResult = await getblockResponse.json();
        const getblock = getblockResult.result;
        return getblock;
    } catch (error) {
        return null;
    }
}

async function getPeerInfo(baseUrlPath) {
    try {
        const getpeerinfoResponse = await fetch(baseUrlPath+"/network/getpeerinfo/");
        const getpeerinfoResult = await getpeerinfoResponse.json();
        const getpeerinfo = getpeerinfoResult.result;
        return getpeerinfo;
    } catch (error) {
        return null;
    }
}

async function getCurrencyState(baseUrlPath, chainname, blockstart, blockend, blockintervals, converttocurrency) {

    try {
        const getcurrencystateResponse = await fetch(baseUrlPath+ "multichain/getcurrencystate/"+chainname+"/"+blockstart+"/"+blockend+"/"+blockintervals+"/"+converttocurrency+"/");
        const getcurrencystateResult = await getcurrencystateResponse.json();
        const getcurrencystate = getcurrencystateResult.result;
        return getcurrencystate;
    } catch (error) {
        return null;
    }
}

module.exports = { getMiningInfo, getBlockSubsidy, getBlock, getPeerInfo, getCurrencyState }