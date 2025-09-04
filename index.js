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
import { readFromCache, isCacheReady } from './components/cache/cache.js';
import { getCoingeckoPrice } from './components/coingecko/coingecko.js';
import { getAddressBalance } from './components/verus/currencies/currenciesUtils.js';

/* currencies - main */
app.get('/', async (req, res) => {

  /* page loads */
  pageLoads++;
  console.log("page loads: currencies: ", new Date().toLocaleString(), pageLoads);

  /* cache */
  let cacheReady = await isCacheReady();
  let mainRenderData = {};

  if (cacheReady) {

    // cache data
    const cacheData = await readFromCache('cache.json');
    mainRenderData = cacheData;

    res.render('currencyList', {
      timeAgo: mainRenderData.timeAgo,
      currencyGroupList: mainRenderData.currencyGroupList,
      totalBasketsVolume: mainRenderData.totalBasketsVolume,
      basketsInfo: mainRenderData.basketsInfo,
      // legacy info
      totalBasketReserves: mainRenderData.basketsInfo[0].currencySupplyPriceUSD,
      totalVolume24h: mainRenderData.totalBasketsVolume[0].totalVolume24HoursUSD,
      totalVolume7d: mainRenderData.totalBasketsVolume[0].totalVolume7DaysUSD,
      totalVolume30d: mainRenderData.totalBasketsVolume[0].totalVolume30DaysUSD,
      vrscInBaskets: mainRenderData.basketsInfo[0].vrscInReserve,
      vrscInBasketsUSD: mainRenderData.basketsInfo[0].vrscInReserveUSD
    });
    return;
  } else {

    res.render('currencyList', { vrscOnline: false, varrrOnline: false, vdexOnline: false, mainRenderData: mainRenderData });
    return;
  }

});

app.get('/currency/', async (req, res) => {
  res.redirect('/')
})

app.get('/currency/:param', async (req, res) => {

  /* page loads */
  pageLoads++;
  console.log("page loads: currency: ", req.params.param, "", new Date().toLocaleString(), pageLoads);

  /* cache */
  let cacheReady = await isCacheReady();
  let mainRenderData = {};
  const param = req.params.param;

  if (cacheReady) {

    // cache data
    const cacheData = await readFromCache('cache.json');
    mainRenderData = cacheData;

    const currencyGroupList = mainRenderData.currencyGroupList.filter((item) => { return item.currencyName.toLowerCase() === param.toLowerCase() });

    let currencyReserveValue = 0;
    let totalVolume24Hours = 0;
    let totalVolume7Days = 0;
    let totalVolume30Days = 0;
    let currencyName = "";
    let currencySupply = 0;
    let currencyPriceInNative = 0;
    let currencyPriceUSD = 0;
    let blockchain = "";
    let currencyType = "Token";
    let currencyStartBlock = 0;

    let basketReserveCurrencyArray = [];

    if (currencyGroupList.length > 0) {
      currencyReserveValue = currencyGroupList[0].currencySupplyPriceUSD;
      totalVolume24Hours = currencyGroupList[0].totalVolume24Hours;
      totalVolume7Days = currencyGroupList[0].totalVolume7Days;
      totalVolume30Days = currencyGroupList[0].totalVolume30Days;
      currencyName = currencyGroupList[0].currencyName;
      currencySupply = currencyGroupList[0].currencySupply;
      currencyStartBlock = currencyGroupList[0].currencyStartBlock;

      const currency = mainRenderData.allCurrenciesFromBaskets.filter((item) => { return item.name.toLowerCase() === param.toLowerCase() })[0];

      if (currency) {
        if (currency?.type === "Basket") {
          currencyType = "Basket"
          basketReserveCurrencyArray = currency.currencyReserve.basketCurrencyArray//.forEach((item)=>{return item.currencyPriceUSD = 5});
          currencyPriceInNative = currency.currencyReserve.currencyPriceNative.toFixed(4).toLocaleString();
          currencyPriceUSD = currency.currencyReserve.currencyPriceUSD.toFixed(4).toLocaleString();
          blockchain = currency.blockchain;

        }

      }
      else {
        currencyPriceUSD = currencyGroupList[0].currencyList[0].currencyPriceUSD;
      }
    }

    basketReserveCurrencyArray.map((item) => {
      let obj = item;
      obj.reservePriceUSD = item.reservePriceUSD < 1 ? Number(item.reservePriceUSD.toFixed(4)).toLocaleString() : Number(item.reservePriceUSD.toFixed(2)).toLocaleString()
      obj.priceNativeCurrency = item.priceNativeCurrency < 1 ? Number(item.priceNativeCurrency.toFixed(4)).toLocaleString() : Number(item.priceNativeCurrency.toFixed(4)).toLocaleString()
      obj.reserves = item.reserves < 1 ? Number(item.reserves.toFixed(4)).toLocaleString() : Number(item.reserves.toFixed(0)).toLocaleString()
      return obj
    })


    res.render('currency', {
      timeAgo: mainRenderData.timeAgo,
      currencyGroupList: currencyGroupList,
      currencyType: currencyType,
      currencyName: currencyName,
      currencyStartBlock: currencyStartBlock,
      currencySupply: currencySupply,
      blockchain: blockchain,
      currencyPriceUSD: currencyPriceUSD,
      currencyPriceInNative: currencyPriceInNative,
      currencyReserveValue: currencyReserveValue,
      totalVolume24Hours: totalVolume24Hours,
      totalVolume7Days: totalVolume7Days,
      totalVolume30Days: totalVolume30Days,
      totalBasketsVolume: mainRenderData.totalBasketsVolume,
      basketsInfo: mainRenderData.basketsInfo,
      basketReserveCurrencyArray: basketReserveCurrencyArray
    });
    return;
  } else {

    res.render('currency', { vrscOnline: false, varrrOnline: false, vdexOnline: false, mainRenderData: mainRenderData });
    return;
  }
});

