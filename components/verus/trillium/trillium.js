import dotenv from 'dotenv';
dotenv.config();

export async function currencyReserveTrillium(priceArray, vrscBridgePrice) {
    let result = {};

    /* Trillium reserves */
    const getcurrencyResponse = await fetch(process.env.VERUS_REST_API+ "multichain/getcurrency/trillium");
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let currencyTrilliumArray = [];

    let tBTCvETHCoingeckoPrice = 0;
    let vrscCoingeckoPrice = 0;
    let vrscReserve = 0;
    let tBTCvETHReserve = 0;
    let estimatedTrilliumValueUSDBTC = 0;
    let estimatedTrilliumValueUSDVRSC = 0;
    let estimatedTrilliumValueVRSC = 0;
    let estimatedTrilliumSupply = getcurrency.bestcurrencystate.supply;
    let estimatedTrilliumValueUSD = 0;

    priceArray.forEach((priceElm) => {
        if (priceElm.currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
            vrscCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
            tBTCvETHCoingeckoPrice = priceElm.price;
        }
    })


    if (getcurrency) {
        let currencyIdArray = Object.values(getcurrency.currencies);
        let currencyNames = Object.entries(getcurrency.currencynames);

        /* find vrsc value*/
        currencyIdArray.forEach((currencyId) => {
            currencyNames.forEach((item) => {
                let currency = {}
                if (item[0] === currencyId) {
                    getcurrency.bestcurrencystate.reservecurrencies.forEach((reservesCurrency) => {
                        if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            vrscReserve = reservesCurrency.reserves;
                        }
                        if (reservesCurrency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                            tBTCvETHReserve = reservesCurrency.reserves;
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
                            currency.weight = Math.round(reservesCurrency.weight *100) / 100;
                            currency.priceinreserve = reservesCurrency.priceinreserve;
                            currency.origin = "Trillium";
                            currency.network = "vrsc";
                            //currency.price = Math.round(vrscReserve / currency.reserves * 100) / 100;

                            if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                currency.priceNative = Math.round(tBTCvETHReserve / currency.reserves * 100000000) / 100000000;
                                currency.pricelabel = "tBTCvETH";
                                currency.price = Math.round(tBTCvETHCoingeckoPrice * currency.priceNative * 100) / 100;
                               // currency.dollarprice = Math.round(tBTCvETHCoingeckoPrice * currency.price * 100) / 100;
                            }
                            if (currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                                currency.priceNative = Math.round(vrscReserve / currency.reserves * 100) / 100;
                                currency.pricelabel = "VRSC";
                                currency.price = Math.round(vrscBridgePrice * currency.priceNative * 100) / 100;
                            }
                            if (currencyId === "i9nLSK4S1U5sVMq4eJUHR1gbFALz56J9Lj") {
                                currency.priceNative = Math.round(tBTCvETHReserve / currency.reserves * 100000000) / 100000000;
                                currency.pricelabel = "tBTCvETH";
                                currency.price = Math.round(tBTCvETHCoingeckoPrice * currency.priceNative * 1000) / 1000;
                            }
                        }

                        if (priceArray.length > 0) {
                            priceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    if(currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV"){
                                        currency.coingeckoprice = Math.round(vrscBridgePrice * 100) / 100;
                                        currency.coingeckoLabel = "Bridge.vETH";
                                    }
                                    if(currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU"){
                                        currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                        currency.coingeckoLabel = "Coingecko";
                                    } 
                                    if(currencyId === "i9nLSK4S1U5sVMq4eJUHR1gbFALz56J9Lj"){
                                        currency.coingeckoprice = Math.round(price.price * 1000) / 1000;
                                        currency.coingeckoLabel = "Coingecko";
                                    } 
                                }
                            })
                        }


                        if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            estimatedTrilliumValueUSDVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 3 ) ).toLocaleString();
                            estimatedTrilliumValueUSD = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 3 / estimatedTrilliumSupply *100)/ 100).toLocaleString();
                            estimatedTrilliumValueVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 3 / estimatedTrilliumSupply /vrscBridgePrice *100000000)/ 100000000).toLocaleString();
                        }
                        if (reservesCurrency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                            estimatedTrilliumValueUSDBTC = (Math.round(tBTCvETHCoingeckoPrice * reservesCurrency.reserves * 3 ) ).toLocaleString();
                        }
                    })
                    currency.currencyId = currencyId;
                    currency.currencyName = item[1];
                    currencyTrilliumArray.push(currency);
                }
            })
        })
    }

    /* estimated value of Trillium */
    currencyTrilliumArray.forEach((currency) => {
        currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 4 });
    })

    result.estimatedTrilliumSupply = estimatedTrilliumSupply;
    result.currencyTrilliumArray = currencyTrilliumArray;
    result.estimatedTrilliumValueUSDBTC = estimatedTrilliumValueUSDBTC;
    result.estimatedTrilliumValueUSDVRSC = estimatedTrilliumValueUSDVRSC;
    result.estimatedTrilliumValueUSD = estimatedTrilliumValueUSD;
    result.estimatedTrilliumValueVRSC = estimatedTrilliumValueVRSC;
    return result;
}