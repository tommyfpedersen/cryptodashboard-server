
import dotenv from 'dotenv';
dotenv.config();

import { getCurrenciesConfig } from './currenciesConfig.js';
import { getMiningInfo, getCurrencyState } from "../api/api.js";




export async function getAllCurrenciesFromBaskets(priceArray) {
    const currenciesConfig = getCurrenciesConfig();

    const vrscBasePrice = await getNativeCurrencyBasePrice(priceArray, "Bridge.vETH", 0);
    // const varrrBasePrice = await getNativeCurrencyBasePrice(priceArray, "Bridge.vARRR", vrscBasePrice);
    // const vdexBasePrice = await getNativeCurrencyBasePrice(priceArray, "Bridge.vDEX", vrscBasePrice);
    // const chipsBasePrice = await getNativeCurrencyBasePrice(priceArray, "Bridge.CHIPS", vrscBasePrice);
    // console.log("vrscBasePrice", vrscBasePrice)

    // calculate native currency price for each blockchain
    const nativeCurrencyArray = [
        {
            currencyName: "vrsc",
            nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
            price: await getNativeCurrencyBasePrice(priceArray, "Bridge.vETH", 0)
        },
        {
            currencyName: "varrr",
            nativeCurrencyId: "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2",
            price: await getNativeCurrencyBasePrice(priceArray, "Bridge.vARRR", vrscBasePrice)
        },
        {
            currencyName: "vdex",
            nativeCurrencyId: "iHog9UCTrn95qpUBFCZ7kKz7qWdMA8MQ6N",
            price: await getNativeCurrencyBasePrice(priceArray, "Bridge.vDEX", vrscBasePrice)
        },
        {
            currencyName: "chips",
            nativeCurrencyId: "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP",
            price: await getNativeCurrencyBasePrice(priceArray, "Bridge.CHIPS", vrscBasePrice)
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

        // vrscBasePrice = nativeCurrencyArray[0].price;

        // console.log("vrscBasePrice",vrscBasePrice)

        /* Get latest block */
        const miningInfo = await getMiningInfo(currenciesConfig[i].rpcBaseUrl);
        const currentBlock = miningInfo.blocks;

        currencyReserve = await getCurrencyReserves(currenciesConfig[i], priceArray, nativeCurrencyBasePrice, vrscBasePrice);
        currencyVolume24Hours = await getCurrencyVolume(currenciesConfig[i], currentBlock - 1440, currentBlock, 60, nativeCurrencyBasePrice);
        currencyVolume7Days = await getCurrencyVolume(currenciesConfig[i], currentBlock - 1440 * 7, currentBlock, 1440, nativeCurrencyBasePrice);
        currencyVolume30Days = await getCurrencyVolume(currenciesConfig[i], currentBlock - 1440 * 30, currentBlock, 1440, nativeCurrencyBasePrice);

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

export async function getNativeCurrencyBasePrice(priceArray, baseCurrencyName, vrscBasePrice) {
    const currenciesConfig = getCurrenciesConfig();
    let currencyConfig = currenciesConfig.find(item => item.currencyName === baseCurrencyName);
    let nativeCurrencyBasketPrice = 0;

    if (currencyConfig) {
        let currencyReserves = await getCurrencyReserves(currencyConfig, priceArray, "5", vrscBasePrice);
        nativeCurrencyBasketPrice = currencyReserves.nativeCurrencyBasketPrice;
    }

    // console.log(baseCurrencyName, "nativeCurrencyBasketPrice", nativeCurrencyBasketPrice)
    return nativeCurrencyBasketPrice;
}

export async function getCurrencyReserves(currencyConfig, priceArray, nativeCurrencyBasePrice, vrscBasePrice) {
    //  console.log("conf", currencyConfig)

    //console.log("getCurrencyReserves", vrscBasePrice)
    let blockchain = currencyConfig.blockchain;
    let nativeCurrencyId = currencyConfig.nativeCurrencyId;
    let currencyName = currencyConfig.currencyName;
    let anchorCurrencyId = currencyConfig.anchorCurrencyId;
    let anchorCurrencyName = currencyConfig.anchorCurrencyName;
    let secondaryAnchorCurrencyId = currencyConfig.secondaryAnchorCurrencyId;
    let secondaryAnchorCurrencyName = currencyConfig.secondaryAnchorCurrencyName;
    let rpcBaseUrl = currencyConfig.rpcBaseUrl;
    let currencyIcon = currencyConfig.currencyIcon;
    let currencyNote = currencyConfig.note === undefined ? "" : currencyConfig.note;

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
    let secondaryAnchorReserve = 0;
    let secondaryAnchorWeight = 0;

    let anchorCurrencyFromPriceArray = priceArray.find(item => item.currencyId === anchorCurrencyId)?.price || 0;
    let secondaryAnchorCurrencyFromPriceArray = priceArray.find(item => item.currencyId === secondaryAnchorCurrencyId)?.price || 0;

    if (blockchain !== "VRSC" && anchorCurrencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
        anchorCurrencyFromPriceArray = vrscBasePrice;
    }
    if (secondaryAnchorCurrencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
        secondaryAnchorCurrencyFromPriceArray = vrscBasePrice;
    }
    // if (blockchain !== "VRSC" && secondaryAnchorCurrencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
    //     console.log("blockchain", blockchain, "secondaryAnchorCurrencyId", secondaryAnchorCurrencyId, "vrscBasePrice", vrscBasePrice)
    //     if (vrscBasePrice !== undefined) {
    //          console.log("...",vrscBasePrice);
    //          secondaryAnchorCurrencyFromPriceArray = vrscBasePrice;

    //     }
    // }

    //  console.log("...anchorCurrencyFromPriceArray",anchorCurrencyFromPriceArray);

    //     if( currencyId === anchorCurrencyId && currency.network !== "VRSC" && anchorCurrencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV"){
    //         // currency.price = Math.round((nativeCurrencyReserve * 1 / nativeCurrencyWeight) / (anchorReserve * 1 / anchorWeight) * 1000000) / 1000000;
    //         // currency.pricePrefix = "VRSC";
    //         // currency.priceUSD = currency.price * vrscBasePrice;
    //         console.log(currency.origin, "currency.priceUSD",currency.price, currency.priceUSD, currencyId, anchorCurrencyId, vrscBasePrice)

    //         //  currency.priceUSD = currency.price * vrscBasePrice;
    //    }


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
                            currency.priceUSD = currency.price * anchorCurrencyFromPriceArray;
                            currency.priceNativeCurrency = Math.round((nativeCurrencyReserve * 1 / currency.weight) / (currency.reserves * 1 / currency.weight) * 100000000) / 100000000;
                            currency.reservePriceUSD = currency.priceUSD * currency.reserves;

                            if (currencyId === anchorCurrencyId) {
                                currency.price = Math.round((secondaryAnchorReserve * 1 / secondaryAnchorWeight) / (anchorReserve * 1 / anchorWeight) * 100000000) / 100000000;
                                currency.pricePrefix = secondaryAnchorCurrencyName;
                                currency.priceUSD = currency.price * secondaryAnchorCurrencyFromPriceArray;
                            }


                            // if (currencyId === anchorCurrencyId) {
                            //     currency.price = Math.round((nativeCurrencyReserve * 1 / nativeCurrencyWeight) / (anchorReserve * 1 / anchorWeight) * 100000000) / 100000000;
                            //     currency.pricePrefix = blockchain;
                            //     currency.priceUSD = currency.price * nativeCurrencyBasePrice;
                            // }

                            if (reservesCurrency.currencyid === nativeCurrencyId) {
                                nativeCurrencyBasketPrice = Math.round((anchorReserve * 1 / anchorWeight) / (nativeCurrencyReserve * 1 / nativeCurrencyWeight) * 100000000) / 100000000 * anchorCurrencyFromPriceArray;
                                //   console.log(currency.origin, "vrscBasePrice",vrscBasePrice, "anchorCurrencyFromPriceArray",  anchorCurrencyFromPriceArray, currency.pricePrefix, "currency.price", currency.price , "currency.priceUSD",  currency.priceUSD)
                            }

                            if (currency.network !== "VRSC" && anchorCurrencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV" && currency.pricePrefix === "VRSC") {
                                currency.priceUSD = currency.price * vrscBasePrice;
                                // console.log(" currency.price", currency.price, "currency.priceUSD",  currency.priceUSD)
                                //    console.log(currency.origin, "vrscBasePrice",vrscBasePrice, "anchorCurrencyFromPriceArray", currency.pricePrefix, anchorCurrencyFromPriceArray, "currency.price", currency.price , "currency.priceUSD",  currency.priceUSD)
                            }
                            if (currency.network !== "VRSC" && anchorCurrencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV" && currency.pricePrefix !== "VRSC") {
                                currency.priceUSD = vrscBasePrice;
                                // console.log(" currency.price", currency.price, "currency.priceUSD",  currency.priceUSD)
                                // console.log(currency.origin, "vrscBasePrice",vrscBasePrice, "anchorCurrencyFromPriceArray", currency.pricePrefix, anchorCurrencyFromPriceArray, "currency.price", currency.price , "currency.priceUSD",  currency.priceUSD)
                            }

                            // if (anchorCurrencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV" && secondaryAnchorCurrencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV" && currency.price !== "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV"){
                            //     console.log(currency.origin, currency.pricePrefix, vrscBasePrice, currency.price)
                            //     console.log(reservesCurrency)
                            //     currency.priceUSD = vrscBasePrice * currency.price;
                            //     console.log(currency.priceUSD)
                            // }



                            // if(reservesCurrency.currencyid === "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP"){
                            //     // console.log(currency.origin, "vrscBasePrice",vrscBasePrice, "anchorCurrencyFromPriceArray",  anchorCurrencyFromPriceArray, currency.pricePrefix, "currency.price", currency.price , "currency.priceUSD",  currency.priceUSD)
                            // }


                            // if (currencyId === anchorCurrencyId && currency.network !== "VRSC" && anchorCurrencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            //     // currency.price = Math.round((nativeCurrencyReserve * 1 / nativeCurrencyWeight) / (anchorReserve * 1 / anchorWeight) * 1000000) / 1000000;
                            //     // currency.pricePrefix = "VRSC";
                            //     // currency.priceUSD = currency.price * vrscBasePrice;
                            //     // console.log(currency.origin, "currency.priceUSD", currency.price, currency.priceUSD, currencyId, anchorCurrencyId, vrscBasePrice)

                            //     //  currency.priceUSD = currency.price * vrscBasePrice;
                            // }



                            // if(reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV")

                            // if (reservesCurrency.currencyid === nativeCurrencyId && reservesCurrency.currencyid === anchorCurrencyId) {
                            //     console.log("currency.origin", currency.origin)
                            //     nativeCurrencyBasketPrice = Math.round((anchorReserve * 1 / anchorWeight) / (nativeCurrencyReserve * 1 / nativeCurrencyWeight) * 100000000) / 100000000 * anchorCurrencyFromPriceArray;
                            // }
                        }


                        if (priceArray.length > 0) {
                            priceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                }
                            })
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

    // if (anchorCurrencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV" && secondaryAnchorCurrencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV" && currency.price !== "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV"){
    //     console.log(currency.origin, currency.pricePrefix, vrscBasePrice, currency.price)
    //     console.log(reservesCurrency)
    //     currency.priceUSD = vrscBasePrice * currency.price;
    //     console.log(currency.priceUSD)
    // }


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