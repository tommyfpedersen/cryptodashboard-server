async function getMiningInfo() {
    try {
        const getmininginfoResponse = await fetch("http://localhost:9009/mining/getmininginfo")
        const getmininginfoResult = await getmininginfoResponse.json();
        const getmininginfo = getmininginfoResult.result;
        return getmininginfo;
    } catch (error) {
        // Handle the error here
        // console.log("Error fetching mining info:", error);
        return null;
    }
}

async function getBlockSubsidy(block) {
    try {
        const getblocksubsidyResponse = await fetch("http://localhost:9009/mining/getblocksubsidy/" + block);
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
        const getblockResponse = await fetch("http://localhost:9009/blockchain/getblock/" + block);
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
        const getpeerinfoResponse = await fetch("http://localhost:9009/network/getpeerinfo/");
        const getpeerinfoResult = await getpeerinfoResponse.json();
        const getpeerinfo = getpeerinfoResult.result;
        return getpeerinfo;
    } catch (error) {
        // Handle the error here
        // console.log("Error fetching mining info:", error);
        return null;
    }
}


module.exports = { getMiningInfo, getBlockSubsidy, getBlock, getPeerInfo }