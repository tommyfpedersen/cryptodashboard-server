
import dotenv from 'dotenv';
dotenv.config();

import { getCurrenciesConfig } from './currenciesConfig.js';
//import currencies from './currenciesConfig';


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

export async function getAllCurrenciesFromBaskets(priceArray) {
    console.log("priceArray", priceArray);

    // loop
    let blockchain = "vrsc";
    let currencyName = "bridge.veth";
    let anchorPriceId = "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM"
  //  let anchorPriceId = "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV"
    let currencyIcon = "";
    let rpcBaseUrl = process.env.VERUS_REST_API;

    getCurrencyReserves(blockchain, currencyName, anchorPriceId, rpcBaseUrl, priceArray, "5", currencyIcon);
}

export async function getCurrencyReserves(blockchain = "vrsc", currencyName, anchorPriceId, rpcBaseUrl, priceArray, vrscBasePrice, currencyIcon) {
    let result = {};
   
    const getcurrencyResponse = await fetch(rpcBaseUrl + "multichain/getcurrency/" + currencyName);
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let basketCurrencyArray = [];

    let vrscReserve = 0;
    let vrscWeight = 0;
    let vrscBasketPrice = 0;
    let vrscBasketValueInUSD = 0;

    let anchorReserve = 0;
    let anchorWeight = 0;
    let anchorBasketValueInUSD = 0;

    let currencyValue = 0;
    let currencySupply = getcurrency.bestcurrencystate.supply;
    let estimatedBridgeValueUSD = 0;
    let estimatedBridgeValueVRSC = 0;

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
                        if (reservesCurrency.currencyid === anchorPriceId) {
                            anchorReserve = reservesCurrency.reserves;
                            anchorWeight = reservesCurrency.weight;
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
                            currency.reserves = reservesCurrency.reserves;//(reservesCurrency.reserves).toLocaleString(undefined, { minimumFractionDigits: 8 });
                            currency.weight = reservesCurrency.weight * 100;
                            currency.priceinreserve = reservesCurrency.priceinreserve;
                            currency.origin = currencyName;
                            currency.network = blockchain;
                            currency.price = Math.round((anchorReserve * 1 / currency.weight) / (currency.reserves * 1 / currency.weight) * 100) / 100;
                            currency.priceVRSC = Math.round((vrscReserve * 1 / currency.weight) / (currency.reserves * 1 / currency.weight) * 100) / 100;
                        }

                        if (priceArray.length > 0) {
                            priceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                }
                            })
                        }

                        if(reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV"){

                            vrscBasketPrice = Math.round((anchorReserve * 1 / vrscWeight) / (vrscReserve * 1 / vrscWeight) * 100) / 100;
                            console.log("vrscBasketPrice", vrscBasketPrice, anchorReserve, vrscReserve, vrscWeight);
                        }


                        // if (reservesCurrency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                        //     estimatedBridgeValue = (Math.round(reservesCurrency.reserves * 4)).toLocaleString();
                        //     estimatedBridgeValueUSD = (Math.round(reservesCurrency.reserves * 4 / estimatedBridgeSupply * 100) / 100).toLocaleString();
                        //     estimatedBridgeValueVRSC = (Math.round(reservesCurrency.reserves * 4 / estimatedBridgeSupply / vrscBridgePrice * 100000000) / 100000000).toLocaleString();
                        // }
                    })
                    currency.currencyId = currencyId;
                    currency.currencyName = item[1];
                    basketCurrencyArray.push(currency);
                }
            })
        })
    }
    result.basketCurrencyArray = basketCurrencyArray;
    result.currencySupply = currencySupply;
    result.vrscBasketPrice = vrscBasketPrice;
    result.basketValueVRSC = 2;
    result.basketValueVRSCUSD = vrscReserve * (1 / vrscWeight)*vrscBasketPrice;
    result.basketValueUSD = 2;
    result.basketValueAnchorPriceUSD = 2;
    result.currencyIcon = currencyIcon;


    //console.log("getcurrency fetch", getcurrency);
    console.log("anchorReserve", anchorReserve);
    console.log("result", result);
}


export async function currencyReserveEthBridge(priceArray) {
    let result = {};

    /* VRSC-ETH Bridge reserves */
    const getcurrencyResponse = await fetch(process.env.VERUS_REST_API + "multichain/getcurrency/bridge.veth");
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let currencyBridgeArray = [];
    let ethereumBridgePrice = 0;
    let mkrBridgePrice = 0;
    let vrscBridgePrice = 0;
    let daiReserve = 0;
    let estimatedBridgeValue = 0;
    let estimatedBridgeSupply = getcurrency.bestcurrencystate.supply;
    let estimatedBridgeValueUSD = 0;
    let estimatedBridgeValueVRSC = 0;

    if (getcurrency) {
        let currencyIdArray = Object.values(getcurrency.currencies);
        let currencyNames = Object.entries(getcurrency.currencynames);

        /* find dai value*/
        currencyIdArray.forEach((currencyId) => {
            currencyNames.forEach((item) => {
                let currency = {}
                if (item[0] === currencyId) {
                    getcurrency.bestcurrencystate.reservecurrencies.forEach((reservesCurrency) => {
                        if (reservesCurrency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                            daiReserve = reservesCurrency.reserves;
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
                            currency.reserves = reservesCurrency.reserves;//(reservesCurrency.reserves).toLocaleString(undefined, { minimumFractionDigits: 8 });
                            currency.weight = reservesCurrency.weight * 100;
                            currency.priceinreserve = reservesCurrency.priceinreserve;
                            currency.price = Math.round(daiReserve / currency.reserves * 100) / 100;
                            currency.origin = "Bridge.vETH";
                            currency.network = "vrsc";

                            if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                vrscBridgePrice = Math.round(daiReserve / currency.reserves * 100) / 100;
                            }
                            if (currencyId === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
                                ethereumBridgePrice = Math.round(daiReserve / currency.reserves * 100) / 100;
                            }
                            if (currencyId === "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4") {
                                mkrBridgePrice = Math.round(daiReserve / currency.reserves * 100) / 100;
                            }
                        }

                        if (priceArray.length > 0) {
                            priceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                }
                            })
                        }


                        if (reservesCurrency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                            estimatedBridgeValue = (Math.round(reservesCurrency.reserves * 4)).toLocaleString();
                            estimatedBridgeValueUSD = (Math.round(reservesCurrency.reserves * 4 / estimatedBridgeSupply * 100) / 100).toLocaleString();
                            estimatedBridgeValueVRSC = (Math.round(reservesCurrency.reserves * 4 / estimatedBridgeSupply / vrscBridgePrice * 100000000) / 100000000).toLocaleString();
                        }
                    })
                    currency.currencyId = currencyId;
                    currency.currencyName = item[1];
                    currencyBridgeArray.push(currency);
                }
            })
        })
    }

    /* estimated value of bridge */
    currencyBridgeArray.forEach((currency) => {
        currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 4 });
    })

    result.estimatedBridgeSupply = estimatedBridgeSupply;
    result.currencyBridgeArray = currencyBridgeArray;
    result.estimatedBridgeValue = estimatedBridgeValue;
    result.vrscBridgePrice = vrscBridgePrice;
    result.ethereumBridgePrice = ethereumBridgePrice;
    result.mkrBridgePrice = mkrBridgePrice;
    result.estimatedBridgeValueUSD = estimatedBridgeValueUSD;
    result.estimatedBridgeValueVRSC = estimatedBridgeValueVRSC;
    return result;
}