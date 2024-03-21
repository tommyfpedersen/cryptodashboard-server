/* cache */
let cacheStartTime = Date.now();
let coolDownTime = 30000;
let estimatedCoingeckoBridgeValueCache = 0;
let estimatedCoingeckoBridgeValue = 0;

async function getCoingeckoPrice() {
    /* Total Bridge Value 4x DAI -  estimatedCoingeckoBridgeValue*/

    /* Get price from coingecko */
    // VRSC: i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV
    // DAI: iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM
    // MKR: iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4
    // ETH: i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X
    estimatedCoingeckoBridgeValue = 0;

    if (cacheStartTime + coolDownTime < Date.now()) {
        priceArray = [];

        let coingeckoPriceResponse = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin%2C%20verus-coin%2C%20dai%2C%20maker%2C%20ethereum&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en");
        const coingeckoPriceResult = await coingeckoPriceResponse.json();
        const coingeckoPrice = coingeckoPriceResult;

        if (coingeckoPrice) {
            if (coingeckoPrice.length > 0) {
                coingeckoPrice.forEach((item) => {
                    if (item.id === "bitcoin") {
                        bitcoinPrice = item.current_price.toLocaleString();
                    }
                    if (item.id === "verus-coin") {
                        vrscPrice = item.current_price.toLocaleString();
                        priceArray.push({
                            currencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
                            price: item.current_price
                        })
                    }
                    if (item.id === "dai") {
                        priceArray.push({
                            currencyId: "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM",
                            price: item.current_price
                        })
                    }
                    if (item.id === "maker") {
                        priceArray.push({
                            currencyId: "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4",
                            price: item.current_price
                        })
                    }
                    if (item.id === "ethereum") {
                        ethereumPrice = item.current_price.toLocaleString();
                        priceArray.push({
                            currencyId: "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X",
                            price: item.current_price
                        })
                    }
                })
            }
        }
    }
}

// function estimatedBridgeValue() {
//     if (cacheStartTime + coolDownTime < Date.now()) {

//         /* estimated value of bridge */
//         currencyBridgeArray.forEach((currency) => {
//             priceArray.forEach((price) => {
//                 if (currency.currencyId === price.currencyId) {
//                     estimatedCoingeckoBridgeValue = estimatedCoingeckoBridgeValue + (currency.reserves * price.price);
//                 }
//             })
//             currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 8 });
//         })
//         estimatedCoingeckoBridgeValueCache = (estimatedCoingeckoBridgeValue = Math.round(estimatedCoingeckoBridgeValue * 100) / 100).toLocaleString();
//         cacheStartTime = Date.now();
//     }
// }

module.exports = { getCoingeckoPrice };