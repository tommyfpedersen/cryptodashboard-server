import dotenv from 'dotenv';
dotenv.config();

/* express */
import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;
import cors from 'cors';
app.use(express.json());
app.use(cors({
  origin: 'cryptodashboard.faldt.net' // <-- which domains can access this API
}));

let pageLoads = 0;


// components
import { writeToCache, readFromCache, isCacheReady } from './components/cache/cache.js';

import { getNodeStatus, getBlockAndFeePoolRewards, getAddressBalance, calculateStakingRewards, calculateMiningRewards, getCurrencyVolume, getCurrencyReserve, getMarketCapStats } from './components/verus/verus.js';
import { getVarrrNodeStatus, getVarrrBlockAndFeePoolRewards, getVarrrAddressBalance, calculateVarrrStakingRewards, calculateVarrrMiningRewards, getVarrrCurrencyVolume, getVarrrCurrencyReserve } from './components/varrr/varrr.js';
import { getVdexNodeStatus, getVdexBlockAndFeePoolRewards, getVdexAddressBalance, calculateVdexStakingRewards, calculateVdexMiningRewards, getVdexCurrencyVolume, getVdexCurrencyReserve } from './components/vdex/vdex.js';
import { calculateChipsMiningRewards, calculateChipsStakingRewards, getChipsAddressBalance, getChipsBlockAndFeePoolRewards, getChipsCurrencyReserve, getChipsNodeStatus } from './components/chips/chips.js';
import { getCoingeckoPrice } from './components/coingecko/coingecko.js';
import { getThreeFoldNodeArray } from './components/threefold/threefold.js';

import { getAllCurrenciesFromBaskets } from './components/verus/currencies/currencies.js';