/* pbaas */
app.get('/blockchain', async (req, res) => {

  /* page loads */
  pageLoads++;
  console.log("page loads: blockchain: ", new Date().toLocaleString(), pageLoads);

  /* cache */
  let cacheReady = await isCacheReady();
  let mainRenderData = {};

  if (cacheReady) {

    // cache data
    const cacheData = await readFromCache('cache.json');
    mainRenderData = cacheData;

    res.render('blockchainList', {
      timeAgo: mainRenderData.timeAgo,
      pbaasList: mainRenderData.pbaasList.sort((a, b) => parseFloat(b.marketCap.replace(/,/g, '')) - parseFloat(a.marketCap.replace(/,/g, ''))),
      marketCapArray: mainRenderData.marketCapArray,
      idPriceListArray: mainRenderData.idPriceListArray,
      currencyPriceListArray: mainRenderData.currencyPriceListArray,
      networkHashrateArray: mainRenderData.networkHashrateArray
    });
    return;
  } else {

    res.render('blockchainList', { vrscOnline: false, varrrOnline: false, vdexOnline: false, mainRenderData: mainRenderData });
    return;
  }

});

/* earnings */
app.get('/earnings', async (req, res) => {

  /* page loads */
  pageLoads++;
  console.log("page loads: earnings: ", new Date().toLocaleString(), pageLoads);

  /* cache */
  let cacheReady = await isCacheReady();
  let mainRenderData = {};

  if (cacheReady) {

    // cache data
    const cacheData = await readFromCache('cache.json');
    mainRenderData = cacheData;

    res.render('earnings', {
      timeAgo: mainRenderData.timeAgo,
      pbaasList: mainRenderData.pbaasList.sort((a, b) => parseFloat(b.networkHashrate.replace(/,/g, '')) - parseFloat(a.networkHashrate.replace(/,/g, ''))),
      apyArray: mainRenderData.apyArray,
      dailyEarningsPerGHArray: mainRenderData.dailyEarningsPerGHArray,
      feePoolRewardArray: mainRenderData.feePoolRewardArray,
      networkHashrateArray: mainRenderData.networkHashrateArray
    });
    return;
  } else {

    res.render('earnings', { vrscOnline: false, varrrOnline: false, vdexOnline: false, mainRenderData: mainRenderData });
    return;
  }
});


