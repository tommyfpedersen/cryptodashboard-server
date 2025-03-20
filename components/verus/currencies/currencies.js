
import dotenv from 'dotenv';
dotenv.config();

import { getCurrenciesConfig } from './currenciesConfig.js';


export async function getCurrencyReserve(currencyName, priceArray, vrscBridgePrice) {
    if (currencyName === "bridge.veth") {
        return currencyReserveEthBridge(priceArray);
    }
    if (currencyName === "kaiju") {
        return currencyReserveKaiju(priceArray, vrscBridgePrice);
    }
    if (currencyName === "pure") {
        return currencyReservePure(priceArray, vrscBridgePrice);
    }
    if (currencyName === "switch") {
        return currencyReserveSwitch(priceArray, vrscBridgePrice);
    }
    if (currencyName === "nati") {
        return currencyReserveNati(priceArray, vrscBridgePrice);
    }
    if (currencyName === "nati🦉") {
        return currencyReserveNatiOwl(priceArray, vrscBridgePrice);
    }
    if (currencyName === "supervrsc") {
        return currencyReserveSuperVRSC(priceArray, vrscBridgePrice);
    }
    if (currencyName === "vyield") {
        return currencyReserveVyield(priceArray, vrscBridgePrice);
    }
    if (currencyName === "Kek🐸") {
        return currencyReserveKekFrog(priceArray, vrscBridgePrice);
    }
    if (currencyName === "bridge.chips") {
        return currencyReserveBridgeChips(priceArray, vrscBridgePrice);
    }
    if (currencyName === "SUPER🛒") {
        return currencyReserveSuperBasket(priceArray, vrscBridgePrice);
    }
}

export async function getVRSCBasePrice(priceArray) {
    // based on bridge.vETH at the moment
    const currenciesConfig = getCurrenciesConfig();
    let bridgeEthCurrencyReserves = await getCurrencyReserves(currenciesConfig[0], priceArray, "5");
    let vrscBasePrice = bridgeEthCurrencyReserves.vrscBasketPrice;
    return vrscBasePrice;
}

export async function getAllCurrenciesFromBaskets(priceArray) {
    // console.log("priceArray", priceArray);
    const currenciesConfig = getCurrenciesConfig();
    const vrscBasePrice = await getVRSCBasePrice(priceArray);
    console.log("vrscBasePrice", vrscBasePrice);

    //remember await for loop if needed
    currenciesConfig.forEach((currencyConfig) => {
        const currency = getCurrencyReserves(currencyConfig, priceArray, vrscBasePrice);

    })
}

export async function getCurrencyReserves(currencyConfig, priceArray, vrscBasePrice) {

    let blockchain = currencyConfig.blockchain;
    let currencyName = currencyConfig.currencyName;
    let anchorCurrencyId = currencyConfig.anchorCurrencyId;
    let anchorCurrencyName = currencyConfig.anchorCurrencyName;
    let rpcBaseUrl = currencyConfig.rpcBaseUrl;
    let currencyIcon = currencyConfig.currencyIcon;

    let result = {};

    const getcurrencyResponse = await fetch(rpcBaseUrl + "multichain/getcurrency/" + currencyName);
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let basketCurrencyArray = [];

    let vrscReserve = 0;
    let vrscWeight = 0;
    let vrscBasketPrice = 0;

    let anchorReserve = 0;
    let anchorWeight = 0;

    let anchorCurrencyFromPriceArray = priceArray.find(item => item.currencyId === anchorCurrencyId).price || 0;
    let currencySupply = getcurrency.bestcurrencystate.supply;

    if (getcurrency) {
        let currencyIdArray = Object.values(getcurrency.currencies);
        let currencyNames = Object.entries(getcurrency.currencynames);

        /* find anchor value*/
        currencyIdArray.forEach((currencyId) => {
            currencyNames.forEach((item) => {

                if (item[0] === currencyId) {
                    getcurrency.bestcurrencystate.reservecurrencies.forEach((reservesCurrency) => {
                        if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            vrscReserve = reservesCurrency.reserves;
                            vrscWeight = reservesCurrency.weight;
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
                            currency.priceVRSC = Math.round((vrscReserve * 1 / currency.weight) / (currency.reserves * 1 / currency.weight) * 1000000) / 1000000;
                        }

                        if (priceArray.length > 0) {
                            priceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                }
                            })
                        }

                        if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            vrscBasketPrice = Math.round((anchorReserve * 1 / anchorWeight) / (vrscReserve * 1 / vrscWeight) * 1000000) / 1000000 * anchorCurrencyFromPriceArray;
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
    result.vrscBasketPrice = vrscBasketPrice;
    result.vrscBasePrice = vrscBasePrice;
    result.basketReserveValueVRSC = vrscReserve * (1 / vrscWeight);
    result.basketReserveValueVRSCUSD = vrscReserve * (1 / vrscWeight) * vrscBasketPrice;
    result.basketValueAnchorCurrencyUSD = anchorReserve * (1 / anchorWeight) * anchorCurrencyFromPriceArray;
    result.anchorCurrencyName = anchorCurrencyName;
    result.currencyName = currencyName;
    result.currencySupply = currencySupply;
    result.currencyPriceUSD = (vrscReserve * (1 / vrscWeight) * vrscBasketPrice) / currencySupply;
    result.currencyPriceVRSC = (vrscReserve * (1 / vrscWeight) * vrscBasketPrice) / currencySupply / vrscBasketPrice;
    result.currencyIcon = currencyIcon;

    console.log("result", result);

    return result;
}