/* currencies */
app.get('/currencies', async (req, res) => {

  /* page loads */
  pageLoads++;
  console.log("page loads: ", new Date().toLocaleString(), pageLoads);



  /* cache */
  let cacheReady = await isCacheReady();

  if (cacheReady) {
    let mainRenderData = {};

    // cache data
    const cacheData = await readFromCache('cache.json');
    mainRenderData = cacheData;
  }


  let coingeckoPriceArray = [
    {
      currencyId: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU",
      price: 109657,
      totalVolume: 0,
      name: "bitcoin",
    },
    {
      currencyId: "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X",
      price: 2644,
      totalVolume: 0,
      name: "ethereum",
    },
    {
      currencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
      price: 13.20,
      totalVolume: 0,
      name: "vrsccoin",
    },
    {
      currencyId: "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM",
      price: 1,
      totalVolume: 0,
      name: "dai",
    },
    {
      currencyId: "i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY",
      price: 1,
      totalVolume: 0,
      name: "usdt",
    },
    {
      currencyId: "iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2",
      price: 0.155,
      totalVolume: 0,
      name: "varrr",
    },
    {
      currencyId: "iL62spNN42Vqdxh8H5nrfNe8d6Amsnfkdx",
      price: 0.0059,
      totalVolume: 0,
      name: "nati",
    },
    {
      currencyId: "i9nLSK4S1U5sVMq4eJUHR1gbFALz56J9Lj",
      price: 1.0484,
      totalVolume: 0,
      name: "scrvUSD",
    },
    {
      currencyId: "i5VVBEi6efBrXMaeqFW3MTPSzbmpNLysGR",
      price: 0.38,
      totalVolume: 0,
      name: "pepecoinvETH",
    },

  ]

  let allCurrenciesFromBaskets = await getAllCurrenciesFromBaskets(coingeckoPriceArray);
  let currencyGroupList = [];

  const currencyNameList = new Set();

  // Find a list of currencies
  allCurrenciesFromBaskets.forEach((item) => {
    if (item.currencyReserve) {
      currencyNameList.add(item.currencyReserve.currencyName);
      item.currencyReserve.basketCurrencyArray.forEach((basketItem) => {
        currencyNameList.add(basketItem.currencyName);
      })
    }
  })

  // Group currencies by currencies names
  currencyNameList.forEach((currencyName) => {


    let currencyList = [];
    let currencyItem = {};
    let currencySupply = 0;
    let currencySupplyPriceUSD = 0;
    let totalVolume24Hours = 0;
    let totalVolume7Days = 0;
    let totalVolume30Days = 0;

    currencyItem.currencyName = currencyName;
    currencyItem.currencyList = currencyList;


    let coingeckoPriceAdded = [];

    allCurrenciesFromBaskets.forEach((item) => {

      if (item.currencyReserve) {
        if (item.currencyReserve.currencyName === currencyName) {

          currencyList.push({
            basketName: item.currencyReserve.currencyName,
            currencyName: item.currencyReserve.currencyName,
            currencyPriceUSD: item.currencyReserve.currencyPriceUSD < 1 ? Number(item.currencyReserve.currencyPriceUSD.toFixed(4)).toLocaleString() : Number(item.currencyReserve.currencyPriceUSD.toFixed(2)).toLocaleString(),
            currencySupply: item.currencyReserve.currencySupply < 1 ? Number(item.currencyReserve.currencySupply.toFixed(4)).toLocaleString() : Number(item.currencyReserve.currencySupply.toFixed(0)).toLocaleString(),
            currencySupplyPriceUSD: Number(item.currencyReserve.basketValueAnchorCurrencyUSD.toFixed(0)).toLocaleString(),
            currencyNetwork: item.currencyReserve.nativeCurrencyName,
            basketVolume24Hours: Number(item.currencyVolume24Hours.totalVolumeUSD.toFixed(0)).toLocaleString(),
            basketVolume7Days: Number(item.currencyVolume7Days.totalVolumeUSD.toFixed(0)).toLocaleString(),
            basketVolume30Days: Number(item.currencyVolume30Days.totalVolumeUSD.toFixed(0)).toLocaleString(),
            coingeckoprice: item.currencyReserve.coingeckoprice
          })

          totalVolume24Hours = totalVolume24Hours + item.currencyVolume24Hours.totalVolumeUSD;
          totalVolume7Days = totalVolume7Days + item.currencyVolume7Days.totalVolumeUSD;
          totalVolume30Days = totalVolume30Days + item.currencyVolume30Days.totalVolumeUSD;
          currencySupply = currencySupply + item.currencyReserve.currencySupply;
          currencySupplyPriceUSD = currencySupplyPriceUSD + item.currencyReserve.basketValueAnchorCurrencyUSD;
        }


        item.currencyReserve.basketCurrencyArray.forEach((basketItem) => {

          if (basketItem.currencyName === currencyName) {

            currencyList.push({
              basketName: item.currencyReserve.currencyName,
              currencyName: basketItem.currencyName,
              currencyNetwork: basketItem.network,
              currencyPriceUSD: basketItem.priceUSD < 1 ? Number(basketItem.priceUSD.toFixed(4)).toLocaleString() : Number(basketItem.priceUSD.toFixed(2)).toLocaleString(),
              currencySupply: basketItem.reserves < 1 ? Number(basketItem.reserves.toFixed(4)).toLocaleString() : Number(basketItem.reserves.toFixed(0)).toLocaleString(),
              currencySupplyPriceUSD: Number(basketItem.reservePriceUSD.toFixed(0)).toLocaleString(),
              basketVolume24Hours: Number(item.currencyVolume24Hours.totalVolumeUSD.toFixed(0)).toLocaleString(),
              basketVolume7Days: Number(item.currencyVolume7Days.totalVolumeUSD.toFixed(0)).toLocaleString(),
              basketVolume30Days: Number(item.currencyVolume30Days.totalVolumeUSD.toFixed(0)).toLocaleString()
            })

            //add coingecko price if exist
            if (basketItem.coingeckoprice && !coingeckoPriceAdded.includes(currencyName)) {


              currencyList.push({
                basketName: "Coingecko",
                currencyNetwork: "CEX/DEX",
                currencyPriceUSD: basketItem.coingeckoprice < 1 ? Number(basketItem.coingeckoprice.toFixed(4)).toLocaleString() : Number(basketItem.coingeckoprice.toFixed(2)).toLocaleString(),
                currencySupply: "-",
                currencySupplyPriceUSD: "",
                basketVolume24Hours: "",
                basketVolume7Days: "",
                basketVolume30Days: ""
              })
              coingeckoPriceAdded.push(currencyName);
            }

            totalVolume24Hours = totalVolume24Hours + item.currencyVolume24Hours.totalVolumeUSD;
            totalVolume7Days = totalVolume7Days + item.currencyVolume7Days.totalVolumeUSD;
            totalVolume30Days = totalVolume30Days + item.currencyVolume30Days.totalVolumeUSD;
            currencySupply = currencySupply + basketItem.reserves;
            currencySupplyPriceUSD = currencySupplyPriceUSD + basketItem.reservePriceUSD;
          }
        })
      }
    })

    currencyItem.currencySupply = currencySupply < 1 ? Number(currencySupply.toFixed(4)).toLocaleString() : Number(currencySupply.toFixed(0)).toLocaleString();
    currencyItem.currencySupplyPriceUSD = Number(currencySupplyPriceUSD.toFixed(0)).toLocaleString();
    // sort currency list by price
    currencyItem.currencyList.sort((a, b) => parseFloat(b.currencyPriceUSD.replace(/,/g, '')) - parseFloat(a.currencyPriceUSD.replace(/,/g, '')));

    // total basket volume usd
    currencyItem.totalVolume24Hours = Number(totalVolume24Hours.toFixed(0)).toLocaleString();
    currencyItem.totalVolume7Days = Number(totalVolume7Days.toFixed(0)).toLocaleString();
    currencyItem.totalVolume30Days = Number(totalVolume30Days.toFixed(0)).toLocaleString();

    currencyGroupList.push(currencyItem);
  })

  currencyGroupList.sort((a, b) => parseFloat(b.currencySupplyPriceUSD.replace(/,/g, '')) - parseFloat(a.currencySupplyPriceUSD.replace(/,/g, '')));

  res.render('currencies', { currencyGroupList });

  return;
});

