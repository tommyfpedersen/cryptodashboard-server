import dotenv from 'dotenv';
dotenv.config();

export async function getMiningInfo(rpcBaseUrl) {
    try {
        const getmininginfoResponse = await fetch(rpcBaseUrl + "mining/getmininginfo")
        const getmininginfoResult = await getmininginfoResponse.json();
        const getmininginfo = getmininginfoResult.result;
        return getmininginfo;
    } catch (error) {
        // Handle the error here
        // console.log("Error fetching mining info:", error);
        return null;
    }
}

export async function getCoinSupply(rpcBaseUrl, block) {
    try {
        const getcoinsupplyResponse = await fetch(rpcBaseUrl+  "blockchain/coinsupply/" + block);
        const getcoinsupplyResult = await getcoinsupplyResponse.json();
        const getcoinsupply = getcoinsupplyResult.result;
        return getcoinsupply;
    } catch (error) {
        // Handle the error here
        // console.log("Error fetching mining info:", error);
        return null;
    }
}

export async function getBlockSubsidy(rpcBaseUrl, block) {
    try {
        const getblocksubsidyResponse = await fetch(rpcBaseUrl+ "mining/getblocksubsidy/" + block);
        const getblocksubsidyResult = await getblocksubsidyResponse.json();
        const getblocksubsidy = getblocksubsidyResult.result;
        return getblocksubsidy;
    } catch (error) {
        // Handle the error here
        // console.log("Error fetching mining info:", error);
        return null;
    }
}

export async function getBlock(rpcBaseUrl, block) {
    try {
        const getblockResponse = await fetch(rpcBaseUrl+ "blockchain/getblock/" + block);
        const getblockResult = await getblockResponse.json();
        const getblock = getblockResult.result;
        return getblock;
    } catch (error) {
        // Handle the error here
        // console.log("Error fetching mining info:", error);
        return null;
    }
}

export async function getPeerInfo(rpcBaseUrl) {
    try {
        const getpeerinfoResponse = await fetch(rpcBaseUrl+ "network/getpeerinfo/");
        const getpeerinfoResult = await getpeerinfoResponse.json();
        const getpeerinfo = getpeerinfoResult.result;
        return getpeerinfo;
    } catch (error) {
        // Handle the error here
        // console.log("Error fetching mining info:", error);
        return null;
    }
}
export async function getCurrencyState(rpcBaseUrl, currencyName, blockstart, blockend, blockintervals, converttocurrency) {

    try {
        const getcurrencystateResponse = await fetch(rpcBaseUrl+ "multichain/getcurrencystate/"+currencyName+"/"+blockstart+"/"+blockend+"/"+blockintervals+"/"+converttocurrency+"/");
        const getcurrencystateResult = await getcurrencystateResponse.json();
        const getcurrencystate = getcurrencystateResult.result;
        return getcurrencystate;
    } catch (error) {
        // Handle the error here
        // console.log("Error fetching mining info:", error);
        return null;
    }
}
export async function getCurrency(rpcBaseUrl, currencyName) {

    try {
        const getcurrencyResponse = await fetch(rpcBaseUrl+ "multichain/getcurrency/"+currencyName);
        const getcurrencyResult = await getcurrencyResponse.json();
        const getcurrency = getcurrencyResult.result;
        return getcurrency;
    } catch (error) {
        // Handle the error here
        // console.log("Error fetching mining info:", error);
        return null;
    }
}