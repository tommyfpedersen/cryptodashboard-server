import dotenv from 'dotenv';
dotenv.config();

export async function currencyReserveVyield(priceArray, vrscBridgePrice) {
    let result = {};

    /* vYIELD reserves */
    const getcurrencyResponse = await fetch(process.env.VERUS_REST_API + "multichain/getcurrency/vyield");
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let currencyVyieldArray = [];
    // let eurcPrice = 0;
    // let usdcPrice = 0;
    let vrscPrice = 0;

    let scrvUSDPrice = 0;
    let crvUSDPrice = 1;

    let vrscReserve = 0;
    let scrvUSDReserve = 0;
    let estimatedVyieldValueUSD = 0;
    let estimatedVyieldReserveValue = 0;
    let estimatedVyieldValue = 0;
    let estimatedVyieldSupply = getcurrency.bestcurrencystate.supply;
    let estimatedVyieldValueUSDVRSC = 0;
    let estimatedVyieldValueVRSC = 0;

    let crvUSDCoingeckoPrice = 0;
    let vrscCoingeckoPrice = 0;

    priceArray.forEach((priceElm) => {
        if (priceElm.currencyId === "i9nLSK4S1U5sVMq4eJUHR1gbFALz56J9Lj") {
            crvUSDCoingeckoPrice = priceElm.price;
        }
    })


    if (getcurrency) {
        let currencyIdArray = Object.values(getcurrency.currencies);
        let currencyNames = Object.entries(getcurrency.currencynames);

        /* find scrvUSD value*/
        currencyIdArray.forEach((currencyId) => {
            currencyNames.forEach((item) => {
                if (item[0] === currencyId) {
                    getcurrency.bestcurrencystate.reservecurrencies.forEach((reservesCurrency) => {

                        if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            vrscReserve = reservesCurrency.reserves;
                            estimatedVyieldValueUSD = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 / estimatedVyieldSupply * 100) / 100).toLocaleString();
                            estimatedVyieldValueVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 / estimatedVyieldSupply / vrscBridgePrice * 1000) / 1000).toLocaleString();
                        }
                        if (reservesCurrency.currencyid === "i9nLSK4S1U5sVMq4eJUHR1gbFALz56J9Lj") {
                            scrvUSDReserve = reservesCurrency.reserves;
                            //   estimatedVyieldReserveValue = scrvUSDReserve * 1 / reservesCurrency.weight;
                            estimatedVyieldReserveValue = scrvUSDReserve * crvUSDCoingeckoPrice * 2;
                            estimatedVyieldValue = (Math.round(estimatedVyieldReserveValue / estimatedVyieldSupply * 100) / 100).toLocaleString();
                            estimatedVyieldValueUSDVRSC = (Math.round(estimatedVyieldValue / vrscBridgePrice * 100) / 100).toLocaleString();
                            estimatedVyieldReserveValue = (Math.round(estimatedVyieldReserveValue)).toLocaleString();
                            // estimatedVyieldValueVRSC = (Math.round(estimatedVyieldValueUSDVRSC / vrscBridgePrice * 1000) / 1000).toLocaleString();
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
                            currency.weight = reservesCurrency.weight * 100;
                            currency.reserves = reservesCurrency.reserves;//(reservesCurrency.reserves).toLocaleString(undefined, { minimumFractionDigits: 8 });
                            currency.priceinreserve = reservesCurrency.priceinreserve;
                            currency.origin = "vYIELD";
                            currency.network = "vrsc";

                            if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                //vrscPrice = (scrvUSDReserve * 1 / 0.5) / (currency.reserves * 1 / 0.5);
                                //vrscPrice = scrvUSDReserve  / currency.reserves ;
                                //let vyeildBasketPrice = Math.round(vrscReserve / scrvUSDReserve * 100) / 100;
                                // currency.price =  Math.round(scrvUSDReserve * vyeildBasketPrice*100) / 100;
                                currency.price = Math.round(scrvUSDReserve * (vrscBridgePrice * (vrscReserve / scrvUSDReserve)) / vrscReserve * 10000) / 10000;
                                // currency.price =  Math.round(vrscPrice * 100) / 100;

                                //  currency.price = Math.round(scrvUSDReserve / currency.reserves * 1000) / 1000;
                                // currency.priceNative = Math.round(scrvUSDReserve / currency.reserves * 1000) / 1000;
                                currency.pricelabel = "scrvUSD";
                                // currency.price = Math.round(crvUSDCoingeckoPrice * currency.priceNative * 100) / 100;
                            }
                            if (currencyId === "i9nLSK4S1U5sVMq4eJUHR1gbFALz56J9Lj") {
                                // scrvUSDPrice = (vrscReserve * 1 / 0.5) / (currency.reserves * 1 / 0.5);
                                // currency.price = Math.round(scrvUSDPrice * 100) / 100;

                                currency.priceNative = Math.round(vrscReserve / currency.reserves * 1000) / 1000;
                                currency.pricelabel = "VRSC";
                                currency.price = Math.round(vrscBridgePrice * currency.priceNative * 1000) / 1000;
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
                        foundCurrency = priceArray.find(price => price.currencyId === "i9nLSK4S1U5sVMq4eJUHR1gbFALz56J9Lj");
                        if (foundCurrency && currencyId === "i9nLSK4S1U5sVMq4eJUHR1gbFALz56J9Lj") {
                            currency.coingeckoprice = Math.round(foundCurrency.price * 1000) / 1000;
                            currency.coingeckoLabel = "Coingecko";
                        }
                    }

                    // if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                    //  //   estimatedPureValueUSDVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 ) ).toLocaleString();
                    //     estimatedPureValueUSD = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 / estimatedPureSupply *100)/ 100).toLocaleString();
                    //     estimatedPureValueVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 / estimatedPureSupply /vrscBridgePrice *100000000)/ 100000000).toLocaleString();
                    // }
                    // if (reservesCurrency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                    //     estimatedPureValueUSDBTC = (Math.round(tBTCvETHCoingeckoPrice * reservesCurrency.reserves * 2 ) ).toLocaleString();
                    // }

                    currency.currencyId = currencyId;
                    currency.currencyName = item[1];
                    currencyVyieldArray.push(currency);
                }
            })
        })
    }

    /* estimated value of vYIELD */
    currencyVyieldArray.forEach((currency) => {
        currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 4 });
    })

    result.estimatedVyieldSupply = estimatedVyieldSupply;
    result.currencyVyieldArray = currencyVyieldArray;
    result.estimatedVyieldValue = estimatedVyieldValue;
    result.estimatedVyieldReserveValue = estimatedVyieldReserveValue;
    result.estimatedVyieldValueUSDVRSC = estimatedVyieldValueUSDVRSC;
    result.estimatedVyieldValueVRSC = estimatedVyieldValueVRSC;
    return result;
}