/* pbaas */
app.get('/pbaas', async (req, res) => {

  /* page loads */
  pageLoads++;
  console.log("pbaas loads: ", new Date().toLocaleString(), pageLoads);

  let pbaasList = await getAllPbaas();

  pbaasList.sort((a, b) => parseFloat(b.marketCap.replace(/,/g, '')) - parseFloat(a.marketCap.replace(/,/g, '')));

  res.render('pbaas', { pbaasList });
  return;
});

/* earnings */
app.get('/earnings', async (req, res) => {

  /* page loads */
  pageLoads++;
  console.log("earnings loads: ", new Date().toLocaleString(), pageLoads);

  //let pbaasEarningsList = await getAllPbaasEarnings();
  let pbaasList = await getAllPbaas();

  // top cards
  let apyArray = getAPYArray(pbaasList);
  let dailyEarningsPerGHArray = getDailyEarningsPerGHArray(pbaasList)
  let networkHashrateArray = getNetworkHashrateArray(pbaasList);
  let feePoolRewardArray = getFeePoolRewardArray(pbaasList)

  pbaasList.sort((a, b) => parseFloat(b.networkHashrate.replace(/,/g, '')) - parseFloat(a.networkHashrate.replace(/,/g, '')));

  res.render('earnings', { pbaasList, apyArray, dailyEarningsPerGHArray, feePoolRewardArray, networkHashrateArray });
  return;
});

/* main */
app.get('/', async (req, res) => {
  res.redirect('/stats')
})


