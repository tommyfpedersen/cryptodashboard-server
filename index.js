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

/* routes */
// const addressindexRouter = require('./routes/addressindex');
// app.use('/addressindex', addressindexRouter);

// const miningRouter = require('./routes/mining');
// app.use('/mining', miningRouter);

// const networkRouter = require('./routes/network');
// app.use('/network', networkRouter);

app.get('/', async (req, res) => {

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

  /* VRSC-ETH Bridge information reserves */
  const getcurrencyResponse = await fetch("http://localhost:9009/multichain/getcurrency/bridge.veth");
  const getcurrencyResult = await getcurrencyResponse.json();
  const getcurrency = getcurrencyResult.result;

  // make cache to spare the api
  // https://api.coingecko.com/api/v3/coins/verus-coin
  // https://api.coingecko.com/api/v3/coins/ethereum
  // https://api.coingecko.com/api/v3/coins/maker
  // https://api.coingecko.com/api/v3/coins/dai 

  let currencyIdArray = Object.values(getcurrency.currencies);
  let currencyNames = Object.entries(getcurrency.currencynames);
  let currencyBridgeArray = [];

  currencyIdArray.forEach((currencyId) => {

    currencyNames.forEach((item)=>{
      let currency = {}
      if(item[0] === currencyId){

        getcurrency.bestcurrencystate.reservecurrencies.forEach((reservesCurrency)=>{
          if(reservesCurrency.currencyid === currencyId){
            currency.reserves = reservesCurrency.reserves;
            currency.priceinreserve = reservesCurrency.priceinreserve;
          }
        })
        
        currency.currencyId = currencyId;
        currency.currencyName = item[1];
       
      //  currencyBridgeArray.push({currency:currency});
        currencyBridgeArray.push(currency);
      }

    })
  })

  // console.log("currencyIdArray ", currencyIdArray);
  // console.log("currencyNames ", currencyNames);
  // console.log("currencyBridgeArray ", currencyBridgeArray);


 

  //console.log("value", Math.floor( (blockFeeReward - getblocksubsidy?.miner) * 100000000)/100000000)

  //   const updateScript = `<script>
  //   console.log("test")
  // </script>`;


  res.render('main', {
    blocks: getmininginfo?.blocks, //!== undefined ? getmininginfo.blocks : "null",
    blockLastSend: blockLastSend,
    blockReward: getblocksubsidy?.miner,
    feeReward: feeReward,
    averageblockfees: getmininginfo?.averageblockfees, //|| "null"
    online: online,
    statusMessage: statusMessage,
    currencyBridgeArray: currencyBridgeArray
    // updateScript: updateScript
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
