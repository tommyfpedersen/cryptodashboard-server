
import dotenv from 'dotenv';
dotenv.config();

import { getCurrenciesConfig } from './currenciesConfig.js';
import { getMiningInfo, getCurrencyState } from "../api/api.js";




export async function getAllCurrenciesFromBaskets(priceArray) {
    const currenciesConfig = getCurrenciesConfig();

    // calculate native currency price for each blockchain
    const nativeCurrencyArray = [
        {
            currencyName: "vrsc",
            nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
            price: await getNativeCurrencyBasePrice(priceArray, "bridge.veth")
        },
        {
            currencyName: "varrr",
            nativeCurrencyId: "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2",
            price: await getNativeCurrencyBasePrice(priceArray, "bridge.varrr")
        },
        {
            currencyName: "vdex",
            nativeCurrencyId: "iHog9UCTrn95qpUBFCZ7kKz7qWdMA8MQ6N",
            price: await getNativeCurrencyBasePrice(priceArray, "bridge.vdex")
        },
        {
            currencyName: "chips",
            nativeCurrencyId: "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP",
            price: await getNativeCurrencyBasePrice(priceArray, "bridge.chips")
        },

    ];

    let currencyArray = [];
    let currencyReserve = {};
    let currencyVolume24Hours = {};
    let currencyVolume7Days = {};
    let currencyVolume30Days = {};

    for (let i = 0; i < currenciesConfig.length; i++) {
        let currency = {};
        let nativeCurrencyBasePrice = 0;
        nativeCurrencyArray.map((item) => {
            if (item.nativeCurrencyId === currenciesConfig[i].nativeCurrencyId) {
                nativeCurrencyBasePrice = item.price;
            }
        })

        /* Get latest block */
        const miningInfo = await getMiningInfo(currenciesConfig[i].rpcBaseUrl);
        const currentBlock = miningInfo.blocks;

        currencyReserve = await getCurrencyReserves(currenciesConfig[i], priceArray, nativeCurrencyBasePrice);
        currencyVolume24Hours = await getCurrencyVolume(currenciesConfig[i], currentBlock - 1440, currentBlock, 60);
        currencyVolume7Days = await getCurrencyVolume(currenciesConfig[i], currentBlock - 1440 *7, currentBlock, 1440);
        currencyVolume30Days = await getCurrencyVolume(currenciesConfig[i], currentBlock - 1440*30, currentBlock, 1440);

        currency.blockchain = currenciesConfig[i].blockchain;
        currency.name = currenciesConfig[i].currencyName;
        currency.currencyReserve = currencyReserve;
        currency.currencyVolume24Hours = currencyVolume24Hours;
        currency.currencyVolume7Days = currencyVolume7Days;
        currency.currencyVolume30Days = currencyVolume30Days;
        currencyArray.push(currency);
    }

  //  console.log("currencyArray", currencyArray);
    return currencyArray;
}

export async function getNativeCurrencyBasePrice(priceArray, baseCurrencyName) {
    const currenciesConfig = getCurrenciesConfig();
    let currencyConfig = currenciesConfig.find(item => item.currencyName === baseCurrencyName);
    // console.log("currencyConfig", currencyConfig)
    let nativeCurrencyBasketPrice = 0;
    if (currencyConfig) {
        let currencyReserves = await getCurrencyReserves(currencyConfig, priceArray, "5");
        nativeCurrencyBasketPrice = currencyReserves.nativeCurrencyBasketPrice;
    }

    return nativeCurrencyBasketPrice;
}

