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
let vrscBridgePrice = 0;
let vrscPrice = 0;

// components
const { getMiningInfo, getBlockSubsidy, getBlock, getPeerInfo } = require('./components/verus/verus');

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

  let startBlock = 2793743;
  let endblock = 2793743 - 1440;

  let vrscReserveIn = 0;
  let vrscReserveInLastValue = -1;
  let vrscReserveOut = 0;
  let vrscReserveOutLastValue = -1;
  let vrscReserveInDollars = 0;

  let daiReserveIn = 0;
  let daiReserveInLastValue = -1;
  let daiReserveOut = 0;
  let daiReserveOutLastValue = -1;
  let daiReserveInDollars = 0;

  let mkrReserveIn = 0;
  let mkrReserveInLastValue = -1;
  let mkrReserveOut = 0;
  let mkrReserveOutLastValue = -1;
  let mkrReserveInDollars = 0;

  let ethReserveIn = 0;
  let ethReserveInLastValue = -1;
  let ethReserveOut = 0;
  let ethReserveOutLastValue = -1;
  let ethReserveInDollars = 0;

  for (let i = endblock; i < startBlock; i++) {
    const getcurrencystateResponse = await fetch("http://localhost:9009/multichain/getcurrencystate/bridge.veth/" + i);
    const getcurrencystateResult = await getcurrencystateResponse.json();
    const getcurrencystate = getcurrencystateResult.result[0];

    const getcurrencystateVRSC = getcurrencystate.currencystate.currencies.i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV;
    const getcurrencystateDAI = getcurrencystate.currencystate.currencies.iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM;
    const getcurrencystateMKR = getcurrencystate.currencystate.currencies.iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4;
    const getcurrencystateETH = getcurrencystate.currencystate.currencies.i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X;

    // VRSC in
    if (getcurrencystateVRSC.reservein !== vrscReserveInLastValue) {
      vrscReserveIn = vrscReserveIn + getcurrencystateVRSC.reservein;

      let vrscReserves = 0;
      let daiReserves = 0;

      getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
        if (currency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
          vrscReserves = currency.reserves;
        }
        if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
          daiReserves = currency.reserves;
        }
      })
      vrscReserveInDollars = vrscReserveInDollars + getcurrencystateVRSC.reservein * (daiReserves / vrscReserves);
    }
    // VRSC out
    if (getcurrencystateVRSC.reserveout !== vrscReserveOutLastValue) {
      vrscReserveOut = vrscReserveOut + getcurrencystateVRSC.reserveout;
      let vrscReserves = 0;
      let daiReserves = 0;
      getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
        if (currency.currencyid === "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") {
          vrscReserves = currency.reserves;
        }
        if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
          daiReserves = currency.reserves;
        }
      })
      vrscReserveInDollars = vrscReserveInDollars + getcurrencystateVRSC.reserveout * (daiReserves / vrscReserves);
    }

    vrscReserveInLastValue = getcurrencystateVRSC.reservein;
    vrscReserveOutLastValue = getcurrencystateVRSC.reserveout;

    // DAI in
    if (getcurrencystateDAI.reservein !== daiReserveInLastValue) {
      daiReserveIn = daiReserveIn + getcurrencystateDAI.reservein;

      let daiReserves = 0;
      getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
        if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
          daiReserves = currency.reserves;
        }
      })
      daiReserveInDollars = daiReserveInDollars + getcurrencystateDAI.reservein * 1;
    }
    // DAI out
    if (getcurrencystateDAI.reserveout !== daiReserveOutLastValue) {
      daiReserveOut = daiReserveOut + getcurrencystateDAI.reserveout;

      let daiReserves = 0;
      getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
        if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
          daiReserves = currency.reserves;
        }
      })
      daiReserveInDollars = daiReserveInDollars + getcurrencystateDAI.reserveout * 1;
    }
    daiReserveInLastValue = getcurrencystateDAI.reservein;
    daiReserveOutLastValue = getcurrencystateDAI.reserveout;

    // MKR in
    if (getcurrencystateMKR.reservein !== mkrReserveInLastValue) {
      mkrReserveIn = mkrReserveIn + getcurrencystateMKR.reservein;

      let mkrReserves = 0;
      let daiReserves = 0;

      getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
        if (currency.currencyid === "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4") {
          mkrReserves = currency.reserves;
        }
        if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
          daiReserves = currency.reserves;
        }
      })
      mkrReserveInDollars = mkrReserveInDollars + getcurrencystateMKR.reservein * (daiReserves / mkrReserves);
    }
    // MKR out
    if (getcurrencystateMKR.reserveout !== mkrReserveOutLastValue) {
      mkrReserveOut = mkrReserveOut + getcurrencystateMKR.reserveout;
      let mkrReserves = 0;
      let daiReserves = 0;
      getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
        if (currency.currencyid === "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4") {
          mkrReserves = currency.reserves;
        }
        if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
          daiReserves = currency.reserves;
        }
      })
      mkrReserveInDollars = mkrReserveInDollars + getcurrencystateMKR.reserveout * (daiReserves / mkrReserves);
    }

    mkrReserveInLastValue = getcurrencystateMKR.reservein;
    mkrReserveOutLastValue = getcurrencystateMKR.reserveout;

    // ETH in
    if (getcurrencystateETH.reservein !== ethReserveInLastValue) {
      ethReserveIn = ethReserveIn + getcurrencystateETH.reservein;

      let ethReserves = 0;
      let daiReserves = 0;

      getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
        if (currency.currencyid === "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X") {
          ethReserves = currency.reserves;
        }
        if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
          daiReserves = currency.reserves;
        }
      })
      ethReserveInDollars = ethReserveInDollars + getcurrencystateETH.reservein * (daiReserves / ethReserves);
    }
    // ETH out
    if (getcurrencystateETH.reserveout !== ethReserveOutLastValue) {
      ethReserveOut = ethReserveOut + getcurrencystateETH.reserveout;
      let ethReserves = 0;
      let daiReserves = 0;
      getcurrencystate.currencystate.reservecurrencies.forEach((currency) => {
        if (currency.currencyid === "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4") {
          ethReserves = currency.reserves;
        }
        if (currency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
          daiReserves = currency.reserves;
        }
      })
      ethReserveInDollars = ethReserveInDollars + getcurrencystateETH.reserveout * (daiReserves / ethReserves);
    }
    ethReserveInLastValue = getcurrencystateETH.reservein;
    ethReserveOutLastValue = getcurrencystateETH.reserveout;
  }

  console.log("vrsc total", vrscReserveIn + vrscReserveOut, "$", vrscReserveInDollars);
  console.log("mkr total", mkrReserveIn + mkrReserveOut, "$", mkrReserveInDollars);
  console.log("dai total", daiReserveIn + daiReserveOut, "$", daiReserveInDollars);
  console.log("eth total", ethReserveIn + ethReserveOut, "$", ethReserveInDollars);
  let totalReserveVolumeInDollars = vrscReserveInDollars + mkrReserveInDollars + daiReserveInDollars + ethReserveInDollars;
  console.log("total volume $", totalReserveVolumeInDollars);


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
    blocks: getmininginfo?.blocks,
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
    vrscBridgePrice: vrscBridgePrice
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
