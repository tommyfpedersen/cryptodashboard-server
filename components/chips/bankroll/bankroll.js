import dotenv from 'dotenv';
dotenv.config();

export async function currencyReserveBankroll(priceArray, vrscBasePrice, chipsBasePrice) {
    let result = {};

    /* Bankroll reserves */
    const getcurrencyResponse = await fetch(process.env.VERUS_REST_API_CHIPS + "multichain/getcurrency/bankroll.chips");
    const getcurrencyResult = await getcurrencyResponse.json();
    const getcurrency = getcurrencyResult.result;

    let currencyBankrollArray = [];

    let chipsCoingeckoPrice = 0;
    let vrscCoingeckoPrice = 0;
    let scrvusdCoingeckoPrice = 0;
    let daivETHCoingeckoPrice = 0;

    let vrscBasketPrice = 0;

    let chipsReserve = 0;
    let vrscReserve = 0;
    let daivETHReserve = 0;


    let estimatedBankrollValueUSDCHIPS = 0;
    let estimatedBankrollValueCHIPS = 0;
    let estimatedBankrollReserveValueUSDCHIPS = 0;
    let estimatedBankrollReserveValueUSD = 0


    let estimatedBankrollValueUSDVRSC = 0;
    let estimatedBankrollValueVRSC = 0;
    let estimatedBankrollSupply = getcurrency.bestcurrencystate.supply;
    let estimatedBankrollValueUSD = 0;
    let estimatedBankrollReserveValueUSDVRSC = 0;

    priceArray.forEach((priceElm) => {
        if (priceElm.currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
            vrscCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
            daivETHCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP") {
            chipsCoingeckoPrice = priceElm.price;
        }
        if (priceElm.currencyId === "i9nLSK4S1U5sVMq4eJUHR1gbFALz56J9Lj") {
            scrvusdCoingeckoPrice = priceElm.price;
        }
    })


    if (getcurrency) {
        let currencyIdArray = Object.values(getcurrency.currencies);
        let currencyNames = Object.entries(getcurrency.currencynames);


        currencyIdArray.forEach((currencyId) => {
            currencyNames.forEach((item) => {
                let currency = {}
                if (item[0] === currencyId) {
                    getcurrency.bestcurrencystate.reservecurrencies.forEach((reservesCurrency) => {
                        if (reservesCurrency.currencyid === "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP") {
                            chipsReserve = reservesCurrency.reserves;
                        }
                        if (reservesCurrency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                            vrscReserve = reservesCurrency.reserves;
                        }
                        if (reservesCurrency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                            daivETHReserve = reservesCurrency.reserves;
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
                            currency.weight = reservesCurrency.weight * 100;
                            currency.priceinreserve = reservesCurrency.priceinreserve;
                            currency.origin = "Bankroll.CHIPS";
                            currency.network = "CHIPS";

                            if (currencyId === "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP") {
                                currency.priceNative = Math.round((daivETHReserve * 1 / 0.25) / (currency.reserves * 1 / 0.25) * 100) / 100;
                                currency.price = Math.round(chipsBasePrice * 100) / 100;
                                currency.priceLabel = "Bridge.CHIPS";//"SUPER🛒";
                            }
                            if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                currency.priceNative = Math.round((daivETHReserve * 1 / 0.25) / (currency.reserves * 1 / 0.25) * 100) / 100;
                            }
                            if (currencyId === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                                currency.priceNative = Math.round((daivETHReserve * 1 / 0.25) / (currency.reserves * 1 / 0.25) * 100) / 100;
                            }
                            if (currencyId === "i9nLSK4S1U5sVMq4eJUHR1gbFALz56J9Lj") {
                                currency.priceNative = Math.round((daivETHReserve * 1 / 0.25) / (currency.reserves * 1 / 0.25) * 100) / 100;
                            }
                        }

                        if (priceArray.length > 0) {
                            priceArray.forEach((price) => {
                                if (price.currencyId === currencyId) {
                                    if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                                        currency.price = Math.round(vrscBasePrice * 100) / 100;
                                        currency.priceLabel = "Bridge.vETH";
                                    }
                                    if (currencyId === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                                        currency.price = Math.round(price.price * 100) / 100;
                                        currency.priceLabel = "Coingecko";
                                    }
                                    if (currencyId === "i9nLSK4S1U5sVMq4eJUHR1gbFALz56J9Lj") {
                                        currency.price = Math.round(price.price * 100) / 100;
                                        currency.priceLabel = "Coingecko";
                                    }
                                }
                            })
                        }


                         if (reservesCurrency.currencyid === "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP") {
                             estimatedBankrollValueUSDCHIPS = (Math.round(chipsBasePrice * reservesCurrency.reserves * 4)).toLocaleString();
                             estimatedBankrollValueCHIPS = (Math.round(chipsBasePrice * reservesCurrency.reserves * 4 / estimatedBankrollSupply / chipsBasePrice * 100000000) / 100000000).toLocaleString();
                             estimatedBankrollReserveValueUSDCHIPS = (Math.round(chipsBasePrice * reservesCurrency.reserves * 4));
                         }
                        if (reservesCurrency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
                            estimatedBankrollValueUSD = (Math.round(1 * reservesCurrency.reserves * 4 / estimatedBankrollSupply * 100) / 100).toLocaleString();
                            estimatedBankrollReserveValueUSD = (Math.round( reservesCurrency.reserves * 4 * 100) / 100).toLocaleString();
                        }
                    })
                    currency.currencyId = currencyId;
                    currency.currencyName = item[1];
                    currencyBankrollArray.push(currency);
                }
            })
        })
    }

    /* estimated value of Bankroll */
    currencyBankrollArray.forEach((currency) => {
        currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 4 });
    })

    result.estimatedBankrollSupply = estimatedBankrollSupply
    result.currencyBankrollArray = currencyBankrollArray;
    result.estimatedBankrollValueUSDCHIPS = estimatedBankrollValueUSDCHIPS;
    result.estimatedBankrollValueCHIPS = estimatedBankrollValueCHIPS
    result.estimatedBankrollValueUSD = estimatedBankrollValueUSD;
    result.estimatedBankrollReserveValueUSD = estimatedBankrollReserveValueUSD;
    result.estimatedBankrollReserveValueUSDCHIPS = estimatedBankrollReserveValueUSDCHIPS;
    //result.estimatedBankrollValueVRSC = estimatedBankrollValueVRSC;
    // result.estimatedBankrollValueUSDVRSC = estimatedBankrollValueUSDVRSC;
    // result.estimatedBankrollReserveValueUSDVRSC = estimatedBankrollReserveValueUSDVRSC;
    return result;
}