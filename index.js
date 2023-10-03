require('dotenv').config();

/* express */
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
app.use(express.json());
app.use(cors({
  origin: '*' // <-- which domains can access this API
}));

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

  console.log("getmininginfo", getmininginfo)

  res.render('main',{
    blocks: getmininginfo.blocks,
    averageblockfees: getmininginfo.averageblockfees
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
