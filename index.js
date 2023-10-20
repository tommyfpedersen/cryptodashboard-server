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

/* helmet */
const helmet = require("helmet");
app.use(helmet());
app.use(helmet.hidePoweredBy({
  setTo:
    'Powered by Code'
}));

app.use(
  helmet.contentSecurityPolicy({
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "cryptodashboard.faldt.net"],
    styleSrc: ["'self'", "cryptodashboard.faldt.net"],
    reportOnly: false,
    setAllHeaders: false,
    // directives: {
    //   "script-src": ["'self'","cryptodashboard.faldt.net"],
    //   "style-src": ["'self'","cryptodashboard.faldt.net"],
    // },
  })
);

/* cache */
let cacheStartTime = Date.now();
let coolDownTime = 5000;
let estimatedCoingeckoBridgeValueCache = 0;
let pageLoads = 0;


/* dashboard */
app.get('/', async (req, res) => {

  /* page loads */
  pageLoads++;
  console.log("page loads: ", pageLoads);

  const getmininginfoResponse = await fetch("http://localhost:9009/mining/getmininginfo")
  const getmininginfoResult = await getmininginfoResponse.json();
  const getmininginfo = getmininginfoResult.result;

  let online = false;
  let statusMessage = "Updating Verus Node..."

  if (getmininginfo) {
    online = true;
    statusMessage = "Verus Node Running";
  }

  const getblocksubsidyResponse = await fetch("http://localhost:9009/mining/getblocksubsidy/" + getmininginfo?.blocks);
  const getblocksubsidyResult = await getblocksubsidyResponse.json();
  const getblocksubsidy = getblocksubsidyResult.result;

  const getpeerinfoResponse = await fetch("http://localhost:9009/network/getpeerinfo/");
  let blockLastSend = "";
  const getpeerinfoResult = await getpeerinfoResponse.json();
  const getpeerinfo = getpeerinfoResult.result;

  if (getpeerinfo) {
    blockLastSend = new Date(getpeerinfo[0].lastsend * 1000).toLocaleString();
  }

  const getblockResponse = await fetch("http://localhost:9009/blockchain/getblock/" + getmininginfo?.blocks);
  const getblockResult = await getblockResponse.json();
  const getblock = getblockResult.result;
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
  let priceArray = [];

  if (cacheStartTime + coolDownTime < Date.now()) {
    
    //VRSC
    let vrscPriceResponse = await fetch("https://api.coingecko.com/api/v3/coins/verus-coin");
    const vrscPriceResult = await vrscPriceResponse.json();
    const vrscPrice = vrscPriceResult;

    if (vrscPrice) {
      priceArray.push({
        currencyId: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        price: vrscPrice.market_data.current_price.usd
      })

      //DAI
      let daiPriceResponse = await fetch("https://api.coingecko.com/api/v3/coins/dai");
      const daiPriceResult = await daiPriceResponse.json();
      const daiPrice = daiPriceResult;

      priceArray.push({
        currencyId: "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM",
        price: daiPrice.market_data.current_price.usd
      })

      //MKR
      let mkrPriceResponse = await fetch("https://api.coingecko.com/api/v3/coins/maker");
      const mkrPriceResult = await mkrPriceResponse.json();
      const mkrPrice = mkrPriceResult;

      priceArray.push({
        currencyId: "iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4",
        price: mkrPrice.market_data.current_price.usd
      })

      //ETH
      let ethPriceResponse = await fetch("https://api.coingecko.com/api/v3/coins/ethereum");
      const ethPriceResult = await ethPriceResponse.json();
      const ethPrice = ethPriceResult;

      priceArray.push({
        currencyId: "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X",
        price: ethPrice.market_data.current_price.usd
      })
    }


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
              currency.reserves = reservesCurrency.reserves;
              currency.priceinreserve = reservesCurrency.priceinreserve;
              currency.price = Math.round(daiReserve / currency.reserves * 100) / 100;
            }

            if(priceArray.length >0){
              priceArray.forEach((price)=>{
                if(price.currencyId === currencyId){
                  currency.coingeckoprice =  Math.round(price.price* 100) / 100;
                }
              })
            }
          

            if (reservesCurrency.currencyid === "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM") {
              estimatedBridgeValue = Math.round(reservesCurrency.reserves * 4 * 100) / 100;
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
    console.log("currencyBridgeArray", currencyBridgeArray)

    /* estimated value of bridge */
    currencyBridgeArray.forEach((currency) => {
      priceArray.forEach((price) => {
        if (currency.currencyId === price.currencyId) {
          estimatedCoingeckoBridgeValue = estimatedCoingeckoBridgeValue + (currency.reserves * price.price);
        }
      })
    })
    estimatedCoingeckoBridgeValueCache = estimatedCoingeckoBridgeValue = Math.round(estimatedCoingeckoBridgeValue * 100) / 100;

    cacheStartTime = Date.now();
  }


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
    estimatedCoingeckoBridgeValue: estimatedCoingeckoBridgeValueCache
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