/* stats */
app.get('/stats', async (req, res) => {

  /* page loads */
  pageLoads++;
  console.log("page loads: stats", new Date().toLocaleString(), pageLoads);

  /* cache */
  let cacheReady = await isCacheReady();
  let mainRenderData = {};
  let userData = {};

  if (cacheReady) {

    // cache data
    const cacheData = await readFromCache('cache.json');
    mainRenderData = cacheData;

    // user request
    /*  if user input - no cache  */
    if (req.query.address || req.query.varrraddress || req.query.vdexaddress || req.query.chipsaddress || req.query.vrscstakingamount || req.query.vrscmininghash  || req.query.varrrstakingamount || req.query.varrrmininghash || req.query.vdexstakingamount || req.query.vdexmininghash  || req.query.chipsstakingamount || req.query.chipsmininghash || req.query.tfnodes) {

      /* Get price from coingecko */
      let coingeckoPriceArray = await getCoingeckoPrice();

      /* verus */
      const verusAddressBalance = await getAddressBalance(process.env.VERUS_REST_API, req.query.address);

      userData = {
        getAddressBalanceArray: verusAddressBalance.getAddressBalanceArray,
        getAddress: verusAddressBalance.verusAddress === "none" ? "" : verusAddressBalance.verusAddress,
      }

      /* chips */
      const chipsAddressBalance = await getAddressBalance(process.env.VERUS_REST_API_CHIPS, req.query.chipsaddress);

      userData = {
        ...userData,
        getChipsAddressBalanceArray: chipsAddressBalance.getAddressBalanceArray,
        getChipsAddress: chipsAddressBalance.verusAddress === "none" ? "" : chipsAddressBalance.verusAddress,
      }

      /* varrr */
      const varrrAddressBalance = await getAddressBalance(process.env.VERUS_REST_API_VARRR, req.query.varrraddress);

      userData = {
        ...userData,
        getVarrrAddressBalanceArray: varrrAddressBalance.getAddressBalanceArray,
        getVarrrAddress: varrrAddressBalance.verusAddress === "none" ? "" : varrrAddressBalance.verusAddress,
      }

      /* vdex */
      const vdexAddressBalance = await getAddressBalance(process.env.VERUS_REST_API_VDEX, req.query.vdexaddress);

      userData = {
        ...userData,
        getVdexAddressBalanceArray: vdexAddressBalance.getAddressBalanceArray,
        getVdexAddress: vdexAddressBalance.verusAddress === "none" ? "" : vdexAddressBalance.verusAddress,
      }
    }

    res.render('stats', {
      getAddress: userData.getAddress,
      getAddressBalanceArray: userData.getAddressBalanceArray,
      getVarrrAddress: userData.getVarrrAddress,
      getVarrrAddressBalanceArray: userData.getVarrrAddressBalanceArray,
      getChipsAddress: userData.getChipsAddress,
      getChipsAddressBalanceArray: userData.getChipsAddressBalanceArray,
      getVdexAddress: userData.getVdexAddress,
      getVdexAddressBalanceArray: userData.getVdexAddressBalanceArray
    });
    return;
  } else {


    res.render('stats', { vrscOnline: false, varrrOnline: false, vdexOnline: false, mainRenderData: mainRenderData });
    return;
  }

})

app.get('/api/', async (req, res) => {
  res.redirect('/api/highlights')
})

app.get('/api/highlights', async (req, res) => {

  /* page loads */
  pageLoads++;
  console.log("page loads: api highlights", new Date().toLocaleString(), pageLoads);

  /* cache */
  let cacheReady = await isCacheReady();
  let mainRenderData = {};

  if (cacheReady) {

    // cache data
    const cacheData = await readFromCache('cache.json');
    mainRenderData = cacheData;

    res.json({
      // data: mainRenderData,
      cachetimestamp: mainRenderData.cachetimestamp,
      timeAgo: mainRenderData.timeAgo,
      totalBasketReserves: mainRenderData.basketsInfo[0].currencySupplyPriceUSD,
      totalVolume24h: mainRenderData.totalBasketsVolume[0].totalVolume24HoursUSD,
      totalVolume7d: mainRenderData.totalBasketsVolume[0].totalVolume7DaysUSD,
      totalVolume30d: mainRenderData.totalBasketsVolume[0].totalVolume30DaysUSD,
      vrscInBaskets: mainRenderData.basketsInfo[0].vrscInReserve,
      vrscInBasketsUSD: mainRenderData.basketsInfo[0].vrscInReserveUSD,

    });
    return;
  } else {

    res.json({ errorMessage: "service offline" });
    return;
  }

})


/* hbs */
import hbs from 'hbs';
import path from 'path';

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

