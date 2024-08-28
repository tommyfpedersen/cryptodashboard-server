import dotenv from 'dotenv';
dotenv.config();

export async function currencyReserveVdexBridge(priceArray, vrscBridgePrice, estimatedBridgeValueUSD) {
    let result = {};

    /* Bridge vdex reserves */
    try {
        const getcurrencyResponse = await fetch(process.env.VERUS_REST_API_VDEX + "multichain/getcurrency/bridge.vdex");
        const getcurrencyResult = await getcurrencyResponse.json();
        const getcurrency = getcurrencyResult.result;

        let currencyBridgeArray = [];

        let vrscCoingeckoPrice = 0;
        let vdexCoingeckoPrice = 0;
        let ethereumCoingeckoPrice = 0;
        let vdexBridgePrice = 0;
        let ethereumBridgePrice = 0;
        let tBTCvETHBridgePrice = 0;
        let tBTCvETHCoingeckoPrice = 0;

        let daiReserve = 0;

        let estimatedBridgeValue = 0;
        let estimatedBridgeValueVRSC = 0;
        let estimatedBridgeValueUSD = 0;
        let estimatedBridgeValueUSDVRSC = 0;
        let estimatedBridgeValueUSDBTC = 0;
        let estimatedBridgeSupply = getcurrency.bestcurrencystate.supply;

        priceArray.forEach((priceElm) => {
            if (priceElm.currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                vrscCoingeckoPrice = priceElm.price;
            }
            if (priceElm.currencyId === "iHog9UCTrn95qpUBFCZ7kKz7qWdMA8MQ6N") {
                vdexCoingeckoPrice = priceElm.price;
            }
            if (priceElm.currencyId === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
                ethereumCoingeckoPrice = priceElm.price;
            }
            if (priceElm.currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                tBTCvETHCoingeckoPrice = priceElm.price;
            }
        })

       
        if (getcurrency) {
            let currencyIdArray = Object.values(getcurrency.currencies);
            let currencyNames = Object.entries(getcurrency.currencynames);

            /* find dai reserves*/
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
                                currency.origin = "Bridge.vDEX";
                                currency.network = "vDEX";
                                currency.price = Math.round(daiReserve / currency.reserves * 100) / 100;

                                if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                    vrscBridgePrice = Math.round(daiReserve / currency.reserves * 100) / 100;
                                }
                                if (currencyId === "iHog9UCTrn95qpUBFCZ7kKz7qWdMA8MQ6N") {
                                    vdexBridgePrice = Math.round(daiReserve / currency.reserves * 100) / 100;
                                }
                                if (currencyId === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
                                    ethereumBridgePrice = Math.round(daiReserve / currency.reserves * 100) / 100;
                                }
                                if (currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                                    tBTCvETHBridgePrice = Math.round(daiReserve / currency.reserves * 100) / 100;
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
                                estimatedBridgeValue = (Math.round(reservesCurrency.reserves * 5 ) ).toLocaleString();
                                estimatedBridgeValueUSD = (Math.round(reservesCurrency.reserves * 5 / estimatedBridgeSupply *100)/ 100).toLocaleString();
                                estimatedBridgeValueVRSC = (Math.round(reservesCurrency.reserves * 5 / estimatedBridgeSupply / vrscBridgePrice *100000000)/ 100000000).toLocaleString();
                            }

                            if (reservesCurrency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                                estimatedBridgeValueUSDBTC = (Math.round(tBTCvETHCoingeckoPrice * reservesCurrency.reserves * 5)).toLocaleString();
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
        result.estimatedBridgeValueUSDBTC = estimatedBridgeValueUSDBTC;
        result.estimatedBridgeValueUSDVRSC = estimatedBridgeValueUSDVRSC;
        result.estimatedBridgeValueUSD = estimatedBridgeValueUSD;
        result.estimatedBridgeValueVRSC = estimatedBridgeValueVRSC;
        return result;
    } catch (error) {
        // Handle the error here
        // console.log("Error fetching mining info:", error);
        return result;
    }
}