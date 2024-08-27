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
export async function getCoingeckoPrice() {

    if (cacheStartTime + coolDownTime < Date.now()) {
        priceArray = [];
        let coingeckoPriceResponse = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin%2C%20verus-coin%2C%20dai%2C%20maker%2C%20ethereum%2C%20usd-coin%2C%20euro-coin%2C%20pirate-chain%2C%20tether%2C%20illuminaticoin&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en&order=market_cap_desc&precision=8");
        const coingeckoPriceResult = await coingeckoPriceResponse.json();
        const coingeckoPrice = coingeckoPriceResult;

        if (coingeckoPrice) {
            if (coingeckoPrice.length > 0) {
                coingeckoPrice.forEach((item) => {
                    if (item.id === "bitcoin") {
                        //  bitcoinPrice = item.current_price.toLocaleString();
                        priceArray.push({
                            currencyId: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU",
                            price: Math.round(item.current_price*100)/100,
                            name: "bitcoin",
                            origin: "Coingecko",
                            network: "btc"
                        })
                    }
                    if (item.id === "verus-coin") {
                        //  vrscPrice = item.current_price.toLocaleString();
                        priceArray.push({
                            currencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
                            price: Math.round(item.current_price*100)/100,
                            name: "verus-coin",
                            origin: "Coingecko",
                            network: "vrsc"
                        })
                    }
                    if (item.id === "dai") {
                        priceArray.push({
                            currencyId: "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM",
                            price: Math.round(item.current_price*100)/100,
                            name: "dai",
                            origin: "Coingecko"
                        })
                    }
                    if (item.id === "maker") {
                        priceArray.push({
                            currencyId: "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4",
                            price: Math.round(item.current_price*100)/100,
                            name: "maker",
                            origin: "Coingecko",
                            network: "ethereum"
                        })
                    }
                    if (item.id === "ethereum") {
                        // ethereumPrice = item.current_price.toLocaleString();
                        priceArray.push({
                            currencyId: "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X",
                            price: Math.round(item.current_price*100)/100,
                            name: "ethereum",
                            origin: "Coingecko",
                            network: "ethereum"
                        })
                    }
                    if (item.id === "usd-coin") {
                        //  ethereumPrice = item.current_price.toLocaleString();
                        priceArray.push({
                            currencyId: "i61cV2uicKSi1rSMQCBNQeSYC3UAi9GVzd",
                            price: Math.round(item.current_price*100)/100,
                            name: "usdc",
                            origin: "Coingecko"
                        })
                    }
                    if (item.id === "euro-coin") {
                        //  ethereumPrice = item.current_price.toLocaleString();
                        priceArray.push({
                            currencyId: "iC5TQFrFXSYLQGkiZ8FYmZHFJzaRF5CYgE",
                            price: Math.round(item.current_price*100)/100,
                            name: "eurc",
                            origin: "Coingecko"
                        })
                    }
                    if (item.id === "pirate-chain") {
                        //  ethereumPrice = item.current_price.toLocaleString();
                        priceArray.push({
                            currencyId: "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2",
                            price: Math.round(item.current_price*100)/100,
                            name: "pirate-chain",
                            origin: "Coingecko",
                            network: "piratechain"
                        })
                    }
                    if (item.id === "tether") {
                        priceArray.push({
                            currencyId: "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY",
                            price: Math.round(item.current_price*100)/100,
                            name: "usdt",
                            origin: "Coingecko"
                        })
                    }
                    if (item.id === "illuminaticoin") {
                        priceArray.push({
                            currencyId: "iL62spNN42Vqdxh8H5nrfNe8d6Amsnfkdx",
                            price: item.current_price,
                            name: "nati",
                            origin: "Coingecko"
                        })
                    }
                })
            }
        }
    }
    return priceArray;
}