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

  /* Verus */
  const nodeStatus = await getNodeStatus();
  console.log("nodeStatus: ", nodeStatus);

  if (nodeStatus.online === false) {
    return res.render('main', {});
  }

  /* Get address balance */
  const verusAddressBalance = await getAddressBalance(req.query.address);

  /* Get block and fee pool rewards */
  const blockandfeepoolrewards = await getBlockAndFeePoolRewards();

  /* Get bridge.veth volume and reserve info */
  const currencyVolumeBridge = await getCurrencyVolume("bridge.veth", (1440 * 1));//31
  const currencyReserveBridge = await getCurrencyReserve("bridge.veth", coingeckoPriceArray);

  /* Get pure volume and reserve info */
  const currencyReservePure = await getCurrencyReserve("pure", coingeckoPriceArray);
  const currencyVolumePure = await getCurrencyVolume("pure", (1440 * 1));//31


  // ThreeFold //
  let threeFoldNodeArray = []
  let threefoldNodeString = "";
  if (req.query.tfnodes) {
    threefoldNodeString = decodeURIComponent(req.query.tfnodes);
    threeFoldNodeArray = await getThreeFoldNodeArray(threefoldNodeString);
  } else {
    threefoldNodeString = "none";
  }

  console.log("currencyReservePure.currencyPureArray", currencyReservePure.currencyPureArray);

  res.render('main', {
    // Verus
    blocks: blockandfeepoolrewards.block.toLocaleString(),
    blockLastSend: blockandfeepoolrewards.blockLastSend,
    blockReward: blockandfeepoolrewards.blockReward,
    feeReward: blockandfeepoolrewards.feeReward,
    averageblockfees: blockandfeepoolrewards.averageblockfees,
    online: nodeStatus.online,
    statusMessage: nodeStatus.statusMessage,
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
    currencyBridgeArray: currencyReserveBridge.currencyBridgeArray,
    estimatedBridgeValue: currencyReserveBridge.estimatedBridgeValue,
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
    estimatedPureValueBTC: currencyReservePure.estimatedPureValueBTC,
    estimatedPureValueVRSC: currencyReservePure.estimatedPureValueVRSC,
    // ThreeFold
    threeFoldNodeArray: threeFoldNodeArray,
    threefoldNodeString: threefoldNodeString === "none" ? "" : threefoldNodeString

  })
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
