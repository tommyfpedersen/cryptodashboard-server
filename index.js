require('dotenv').config();

/* express */
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
app.use(express.json());
app.use(cors({
  origin: 'cryptodashboard.faldt.net' // <-- which domains can access this API
}));

let pageLoads = 0;

// components
const { getNodeStatus, getBlockAndFeePoolRewards, getAddressBalance, calculateStakingRewards, calculateMiningRewards, getCurrencyVolume, getCurrencyReserve, getMarketCapStats } = require('./components/verus/verus');
const { getVarrrNodeStatus, getVarrrBlockAndFeePoolRewards, getVarrrAddressBalance, calculateVarrrStakingRewards, calculateVarrrMiningRewards, getVarrrCurrencyVolume, getVarrrCurrencyReserve } = require('./components/varrr/varrr');
const { getVdexNodeStatus, getVdexBlockAndFeePoolRewards, getVdexAddressBalance, calculateVdexStakingRewards, calculateVdexMiningRewards, getVdexCurrencyVolume, getVdexCurrencyReserve } = require('./components/vdex/vdex');
const { getCoingeckoPrice } = require('./components/coingecko/coingecko');
const { getThreeFoldNodeArray } = require('./components/threefold/threefold');

/* RenderData def*/
// let mainRenderData = {};
// let priceArray = [];
// let vrscReserveArray = [];


/* cache */
let cacheReady = false;
let cacheTime = 20000;
let cacheTimeStamp = Date.now() + cacheTime;


