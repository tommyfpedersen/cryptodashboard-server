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
let days = 1;


// components
const { getNodeStatus, getBlockAndFeePoolRewards, getAddressBalance, calculateStakingRewards, calculateMiningRewards, getCurrencyVolume, getCurrencyReserve } = require('./components/verus/verus');
const { getVarrrNodeStatus, getVarrrBlockAndFeePoolRewards, getVarrrAddressBalance, calculateVarrrStakingRewards, calculateVarrrMiningRewards, getVarrrCurrencyVolume, getVarrrCurrencyReserve } = require('./components/varrr/varrr');
const { getCoingeckoPrice } = require('./components/coingecko/coingecko');
const { getThreeFoldNodeArray } = require('./components/threefold/threefold');


/* dashboard */
app.get('/', async (req, res) => {

  /* page loads */
  pageLoads++;
  console.log("page loads: ", pageLoads);

  /* RenderData def*/
  let mainRenderData = {};
  let priceArray = [];
  let vrscReserveArray = [];
  let vrscPriceData = {};

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

    /* Get bridge.veth volume and reserve info */
    const currencyVolumeBridge = await getCurrencyVolume("bridge.veth", (1440 * days));//31
    currencyReserveBridge = await getCurrencyReserve("bridge.veth", coingeckoPriceArray);

    /* Calculate staking rewards */
    const stakingRewards = await calculateStakingRewards(blockandfeepoolrewards.stakingsupply, req.query.vrscstakingamount, currencyReserveBridge.vrscBridgePrice);

    /* Calculate mining rewards */
    const miningRewards = await calculateMiningRewards(blockandfeepoolrewards.networkhashps, req.query.vrscmininghash, currencyReserveBridge.vrscBridgePrice);

    /* Get Kaiju volume and reserve info */
    const currencyReserveKaiju = await getCurrencyReserve("kaiju", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice);
    const currencyVolumeKaiju = await getCurrencyVolume("kaiju", (1440 * days));//31

    /* Get pure volume and reserve info */
    const currencyReservePure = await getCurrencyReserve("pure", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice);
    const currencyVolumePure = await getCurrencyVolume("pure", (1440 * days));//31

    /* Get pure volume and reserve info */
    const currencyReserveSwitch = await getCurrencyReserve("switch", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice);
    const currencyVolumeSwitch = await getCurrencyVolume("switch", (1440 * days));//31

    vrscRenderData = {
      // Verus
      blocks: blockandfeepoolrewards.block.toLocaleString(),
      blockLastSend: blockandfeepoolrewards.blockLastSend,
      blockReward: blockandfeepoolrewards.blockReward,
      feeReward: blockandfeepoolrewards.feeReward,
      averageblockfees: blockandfeepoolrewards.averageblockfees,
      stakingAmount: stakingRewards.stakingAmount,
      stakingRewardsArray: stakingRewards.stakingArray,
      stakingSupply: Math.round(blockandfeepoolrewards.stakingsupply).toLocaleString(),
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
      vrscBridgeVolumeInDollars24Hours: currencyVolumeBridge.volumeInDollars24Hours,
      vrscBridgeVolumeInDollars24HoursArray: currencyVolumeBridge.volumeInDollars24HoursArray,
      vrscBridgeVolumeInDollars24HoursArrayYAxis: currencyVolumeBridge.volumeInDollars24HoursArrayYAxis,
      vrscBridgeVolumeInDollars7Days: currencyVolumeBridge.volumeInDollars7Days,
      vrscBridgeVolumeInDollars7DaysArray: currencyVolumeBridge.volumeInDollars7DaysArray,
      vrscBridgeVolumeInDollars7DaysArrayYAxis: currencyVolumeBridge.volumeInDollars7DaysArrayYAxis,
      vrscBridgeVolumeInDollars30Days: currencyVolumeBridge.volumeInDollars30Days,
      vrscBridgeVolumeInDollars30DaysArray: currencyVolumeBridge.volumeInDollars30DaysArray,
      vrscBridgeVolumeInDollars30DaysArrayYAxis: currencyVolumeBridge.volumeInDollars30DaysArrayYAxis,
      estimatedBridgeValueUSD: currencyReserveBridge.estimatedBridgeValueUSD,
      estimatedBridgeValueVRSC: currencyReserveBridge.estimatedBridgeValueVRSC,
      currencyBridgeArray: currencyReserveBridge.currencyBridgeArray,
      estimatedBridgeReserveValue: currencyReserveBridge.estimatedBridgeValue,
      //kaiju
      kaijuVolumeInDollars24Hours: currencyVolumeKaiju.volumeInDollars24Hours,
      kaijuVolumeInDollars24HoursArray: currencyVolumeKaiju.volumeInDollars24HoursArray,
      kaijuVolumeInDollars24HoursArrayYAxis: currencyVolumeKaiju.volumeInDollars24HoursArrayYAxis,
      kaijuVolumeInDollars7Days: currencyVolumeKaiju.volumeInDollars7Days,
      kaijuVolumeInDollars7DaysArray: currencyVolumeKaiju.volumeInDollars7DaysArray,
      kaijuVolumeInDollars7DaysArrayYAxis: currencyVolumeKaiju.volumeInDollars7DaysArrayYAxis,
      kaijuVolumeInDollars30Days: currencyVolumeKaiju.volumeInDollars30Days,
      kaijuVolumeInDollars30DaysArray: currencyVolumeKaiju.volumeInDollars30DaysArray,
      kaijuVolumeInDollars30DaysArrayYAxis: currencyVolumeKaiju.volumeInDollars30DaysArrayYAxis,
      estimatedKaijuValueUSD: currencyReserveKaiju.estimatedKaijuValueUSD,
      estimatedKaijuValueVRSC: currencyReserveKaiju.estimatedKaijuValueVRSC,
      currencyKaijuArray: currencyReserveKaiju.currencyKaijuArray,
      estimatedKaijuReserveValue: currencyReserveKaiju.estimatedKaijuValue,
      // Verus pure
      currencyVolumePure24Hours: currencyVolumePure.volumeInDollars24Hours,
      currencyVolumePure24HoursArray: currencyVolumePure.volumeInDollars24HoursArray,
      currencyVolumePure24HoursArrayYAxis: currencyVolumePure.volumeInDollars24HoursArrayYAxis,
      currencyVolumePure7Days: currencyVolumePure.volumeInDollars7Days,
      currencyVolumePure7DaysArray: currencyVolumePure.volumeInDollars7DaysArray,
      currencyVolumePure7DaysArrayYAxis: currencyVolumePure.volumeInDollars7DaysArrayYAxis,
      currencyVolumePure30Days: currencyVolumePure.volumeInDollars30Days,
      currencyVolumePure30DaysArray: currencyVolumePure.volumeInDollars30DaysArray,
      currencyVolumePure30DaysArrayYAxis: currencyVolumePure.volumeInDollars30DaysArrayYAxis,
      currencyPureArray: currencyReservePure.currencyPureArray,
      estimatedPureValueUSD: currencyReservePure.estimatedPureValueUSD,
      estimatedPureValueVRSC: currencyReservePure.estimatedPureValueVRSC,
      estimatedPureReserveValueUSDBTC: currencyReservePure.estimatedPureValueUSDBTC,
      estimatedPureReserveValueUSDVRSC: currencyReservePure.estimatedPureValueUSDVRSC,
      // Verus switch
      currencyVolumeSwitch24Hours: currencyVolumeSwitch.volumeInDollars24Hours,
      currencyVolumeSwitch24HoursArray: currencyVolumeSwitch.volumeInDollars24HoursArray,
      currencyVolumeSwitch24HoursArrayYAxis: currencyVolumeSwitch.volumeInDollars24HoursArrayYAxis,
      currencyVolumeSwitch7Days: currencyVolumeSwitch.volumeInDollars7Days,
      currencyVolumeSwitch7DaysArray: currencyVolumeSwitch.volumeInDollars7DaysArray,
      currencyVolumeSwitch7DaysArrayYAxis: currencyVolumeSwitch.volumeInDollars7DaysArrayYAxis,
      currencyVolumeSwitch30Days: currencyVolumeSwitch.volumeInDollars30Days,
      currencyVolumeSwitch30DaysArray: currencyVolumeSwitch.volumeInDollars30DaysArray,
      currencyVolumeSwitch30DaysArrayYAxis: currencyVolumeSwitch.volumeInDollars30DaysArrayYAxis,
      currencySwitchArray: currencyReserveSwitch.currencySwitchArray,
      estimatedSwitchValue: currencyReserveSwitch.estimatedSwitchValue,
      estimatedSwitchReserveValue: currencyReserveSwitch.estimatedSwitcheReserveValue,
      estimatedSwitchValueUSDVRSC: currencyReserveSwitch.estimatedSwitchValueUSDVRSC
    };
    // adding to pricingArray
    priceArray = [...priceArray, ...vrscRenderData.currencyBridgeArray, ...vrscRenderData.currencyKaijuArray, ...vrscRenderData.currencyPureArray, ...vrscRenderData.currencySwitchArray];
    // adding to reserveArray
    vrscReserveArray = [...vrscReserveArray, { basket: "Bridge.vETH", reserve: currencyReserveBridge.estimatedBridgeValue, via: "" }, { basket: "Kaiju", reserve: currencyReserveKaiju.estimatedKaijuValue, via: "" }, { basket: "Pure", reserve: currencyReservePure.estimatedPureValueUSDVRSC, via: "" }, { basket: "Switch", reserve: currencyReserveSwitch.estimatedSwitcheReserveValue, via: "" }];
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



    /* Get bridge.varrr volume and reserve info */
    const currencyReserveVarrrBridge = await getVarrrCurrencyReserve("bridge.varrr", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice, currencyReserveBridge.estimatedBridgeValueUSD);
    const currencyVolumeVarrrBridge = await getVarrrCurrencyVolume("bridge.varrr", (1440 * days));//31

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
      varrrMiningHash: varrrMiningRewards.varrrMiningHash,
      varrrMiningRewardsArray: varrrMiningRewards.miningArray,
      varrrNetworkHash: (Math.round(varrrblockandfeepoolrewards.networkhashps) / 1000000000).toLocaleString(),
      //varrr bridge
      varrrBridgeVolumeInDollars24Hours: currencyVolumeVarrrBridge.volumeInDollars24Hours,
      varrrBridgeVolumeInDollars24HoursArray: currencyVolumeVarrrBridge.volumeInDollars24HoursArray,
      varrrBridgeVolumeInDollars24HoursArrayYAxis: currencyVolumeVarrrBridge.volumeInDollars24HoursArrayYAxis,
      varrrBridgeVolumeInDollars7Days: currencyVolumeVarrrBridge.volumeInDollars7Days,
      varrrBridgeVolumeInDollars7DaysArray: currencyVolumeVarrrBridge.volumeInDollars7DaysArray,
      varrrBridgeVolumeInDollars7DaysArrayYAxis: currencyVolumeVarrrBridge.volumeInDollars7DaysArrayYAxis,
      varrrBridgeVolumeInDollars30Days: currencyVolumeVarrrBridge.volumeInDollars30Days,
      varrrBridgeVolumeInDollars30DaysArray: currencyVolumeVarrrBridge.volumeInDollars30DaysArray,
      varrrBridgeVolumeInDollars30DaysArrayYAxis: currencyVolumeVarrrBridge.volumeInDollars30DaysArrayYAxis,
      currencyVarrrBridgeArray: currencyReserveVarrrBridge.currencyVarrrBridgeArray,
      estimatedVarrrBridgeValueUSD: currencyReserveVarrrBridge.estimatedVarrrBridgeValueUSD,
      estimatedVarrrBridgeValueVRSC: currencyReserveVarrrBridge.estimatedVarrrBridgeValueVRSC,
      estimatedVarrrBridgeReserveValueUSDBTC: currencyReserveVarrrBridge.estimatedVarrrBridgeValueUSDBTC,
      estimatedVarrrBridgeReserveValueUSDVRSC: currencyReserveVarrrBridge.estimatedVarrrBridgeValueUSDVRSC
    }
    priceArray = [...priceArray, ...varrrRenderData.currencyVarrrBridgeArray];
    //vrscReserveArray = [...vrscReserveArray, {basket: "Bridge.vARRR", reserve: currencyReserveVarrrBridge.estimatedVarrrBridgeValueUSDVRSC, via: "VRSC"}];
  } else {
    varrrRenderData = {
      varrrOnline: varrrNodeStatus.online,
      varrrStatusMessage: varrrNodeStatus.statusMessage
    }
  }
  mainRenderData = { ...mainRenderData, ...varrrRenderData };

  let btcPriceArray = priceArray.filter(item => item.currencyId === 'iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU').sort((a, b) => b.price - a.price);
  let ethereumPriceArray = priceArray.filter(item => item.currencyId === 'i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X').sort((a, b) => b.price - a.price);
  let makerPriceArray = priceArray.filter(item => item.currencyId === 'iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4').sort((a, b) => b.price - a.price);
  let vrscPriceArray = priceArray.filter(item => item.currencyId === 'i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV').sort((a, b) => b.price - a.price);
  let arrrPriceArray = priceArray.filter(item => item.currencyId === 'iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2').sort((a, b) => b.price - a.price);

  vrscReserveArray.sort((a, b) => parseFloat(b.reserve.replace(/,/g, '')) - parseFloat(a.reserve.replace(/,/g, '')));


  //let numberValue = parseFloat("12,701,613.72".replace(/,/g, ''));

  // let vrscReserveArray = reserveArray.sort((a, b) => {
  //   console.log(typeof a.reserve, typeof b.reserve)
  //   let aReserve = a.reserve;
  //   let bReserve = Number(b.reserve);

  //   console.log("a: ", Number(aReserve));
  //   console.log("b: ", b.reserve);
  //   return b.reserve - a.reserve});

  // vrscReserveArray.map((item) => {
  //   console.log("vrscReserveArray: ", item.basket, item.reserve, item.via);
  // });

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
})

/* hbs */
const hbs = require('hbs')
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
