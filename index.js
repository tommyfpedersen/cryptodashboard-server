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
const { getNodeStatus, getBlockAndFeePoolRewards, getAddressBalance, getCurrencyVolume, getCurrencyReserve } = require('./components/verus/verus');
const { getVarrrNodeStatus, getVarrrBlockAndFeePoolRewards, getVarrrAddressBalance, getVarrrCurrencyVolume, getVarrrCurrencyReserve } = require('./components/varrr/varrr');
const { getCoingeckoPrice } = require('./components/coingecko/coingecko');
const { getThreeFoldNodeArray } = require('./components/threefold/threefold');


/* dashboard */
app.get('/', async (req, res) => {

  /* page loads */
  pageLoads++;
  console.log("page loads: ", pageLoads);

  /* Get price from coingecko */
  let coingeckoPriceArray = await getCoingeckoPrice();
  let bitcoinPriceItem = coingeckoPriceArray.find(item => item.name === "bitcoin");
  let bitcoinPrice = bitcoinPriceItem?.price.toLocaleString() || "0";

  /* RenderData def*/
  let mainRenderData = {};

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
    const currencyVolumeBridge = await getCurrencyVolume("bridge.veth", (1440 * 31));//31
    currencyReserveBridge = await getCurrencyReserve("bridge.veth", coingeckoPriceArray);

    /* Get pure volume and reserve info */
    const currencyReservePure = await getCurrencyReserve("pure", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice);
    const currencyVolumePure = await getCurrencyVolume("pure", (1440 * 31));//31

    /* Get pure volume and reserve info */
    const currencyReserveSwitch = await getCurrencyReserve("switch", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice);
    const currencyVolumeSwitch = await getCurrencyVolume("switch", (1440 * 31));//31

    vrscRenderData = {
      // Verus
      blocks: blockandfeepoolrewards.block.toLocaleString(),
      blockLastSend: blockandfeepoolrewards.blockLastSend,
      blockReward: blockandfeepoolrewards.blockReward,
      feeReward: blockandfeepoolrewards.feeReward,
      averageblockfees: blockandfeepoolrewards.averageblockfees,
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
  } else {
    vrscRenderData = {
      vrscNodeStatus: vrscNodeStatus.online
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
    const currencyVolumeVarrrBridge = await getVarrrCurrencyVolume("bridge.varrr", (1440 * 31));//31
    const currencyReserveVarrrBridge = await getVarrrCurrencyReserve("bridge.varrr", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice, currencyReserveBridge.estimatedBridgeValueUSD);

    varrrRenderData = {
      //varrr
      varrrNodeStatus: varrrNodeStatus.online,
      getVarrrAddressBalanceArray: varrrAddressBalance.getAddressBalanceArray,
      getVarrrAddress: varrrAddressBalance.verusAddress === "none" ? "" : varrrAddressBalance.verusAddress,
      varrrblocks: varrrblockandfeepoolrewards.block.toLocaleString(),
      varrrblockLastSend: varrrblockandfeepoolrewards.blockLastSend,
      varrrblockReward: varrrblockandfeepoolrewards.blockReward,
      varrrfeeReward: varrrblockandfeepoolrewards.feeReward,
      varrraverageblockfees: varrrblockandfeepoolrewards.averageblockfees,
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
  } else {
    varrrRenderData = {
      varrrNodeStatus: varrrNodeStatus.online,
      varrrStatusMessage: varrrNodeStatus.statusMessage
    }
  }
  mainRenderData = { ...mainRenderData, ...varrrRenderData };



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
