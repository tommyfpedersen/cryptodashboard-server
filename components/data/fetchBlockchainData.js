
import { getCoingeckoPrice } from '../coingecko/coingecko.js';
import client from '../../redisClient.js';
import { getBasketsInfo, getCurrencyGroupList, getTotalBasketsVolume } from '../verus/currencies/currenciesUtils.js';
import { getAllPbaas, getAllPbaasStatus } from '../verus/pbaas/pbaas.js';
import { getAPYArray, getBlockHeightArray, getBlockRewardArray, getBlocktimeArray, getCurrencyPriceListArray, getDailyEarningsPerGHArray, getFeePoolRewardArray, getIDPriceListArray, getMarketCapArray, getMaxSupplyArray, getNetworkHashrateArray } from '../verus/pbaas/pbaasUtils.js';
import { getAllCurrenciesFromBaskets } from '../verus/currencies/currencies.js';

export async function getBlockchainData() {

    /* Clear fetch status */
    client.set("fetchingerror", JSON.stringify(false));

    /* RenderData def*/
    let mainRenderData = {};

    /* Get price from coingecko */
    let coingeckoPriceArray = await getCoingeckoPrice();

    
    /* Get currencies, baskets and volume*/
    let allCurrenciesFromBaskets = await getAllCurrenciesFromBaskets(coingeckoPriceArray);
    let currencyGroupList = getCurrencyGroupList(allCurrenciesFromBaskets);
    let totalBasketsVolume = getTotalBasketsVolume(allCurrenciesFromBaskets)
    let basketsInfo = getBasketsInfo(allCurrenciesFromBaskets)

    /* Get pbaas and earnings */
    let pbaasList = await getAllPbaas(allCurrenciesFromBaskets);
    let marketCapArray = getMarketCapArray(pbaasList);
    let maxSupplyArray = getMaxSupplyArray(pbaasList);
    let idPriceListArray = getIDPriceListArray(pbaasList)
    let currencyPriceListArray = getCurrencyPriceListArray(pbaasList)
    let networkHashrateArray = getNetworkHashrateArray(pbaasList);
    let blockheightArray = getBlockHeightArray(pbaasList);
    let blocktimeArray = getBlocktimeArray(pbaasList);
    let apyArray = getAPYArray(pbaasList);
    let dailyEarningsPerGHArray = getDailyEarningsPerGHArray(pbaasList)
    let feePoolRewardArray = getFeePoolRewardArray(pbaasList)
    let blockRewardArray = getBlockRewardArray(pbaasList)

    mainRenderData = {
        allCurrenciesFromBaskets,
        currencyGroupList,
        totalBasketsVolume,
        basketsInfo,
        pbaasList,
        marketCapArray,
        maxSupplyArray,
        idPriceListArray,
        currencyPriceListArray,
        networkHashrateArray,
        apyArray,
        dailyEarningsPerGHArray,
        feePoolRewardArray,
        blockRewardArray,
        blockheightArray,
        blocktimeArray
    };

    return mainRenderData;
}