/* stats */
app.get('/stats', async (req, res) => {

  /* page loads */
  pageLoads++;
  console.log("page loads: ", new Date().toLocaleString(), pageLoads);

  /* cache */
  let cacheReady = await isCacheReady();
  let userData = {};


  if (cacheReady) {
    let mainRenderData = {};

    // cache data
    const cacheData = await readFromCache('cache.json');
    mainRenderData = cacheData;

    // user request
    /*  if user input - no cache  */
    if (req.query.address || req.query.vrscstakingamount || req.query.vrscmininghash || req.query.varrraddress || req.query.varrrstakingamount || req.query.varrrmininghash || req.query.vdexstakingamount || req.query.vdexmininghash || req.query.chipsaddress || req.query.chipsstakingamount || req.query.chipsmininghash || req.query.tfnodes) {
      const vrscNodeStatus = await getNodeStatus();
      const varrrNodeStatus = await getVarrrNodeStatus();
      const vdexNodeStatus = await getVdexNodeStatus();
      const chipsNodeStatus = await getChipsNodeStatus();
      /* Get price from coingecko */
      let coingeckoPriceArray = await getCoingeckoPrice();
      let currencyReserveBridge = await getCurrencyReserve("bridge.veth", coingeckoPriceArray);

      /* verus */
      if (vrscNodeStatus.online === true) {
        /* Get address balance */
        const verusAddressBalance = await getAddressBalance(req.query.address);

        /* Get block and fee pool rewards */
        const blockandfeepoolrewards = await getBlockAndFeePoolRewards();
        const currentBlock = blockandfeepoolrewards.block;

        /* Get Coinsupply - marketcap */
        const coinSupply = await getMarketCapStats(currentBlock, currencyReserveBridge.vrscBridgePrice)

        /* Calculate staking rewards */
        const stakingRewards = await calculateStakingRewards(coinSupply.totalSupply, blockandfeepoolrewards.stakingsupply, req.query.vrscstakingamount, currencyReserveBridge.vrscBridgePrice);

        /* Calculate mining rewards */
        const miningRewards = await calculateMiningRewards(blockandfeepoolrewards.networkhashps, req.query.vrscmininghash, currencyReserveBridge.vrscBridgePrice);

        userData = {
          getAddressBalanceArray: verusAddressBalance.getAddressBalanceArray,
          getAddress: verusAddressBalance.verusAddress === "none" ? "" : verusAddressBalance.verusAddress,
          stakingAmount: stakingRewards.stakingAmount,
          stakingRewardsArray: stakingRewards.stakingArray,
          vrscMiningHash: miningRewards.vrscMiningHash,
          miningRewardsArray: miningRewards.miningArray,
        }
      }


      /* chips */
      if (chipsNodeStatus.online === true) {

        /* Get address balance */
        const chipsAddressBalance = await getChipsAddressBalance(req.query.chipsaddress);

        /* Get block and fee pool rewards */
        const chipsblockandfeepoolrewards = await getChipsBlockAndFeePoolRewards();
        const currentBlock = chipsblockandfeepoolrewards.block;

        /* Get bridge.Chips volume and reserve info */
        const currencyReserveChipsBridge = await getChipsCurrencyReserve("bridge.chips", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice, currencyReserveBridge.estimatedBridgeValueUSD);

        const chipsBridgePrice = currencyReserveChipsBridge.currencyBridgeChipsArray.find(item => item.currencyName === 'CHIPS').price;

        /* Calculate chips staking rewards */
        const chipsStakingRewards = await calculateChipsStakingRewards(chipsblockandfeepoolrewards.stakingsupply, req.query.chipsstakingamount, chipsBridgePrice);

        /* Calculate chips mining rewards */
        const chipsMiningRewards = await calculateChipsMiningRewards(chipsblockandfeepoolrewards.networkhashps, req.query.chipsmininghash, chipsBridgePrice);

        userData = {
          ...userData,
          getChipsAddressBalanceArray: chipsAddressBalance.getAddressBalanceArray,
          getChipsAddress: chipsAddressBalance.verusAddress === "none" ? "" : chipsAddressBalance.verusAddress,
          chipsStakingAmount: chipsStakingRewards.stakingAmount,
          chipsStakingRewardsArray: chipsStakingRewards.stakingArray,
          chipsMiningHash: chipsMiningRewards.chipsMiningHash,
          chipsMiningRewardsArray: chipsMiningRewards.miningArray,
        }
      }


      /* varrr */
      if (varrrNodeStatus.online === true) {

        /* Get address balance */
        const varrrAddressBalance = await getVarrrAddressBalance(req.query.varrraddress);

        /* Get block and fee pool rewards */
        const varrrblockandfeepoolrewards = await getVarrrBlockAndFeePoolRewards();
        const currentBlock = varrrblockandfeepoolrewards.block;

        /* Get bridge.varrr volume and reserve info */
        const currencyReserveVarrrBridge = await getVarrrCurrencyReserve("bridge.varrr", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice, currencyReserveBridge.estimatedBridgeValueUSD);

        const varrrBridgePrice = currencyReserveVarrrBridge.currencyVarrrBridgeArray.find(item => item.currencyName === 'vARRR').price;

        /* Calculate varrr staking rewards */
        const varrrStakingRewards = await calculateVarrrStakingRewards(varrrblockandfeepoolrewards.stakingsupply, req.query.varrrstakingamount, varrrBridgePrice);

        /* Calculate varrr mining rewards */
        const varrrMiningRewards = await calculateVarrrMiningRewards(varrrblockandfeepoolrewards.networkhashps, req.query.varrrmininghash, varrrBridgePrice);

        userData = {
          ...userData,
          getVarrrAddressBalanceArray: varrrAddressBalance.getAddressBalanceArray,
          getVarrrAddress: varrrAddressBalance.verusAddress === "none" ? "" : varrrAddressBalance.verusAddress,
          varrrStakingAmount: varrrStakingRewards.stakingAmount,
          varrrStakingRewardsArray: varrrStakingRewards.stakingArray,
          varrrMiningHash: varrrMiningRewards.varrrMiningHash,
          varrrMiningRewardsArray: varrrMiningRewards.miningArray,
        }
      }

      /* vdex */
      if (vdexNodeStatus.online === true) {

        /* Get address balance */
        const vdexAddressBalance = await getVdexAddressBalance(req.query.vdexaddress);

        /* Get block and fee pool rewards */
        const vdexblockandfeepoolrewards = await getVdexBlockAndFeePoolRewards();
        const currentBlock = vdexblockandfeepoolrewards.block;

        /* Get bridge.vdex volume and reserve info */
        const currencyReserveVdexBridge = await getVdexCurrencyReserve("bridge.vdex", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice, currencyReserveBridge.estimatedBridgeValueUSD);
        const vdexBridgePrice = currencyReserveVdexBridge.currencyBridgeArray.find(item => item.currencyName === 'vDEX').price;

        /* Calculate vdex staking rewards */
        const vdexStakingRewards = await calculateVdexStakingRewards(vdexblockandfeepoolrewards.stakingsupply, req.query.vdexstakingamount, vdexBridgePrice);

        /* Calculate vdex mining rewards */
        const vdexMiningRewards = await calculateVdexMiningRewards(vdexblockandfeepoolrewards.networkhashps, req.query.vdexmininghash, vdexBridgePrice);

        userData = {
          ...userData,
          getVdexAddressBalanceArray: vdexAddressBalance.getAddressBalanceArray,
          getVdexAddress: vdexAddressBalance.verusAddress === "none" ? "" : vdexAddressBalance.verusAddress,
          vdexStakingAmount: vdexStakingRewards.stakingAmount,
          vdexStakingRewardsArray: vdexStakingRewards.stakingArray,
          vdexMiningHash: vdexMiningRewards.vdexMiningHash,
          vdexMiningRewardsArray: vdexMiningRewards.miningArray,
        }
      }

      /* ThreeFold*/
      let threeFoldNodeArray = []
      let threefoldNodeString = "";
      if (req.query.tfnodes) {
        threefoldNodeString = decodeURIComponent(req.query.tfnodes);
        threeFoldNodeArray = await getThreeFoldNodeArray(threefoldNodeString);
      } else {
        threefoldNodeString = "none";
      }

      const threeFoldRenderData = {
        // ThreeFold
        threeFoldNodeArray: threeFoldNodeArray,
        threefoldNodeString: threefoldNodeString === "none" ? "" : threefoldNodeString
      }

      console.log("her I")
      // add userData to renderData
      mainRenderData = { ...mainRenderData, ...userData, ...threeFoldRenderData };
    }
    // console.log("her 1")
    // let currencyArray = [];
    // let priceArray = [
    //   {
    //     currencyId: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU",
    //     price: 0,
    //     totalVolume: 0,
    //     name: "bitcoin",
    //   }]

    // currencyArray.push({ priceArray });

    // priceArray = [
    //   {
    //     currencyId: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU",
    //     price: 0,
    //     totalVolume: 0,
    //     name: "vrscoin",
    //   }]

    // currencyArray.push({ priceArray });
    // console.log("currencyArray", { currencyArray })

    res.render('main', { currencyArray });
    return;
  } else {


    console.log("her II")

    res.render('main', { vrscOnline: false, varrrOnline: false, vdexOnline: false, currencyArray: currencyArray });
    return;
  }

})
// app.get('/:param', async (req, res) => {

