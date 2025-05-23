// setup
export function getCurrenciesConfig() {

    return [

        // VRSC
         { blockchain: "VRSC", nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyName: "Bridge.vETH", anchorCurrencyId: "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM", anchorCurrencyName: "DAI.vETH",  currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
         { blockchain: "VRSC", nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyName: "Kaiju", anchorCurrencyId: "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY", anchorCurrencyName: "vUSDT.vETH", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
         { blockchain: "VRSC", nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyName: "Pure", anchorCurrencyId: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU", anchorCurrencyName: "tBTC.vETH", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        // { blockchain: "VRSC", nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyName: "Switch", anchorCurrencyId: "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM", anchorCurrencyName: "DAI.vETH", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        // { blockchain: "VRSC", nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyName: "NATI", anchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", anchorCurrencyName: "VRSC",  note: "1 NATI.vETH on Verus = 10,000 NATI ERC20 on Ethereum", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
         { blockchain: "VRSC", nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyName: "NATI🦉", anchorCurrencyId: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU", anchorCurrencyName: "tBTC.vETH",  note: "1 NATI.vETH on Verus = 10,000 NATI ERC20 on Ethereum", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        // { blockchain: "VRSC", nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyName: "SUPERVRSC", anchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", anchorCurrencyName: "VRSC", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        // { blockchain: "VRSC", nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyName: "vYIELD", anchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", anchorCurrencyName: "VRSC", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        // { blockchain: "VRSC", nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyName: "Kek🐸", anchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", anchorCurrencyName: "VRSC", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
        // // scale test
        //{ blockchain: "vrsc", nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyName: "nati", anchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", anchorCurrencyName: "VRSC", currencyScale:[{currencyId: "iL62spNN42Vqdxh8H5nrfNe8d6Amsnfkdx", scale: 10000}],  note: "1 NATI.vETH on Verus = 10,000 NATI ERC20 on Ethereum", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },
      
        // { blockchain: "VRSC", nativeCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", currencyName: "SUPER🛒", anchorCurrencyId: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU", anchorCurrencyName: "tBTC.vETH", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API },

        // // VARRR
        // { blockchain: "vARRR", nativeCurrencyId: "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2", currencyName: "Bridge.vARRR", anchorCurrencyId: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU", anchorCurrencyName: "tBTC.vETH", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API_VARRR },

        // // VDEX
        // { blockchain: "vDEX", nativeCurrencyId: "iHog9UCTrn95qpUBFCZ7kKz7qWdMA8MQ6N", currencyName: "Bridge.vDEX", anchorCurrencyId: "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM", anchorCurrencyName: "DAI.vETH", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API_VDEX },
        
        // // CHIPS
        // { blockchain: "CHIPS", nativeCurrencyId: "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP", currencyName: "Bridge.CHIPS", anchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", anchorCurrencyName: "VRSC", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API_CHIPS },
        // { blockchain: "CHIPS", nativeCurrencyId: "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP", currencyName: "Bankroll.CHIPS", anchorCurrencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV", anchorCurrencyName: "VRSC", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API_CHIPS },
        // { blockchain: "CHIPS", nativeCurrencyId: "iJ3WZocnjG9ufv7GKUA4LijQno5gTMb7tP", currencyName: "Highroller.CHIPS", anchorCurrencyId: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU", anchorCurrencyName: "tBTC.vETH", currencyIcon: "", rpcBaseUrl: process.env.VERUS_REST_API_CHIPS },
        
    ]
}