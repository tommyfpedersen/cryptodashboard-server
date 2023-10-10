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

// app.use(
//   helmet.contentSecurityPolicy({
//     useDefaults: true,
//     directives: {
//       "script-src": ["self","cryptodashboard.faldt.net"],
//       "style-src": ["self","cryptodashboard.faldt.net"],
//     },
//   })
// );

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
  let statusMessage = "Updating Verus Node"

  if (getmininginfo) {
    online = true;
    statusMessage = "Verus Node Running";
  }

  const getblocksubsidyResponse = await fetch("http://localhost:9009/mining/getblocksubsidy/" + getmininginfo.blocks);
  const getblocksubsidyResult = await getblocksubsidyResponse.json();
  const getblocksubsidy = getblocksubsidyResult.result;

  const getpeerinfoResponse = await fetch("http://localhost:9009/network/getpeerinfo/");
  const getpeerinfoResult = await getpeerinfoResponse.json();
  const getpeerinfo = getpeerinfoResult.result[0];
  let blockLastSend = "";
 
  if(getpeerinfo){
   blockLastSend = new Date(getpeerinfo.lastsend * 1000).toLocaleString(); 
  }
  
  console.log("blockLastSend",blockLastSend);

  res.render('main', {
    blocks: getmininginfo?.blocks, //!== undefined ? getmininginfo.blocks : "null",
    blockLastSend: blockLastSend,
    blockReward: getblocksubsidy?.miner,
    averageblockfees: getmininginfo?.averageblockfees, //|| "null"
    online: online,
    statusMessage: statusMessage
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
