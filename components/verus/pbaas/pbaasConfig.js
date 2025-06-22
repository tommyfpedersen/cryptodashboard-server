// setup
export function getPbaasConfig() {

    return [
        { name: "VRSC",  maxSupply: 83540184, nativeBasePrice: 2.4, rpcBaseUrl: process.env.VERUS_REST_API },
        { name: "vARRR",  maxSupply: 9949725.96154223, nativeBasePrice: 0.15, rpcBaseUrl: process.env.VERUS_REST_API_VARRR },
        { name: "vDEX",  maxSupply: 865812.82792365, nativeBasePrice: 1.1, rpcBaseUrl: process.env.VERUS_REST_API_VDEX },
        { name: "CHIPS",  maxSupply: 20048053.58478936, nativeBasePrice: 0.65, rpcBaseUrl: process.env.VERUS_REST_API_CHIPS }
    ]
}