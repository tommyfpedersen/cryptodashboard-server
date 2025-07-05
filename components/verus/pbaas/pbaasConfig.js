// setup
export function getPbaasConfig() {

    return [
        { name: "VRSC",  maxSupply: 83540184, nativeBasePrice: 2.4, rpcBaseUrl: process.env.VERUS_REST_API, 
            priceAddrToAddr: 0.0001, priceBasketToReserve: 0.025, priceReserveToReserve: 0.050,
            priceId1RefNotYours: 80, priceId1RefYours: 60, priceId2RefAllYours: 40, priceId3RefAllYours: 20,
            priceSubId: 0.01, priceStorage: 0.01, priceCurrency: 200, pricePbaas: 10000
        },
        { name: "vARRR",  maxSupply: 9949725.96154223, nativeBasePrice: 0.15, rpcBaseUrl: process.env.VERUS_REST_API_VARRR, 
            priceAddrToAddr: 0.0001, priceBasketToReserve: 0.025, priceReserveToReserve: 0.050,
            priceId1RefNotYours: 80, priceId1RefYours: 60, priceId2RefAllYours: 40, priceId3RefAllYours: 20,
            priceSubId: 0.01, priceStorage: 0.01, priceCurrency: 200, pricePbaas: 10000
         },
        { name: "vDEX",  maxSupply: 865812.82792365, nativeBasePrice: 1.1, rpcBaseUrl: process.env.VERUS_REST_API_VDEX, 
            priceAddrToAddr: 0.0001, priceBasketToReserve: 0.025, priceReserveToReserve: 0.050,
            priceId1RefNotYours: 80, priceId1RefYours: 60, priceId2RefAllYours: 40, priceId3RefAllYours: 20,
            priceSubId: 0.01, priceStorage: 0.01, priceCurrency: 10, pricePbaas: "" },
        { name: "CHIPS",  maxSupply: 20048053.58478936, nativeBasePrice: 0.65, rpcBaseUrl: process.env.VERUS_REST_API_CHIPS, 
            priceAddrToAddr: 0.0001, priceBasketToReserve: 0.025, priceReserveToReserve: 0.050,
            priceId1RefNotYours: 80, priceId1RefYours: 60, priceId2RefAllYours: 40, priceId3RefAllYours: 20,
            priceSubId: 0.01, priceStorage: 0.01, priceCurrency: 77.7, pricePbaas: 7777 }
    ]
}