/* dashboard */
app.get('/', async (req, res) => {

  /* page loads */
  pageLoads++;
  console.log("page loads: ", new Date().toLocaleString(), pageLoads);

  /* cache */
  if (cacheTimeStamp < Date.now()) {

    //clear cache
    cacheTimeStamp = Date.now() + cacheTime;
    cacheReady = false;

    // clear render data
    // mainRenderData = {};
    // priceArray.length = 0;
    // vrscReserveArray.length = 0;

  }

  /* RenderData def*/
  let mainRenderData = {};
  let priceArray = [];
  let vrscReserveArray = [];


  /* Get price from coingecko */
  let coingeckoPriceArray = await getCoingeckoPrice();
  let bitcoinPriceItem = coingeckoPriceArray.find(item => item.name === "bitcoin");
  let bitcoinPrice = bitcoinPriceItem?.price.toLocaleString() || "0";
  priceArray = [...coingeckoPriceArray];


  /* Verus */
  let vrscRenderData = {};
  let currencyReserveBridge = {};
  const vrscNodeStatus = await getNodeStatus();

  if (vrscNodeStatus.online === true) {
    /* Get address balance */
    const verusAddressBalance = await getAddressBalance(req.query.address);

    /* Get block and fee pool rewards */
    const blockandfeepoolrewards = await getBlockAndFeePoolRewards();
    const currentBlock = blockandfeepoolrewards.block;

    if (cacheTimeStamp > Date.now()) {

    }

    /* Get bridge.veth volume and reserve info */
    const vrscVolume24Hours = await getCurrencyVolume("bridge.veth", currentBlock - 1440, currentBlock, 60, "DAI.vETH");
    const vrscVolume7Days = await getCurrencyVolume("bridge.veth", currentBlock - 1440 * 7, currentBlock, 1440, "DAI.vETH");
    const vrscVolume30Days = await getCurrencyVolume("bridge.veth", currentBlock - 1440 * 30, currentBlock, 1440, "DAI.vETH");

    currencyReserveBridge = await getCurrencyReserve("bridge.veth", coingeckoPriceArray);

    /* Get Coinsupply - marketcap */
    const coinSupply = await getMarketCapStats(currentBlock, currencyReserveBridge.vrscBridgePrice)

    /* Calculate staking rewards */
    const stakingRewards = await calculateStakingRewards(coinSupply.totalSupply, blockandfeepoolrewards.stakingsupply, req.query.vrscstakingamount, currencyReserveBridge.vrscBridgePrice);

    /* Calculate mining rewards */
    const miningRewards = await calculateMiningRewards(blockandfeepoolrewards.networkhashps, req.query.vrscmininghash, currencyReserveBridge.vrscBridgePrice);

    /* Get Kaiju volume and reserve info */
    const currencyReserveKaiju = await getCurrencyReserve("kaiju", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice);
    const kaijuVolume24Hours = await getCurrencyVolume("kaiju", currentBlock - 1440, currentBlock, 60, "vUSDT.vETH");
    const kaijuVolume7Days = await getCurrencyVolume("kaiju", currentBlock - 1440 * 7, currentBlock, 1440, "vUSDT.vETH");
    const kaijuVolume30Days = await getCurrencyVolume("kaiju", currentBlock - 1440 * 30, currentBlock, 1440, "vUSDT.vETH");

    /* Get pure volume and reserve info */
    const currencyReservePure = await getCurrencyReserve("pure", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice);
    const pureVolume24Hours = await getCurrencyVolume("pure", currentBlock - 1440, currentBlock, 60, "vrsc");
    const pureVolume7Days = await getCurrencyVolume("pure", currentBlock - 1440 * 7, currentBlock, 1440, "vrsc");
    const pureVolume30Days = await getCurrencyVolume("pure", currentBlock - 1440 * 30, currentBlock, 1440, "vrsc");

    /* Get switch volume and reserve info */
    const currencyReserveSwitch = await getCurrencyReserve("switch", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice);
    const switchVolume24Hours = await getCurrencyVolume("switch", currentBlock - 1440, currentBlock, 60, "DAI.vETH");
    const switchVolume7Days = await getCurrencyVolume("switch", currentBlock - 1440 * 7, currentBlock, 1440, "DAI.vETH");
    const switchVolume30Days = await getCurrencyVolume("switch", currentBlock - 1440 * 30, currentBlock, 1440, "DAI.vETH");

    /* Get nati volume and reserve info */
    const currencyReserveNati = await getCurrencyReserve("nati", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice);
    const natiVolume24Hours = await getCurrencyVolume("nati", currentBlock - 1440, currentBlock, 60, "vrsc");
    const natiVolume7Days = await getCurrencyVolume("nati", currentBlock - 1440 * 7, currentBlock, 1440, "vrsc");
    const natiVolume30Days = await getCurrencyVolume("nati", currentBlock - 1440 * 30, currentBlock, 1440, "vrsc");

    console.log("currencyReserveNati ",currencyReserveNati)
    console.log("natiVolume24Hours ",natiVolume24Hours)
    console.log("natiVolume7Days ",natiVolume7Days)
    console.log("natiVolume30Days ",natiVolume30Days)

    vrscRenderData = {
      // Verus
      blocks: blockandfeepoolrewards.block.toLocaleString(),
      blockLastSend: blockandfeepoolrewards.blockLastSend,
      blockReward: blockandfeepoolrewards.blockReward,
      feeReward: blockandfeepoolrewards.feeReward,
      averageblockfees: blockandfeepoolrewards.averageblockfees,
      totalSupply: Math.round(coinSupply.totalSupply).toLocaleString(),
      circulatingSupply: Math.round(coinSupply.circulatingSupply).toLocaleString(),
      circulatingSupplyPercentage: (Math.round(coinSupply.circulatingSupplyPercentage * 100) / 100).toLocaleString(),
      marketCap: Math.round(coinSupply.marketCap).toLocaleString(),
      maxSupply: coinSupply.maxSupply.toLocaleString(),
      fullyDilutedMarketCap: Math.round(coinSupply.fullyDilutedMarketCap).toLocaleString(),
      stakingAmount: stakingRewards.stakingAmount,
      stakingPercentage: (Math.round(stakingRewards.stakingPercentage * 100) / 100).toLocaleString(),
      stakingRewardsArray: stakingRewards.stakingArray,
      stakingSupply: Math.round(blockandfeepoolrewards.stakingsupply).toLocaleString(),
      stakingValue: Math.round(blockandfeepoolrewards.stakingsupply * currencyReserveBridge.vrscBridgePrice).toLocaleString(),
      stakingAPY: (Math.round(stakingRewards.apy * 10000) / 100).toLocaleString(),
      vrscMiningHash: miningRewards.vrscMiningHash,
      miningRewardsArray: miningRewards.miningArray,
      vrscNetworkHash: (Math.round(blockandfeepoolrewards.networkhashps) / 1000000000).toLocaleString(),
      vrscOnline: vrscNodeStatus.online,
      vrscStatusMessage: vrscNodeStatus.statusMessage,
      getAddressBalanceArray: verusAddressBalance.getAddressBalanceArray,
      getAddress: verusAddressBalance.verusAddress === "none" ? "" : verusAddressBalance.verusAddress,
      bitcoinPrice: bitcoinPrice,
      ethereumBridgePrice: currencyReserveBridge.ethereumBridgePrice,
      vrscBridgePrice: currencyReserveBridge.vrscBridgePrice,
      mkrBridgePrice: currencyReserveBridge.mkrBridgePrice,
      // Verus bridge
      vrscBridgeVolumeInDollars24Hours: vrscVolume24Hours.totalVolume,
      vrscBridgeVolumeInDollars24HoursArray: vrscVolume24Hours.volumeArray,
      vrscBridgeVolumeInDollars24HoursArrayYAxis: vrscVolume24Hours.yAxisArray,
      vrscBridgeVolumeInDollars7Days: vrscVolume7Days.totalVolume,
      vrscBridgeVolumeInDollars7DaysArray: vrscVolume7Days.volumeArray,
      vrscBridgeVolumeInDollars7DaysArrayYAxis: vrscVolume7Days.yAxisArray,
      vrscBridgeVolumeInDollars30Days: vrscVolume30Days.totalVolume,
      vrscBridgeVolumeInDollars30DaysArray: vrscVolume30Days.volumeArray,
      vrscBridgeVolumeInDollars30DaysArrayYAxis: vrscVolume30Days.yAxisArray,
      estimatedBridgeValueUSD: currencyReserveBridge.estimatedBridgeValueUSD,
      estimatedBridgeValueVRSC: currencyReserveBridge.estimatedBridgeValueVRSC,
      currencyBridgeArray: currencyReserveBridge.currencyBridgeArray,
      estimatedBridgeReserveValue: currencyReserveBridge.estimatedBridgeValue,
      //kaiju
      kaijuVolumeInDollars24Hours: kaijuVolume24Hours.totalVolume,
      kaijuVolumeInDollars24HoursArray: kaijuVolume24Hours.volumeArray,
      kaijuVolumeInDollars24HoursArrayYAxis: kaijuVolume24Hours.yAxisArray,
      kaijuVolumeInDollars7Days: kaijuVolume7Days.totalVolume,
      kaijuVolumeInDollars7DaysArray: kaijuVolume7Days.volumeArray,
      kaijuVolumeInDollars7DaysArrayYAxis: kaijuVolume7Days.yAxisArray,
      kaijuVolumeInDollars30Days: kaijuVolume30Days.totalVolume,
      kaijuVolumeInDollars30DaysArray: kaijuVolume30Days.volumeArray,
      kaijuVolumeInDollars30DaysArrayYAxis: kaijuVolume30Days.yAxisArray,
      estimatedKaijuValueUSD: currencyReserveKaiju.estimatedKaijuValueUSD,
      estimatedKaijuValueVRSC: currencyReserveKaiju.estimatedKaijuValueVRSC,
      currencyKaijuArray: currencyReserveKaiju.currencyKaijuArray,
      estimatedKaijuReserveValue: currencyReserveKaiju.estimatedKaijuValue,
      // Verus pure
      currencyVolumePure24Hours: pureVolume24Hours.totalVolume,
      currencyVolumePure24HoursArray: pureVolume24Hours.volumeArray,
      currencyVolumePure24HoursArrayYAxis: pureVolume24Hours.yAxisArray,
      currencyVolumePure7Days: pureVolume7Days.totalVolume,
      currencyVolumePure7DaysArray: pureVolume7Days.volumeArray,
      currencyVolumePure7DaysArrayYAxis: pureVolume7Days.yAxisArray,
      currencyVolumePure30Days: pureVolume30Days.totalVolume,
      currencyVolumePure30DaysArray: pureVolume30Days.volumeArray,
      currencyVolumePure30DaysArrayYAxis: pureVolume30Days.yAxisArray,
      currencyPureArray: currencyReservePure.currencyPureArray,
      estimatedPureValueUSD: currencyReservePure.estimatedPureValueUSD,
      estimatedPureValueVRSC: currencyReservePure.estimatedPureValueVRSC,
      estimatedPureReserveValueUSDBTC: currencyReservePure.estimatedPureValueUSDBTC,
      estimatedPureReserveValueUSDVRSC: currencyReservePure.estimatedPureValueUSDVRSC,
      // Verus switch
      currencyVolumeSwitch24Hours: switchVolume24Hours.totalVolume,
      currencyVolumeSwitch24HoursArray: switchVolume24Hours.volumeArray,
      currencyVolumeSwitch24HoursArrayYAxis: switchVolume24Hours.yAxisArray,
      currencyVolumeSwitch7Days: switchVolume7Days.totalVolume,
      currencyVolumeSwitch7DaysArray: switchVolume7Days.volumeArray,
      currencyVolumeSwitch7DaysArrayYAxis: switchVolume7Days.yAxisArray,
      currencyVolumeSwitch30Days: switchVolume30Days.totalVolume,
      currencyVolumeSwitch30DaysArray: switchVolume30Days.volumeArray,
      currencyVolumeSwitch30DaysArrayYAxis: switchVolume30Days.yAxisArray,
      currencySwitchArray: currencyReserveSwitch.currencySwitchArray,
      estimatedSwitchValue: currencyReserveSwitch.estimatedSwitchValue,
      estimatedSwitchReserveValue: currencyReserveSwitch.estimatedSwitcheReserveValue,
      estimatedSwitchValueUSDVRSC: currencyReserveSwitch.estimatedSwitchValueUSDVRSC,
      // Verus nati
      currencyVolumeNati24Hours: natiVolume24Hours.totalVolume,
      currencyVolumeNati24HoursArray: natiVolume24Hours.volumeArray,
      currencyVolumeNati24HoursArrayYAxis: natiVolume24Hours.yAxisArray,
      currencyVolumeNati7Days: natiVolume7Days.totalVolume,
      currencyVolumeNati7DaysArray: natiVolume7Days.volumeArray,
      currencyVolumeNati7DaysArrayYAxis: natiVolume7Days.yAxisArray,
      currencyVolumeNati30Days: natiVolume30Days.totalVolume,
      currencyVolumeNati30DaysArray: natiVolume30Days.volumeArray,
      currencyVolumeNati30DaysArrayYAxis: natiVolume30Days.yAxisArray,
      currencyNatiArray: currencyReserveNati.currencyNatiArray,
      estimatedNatiValueUSD: currencyReserveNati.estimatedNatiValueUSD,
      estimatedNatiValueVRSC: currencyReserveNati.estimatedNatiValueVRSC,
      estimatedNatiReserveValueUSDBTC: currencyReserveNati.estimatedNatiValueUSDBTC,
      estimatedNatiReserveValueUSDVRSC: currencyReserveNati.estimatedNatiValueUSDVRSC
    };
    // adding to pricingArray
    priceArray = [...priceArray, ...vrscRenderData.currencyBridgeArray, ...vrscRenderData.currencyKaijuArray, ...vrscRenderData.currencyPureArray, ...vrscRenderData.currencySwitchArray, ...vrscRenderData.currencyNatiArray];
    // adding to reserveArray
    vrscReserveArray = [...vrscReserveArray, { basket: "Bridge.vETH", reserve: currencyReserveBridge.estimatedBridgeValue, via: "" }, { basket: "Kaiju", reserve: currencyReserveKaiju.estimatedKaijuValue, via: "" }, { basket: "Pure", reserve: currencyReservePure.estimatedPureValueUSDVRSC, via: "via VRSC" }, { basket: "Switch", reserve: currencyReserveSwitch.estimatedSwitcheReserveValue, via: "" }, { basket: "NATI", reserve: currencyReserveNati.estimatedNatiValueUSDVRSC, via: "via VRSC" }];
  } else {
    vrscRenderData = {
      vrscNodeStatus: vrscNodeStatus.online,
      vrscStatusMessage: vrscNodeStatus.statusMessage
    }
  }
  mainRenderData = vrscRenderData;




  /* Verus vARRR */
  let varrrRenderData = {};
  const varrrNodeStatus = await getVarrrNodeStatus();

  if (varrrNodeStatus.online === true) {

    /* Get address balance */
    const varrrAddressBalance = await getVarrrAddressBalance(req.query.varrraddress);

    /* Get block and fee pool rewards */
    const varrrblockandfeepoolrewards = await getVarrrBlockAndFeePoolRewards();
    const currentBlock = varrrblockandfeepoolrewards.block;

    /* Get bridge.varrr volume and reserve info */
    const currencyReserveVarrrBridge = await getVarrrCurrencyReserve("bridge.varrr", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice, currencyReserveBridge.estimatedBridgeValueUSD);
    const varrrVolume24Hours = await getVarrrCurrencyVolume("bridge.varrr", currentBlock - 1440, currentBlock, 60, "vrsc");
    const varrrVolume7Days = await getVarrrCurrencyVolume("bridge.varrr", currentBlock - 1440 * 7, currentBlock, 1440, "vrsc");
    const varrrVolume30Days = await getVarrrCurrencyVolume("bridge.varrr", currentBlock - 1440 * 30, currentBlock, 1440, "vrsc");

    const varrrBridgePrice = currencyReserveVarrrBridge.currencyVarrrBridgeArray.find(item => item.currencyName === 'vARRR').price;

    /* Calculate varrr staking rewards */
    const varrrStakingRewards = await calculateVarrrStakingRewards(varrrblockandfeepoolrewards.stakingsupply, req.query.varrrstakingamount, varrrBridgePrice);

    /* Calculate varrr mining rewards */
    const varrrMiningRewards = await calculateVarrrMiningRewards(varrrblockandfeepoolrewards.networkhashps, req.query.varrrmininghash, varrrBridgePrice);

    varrrRenderData = {
      //varrr
      varrrOnline: varrrNodeStatus.online,
      getVarrrAddressBalanceArray: varrrAddressBalance.getAddressBalanceArray,
      getVarrrAddress: varrrAddressBalance.verusAddress === "none" ? "" : varrrAddressBalance.verusAddress,
      varrrblocks: varrrblockandfeepoolrewards.block.toLocaleString(),
      varrrblockLastSend: varrrblockandfeepoolrewards.blockLastSend,
      varrrblockReward: varrrblockandfeepoolrewards.blockReward,
      varrrfeeReward: varrrblockandfeepoolrewards.feeReward,
      varrraverageblockfees: varrrblockandfeepoolrewards.averageblockfees,
      varrrStakingAmount: varrrStakingRewards.stakingAmount,
      varrrStakingRewardsArray: varrrStakingRewards.stakingArray,
      varrrStakingSupply: Math.round(varrrblockandfeepoolrewards.stakingsupply).toLocaleString(),
      varrrStakingAPY: (Math.round(varrrStakingRewards.apy * 10000) / 100).toLocaleString(),
      varrrMiningHash: varrrMiningRewards.varrrMiningHash,
      varrrMiningRewardsArray: varrrMiningRewards.miningArray,
      varrrNetworkHash: (Math.round(varrrblockandfeepoolrewards.networkhashps) / 1000000000).toLocaleString(),
      //varrr bridge
      varrrBridgeVolumeInDollars24Hours: varrrVolume24Hours.totalVolume,
      varrrBridgeVolumeInDollars24HoursArray: varrrVolume24Hours.volumeArray,
      varrrBridgeVolumeInDollars24HoursArrayYAxis: varrrVolume24Hours.yAxisArray,
      varrrBridgeVolumeInDollars7Days: varrrVolume7Days.totalVolume,
      varrrBridgeVolumeInDollars7DaysArray: varrrVolume7Days.volumeArray,
      varrrBridgeVolumeInDollars7DaysArrayYAxis: varrrVolume7Days.yAxisArray,
      varrrBridgeVolumeInDollars30Days: varrrVolume30Days.totalVolume,
      varrrBridgeVolumeInDollars30DaysArray: varrrVolume30Days.volumeArray,
      varrrBridgeVolumeInDollars30DaysArrayYAxis: varrrVolume30Days.yAxisArray,
      currencyVarrrBridgeArray: currencyReserveVarrrBridge.currencyVarrrBridgeArray,
      estimatedVarrrBridgeValueUSD: currencyReserveVarrrBridge.estimatedVarrrBridgeValueUSD,
      estimatedVarrrBridgeValueVRSC: currencyReserveVarrrBridge.estimatedVarrrBridgeValueVRSC,
      estimatedVarrrBridgeReserveValueUSDBTC: currencyReserveVarrrBridge.estimatedVarrrBridgeValueUSDBTC,
      estimatedVarrrBridgeReserveValueUSDVRSC: currencyReserveVarrrBridge.estimatedVarrrBridgeValueUSDVRSC
    }
    priceArray = [...priceArray, ...varrrRenderData.currencyVarrrBridgeArray];
    vrscReserveArray = [...vrscReserveArray, { basket: "Bridge.vARRR", reserve: currencyReserveVarrrBridge.estimatedVarrrBridgeValueUSDVRSC, via: "via VRSC" }];
  } else {
    varrrRenderData = {
      varrrOnline: varrrNodeStatus.online,
      varrrStatusMessage: varrrNodeStatus.statusMessage
    }
  }
  mainRenderData = { ...mainRenderData, ...varrrRenderData };


  /* Verus vDEX */
  let vdexRenderData = {};
  const vdexNodeStatus = await getVdexNodeStatus();

  if (vdexNodeStatus.online === true) {

    /* Get address balance */
    const vdexAddressBalance = await getVdexAddressBalance(req.query.vdexaddress);

    /* Get block and fee pool rewards */
    const vdexblockandfeepoolrewards = await getVdexBlockAndFeePoolRewards();
    const currentBlock = vdexblockandfeepoolrewards.block;

    /* Get bridge.vdex volume and reserve info */
    const currencyReserveVdexBridge = await getVdexCurrencyReserve("bridge.vdex", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice, currencyReserveBridge.estimatedBridgeValueUSD);
    const vdexVolume24Hours = await getVdexCurrencyVolume("bridge.vdex", currentBlock - 1440, currentBlock, 60, "DAI.vETH");
    const vdexVolume7Days = await getVdexCurrencyVolume("bridge.vdex", currentBlock - 1440 * 7, currentBlock, 1440, "DAI.vETH");
    const vdexVolume30Days = await getVdexCurrencyVolume("bridge.vdex", currentBlock - 1440 * 30, currentBlock, 1440, "DAI.vETH");

    const vdexBridgePrice = currencyReserveVdexBridge.currencyBridgeArray.find(item => item.currencyName === 'vDEX').price;

    /* Calculate vdex staking rewards */
    const vdexStakingRewards = await calculateVdexStakingRewards(vdexblockandfeepoolrewards.stakingsupply, req.query.vdexstakingamount, vdexBridgePrice);

    /* Calculate vdex mining rewards */
    const vdexMiningRewards = await calculateVdexMiningRewards(vdexblockandfeepoolrewards.networkhashps, req.query.vdexmininghash, vdexBridgePrice);

    vdexRenderData = {
      //vdex
      vdexOnline: vdexNodeStatus.online,
      getVdexAddressBalanceArray: vdexAddressBalance.getAddressBalanceArray,
      getVdexAddress: vdexAddressBalance.verusAddress === "none" ? "" : vdexAddressBalance.verusAddress,
      vdexblocks: vdexblockandfeepoolrewards.block.toLocaleString(),
      vdexblockLastSend: vdexblockandfeepoolrewards.blockLastSend,
      vdexblockReward: vdexblockandfeepoolrewards.blockReward,
      vdexfeeReward: vdexblockandfeepoolrewards.feeReward,
      vdexaverageblockfees: vdexblockandfeepoolrewards.averageblockfees,
      vdexStakingAmount: vdexStakingRewards.stakingAmount,
      vdexStakingRewardsArray: vdexStakingRewards.stakingArray,
      vdexStakingSupply: Math.round(vdexblockandfeepoolrewards.stakingsupply).toLocaleString(),
      vdexStakingAPY: (Math.round(vdexStakingRewards.apy * 10000) / 100).toLocaleString(),
      vdexMiningHash: vdexMiningRewards.vdexMiningHash,
      vdexMiningRewardsArray: vdexMiningRewards.miningArray,
      vdexNetworkHash: (Math.round(vdexblockandfeepoolrewards.networkhashps) / 1000000000).toLocaleString(),
      //vdex bridge
      vdexBridgeVolumeInDollars24Hours: vdexVolume24Hours.totalVolume,
      vdexBridgeVolumeInDollars24HoursArray: vdexVolume24Hours.volumeArray,
      vdexBridgeVolumeInDollars24HoursArrayYAxis: vdexVolume24Hours.yAxisArray,
      vdexBridgeVolumeInDollars7Days: vdexVolume7Days.totalVolume,
      vdexBridgeVolumeInDollars7DaysArray: vdexVolume7Days.volumeArray,
      vdexBridgeVolumeInDollars7DaysArrayYAxis: vdexVolume7Days.yAxisArray,
      vdexBridgeVolumeInDollars30Days: vdexVolume30Days.totalVolume,
      vdexBridgeVolumeInDollars30DaysArray: vdexVolume30Days.volumeArray,
      vdexBridgeVolumeInDollars30DaysArrayYAxis: vdexVolume30Days.yAxisArray,
      currencyVdexBridgeArray: currencyReserveVdexBridge.currencyBridgeArray,
      estimatedVdexBridgeReserveValue: currencyReserveVdexBridge.estimatedBridgeValue,
      estimatedVdexBridgeValueUSD: currencyReserveVdexBridge.estimatedBridgeValueUSD,
      estimatedVdexBridgeValueVRSC: currencyReserveVdexBridge.estimatedBridgeValueVRSC,
      estimatedVdexBridgeReserveValueUSDBTC: currencyReserveVdexBridge.estimatedBridgeValueUSDBTC,
      estimatedVdexBridgeReserveValueUSDVRSC: currencyReserveVdexBridge.estimatedBridgeValueUSDVRSC
    }
    priceArray = [...priceArray, ...vdexRenderData.currencyVdexBridgeArray];
    vrscReserveArray = [...vrscReserveArray, { basket: "Bridge.vDEX", reserve: currencyReserveVdexBridge.estimatedBridgeValue, via: "" }];
  } else {
    vdexRenderData = {
      vdexOnline: vdexNodeStatus.online,
      vdexStatusMessage: vdexNodeStatus.statusMessage
    }
  }
  mainRenderData = { ...mainRenderData, ...vdexRenderData };

  let btcPriceArray = priceArray.filter(item => item.currencyId === 'iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU').sort((a, b) => b.price - a.price);
  let ethereumPriceArray = priceArray.filter(item => item.currencyId === 'i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X').sort((a, b) => b.price - a.price);
  let makerPriceArray = priceArray.filter(item => item.currencyId === 'iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4').sort((a, b) => b.price - a.price);
  let vrscPriceArray = priceArray.filter(item => item.currencyId === 'i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV').sort((a, b) => b.price - a.price);
  let arrrPriceArray = priceArray.filter(item => item.currencyId === 'iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2').sort((a, b) => b.price - a.price);

  vrscReserveArray.sort((a, b) => parseFloat(b.reserve.replace(/,/g, '')) - parseFloat(a.reserve.replace(/,/g, '')));

  mainRenderData = { ...mainRenderData, ...{ btcPriceArray, ethereumPriceArray, makerPriceArray, vrscPriceArray, arrrPriceArray, vrscReserveArray } };



  // ThreeFold //
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
  mainRenderData = { ...mainRenderData, ...threeFoldRenderData };

  res.render('main', mainRenderData)

  /* cache */
  cacheReady = true;
})

/* hbs */
const hbs = require('hbs');
app.set('views', './views')
app.set('view engine', 'hbs')

hbs.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

app.use(express.static(__dirname + "/public", {
  index: false,
  immutable: true,
  cacheControl: true,
  maxAge: "30d"
}));


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})

