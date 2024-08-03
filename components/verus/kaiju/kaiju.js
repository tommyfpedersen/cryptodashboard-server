require('dotenv').config();
const { saveVolumeDataToFile, getVolumeDataFromFile } = require("../cache/cache");

let volumeInDollarsArrayLoadFromCache = false;
let volumeInDollarsArray = [];

async function currencyReserveKaiju(priceArray) {
    let result = {};

    /* KAIJU reserves */
    const getcurrencyResponse = await fetch(process.env.VERUS_REST_API+ "multichain/getcurrency/kaiju");
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let currencyKaijuArray = [];
    let ethereumKaijuPrice = 0;
    let tBTCKaijuPrice = 0;
    let vrscKaijuPrice = 0;
    let usdtReserve = 0;
    let estimatedKaijuValue = 0;
    let estimatedKaijuSupply = getcurrency.bestcurrencystate.supply;
    let estimatedKaijuValueUSD = 0;
    let estimatedKaijuValueVRSC = 0;

    if (getcurrency) {
        let currencyIdArray = Object.values(getcurrency.currencies);
        let currencyNames = Object.entries(getcurrency.currencynames);

        /* find usdt value*/
        currencyIdArray.forEach((currencyId) => {
            currencyNames.forEach((item) => {
                let currency = {}
                if (item[0] === currencyId) {
                    getcurrency.bestcurrencystate.reservecurrencies.forEach((reservesCurrency) => {
                        if (reservesCurrency.currencyid === "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY") {
                            usdtReserve = reservesCurrency.reserves;
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
                            currency.priceinreserve = reservesCurrency.priceinreserve;
                            currency.price = Math.round(usdtReserve / currency.reserves * 100) / 100;
                            currency.origin = "Kaiju";
                            currency.network = "vrsc";

                            if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                vrscKaijuPrice = Math.round(usdtReserve / currency.reserves * 100) / 100;
                            }
                            if (currencyId === "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4") {
                                ethereumKaijuPrice = Math.round(usdtReserve / currency.reserves * 100) / 100;
                            }
                            if (currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                                tBTCKaijuPrice = Math.round(usdtReserve / currency.reserves * 100) / 100;
                            }
                        }

                        if (priceArray.length > 0) {
                            priceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                }
                            })
                        }


                        if (reservesCurrency.currencyid === "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY") {
                            estimatedKaijuValue = (Math.round(reservesCurrency.reserves * 4 )).toLocaleString();
                            estimatedKaijuValueUSD = (Math.round(reservesCurrency.reserves * 4 / estimatedKaijuSupply *100)/ 100).toLocaleString();
                            estimatedKaijuValueVRSC = (Math.round(reservesCurrency.reserves * 4 / estimatedKaijuSupply / vrscKaijuPrice *100000000)/ 100000000).toLocaleString();
                        }
                    })
                    currency.currencyId = currencyId;
                    currency.currencyName = item[1];
                    currencyKaijuArray.push(currency);
                }
            })
        })
    }

    /* estimated value of kaiju */
    currencyKaijuArray.forEach((currency) => {
        currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 4 });
    })

    result.currencyKaijuArray = currencyKaijuArray;
    result.estimatedKaijuValue = estimatedKaijuValue;
    result.vrscKaijuPrice = vrscKaijuPrice;
    result.ethereumKaijuPrice = ethereumKaijuPrice;
    result.tBTCKaijuPrice = tBTCKaijuPrice; 
    result.estimatedKaijuValueUSD = estimatedKaijuValueUSD;
    result.estimatedKaijuValueVRSC = estimatedKaijuValueVRSC;
    return result;
}

module.exports = { currencyReserveKaiju}