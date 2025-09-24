// setup
export function getPbaasConfig() {

    return [
        {
            name: "CHIPS", maxSupply: 20048053.58478936, rpcBaseUrl: process.env.VERUS_REST_API_CHIPS,
            priceAddrToAddr: 0.0001, priceBasketToReserve: 0.025, priceReserveToReserve: 0.050,
            priceId1RefNotYours: 62.16, priceId1RefYours: 46.62, priceId2RefAllYours: 31.08, priceId3RefAllYours: 15.54,
            priceSubId: 0.01, priceStorage: 0.01, priceCurrency: 77.7, pricePbaas: null,
            links: [
                {title: "CHIPS Website", href: "https://chips.cash"},
                {title: "CHIPS Explorer", href: "https://explorer.chips.cash"},
                {title: "CHIPS Discord", href: "https://discord.gg/9XMYRXUUSP"}
            ]
        },
        {
            name: "vARRR", maxSupply: 9949725.96154223, rpcBaseUrl: process.env.VERUS_REST_API_VARRR,
            priceAddrToAddr: 0.0001, priceBasketToReserve: 0.025, priceReserveToReserve: 0.050,
            priceId1RefNotYours: 80, priceId1RefYours: 60, priceId2RefAllYours: 40, priceId3RefAllYours: 20,
            priceSubId: 0.01, priceStorage: 0.01, priceCurrency: 200, pricePbaas: null, stakingNote: "Needs vARRR ID",
            links: [
                {title: "Pirate Chain Website", href: "https://piratechain.com"},
                {title: "vARRR Explorer", href: "https://varrrexplorer.piratechain.com/"},
                {title: "Pirate Chain Discord", href: "https://piratechain.com/discord"}
            ]
        },
        {
            name: "vDEX", maxSupply: 865812.82792365, rpcBaseUrl: process.env.VERUS_REST_API_VDEX,
            priceAddrToAddr: 0.0001, priceBasketToReserve: 0.025, priceReserveToReserve: 0.050,
            priceId1RefNotYours: 0.80, priceId1RefYours: 0.60, priceId2RefAllYours: 0.40, priceId3RefAllYours: null,
            priceSubId: 0.01, priceStorage: 0.01, priceCurrency: 10, pricePbaas: null,
            links: [
                {title: "Verus Website", href: "https://verus.io"},
                {title: "vDEX Explorer", href: "https://explorer.vdex.to"},
                {title: "Verus Discord", href: "https://verus.io/discord"}
            ]
        },
        {
            name: "VRSC", maxSupply: 83540184, rpcBaseUrl: process.env.VERUS_REST_API,
            priceAddrToAddr: 0.0001, priceBasketToReserve: 0.025, priceReserveToReserve: 0.050,
            priceId1RefNotYours: 80, priceId1RefYours: 60, priceId2RefAllYours: 40, priceId3RefAllYours: 20,
            priceSubId: 0.01, priceStorage: 0.01, priceCurrency: 200, pricePbaas: 10000,
            links: [
                {title: "Verus Website", href: "https://verus.io"},
                {title: "Verus Explorer", href: "https://insight.verus.io"},
                {title: "Verus Discord", href: "https://verus.io/discord"},
                {title: "Verus Raw Trading", href: "https://raw.verus.trading"},
                {title: "Verus Wisdom", href: "https://veruswisdom.com"}
            ]
        }
    ]
}