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

  let currencyArray = [];
  let priceArray = [
    {
      currencyId: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU",
      price: 84000,
      totalVolume: 0,
      name: "bitcoin",
    },
    {
      currencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
      price: 4,
      totalVolume: 0,
      name: "vrscoin",
    },
    {
      currencyId: "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM",
      price: 1,
      totalVolume: 0,
      name: "dai",
    }

  ]

  currencyArray.push({ priceArray });

  //console.log("currencyArray", { currencyArray })

  //let priceArray = getCoingeckoPrice();

  // testing
  getAllCurrenciesFromBaskets(priceArray);

  res.render('currencies', { currencyArray });

  //  res.render('currencies', { vrscOnline: false, varrrOnline: false, vdexOnline: false, currencyArray: currencyArray });
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
    console.log("her 1")
    let currencyArray = [];
    let priceArray = [
      {
        currencyId: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU",
        price: 0,
        totalVolume: 0,
        name: "bitcoin",
      }]

    currencyArray.push({ priceArray });

    priceArray = [
      {
        currencyId: "iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU",
        price: 0,
        totalVolume: 0,
        name: "vrscoin",
      }]

    currencyArray.push({ priceArray });
    console.log("currencyArray", { currencyArray })

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

