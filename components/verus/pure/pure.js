import dotenv from 'dotenv';
dotenv.config();

export async function currencyReservePure(priceArray, vrscBridgePrice) {
    let result = {};

    /* Pure reserves */
    const getcurrencyResponse = await fetch(process.env.VERUS_REST_API+ "multichain/getcurrency/pure");
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let currencyPureArray = [];

    let tBTCvETHCoingeckoPrice = 0;
    let vrscCoingeckoPrice = 0;
    let vrscReserve = 0;
    let tBTCvETHReserve = 0;
    let estimatedPureValueUSDBTC = 0;
    let estimatedPureValueUSDVRSC = 0;
    let estimatedPureValueVRSC = 0;
    let estimatedPureSupply = getcurrency.bestcurrencystate.supply;
    let estimatedPureValueUSD = 0;

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
                            currency.priceinreserve = reservesCurrency.priceinreserve;
                            currency.origin = "Pure";
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
                                }
                            })
                        }


                        if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            estimatedPureValueUSDVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 ) ).toLocaleString();
                            estimatedPureValueUSD = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 / estimatedPureSupply *100)/ 100).toLocaleString();
                            estimatedPureValueVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 / estimatedPureSupply /vrscBridgePrice *100000000)/ 100000000).toLocaleString();
                        }
                        if (reservesCurrency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                            estimatedPureValueUSDBTC = (Math.round(tBTCvETHCoingeckoPrice * reservesCurrency.reserves * 2 ) ).toLocaleString();
                        }
                    })
                    currency.currencyId = currencyId;
                    currency.currencyName = item[1];
                    currencyPureArray.push(currency);
                }
            })
        })
    }

    /* estimated value of Pure */
    currencyPureArray.forEach((currency) => {
        currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 4 });
    })

    result.currencyPureArray = currencyPureArray;
    result.estimatedPureValueUSDBTC = estimatedPureValueUSDBTC;
    result.estimatedPureValueUSDVRSC = estimatedPureValueUSDVRSC;
    result.estimatedPureValueUSD = estimatedPureValueUSD;
    result.estimatedPureValueVRSC = estimatedPureValueVRSC;
    return result;
}