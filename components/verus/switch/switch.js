require('dotenv').config();

async function currencyReserveSwitch(priceArray, vrscBridgePrice) {
    let result = {};

    /* VRSC-ETH Bridge reserves */
    const getcurrencyResponse = await fetch(process.env.VERUS_REST_API+ "multichain/getcurrency/switch");
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let currencySwitchArray = [];
    let eurcPrice = 0;
    let usdcPrice = 0;
    let vrscPrice = 0;
    let daiPrice = 0;
    let daiReserve = 0;
    let estimatedSwitchValue = 0;
    let estimatedSwitchReserveValue = 0;
    let estimatedSwitchValueUSDVRSC = 0;
    let estimatedSwitchSupply = getcurrency.bestcurrencystate.supply;
    let estimatedSwitchValueUSD = 0;

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
                            estimatedSwitchReserveValue = daiReserve * 1 / reservesCurrency.weight;
                            estimatedSwitchValue = (Math.round(estimatedSwitchReserveValue / estimatedSwitchSupply * 100) / 100).toLocaleString();
                            estimatedSwitchValueUSDVRSC = (Math.round(estimatedSwitchValue / vrscBridgePrice * 100000000) / 100000000).toLocaleString();
                            estimatedSwitchReserveValue = (Math.round(estimatedSwitchReserveValue ) ).toLocaleString();
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
                            currency.origin = "Switch";
                            currency.network = "vrsc";

                            if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                vrscPrice = (daiReserve * 1 / 0.21) / (currency.reserves * 1 / 0.16);
                                currency.price = Math.round(vrscPrice * 100) / 100;
                            }
                            if (currencyId === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                                daiPrice = (daiReserve * 1 / 0.21) / (currency.reserves * 1 / 0.21);
                                currency.price = Math.round(daiPrice * 100) / 100;
                            }
                            if (currencyId === "i61cV2uicKSi1rSMQCBNQeSYC3UAi9GVzd") {
                                usdcPrice = (daiReserve * 1 / 0.21) / (currency.reserves * 1 / 0.21);
                                currency.price = Math.round( usdcPrice * 100) / 100;
                            }
                            if (currencyId === "iC5TQFrFXSYLQGkiZ8FYmZHFJzaRF5CYgE") {
                                eurcPrice = (daiReserve * 1 / 0.21) / (currency.reserves * 1 / 0.42);
                                currency.price = Math.round(eurcPrice * 100) / 100;
                            }
                        }
                    })
                
                    if (priceArray.length > 0) {
                        let foundCurrency = null;
                        foundCurrency = priceArray.find(price => price.currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV");
                        if (foundCurrency && currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            currency.coingeckoprice = Math.round(vrscBridgePrice * 100) / 100;
                            currency.coingeckoLabel = "Bridge.vETH";
                        }
                        foundCurrency = priceArray.find(price => price.currencyId === "i61cV2uicKSi1rSMQCBNQeSYC3UAi9GVzd");
                        if (foundCurrency && currencyId === "i61cV2uicKSi1rSMQCBNQeSYC3UAi9GVzd") {
                            currency.coingeckoprice = Math.round(foundCurrency.price * 100) / 100;
                            currency.coingeckoLabel = "Coingecko";
                        }
                        foundCurrency = priceArray.find(price => price.currencyId === "iC5TQFrFXSYLQGkiZ8FYmZHFJzaRF5CYgE");
                        if (foundCurrency && currencyId === "iC5TQFrFXSYLQGkiZ8FYmZHFJzaRF5CYgE") {
                            currency.coingeckoprice = Math.round(foundCurrency.price * 100) / 100;
                            currency.coingeckoLabel = "Coingecko";
                        }
                        foundCurrency = priceArray.find(price => price.currencyId === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM");
                        if (foundCurrency && currencyId === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                            currency.coingeckoprice = Math.round(foundCurrency.price * 100) / 100;
                            currency.coingeckoLabel = "Coingecko";
                        }
                    }

                    currency.currencyId = currencyId;
                    currency.currencyName = item[1];
                    currencySwitchArray.push(currency);
                }
            })
        })
    }

    /* estimated value of Switch */
    currencySwitchArray.forEach((currency) => {
        currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 4 });
    })

    result.currencySwitchArray = currencySwitchArray;
    result.estimatedSwitchValue = estimatedSwitchValue;
    result.estimatedSwitcheReserveValue = estimatedSwitchReserveValue;
    result.estimatedSwitchValueUSDVRSC = estimatedSwitchValueUSDVRSC;
    return result;
}

module.exports = { currencyReserveSwitch }