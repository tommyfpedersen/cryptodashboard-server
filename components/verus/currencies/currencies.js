
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

export async function getVRSCBasePrice(){
    // based on bridge.vETH at the moment
    const currenciesConfig = getCurrenciesConfig();
    let bridgeEthCurrencyReserves =  await getCurrencyReserves(currenciesConfig[0], [], "5");
    let vrscBasePrice = bridgeEthCurrencyReserves.vrscBasketPrice;
    return vrscBasePrice;
}

export async function getAllCurrenciesFromBaskets(priceArray) {
   // console.log("priceArray", priceArray);
    const currenciesConfig = getCurrenciesConfig();
    const vrscBasePrice = await getVRSCBasePrice();
    console.log("vrscBasePrice", vrscBasePrice);

    //remember await for loop if needed
    currenciesConfig.forEach((currencyConfig) => {
     const currency=  getCurrencyReserves(currencyConfig, priceArray, vrscBasePrice);
     
    })
}

//export async function getCurrencyReserves(blockchain = "vrsc", currencyName, anchorPriceId, anchorPriceRefId, rpcBaseUrl, priceArray, vrscBasePrice, currencyIcon) {
export async function getCurrencyReserves(currencyConfig, priceArray, vrscBasePrice) {

    let blockchain = currencyConfig.blockchain;
    let currencyName = currencyConfig.currencyName;
    let mainAnchorPriceId = currencyConfig.mainAnchorPriceId;
    let secondaryAnchorPriceId = currencyConfig.secondaryAnchorPriceId;
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
    let vrscBasketValueInUSD = 0;

    let mainAnchorReserve = 0;
    let mainAnchorWeight = 0;
    let mainAnchorPriceFromPriceArray = 1; // find price from priceArray using anchorPriceId
    let mainAnchorBasketValueInUSD = 0;
    let mainAnchorCurrencyName = "";

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
                        if (reservesCurrency.currencyid === mainAnchorPriceId) {
                            mainAnchorReserve = reservesCurrency.reserves;
                            mainAnchorWeight = reservesCurrency.weight;
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
                            currency.price = Math.round((mainAnchorReserve * 1 / currency.weight) / (currency.reserves * 1 / currency.weight) * 100) / 100;
                            currency.priceVRSC = Math.round((vrscReserve * 1 / currency.weight) / (currency.reserves * 1 / currency.weight) * 100) / 100;
                        }

                        if (priceArray.length > 0) {
                            priceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                }
                            })
                        }

                        if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {

                            vrscBasketPrice = Math.round((mainAnchorReserve * 1 / vrscWeight) / (vrscReserve * 1 / vrscWeight) * 100) / 100;
                     //       console.log("vrscBasketPrice", vrscBasketPrice, mainAnchorReserve, vrscReserve, vrscWeight);
                        }


                        // if (reservesCurrency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                        //     estimatedBridgeValue = (Math.round(reservesCurrency.reserves * 4)).toLocaleString();
                        //     estimatedBridgeValueUSD = (Math.round(reservesCurrency.reserves * 4 / estimatedBridgeSupply * 100) / 100).toLocaleString();
                        //     estimatedBridgeValueVRSC = (Math.round(reservesCurrency.reserves * 4 / estimatedBridgeSupply / vrscBridgePrice * 100000000) / 100000000).toLocaleString();
                        // }
                    })

                    if (currencyId === mainAnchorPriceId) {
                        mainAnchorCurrencyName = item[1];
                    }

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
    result.basketReserveValueVRSC = currencySupply / vrscBasketPrice;
    result.basketReserveValueVRSCUSD = vrscReserve * (1 / vrscWeight) * vrscBasketPrice;
    // result.basketReserveValueUSD = 2;
    result.basketValueAnchorPriceUSD = mainAnchorReserve * (1 / mainAnchorWeight) * mainAnchorPriceFromPriceArray;
    result.mainAnchorCurrencyName = mainAnchorCurrencyName;
    result.currencyName = currencyName;
    result.currencySupply = currencySupply;
    result.currencyPriceUSD = (vrscReserve * (1 / vrscWeight) * vrscBasketPrice) / currencySupply;
    result.currencyPriceVRSC = (vrscReserve * (1 / vrscWeight) * vrscBasketPrice) / currencySupply / vrscBasketPrice;
    result.currencyIcon = currencyIcon;

    console.log("result", result);
    //console.log("getcurrency fetch", getcurrency);
    // console.log("anchorReserve", anchorReserve);
   //  console.log("result", result);
   return result;
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