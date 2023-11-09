async function getMiningInfo(){
    const getmininginfoResponse = await fetch("http://localhost:9009/mining/getmininginfo")
    const getmininginfoResult = await getmininginfoResponse.json();
    const getmininginfo = getmininginfoResult.result;
    return getmininginfo;
}

async function getBlockSubsidy(block){
    const getblocksubsidyResponse = await fetch("http://localhost:9009/mining/getblocksubsidy/" + block);
    const getblocksubsidyResult = await getblocksubsidyResponse.json();
    const getblocksubsidy = getblocksubsidyResult.result;
    return getblocksubsidy;
}

async function getBlock(block){
    const getblockResponse = await fetch("http://localhost:9009/blockchain/getblock/" + block);
    const getblockResult = await getblockResponse.json();
    const getblock = getblockResult.result;
    return getblock;
}

async function getPeerInfo(){
    const getpeerinfoResponse = await fetch("http://localhost:9009/network/getpeerinfo/");
    const getpeerinfoResult = await getpeerinfoResponse.json();
    const getpeerinfo = getpeerinfoResult.result;
    return getpeerinfo;
}

module.exports = {getMiningInfo, getBlockSubsidy, getBlock, getPeerInfo};