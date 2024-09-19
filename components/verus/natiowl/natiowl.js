import dotenv from 'dotenv';
dotenv.config();

export async function currencyReserveNatiOwl(priceArray, vrscBridgePrice) {
    let result = {};

    /* NatiOwl reserves */
    const getcurrencyResponse = await fetch(process.env.VERUS_REST_API + "multichain/getcurrency/nati🦉");
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let currencyNatiOwlArray = [];

    let vrscCoingeckoPrice = 0;
    let tBTCvETHCoingeckoPrice = 0;
    let tBTCvETHBridgePrice = 0;
    let ethereumCoingeckoPrice = 0;
    let ethereumBridgePrice = 0;
    let NatiOwlvETHCoingeckoPrice = 0;
    let NATIvETHCoingeckoPrice = 0;

    let vrscReserve = 0;
    let tBTCvETHReserve = 0;
    let natiReserve = 0;
    let NatiOwlvETHReserve = 0;
    let NATIvETHReserve = 0;
    let estimatedNatiOwlValueUSDtBTC = 0;
    let estimatedNatiOwlValueUSDVRSC = 0;
    let estimatedNatiOwlValueVRSC = 0;
    let estimatedNatiOwlSupply = getcurrency.bestcurrencystate.supply;
    let estimatedNatiOwlValueUSD = 0;

    priceArray.forEach((priceElm) => {
        if (priceElm.currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
            vrscCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
            tBTCvETHCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
            ethereumCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "iL62spNN42Vqdxh8H5nrfNe8d6Amsnfkdx") {
            NATIvETHCoingeckoPrice = priceElm.price;
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
                            currency.reserves = reservesCurrency.reserves;
                            currency.priceinreserve = reservesCurrency.priceinreserve;
                            currency.origin = "NATI🦉";
                            currency.network = "vrsc";


                            if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                currency.priceNative = Math.round(tBTCvETHReserve / currency.reserves * 100000000) / 100000000;
                                currency.pricelabel = "tBTCvETH";
                                currency.price = Math.round(tBTCvETHCoingeckoPrice * currency.priceNative * 100) / 100;
                            }
                            if (currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                                currency.priceNative = Math.round(vrscReserve / currency.reserves * 100) / 100;
                                currency.pricelabel = "VRSC";
                                currency.price = Math.round(vrscBridgePrice * currency.priceNative * 100) / 100;
                            }
                            if (currencyId === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
                                currency.priceNative = Math.round(tBTCvETHReserve / currency.reserves * 1000) / 1000;
                                currency.pricelabel = "VRSC";
                                currency.price = Math.round(tBTCvETHCoingeckoPrice * currency.priceNative * 100) / 100 ;
                            }
                            if (currencyId === "iL62spNN42Vqdxh8H5nrfNe8d6Amsnfkdx") {
                                currency.priceNative = (Math.round(vrscReserve / currency.reserves * 100000000) / 100000000 ).toFixed(5);
                                currency.pricelabel = "VRSC";
                                currency.price = (vrscBridgePrice * currency.priceNative).toFixed(5);
                            }
                        }

                        if (priceArray.length > 0) {
                            priceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                        currency.coingeckoprice = Math.round(vrscBridgePrice * 100) / 100;
                                        currency.coingeckoLabel = "Bridge.vETH";
                                    }
                                    if(currencyId === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU"){
                                        currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                        currency.coingeckoLabel = "Coingecko";
                                    } 
                                    if(currencyId === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X"){
                                        currency.coingeckoprice = Math.round(price.price * 100) / 100;
                                        currency.coingeckoLabel = "Coingecko";
                                    } 
                                    if (currencyId === "iL62spNN42Vqdxh8H5nrfNe8d6Amsnfkdx") {
                                        currency.coingeckoprice = (Math.round(price.price * 100000000) / 100000000).toFixed(8);
                                        currency.coingeckoLabel = "Coingecko";
                                    }
                                }
                            })
                        }


                        if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            estimatedNatiOwlValueUSDVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 4)).toLocaleString();
                            estimatedNatiOwlValueUSD = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 4 / estimatedNatiOwlSupply * 100) / 100).toLocaleString();
                            estimatedNatiOwlValueVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 4 / estimatedNatiOwlSupply / vrscBridgePrice * 100000000) / 100000000).toLocaleString();
                        }
                        if (reservesCurrency.currencyid === "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU") {
                            estimatedNatiOwlValueUSDtBTC = (Math.round(tBTCvETHCoingeckoPrice * reservesCurrency.reserves * 4 ) ).toLocaleString();
                        }
                    })
                    currency.currencyId = currencyId;
                    currency.currencyName = item[1];
                    currencyNatiOwlArray.push(currency);
                }
            })
        })
    }

    /* estimated value of NatiOwl */
    currencyNatiOwlArray.forEach((currency) => {
        currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 4 });
    })

    result.currencyNatiOwlArray = currencyNatiOwlArray;
    result.estimatedNatiOwlValueUSDtBTC = estimatedNatiOwlValueUSDtBTC;
    result.estimatedNatiOwlValueUSDVRSC = estimatedNatiOwlValueUSDVRSC;
    result.estimatedNatiOwlValueUSD = estimatedNatiOwlValueUSD;
    result.estimatedNatiOwlValueVRSC = estimatedNatiOwlValueVRSC;
    return result;
}