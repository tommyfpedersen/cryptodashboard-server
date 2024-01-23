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

/* cache */
let cacheStartTime = Date.now();
let coolDownTime = 30000;
let estimatedCoingeckoBridgeValueCache = 0;
let pageLoads = 0;
let priceArray = [];
let bitcoinPrice = 0;
let ethereumPrice = 0;
let ethereumBridgePrice = 0;
let mkrBridgePrice = 0;
let vrscBridgePrice = 0;
let vrscPrice = 0;

// components
const { getMiningInfo, getBlockSubsidy, getBlock, getPeerInfo, getVrscEthBridgeVolume } = require('./components/verus/verus');
const { getNodeDetails, getNodeDetailsArray } = require('./components/threefold/threefold');
const { convertToAxisString } = require('./utils/stringUtil');

/* dashboard */
app.get('/', async (req, res) => {

  /* page loads */
  pageLoads++;
  console.log("page loads: ", pageLoads);

  /* Verus */
  const getmininginfo = await getMiningInfo();
  let online = false;
  let statusMessage = "Updating Verus Node...";
  if (getmininginfo) {
    online = true;
    statusMessage = "Verus Node Running";
  }

  const getblocksubsidy = await getBlockSubsidy(getmininginfo?.blocks);
  const getpeerinfo = await getPeerInfo();

  let blockLastSend = "";
  if (getpeerinfo) {
    blockLastSend = new Date(getpeerinfo[0].lastsend * 1000).toLocaleString();
  }

  const getblock = await getBlock(getmininginfo?.blocks);
  let blockFeeReward = 0;
  let feeReward = "";
  if (getblock) {
    blockFeeReward = 0;
    getblock.tx[0].vout.map((item) => {
      blockFeeReward = blockFeeReward + item.value;
    })

    feeReward = Math.round((blockFeeReward - getblocksubsidy?.miner) * 100000000) / 100000000;
  }

  /* Total Bridge Value 4x DAI -  estimatedCoingeckoBridgeValue*/

  /* Get price from coingecko */
  // VRSC: i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV
  // DAI: iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM
  // MKR: iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4
  // ETH: i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X
  let estimatedCoingeckoBridgeValue = 0;

  if (cacheStartTime + coolDownTime < Date.now()) {
    priceArray = [];

    let coingeckoPriceResponse = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin%2C%20verus-coin%2C%20dai%2C%20maker%2C%20ethereum&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en");
    const coingeckoPriceResult = await coingeckoPriceResponse.json();
    const coingeckoPrice = coingeckoPriceResult;

    if (coingeckoPrice) {
      if (coingeckoPrice.length > 0) {
        coingeckoPrice.forEach((item) => {
          if (item.id === "bitcoin") {
            bitcoinPrice = item.current_price.toLocaleString();
          }
          if (item.id === "verus-coin") {
            vrscPrice = item.current_price.toLocaleString();
            priceArray.push({
              currencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
              price: item.current_price
            })
          }
          if (item.id === "dai") {
            priceArray.push({
              currencyId: "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM",
              price: item.current_price
            })
          }
          if (item.id === "maker") {
            priceArray.push({
              currencyId: "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4",
              price: item.current_price
            })
          }
          if (item.id === "ethereum") {
            ethereumPrice = item.current_price.toLocaleString();
            priceArray.push({
              currencyId: "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X",
              price: item.current_price
            })
          }
        })
      }
    }
  }

  let vrscBridgeVolumeInDollars24Hours = 0;
  let vrscBridgeVolumeInDollars24HoursArray = [];
  let vrscBridgeVolumeInDollars24HoursArrayYAxis = []

  let vrscBridgeVolumeInDollars7Days = 0;
  let vrscBridgeVolumeInDollars7DaysArray = [];
  let vrscBridgeVolumeInDollars7DaysArrayYAxis = []

  let vrscBridgeVolumeInDollars30Days = 0;
  let vrscBridgeVolumeInDollars30DaysArray = [];
  let vrscBridgeVolumeInDollars30DaysArrayYAxis = []

  if (getmininginfo) {
    let volumeInDollarsArray = await getVrscEthBridgeVolume(getblock.height - (1440 * 31), getblock.height);

    // 24 hour
    const blockInterval24H = 60;
    let snapShootInterval24H = 0;
    let volumeInDollarsCounter24H = 0;
    let counter = -1;
    let totalVol = 0;

    volumeInDollarsArray
      .sort((a, b) => b.height - a.height)
      .filter((item) => {
        return item.height > getblock.height - 1440;
      })
      .forEach((elm) => {
        if (elm.height > getblock.height - 1440) {
          if (elm.height < (getblock.height - snapShootInterval24H)) {
            snapShootInterval24H = snapShootInterval24H + blockInterval24H;
            vrscBridgeVolumeInDollars24HoursArray.push({ price: volumeInDollarsCounter24H, label: counter + " hours ago" })

            volumeInDollarsCounter24H = 0;
            counter++;
          }
          volumeInDollarsCounter24H += elm.dollars;
          vrscBridgeVolumeInDollars24Hours = vrscBridgeVolumeInDollars24Hours + elm.dollars;
        }
      })
    vrscBridgeVolumeInDollars24HoursArray.reverse();

    let vrscBridgeVolumeInDollars24HoursArrayMax = Math.max(...vrscBridgeVolumeInDollars24HoursArray.map(o => o.price));
    vrscBridgeVolumeInDollars24HoursArrayYAxis.push({ value: convertToAxisString(vrscBridgeVolumeInDollars24HoursArrayMax) });
    vrscBridgeVolumeInDollars24HoursArrayYAxis.push({ value: convertToAxisString(vrscBridgeVolumeInDollars24HoursArrayMax / 2) });
    vrscBridgeVolumeInDollars24HoursArrayYAxis.push({ value: 0 });

    vrscBridgeVolumeInDollars24HoursArray.forEach((item) => {
      item.barPCT = (item.price / vrscBridgeVolumeInDollars24HoursArrayMax) * 100;
      item.price = convertToAxisString(item.price)
    })


    // 7 days
    const blockInterval7D = 1440;
    let snapShootInterval7D = 0;
    let volumeInDollarsCounter7D = 0;
    counter = -1;
    totalVol = 0;

    volumeInDollarsArray
      .sort((a, b) => b.height - a.height)
      .filter((item) => {
        return item.height > getblock.height - 1440 * 8;
      })
      .forEach((elm) => {

        if (elm.height > getblock.height - 1440 * 8) {
          if (elm.height < (getblock.height - snapShootInterval7D)) {
            snapShootInterval7D = snapShootInterval7D + blockInterval7D;
            vrscBridgeVolumeInDollars7DaysArray.push({ price: volumeInDollarsCounter7D, label: counter + " days ago" })

            volumeInDollarsCounter7D = 0;
            counter++;
          }
          volumeInDollarsCounter7D += elm.dollars;
          vrscBridgeVolumeInDollars7Days = vrscBridgeVolumeInDollars7Days + elm.dollars;
        }
      })
    vrscBridgeVolumeInDollars7DaysArray.reverse();

    let vrscBridgeVolumeInDollars7DaysArrayMax = Math.max(...vrscBridgeVolumeInDollars7DaysArray.map(o => o.price));
    vrscBridgeVolumeInDollars7DaysArrayYAxis.push({ value: convertToAxisString(vrscBridgeVolumeInDollars7DaysArrayMax) });
    vrscBridgeVolumeInDollars7DaysArrayYAxis.push({ value: convertToAxisString(vrscBridgeVolumeInDollars7DaysArrayMax / 2) });
    vrscBridgeVolumeInDollars7DaysArrayYAxis.push({ value: 0 });

    vrscBridgeVolumeInDollars7DaysArray.forEach((item) => {
      item.barPCT = (item.price / vrscBridgeVolumeInDollars7DaysArrayMax) * 100;
      item.price = convertToAxisString(item.price)
    })

    // 30 days
    const blockInterval30D = 1440;
    let snapShootInterval30D = 0;
    let volumeInDollarsCounter30D = 0;
    counter = -1;
    totalVol = 0;

    volumeInDollarsArray
      .sort((a, b) => b.height - a.height)
      .filter((item) => {
        return item.height > getblock.height - 1440 * 31;
      })
      .forEach((elm) => {
        if (elm.height > getblock.height - 1440 * 31) {
          if (elm.height < (getblock.height - snapShootInterval30D)) {
            snapShootInterval30D = snapShootInterval30D + blockInterval30D;
            vrscBridgeVolumeInDollars30DaysArray.push({ price: volumeInDollarsCounter30D, label: counter + " days ago" })

            volumeInDollarsCounter30D = 0;
            counter++;
          }
          volumeInDollarsCounter30D += elm.dollars;
          vrscBridgeVolumeInDollars30Days = vrscBridgeVolumeInDollars30Days + elm.dollars;
        }
      })
    vrscBridgeVolumeInDollars30DaysArray.reverse();

    let vrscBridgeVolumeInDollars30DaysArrayMax = Math.max(...vrscBridgeVolumeInDollars30DaysArray.map(o => o.price));
    vrscBridgeVolumeInDollars30DaysArrayYAxis.push({ value: convertToAxisString(vrscBridgeVolumeInDollars30DaysArrayMax) });
    vrscBridgeVolumeInDollars30DaysArrayYAxis.push({ value: convertToAxisString(vrscBridgeVolumeInDollars30DaysArrayMax / 2) });
    vrscBridgeVolumeInDollars30DaysArrayYAxis.push({ value: 0 });

    vrscBridgeVolumeInDollars30DaysArray.forEach((item) => {
      item.barPCT = (item.price / vrscBridgeVolumeInDollars30DaysArrayMax) * 100;
      item.price = convertToAxisString(item.price)
    })

    vrscBridgeVolumeInDollars24Hours = (Math.round(vrscBridgeVolumeInDollars24Hours * 100) / 100).toLocaleString();
    vrscBridgeVolumeInDollars7Days = (Math.round(vrscBridgeVolumeInDollars7Days * 100) / 100).toLocaleString();
    vrscBridgeVolumeInDollars30Days = (Math.round(vrscBridgeVolumeInDollars30Days * 100) / 100).toLocaleString();
  }


  /* VRSC-ETH Bridge reserves */
  const getcurrencyResponse = await fetch("http://localhost:9009/multichain/getcurrency/bridge.veth");
  const getcurrencyResult = await getcurrencyResponse.json();
  const getcurrency = getcurrencyResult.result;

  let currencyBridgeArray = [];
  let daiReserve = 0;
  let estimatedBridgeValue = 0;
  if (getcurrency) {
    let currencyIdArray = Object.values(getcurrency.currencies);
    let currencyNames = Object.entries(getcurrency.currencynames);

    /* find dai value*/
    currencyIdArray.forEach((currencyId) => {
      currencyNames.forEach((item) => {
        let currency = {}
        if (item[0] === currencyId) {
          getcurrency.bestcurrencystate.reservecurrencies.forEach((reservesCurrency) => {
            if (reservesCurrency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
              daiReserve = reservesCurrency.reserves;
            }
          })
        }
      })
    })

    currencyIdArray.forEach((currencyId) => {
      currencyNames.forEach((item) => {
        let currency = {}
        if (item[0] === currencyId) {
          getcurrency.bestcurrencystate.reservecurrencies.forEach((reservesCurrency) => {
            if (reservesCurrency.currencyid === currencyId) {
              currency.reserves = reservesCurrency.reserves;//(reservesCurrency.reserves).toLocaleString(undefined, { minimumFractionDigits: 8 });
              currency.priceinreserve = reservesCurrency.priceinreserve;
              currency.price = Math.round(daiReserve / currency.reserves * 100) / 100;

              if (currencyId === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
                vrscBridgePrice = Math.round(daiReserve / currency.reserves * 100) / 100;
              }
              if (currencyId === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
                ethereumBridgePrice = Math.round(daiReserve / currency.reserves * 100) / 100;
              }
              if (currencyId === "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4") {
                mkrBridgePrice = Math.round(daiReserve / currency.reserves * 100) / 100;
              }
            }

            if (priceArray.length > 0) {
              priceArray.forEach((price) => {
                if (price.currencyId === currencyId) {
                  currency.coingeckoprice = Math.round(price.price * 100) / 100;
                }
              })
            }


            if (reservesCurrency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
              estimatedBridgeValue = (Math.round(reservesCurrency.reserves * 4 * 100) / 100).toLocaleString();
            }
          })
          currency.currencyId = currencyId;
          currency.currencyName = item[1];
          currencyBridgeArray.push(currency);
        }
      })
    })
  }

  if (cacheStartTime + coolDownTime < Date.now()) {


    /* estimated value of bridge */
    currencyBridgeArray.forEach((currency) => {
      priceArray.forEach((price) => {
        if (currency.currencyId === price.currencyId) {
          estimatedCoingeckoBridgeValue = estimatedCoingeckoBridgeValue + (currency.reserves * price.price);
        }
      })
      currency.reserves = currency.reserves.toLocaleString(undefined, { minimumFractionDigits: 8 });
    })
    estimatedCoingeckoBridgeValueCache = (estimatedCoingeckoBridgeValue = Math.round(estimatedCoingeckoBridgeValue * 100) / 100).toLocaleString();
    cacheStartTime = Date.now();
  }

  /* Get address balance */
  let getAddressBalanceArray = [];
  let verusAddress = "";
  if (req.query.address) {
    verusAddress = decodeURIComponent(req.query.address);
  } else {
    verusAddress = "none";//"RCdXBieidGuXmK8Tw2gBoXWxi16UgqyKc7";
  }
  const getAddressBalanceResponse = await fetch("http://localhost:9009/addressindex/getaddressbalance/" + verusAddress);
  const getAddressBalanceResult = await getAddressBalanceResponse.json();
  const getAddressBalance = getAddressBalanceResult.result;

  if (getAddressBalance?.currencybalance) {
    let currencyIdArray = Object.keys(getAddressBalance.currencybalance);

    currencyIdArray.forEach((item) => {
      if ("i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV" === item) {
        getAddressBalanceArray.push({ currencyName: "VRSC", amount: getAddressBalance.currencybalance.i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV })
      }
      if ("iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM" === item) {
        getAddressBalanceArray.push({ currencyName: "DAI.vETH", amount: getAddressBalance.currencybalance.iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM })
      }
      if ("iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4" === item) {
        getAddressBalanceArray.push({ currencyName: "MKR.vETH", amount: getAddressBalance.currencybalance.iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4 })
      }
      if ("i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X" === item) {
        getAddressBalanceArray.push({ currencyName: "vETH", amount: getAddressBalance.currencybalance.i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X })
      }
      if ("i3f7tSctFkiPpiedY8QR5Tep9p4qDVebDx" === item) {
        getAddressBalanceArray.push({ currencyName: "Bridge.vETH", amount: getAddressBalance.currencybalance.i3f7tSctFkiPpiedY8QR5Tep9p4qDVebDx })
      }
    })
  }

  // ThreeFold //
  let getDetailsArray = await getNodeDetailsArray([3172,3170, 3174]);
 // let nodeDetailsArray = await getNodeDetailsArray([3172,3170, 3174]);
  //console.log(nodeDetailsArray);

  res.render('main', {
    // Verus
    blocks: getmininginfo?.blocks.toLocaleString(),
    blockLastSend: blockLastSend,
    blockReward: getblocksubsidy?.miner,
    feeReward: feeReward,
    averageblockfees: getmininginfo?.averageblockfees,
    online: online,
    statusMessage: statusMessage,
    currencyBridgeArray: currencyBridgeArray,
    estimatedBridgeValue: estimatedBridgeValue,
    estimatedCoingeckoBridgeValue: estimatedCoingeckoBridgeValueCache,
    getAddressBalanceArray: getAddressBalanceArray,
    getAddress: verusAddress === "none" ? "" : verusAddress,
    bitcoinPrice: bitcoinPrice,
    ethereumBridgePrice: ethereumBridgePrice,
    vrscBridgePrice: vrscBridgePrice,
    mkrBridgePrice: mkrBridgePrice,
    vrscBridgeVolumeInDollars24Hours: vrscBridgeVolumeInDollars24Hours,
    vrscBridgeVolumeInDollars24HoursArray: vrscBridgeVolumeInDollars24HoursArray,
    vrscBridgeVolumeInDollars24HoursArrayYAxis: vrscBridgeVolumeInDollars24HoursArrayYAxis,
    vrscBridgeVolumeInDollars7Days: vrscBridgeVolumeInDollars7Days,
    vrscBridgeVolumeInDollars7DaysArray: vrscBridgeVolumeInDollars7DaysArray,
    vrscBridgeVolumeInDollars7DaysArrayYAxis: vrscBridgeVolumeInDollars7DaysArrayYAxis,
    vrscBridgeVolumeInDollars30Days: vrscBridgeVolumeInDollars30Days,
    vrscBridgeVolumeInDollars30DaysArray: vrscBridgeVolumeInDollars30DaysArray,
    vrscBridgeVolumeInDollars30DaysArrayYAxis: vrscBridgeVolumeInDollars30DaysArrayYAxis
    // ThreeFold
  })
})

/* hbs */
const hbs = require('hbs')
app.set('views', './views')
app.set('view engine', 'hbs')

app.use(express.static(__dirname + "/public", {
  index: false,
  immutable: true,
  cacheControl: true,
  maxAge: "30d"
}));


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
