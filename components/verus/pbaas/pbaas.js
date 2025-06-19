import dotenv from 'dotenv';
dotenv.config();

import { getPbaasConfig } from './pbaasConfig.js';
import { getCurrenciesConfig } from './../currencies/currenciesConfig.js';

import { getMiningInfo, getCurrencyState, getCurrency, } from "../api/api.js";


export async function getAllPbaas() {
    const pbaasConfig = getPbaasConfig();
    const currenciesConfig = getCurrenciesConfig();

    let pbaasArray = [];



    for (let i = 0; i < pbaasConfig.length; i++) {
        console.log(pbaasConfig[i].name)
        const miningInfo = await getMiningInfo(pbaasConfig[i].rpcBaseUrl);
        const currencyInfo = await getCurrency(pbaasConfig[i].rpcBaseUrl, pbaasConfig[i].name)

        let currenciesOnBlockchain = currenciesConfig.filter((currency) => {
            return currency.blockchain === pbaasConfig[i].name
        })

        pbaasArray.push({
            blockchain: pbaasConfig[i].name,
            blockheight: miningInfo.blocks,
            blocktime: currencyInfo.blocktime,
            currenciesCount: currenciesOnBlockchain.length 
        })

    }

    // pbaasConfig.map((blockchain)=>  {


    //     

    // })


    return pbaasArray;
}