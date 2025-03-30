// setup
export function getCurrenciesConfig() {

    return [

        // VRSC
        { blockchain: "vrsc", nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyName: "bridge.veth", anchorCurrencyId: "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM", anchorCurrencyName: "DAI.vETH",  currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        { blockchain: "vrsc", nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyName: "kaiju", anchorCurrencyId: "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY", anchorCurrencyName: "vUSDT.vETH", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
    //    { blockchain: "vrsc", nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyName: "pure", anchorCurrencyId: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU", anchorCurrencyName: "tBTC.vETH", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        // { blockchain: "vrsc", currencyName: "switch", anchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        { blockchain: "vrsc", nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyName: "nati", anchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", anchorCurrencyName: "VRSC",  note: "1 NATI.vETH on Verus = 10,000 NATI ERC20 on Ethereum", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        // scale test
        //{ blockchain: "vrsc", nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyName: "nati", anchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", anchorCurrencyName: "VRSC", currencyScale:[{currencyId: "iL62spNN42Vqdxh8H5nrfNe8d6Amsnfkdx", scale: 10000}],  note: "1 NATI.vETH on Verus = 10,000 NATI ERC20 on Ethereum", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
     //    { blockchain: "vrsc", currencyName: "nati🦉", mainanchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        //   { blockchain: "vrsc", currencyName: "supervrsc", anchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", anchorCurrencyName: "VRSC", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        // { blockchain: "vrsc", currencyName: "vyield", mainanchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        // { blockchain: "vrsc", currencyName: "Kek🐸", mainanchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        
       // { blockchain: "vrsc", nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyName: "SUPER🛒", anchorCurrencyId: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU", anchorCurrencyName: "tBTC.vETH", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },

        // VARRR
//        { blockchain: "varrr", nativeCurrencyId: "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2", currencyName: "bridge.varrr", anchorCurrencyId: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU", anchorCurrencyName: "tBTC.vETH", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API_VARRR },

        // VDEX
  //      { blockchain: "vdex", nativeCurrencyId: "iHog9UCTrn95qpUBFCZ7kKz7qWdMA8MQ6N", currencyName: "bridge.vdex", anchorCurrencyId: "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM", anchorCurrencyName: "DAI.vETH", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API_VDEX },
        
        // CHIPS
    //    { blockchain: "chips", nativeCurrencyId: "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP", currencyName: "bridge.chips", anchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", anchorCurrencyName: "VRSC", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API_CHIPS },
        
    ]
}