//   // let detailRenderData = {};
//   // let result = getDetailData(param);
//   //  res.render('detail', { vrscOnline: false, varrrOnline: false, vdexOnline: false });

//   const param = req.params.param;
//   res.send(`You requested the path: ${param}`);
// });

/* dashboard */
app.get('/api/totalvolume', async (req, res) => {

  /* cache */
  let cacheReady = await isCacheReady();
  let result = {};
  let vrscVolumeArray = [];
  let usdVolumeArray = [];


  if (cacheReady) {
    // cache data
    const cacheData = await readFromCache('cache.json');

    //merging vrscVolumeArrays
    vrscVolumeArray = [
      ...cacheData.chipsBridgeVolumeInDollars30DaysArray,
      ...cacheData.varrrBridgeVolumeInDollars30DaysArray,
      ...cacheData.vdexBridgeVolumeInDollars30DaysArray
    ]
    console.log(vrscVolumeArray)
    //  mainRenderData = cacheData;
  }

  res.json(result);
})


/* hbs */
import hbs from 'hbs';
import path from 'path';
import { get } from 'http';
import { getAllPbaas } from './components/verus/pbaas/pbaas.js';
import { getAPYArray, getDailyEarningsPerGHArray, getFeePoolRewardArray, getNetworkHashrateArray } from './components/verus/pbaas/pbaasUtils.js';
const __dirname = path.resolve();

app.set('views', './views')
app.set('view engine', 'hbs')

// Register the partials
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

hbs.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});




app.use(express.static(path.join(__dirname, 'public'), {
  index: false,
  immutable: true,
  cacheControl: true,
  maxAge: "30d"
}));


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})

