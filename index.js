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

  /* VRSC-ETH Bridge volume  */
  let vrscBridgeVolumeInDollars24Hours = 0;
  let vrscBridgeVolumeInDollars7Days = 0;
  let vrscBridgeVolumeInDollars30Days = 0;
  if (getmininginfo) {
    let volumeInDollarsArray = await getVrscEthBridgeVolume(getblock.height - (1400 * 30), getblock.height);

    volumeInDollarsArray.filter((item) => {
      return item.height > getblock.height - 1400;
    }).forEach((elm) => {
      vrscBridgeVolumeInDollars24Hours = vrscBridgeVolumeInDollars24Hours + elm.dollars;
    })
    volumeInDollarsArray.filter((item) => {
      return item.height > getblock.height - (1400 * 7);
    }).forEach((elm) => {
      vrscBridgeVolumeInDollars7Days = vrscBridgeVolumeInDollars7Days + elm.dollars;
    })
    volumeInDollarsArray.filter((item) => {
      return item.height > getblock.height - (1400 * 30);
    }).forEach((elm) => {
      vrscBridgeVolumeInDollars30Days = vrscBridgeVolumeInDollars30Days + elm.dollars;
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

  //console.log("verusaddress", verusAddress)

  res.render('main', {
    blocks:  getmininginfo?.blocks.toLocaleString(),
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
    vrscBridgeVolumeInDollars7Days: vrscBridgeVolumeInDollars7Days,
    vrscBridgeVolumeInDollars30Days: vrscBridgeVolumeInDollars30Days
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
