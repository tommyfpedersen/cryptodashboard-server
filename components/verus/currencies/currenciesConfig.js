// setup
export function getCurrenciesConfig() {

    return [
        { blockchain: "vrsc", currencyName: "bridge.veth", anchorCurrencyId: "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM", anchorCurrencyName: "DAI.vETH", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        //{ blockchain: "vrsc", currencyName: "kaiju", mainanchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", secondaryanchorCurrencyId: "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
         { blockchain: "vrsc", currencyName: "pure", anchorCurrencyId: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU", anchorCurrencyName: "tBTC.vETH",  currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        // { blockchain: "vrsc", currencyName: "switch", mainanchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        // { blockchain: "vrsc", currencyName: "nati", mainanchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        // { blockchain: "vrsc", currencyName: "nati🦉", mainanchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
      //   { blockchain: "vrsc", currencyName: "supervrsc", anchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", anchorCurrencyName: "VRSC", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        // { blockchain: "vrsc", currencyName: "vyield", mainanchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        // { blockchain: "vrsc", currencyName: "Kek🐸", mainanchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
         { blockchain: "vrsc", currencyName: "SUPER🛒", anchorCurrencyId: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU",  anchorCurrencyName: "tBTC.vETH", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        // { blockchain: "varrr", currencyName: "bridge.varrr", mainanchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API_VARRR },
        // { blockchain: "vdex", currencyName: "bridge.vdex", mainanchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API_VDEX },
        // { blockchain: "chips", currencyName: "bridge.chips", mainanchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API_CHIPS }
    ]
}