// setup
export function getPbaasConfig() {

    return [
        { name: "VRSC", rpcBaseUrl: process.env.VERUS_REST_API },
        { name: "vARRR", rpcBaseUrl: process.env.VERUS_REST_API_VARRR },
        { name: "vDEX", rpcBaseUrl: process.env.VERUS_REST_API_VDEX },
        { name: "CHIPS", rpcBaseUrl: process.env.VERUS_REST_API_CHIPS }
    ]
}