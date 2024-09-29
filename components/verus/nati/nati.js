import dotenv from 'dotenv';
dotenv.config();

export async function currencyReserveNati(priceArray, vrscBridgePrice) {
    let result = {};

    /* NATI reserves */
    const getcurrencyResponse = await fetch(process.env.VERUS_REST_API + "multichain/getcurrency/nati");
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let currencyNatiArray = [];

    let NATIvETHCoingeckoPrice = 0;
    let vrscCoingeckoPrice = 0;
    let NATIBasketPrice =0;
    let vrscReserve = 0;
    let natiReserve = 0;
    let NATIvETHReserve = 0;
    let estimatedNatiValueUSDNATI = 0;
    let estimatedNatiValueUSDVRSC = 0;
    let estimatedNatiValueVRSC = 0;
    let estimatedNatiSupply = getcurrency.bestcurrencystate.supply;
    let estimatedNatiValueUSD = 0;

    priceArray.forEach((priceElm) => {
        if (priceElm.currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
            vrscCoingeckoPrice = priceElm.price;
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
                        if (reservesCurrency.currencyid === "iL62spNN42Vqdxh8H5nrfNe8d6Amsnfkdx") {
                            NATIvETHReserve = reservesCurrency.reserves;
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
                            currency.weight = reservesCurrency.weight *100;
                            currency.priceinreserve = reservesCurrency.priceinreserve;
                            currency.origin = "NATI";
                            currency.network = "vrsc";

                            if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                currency.priceNative = Math.round(NATIvETHReserve / currency.reserves * 1000) / 1000;
                                currency.pricelabel = "NATI.vETH";
                                currency.price = vrscBridgePrice;
                            }
                            if (currencyId === "iL62spNN42Vqdxh8H5nrfNe8d6Amsnfkdx") {
                                currency.priceNative = (Math.round(vrscReserve / currency.reserves * 100000000) / 100000000 ).toFixed(5);
                                currency.pricelabel = "VRSC";
                                currency.price = NATIBasketPrice =(vrscBridgePrice * currency.priceNative).toFixed(5);
                            }
                        }

                        if (priceArray.length > 0) {
                            priceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                        currency.coingeckoprice = Math.round(vrscBridgePrice * 100) / 100;
                                        currency.coingeckoLabel = "Bridge.vETH";
                                    }
                                    if (currencyId === "iL62spNN42Vqdxh8H5nrfNe8d6Amsnfkdx") {
                                        currency.coingeckoprice = (Math.round(price.price * 100000000) / 100000000).toFixed(8);//Math.round(price.price.toFixed(10) * 10000) / 10000;//Math.round(price.price * 100000000) / 100000000;
                                        currency.coingeckoLabel = "Coingecko";
                                    }
                                }
                            })
                        }


                        if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            estimatedNatiValueUSDVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2)).toLocaleString();
                            estimatedNatiValueUSD = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 / estimatedNatiSupply * 100) / 100).toLocaleString();
                            estimatedNatiValueVRSC = (Math.round(vrscBridgePrice * reservesCurrency.reserves * 2 / estimatedNatiSupply / vrscBridgePrice * 100000000) / 100000000).toLocaleString();
                        }
                        if (reservesCurrency.currencyid === "iL62spNN42Vqdxh8H5nrfNe8d6Amsnfkdx") {
                            estimatedNatiValueUSDNATI = (Math.round(NATIvETHCoingeckoPrice * reservesCurrency.reserves * 2 * 10000)).toLocaleString();
                        }
                    })
                    currency.currencyId = currencyId;
                    currency.currencyName = item[1];
                    currencyNatiArray.push(currency);
                }




            })
        })
    }

    /* estimated value of Nati */
    currencyNatiArray.forEach((currency) => {
        currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 4 });
    })

    result.estimatedNatiSupply = estimatedNatiSupply;
    result.currencyNatiArray = currencyNatiArray;
    result.estimatedNatiValueUSDNATI = estimatedNatiValueUSDNATI;
    result.estimatedNatiValueUSDVRSC = estimatedNatiValueUSDVRSC;
    result.estimatedNatiValueUSD = estimatedNatiValueUSD;
    result.estimatedNatiValueVRSC = estimatedNatiValueVRSC;
    return result;
}