require('dotenv').config();
const { saveVolumeDataToFile, getVolumeDataFromFile } = require("../cache/cache");

let volumeInDollarsArrayLoadFromCache = false;


async function currencyReserveEthBridge(priceArray) {
    let result = {};

    /* VRSC-ETH Bridge reserves */
    const getcurrencyResponse = await fetch(process.env.VERUS_REST_API+ "multichain/getcurrency/bridge.veth");
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
                            estimatedBridgeValue = (Math.round(reservesCurrency.reserves * 4 ) ).toLocaleString();
                            estimatedBridgeValueUSD = (Math.round(reservesCurrency.reserves * 4 / estimatedBridgeSupply *100)/ 100).toLocaleString();
                            estimatedBridgeValueVRSC = (Math.round(reservesCurrency.reserves * 4 / estimatedBridgeSupply / vrscBridgePrice *100000000)/ 100000000).toLocaleString();
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

    result.currencyBridgeArray = currencyBridgeArray;
    result.estimatedBridgeValue = estimatedBridgeValue;
    result.vrscBridgePrice = vrscBridgePrice;
    result.ethereumBridgePrice = ethereumBridgePrice;
    result.mkrBridgePrice = mkrBridgePrice;
    result.estimatedBridgeValueUSD = estimatedBridgeValueUSD;
    result.estimatedBridgeValueVRSC = estimatedBridgeValueVRSC;
    return result;
}

module.exports = { currencyReserveEthBridge}