export async function getCurrencyReserves(currencyConfig, priceArray, nativeCurrencyBasePrice) {
  //  console.log("conf", currencyConfig)

    let blockchain = currencyConfig.blockchain;
    let nativeCurrencyId = currencyConfig.nativeCurrencyId;
    let currencyName = currencyConfig.currencyName;
    let anchorCurrencyId = currencyConfig.anchorCurrencyId;
    let anchorCurrencyName = currencyConfig.anchorCurrencyName;
    let rpcBaseUrl = currencyConfig.rpcBaseUrl;
    let currencyIcon = currencyConfig.currencyIcon;
    let currencyNote = currencyConfig.note === undefined ? "": currencyConfig.note;
    
    //let currencyScaleArray = currencyConfig.currencyScale === undefined ? [] : currencyConfig.currencyScale;

    let result = {};

    const getcurrencyResponse = await fetch(rpcBaseUrl + "multichain/getcurrency/" + currencyName);
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let basketCurrencyArray = [];

    let nativeCurrencyReserve = 0;
    let nativeCurrencyWeight = 0;
    let nativeCurrencyBasketPrice = 0;

    let anchorReserve = 0;
    let anchorWeight = 0;

    let anchorCurrencyFromPriceArray = priceArray.find(item => item.currencyId === anchorCurrencyId)?.price || 0;
    let currencySupply = getcurrency.bestcurrencystate.supply;

    if (getcurrency) {
        let currencyIdArray = Object.values(getcurrency.currencies);
        let currencyNames = Object.entries(getcurrency.currencynames);

        /* find anchor value*/
        currencyIdArray.forEach((currencyId) => {
            currencyNames.forEach((item) => {

                if (item[0] === currencyId) {
                    getcurrency.bestcurrencystate.reservecurrencies.forEach((reservesCurrency) => {
                        if (reservesCurrency.currencyid === nativeCurrencyId) {
                            nativeCurrencyReserve = reservesCurrency.reserves;
                            nativeCurrencyWeight = reservesCurrency.weight;
                        }
                        if (reservesCurrency.currencyid === anchorCurrencyId) {
                            anchorReserve = reservesCurrency.reserves;
                            anchorWeight = reservesCurrency.weight;
                        }
                        // if (currencyId === anchorCurrencyId) {
                        //    anchorCurrencyName = item[1];
                        // }
                    })
                }
            })
        })

        currencyIdArray.forEach((currencyId) => {
            currencyNames.forEach((item) => {
                let currency = {}
                if (item[0] === currencyId) {
                    getcurrency.bestcurrencystate.reservecurrencies.forEach((reservesCurrency) => {
                        if (reservesCurrency.currencyid === currencyId) {
                            currency.reserves = reservesCurrency.reserves;
                            currency.weight = reservesCurrency.weight * 100;
                            currency.priceinreserve = reservesCurrency.priceinreserve;
                            currency.origin = currencyName;
                            currency.network = blockchain;
                            currency.price = Math.round((anchorReserve * 1 / anchorWeight / 100) / (currency.reserves * 1 / currency.weight) * 1000000) / 1000000;
                            currency.pricePrefix = anchorCurrencyName;
                            currency.priceUSD = currency.price * anchorCurrencyFromPriceArray;
                            currency.priceNativeCurrency = Math.round((nativeCurrencyReserve * 1 / currency.weight) / (currency.reserves * 1 / currency.weight) * 1000000) / 1000000;
                        }

                        if (priceArray.length > 0) {
                            priceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                }
                            })
                        }

                        if (reservesCurrency.currencyid === nativeCurrencyId) {
                            nativeCurrencyBasketPrice = Math.round((anchorReserve * 1 / anchorWeight) / (nativeCurrencyReserve * 1 / nativeCurrencyWeight) * 1000000) / 1000000 * anchorCurrencyFromPriceArray;
                        }

                        // currencyScaleArray.forEach((element)=>{
                        //     if(currencyId === element.currencyId){
                        //         if(element.currencyId){
                        //             currency.price = currency.price * 1// element.scale;
                        //         }
                        //     }
                        // })
                    })
                    currency.currencyId = currencyId;
                    currency.currencyName = item[1];
                    basketCurrencyArray.push(currency);
                }
            })
        })
    }
    result.basketCurrencyArray = basketCurrencyArray;
    result.nativeCurrencyBasketPrice = nativeCurrencyBasketPrice;
    result.nativeCurrencyBasePrice = nativeCurrencyBasePrice;
    result.nativeCurrencyName = blockchain;
    result.basketReserveValueNativeCurrency = nativeCurrencyReserve * (1 / nativeCurrencyWeight);
    result.basketReserveValueNativeCurrencyUSD = nativeCurrencyReserve * (1 / nativeCurrencyWeight) * nativeCurrencyBasketPrice;
    result.basketValueAnchorCurrencyUSD = anchorReserve * (1 / anchorWeight) * anchorCurrencyFromPriceArray;
    result.anchorCurrencyName = anchorCurrencyName;
    result.currencyName = currencyName;
    result.currencySupply = currencySupply;
    result.currencyPriceUSD = (nativeCurrencyReserve * (1 / nativeCurrencyWeight) * nativeCurrencyBasketPrice) / currencySupply;
    result.currencyPriceNative = (nativeCurrencyReserve * (1 / nativeCurrencyWeight) * nativeCurrencyBasketPrice) / currencySupply / nativeCurrencyBasketPrice;
    result.currencyIcon = currencyIcon;
    result.currencyNote = currencyNote;

    return result;
}

export async function getCurrencyVolume(currencyConfig, fromBlock, toBlock, interval) {
    let result = {};
    let totalVolume = 0;
    let volumeArray = [];

    let rpcBaseUrl = currencyConfig.rpcBaseUrl;
    let currencyName = currencyConfig.currencyName;
    let converttocurrency = currencyConfig.blockchain;

    const currencyState = await getCurrencyState(rpcBaseUrl, currencyName, fromBlock, toBlock, interval, converttocurrency);

    if (currencyState.length > 0) {
        currencyState.map((item) => {

            if (item.conversiondata) {
                let volume = item.conversiondata.volumethisinterval;
                volumeArray.push({
                    height: item.height,
                    blocktime: item.blocktime,
                    volume: volume
                });
            }
            if (item.totalvolume) {
                totalVolume = item.totalvolume;
            }
        })
    }

    result.totalVolume = totalVolume;
    result.volumeCurrency = converttocurrency;
    result.volumeArray = volumeArray;

    return result;
}