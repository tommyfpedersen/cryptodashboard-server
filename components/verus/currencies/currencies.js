
import dotenv from 'dotenv';
dotenv.config();

import { getCurrenciesConfig } from './currenciesConfig.js';
import { getMiningInfo, getCurrencyState } from "../api/api.js";
import { getPbaasConfig } from '../pbaas/pbaasConfig.js';




export async function getAllCurrenciesFromBaskets(coingeckoPriceArray) {
    const currenciesConfig = getCurrenciesConfig();

    const vrscBasePrice = await getNativeCurrencyBasePrice(coingeckoPriceArray, "Bridge.vETH", 0);

    // calculate native currency price for each blockchain
    const nativeCurrencyArray = [
        {
            currencyName: "vrsc",
            nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
            price: await getNativeCurrencyBasePrice(coingeckoPriceArray, "Bridge.vETH", 0)
        },
        {
            currencyName: "varrr",
            nativeCurrencyId: "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2",
            price: await getNativeCurrencyBasePrice(coingeckoPriceArray, "Bridge.vARRR", vrscBasePrice)
        },
        {
            currencyName: "vdex",
            nativeCurrencyId: "iHog9UCTrn95qpUBFCZ7kKz7qWdMA8MQ6N",
            price: await getNativeCurrencyBasePrice(coingeckoPriceArray, "Bridge.vDEX", vrscBasePrice)
        },
        {
            currencyName: "chips",
            nativeCurrencyId: "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP",
            price: await getNativeCurrencyBasePrice(coingeckoPriceArray, "Bridge.CHIPS", vrscBasePrice)
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

                // console.log("item.price", item.price)
            }
        })

        /* Get latest block */
        const miningInfo = await getMiningInfo(currenciesConfig[i].rpcBaseUrl);
        const currentBlock = miningInfo.blocks;

        currencyReserve = await getCurrencyReserves(currenciesConfig[i], coingeckoPriceArray, nativeCurrencyBasePrice, vrscBasePrice);
        currencyVolume24Hours = await getCurrencyVolume(currenciesConfig[i], currentBlock - 1440, currentBlock, 60, nativeCurrencyBasePrice);
        currencyVolume7Days = await getCurrencyVolume(currenciesConfig[i], currentBlock - 1440 * 7, currentBlock, 1440, nativeCurrencyBasePrice);
        currencyVolume30Days = await getCurrencyVolume(currenciesConfig[i], currentBlock - 1440 * 30, currentBlock, 1440, nativeCurrencyBasePrice);

        currency.blockchain = currenciesConfig[i].blockchain;
        currency.name = currenciesConfig[i].currencyName;
        currency.type = "Basket"
        currency.currencyReserve = currencyReserve;
        currency.currencyVolume24Hours = currencyVolume24Hours;
        currency.currencyVolume7Days = currencyVolume7Days;
        currency.currencyVolume30Days = currencyVolume30Days;
        currencyArray.push(currency);
    }

    return currencyArray;
}

export async function getNativeCurrencyBasePrice(coingeckoPriceArray, baseCurrencyName, vrscBasePrice) {
    const currenciesConfig = getCurrenciesConfig();
    let currencyConfig = currenciesConfig.find(item => item.currencyName === baseCurrencyName);
    let nativeCurrencyBasketPrice = 0;

    if (currencyConfig) {
        let currencyReserves = await getCurrencyReserves(currencyConfig, coingeckoPriceArray, "5", vrscBasePrice);
        nativeCurrencyBasketPrice = currencyReserves.nativeCurrencyBasketPrice;
    }

    return nativeCurrencyBasketPrice;
}

