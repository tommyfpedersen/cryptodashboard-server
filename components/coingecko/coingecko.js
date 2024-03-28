/* cache */
let cacheStartTime = Date.now();
let coolDownTime = 3000;
let priceArray = [];

/* Get price from coingecko */
// VRSC: i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV
// DAI: iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM
// MKR: iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4
// ETH: i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X
// BTC: iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU
async function getCoingeckoPrice() {

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
                        priceArray.push({
                            currencyId: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU",
                            price: item.current_price,
                            name: "bitcoin"
                        })
                    }
                    if (item.id === "verus-coin") {
                        vrscPrice = item.current_price.toLocaleString();
                        priceArray.push({
                            currencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
                            price: item.current_price,
                            name: "verus-coin"
                        })
                    }
                    if (item.id === "dai") {
                        priceArray.push({
                            currencyId: "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM",
                            price: item.current_price,
                            name: "dai"
                        })
                    }
                    if (item.id === "maker") {
                        priceArray.push({
                            currencyId: "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4",
                            price: item.current_price,
                            name: "maker"
                        })
                    }
                    if (item.id === "ethereum") {
                        ethereumPrice = item.current_price.toLocaleString();
                        priceArray.push({
                            currencyId: "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X",
                            price: item.current_price,
                            name: "ethereum"
                        })
                    }
                })
            }
        }
    }
    return priceArray;
}

module.exports = { getCoingeckoPrice };