export async function getCurrencyReserves(currencyConfig, coingeckoPriceArray, nativeCurrencyBasePrice, vrscBasePrice) {

    let blockchain = currencyConfig.blockchain;
    let nativeCurrencyId = currencyConfig.nativeCurrencyId;
    let currencyName = currencyConfig.currencyName;
    let currencyId = "";
    let anchorCurrencyId = currencyConfig.anchorCurrencyId;
    let anchorCurrencyName = currencyConfig.anchorCurrencyName;
    let anchorPriceDominance = currencyConfig.anchorPriceDominance;
    let secondaryAnchorCurrencyId = currencyConfig.secondaryAnchorCurrencyId;
    let secondaryAnchorCurrencyName = currencyConfig.secondaryAnchorCurrencyName;
    let secondaryPriceDominance = currencyConfig.secondaryPriceDominance;
    let rpcBaseUrl = currencyConfig.rpcBaseUrl;
    let currencyStartBlock = 0;
    let currencyInPreconversion = false;
    let currencyIcon = currencyConfig.currencyIcon;
    let currencyScale = currencyConfig.currencyScale || [];
    let currencyNote = currencyConfig.note === undefined ? "" : currencyConfig.note;

    //console.log(currencyName, currencyScale)

    let result = {};

    const miningInfo = await getMiningInfo(rpcBaseUrl);
    // console.log(miningInfoResponse)
    // const miningInfoResult = await miningInfoResponse.json();
    // const miningInfo = miningInfoResult.result;

    const getcurrencyResponse = await fetch(rpcBaseUrl + "multichain/getcurrency/" + currencyName);
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let basketCurrencyArray = [];


    let nativeCurrencyReserve = 0;
    let nativeCurrencyWeight = 0;
    let nativeCurrencyBasketPrice = 0;

    let anchorReserve = 0;
    let anchorWeight = 0;
    let secondaryAnchorReserve = 0;
    let secondaryAnchorWeight = 0;

    let anchorCurrencyFromCoingeckoPriceArray = coingeckoPriceArray.find(item => item.currencyId === anchorCurrencyId)?.price || 0;
    let secondaryAnchorCurrencyFromCoingeckoPriceArray = coingeckoPriceArray.find(item => item.currencyId === secondaryAnchorCurrencyId)?.price || 0;

    let currencySupply = getcurrency.bestcurrencystate.supply;

    if (miningInfo && getcurrency) {
        currencyStartBlock = getcurrency.startblock;
        currencyInPreconversion = getcurrency.startblock < miningInfo.blocks ? false : true;

        ///    console.log(currencyInPreconversion, currencyStartBlock, miningInfo.blocks, rpcBaseUrl)

        let currencyIdArray = Object.values(getcurrency.currencies);
        let currencyNames = Object.entries(getcurrency.currencynames);
        currencyId = getcurrency.currencyid;


        //estimate preconversion date
        //  const currencyInfo = await getCurrency(pbaasConfig[i].rpcBaseUrl, pbaasConfig[i].name)
        // estimatedCurrencyLaunchDate = getcurrency.startblock > miningInfo.blocks ? ( getcurrency.startblock-miningInfo.blocks * getPbaasConfig().filter((elm)=>elm.name === blockchain)[0]?. ) : '';


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
                        if (reservesCurrency.currencyid === secondaryAnchorCurrencyId) {
                            secondaryAnchorReserve = reservesCurrency.reserves;
                            secondaryAnchorWeight = reservesCurrency.weight;
                        }
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
                            currency.price = Math.round((anchorReserve * 1 / anchorWeight / 100) / (currency.reserves * 1 / currency.weight) * 100000000) / 100000000;
                            currency.pricePrefix = anchorCurrencyName;
                            currency.priceNativeCurrency = Math.round((nativeCurrencyReserve * 1 / currency.weight) / (currency.reserves * 1 / currency.weight) * 100000000) / 100000000;
                            currency.priceUSD = Math.round(currency.price * 10000) / 10000;

                            if (anchorPriceDominance === "coingecko") {
                                currency.priceUSD = Math.round(currency.price * anchorCurrencyFromCoingeckoPriceArray * 100000) / 100000;
                            }

                            if (currencyId === anchorCurrencyId) {
                                currency.price = Math.round((secondaryAnchorReserve * 1 / secondaryAnchorWeight) / (anchorReserve * 1 / anchorWeight) * 100000000) / 100000000;
                                currency.pricePrefix = anchorCurrencyName;

                                if (secondaryAnchorCurrencyId === nativeCurrencyId && secondaryPriceDominance === "native") {
                                    currency.price = currency.price * nativeCurrencyBasePrice;
                                }

                                if (anchorCurrencyId === nativeCurrencyId && secondaryPriceDominance === "native") {

                                    currency.price = nativeCurrencyBasePrice;
                                }
                                currency.priceUSD = Math.round(currency.price * 10000) / 10000;

                                if (secondaryPriceDominance === "coingecko") {
                                    currency.price = secondaryAnchorCurrencyFromCoingeckoPriceArray * currency.price;
                                    currency.priceUSD = currency.price;

                                    if (currencyScale.length > 0) {
                                        currencyScale.forEach((item) => {
                                            if (item.currencyId === secondaryAnchorCurrencyId) {
                                                currency.priceUSD = Math.round(currency.priceUSD * item.scale * 10000) / 10000;

                                            }
                                        })
                                    }
                                }
                            }

                            if (currencyId === secondaryAnchorCurrencyId) {
                                currency.price = Math.round((anchorReserve * 1 / anchorWeight / 100) / (currency.reserves * 1 / currency.weight) * 100000000) / 100000000;
                                currency.pricePrefix = secondaryAnchorCurrencyName;

                                if (anchorPriceDominance === "coingecko") {
                                    currency.price = anchorCurrencyFromCoingeckoPriceArray * currency.price;
                                }

                                if (anchorCurrencyId === nativeCurrencyId) {
                                    currency.price = currency.price * nativeCurrencyBasePrice;
                                }

                                currency.priceUSD = Math.round(currency.price * 10000) / 10000;
                            }


                            if (reservesCurrency.currencyid === nativeCurrencyId) {
                                nativeCurrencyBasketPrice = Math.round((anchorReserve * 1 / anchorWeight) / (nativeCurrencyReserve * 1 / nativeCurrencyWeight) * 100000000) / 100000000;

                                if (anchorPriceDominance === "coingecko") {
                                    nativeCurrencyBasketPrice = nativeCurrencyBasketPrice * anchorCurrencyFromCoingeckoPriceArray;

                                }

                                if (anchorPriceDominance === "native" && secondaryPriceDominance === "native" && nativeCurrencyId !== "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV" && anchorCurrencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                    nativeCurrencyBasketPrice = nativeCurrencyBasketPrice * vrscBasePrice;
                                    currency.price = nativeCurrencyBasketPrice;
                                    currency.priceUSD = Math.round(currency.price * 10000) / 10000;
                                }
                            }

                            currency.reservePriceUSD = currency.priceUSD * currency.reserves;
                            currency.weight = Math.round(reservesCurrency.weight * 100);
                        }


                        if (coingeckoPriceArray.length > 0) {
                            coingeckoPriceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    currency.coingeckoprice = Math.round(price.price * 10000) / 10000;
                                }
                            })
                        }
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
    result.basketValueAnchorCurrencyUSD = anchorReserve * (1 / anchorWeight) * anchorCurrencyFromCoingeckoPriceArray;

    if (anchorCurrencyId === nativeCurrencyId && anchorPriceDominance === "native") {
        result.basketValueAnchorCurrencyUSD = anchorReserve * (1 / anchorWeight) * nativeCurrencyBasePrice;
    }

    if (anchorPriceDominance === "native" && secondaryPriceDominance === "native" && nativeCurrencyId !== "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV" && anchorCurrencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
        result.basketValueAnchorCurrencyUSD = (nativeCurrencyReserve * (1 / nativeCurrencyWeight) * nativeCurrencyBasePrice);
    }

    result.anchorCurrencyName = anchorCurrencyName;
    result.currencyName = currencyName;
    result.currencyId = currencyId;
    result.currencySupply = currencySupply;
    result.currencyPriceUSD = (nativeCurrencyReserve * (1 / nativeCurrencyWeight) * nativeCurrencyBasePrice) / currencySupply;
    result.currencyPriceNative = (nativeCurrencyReserve * (1 / nativeCurrencyWeight) * nativeCurrencyBasePrice) / currencySupply / nativeCurrencyBasePrice;
    result.currencyStartBlock = currencyStartBlock;
    result.currencyInPreconversion = currencyInPreconversion;
    result.currencyIcon = currencyIcon;
    result.currencyNote = currencyNote;

    return result;
}

export async function getCurrencyVolume(currencyConfig, fromBlock, toBlock, interval, nativeCurrencyBasePrice) {
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
    result.totalVolumeUSD = totalVolume * nativeCurrencyBasePrice;
    result.volumeCurrency = converttocurrency;
    result.volumeArray = volumeArray;

    return result;
}