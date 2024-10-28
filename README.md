# cryptodashboard-server
Free to use cryptodashboard build to show stats from the Verus Protocol.

Useful for Javascript developers and can be used as a monitor for your PBaaS or currencies on the Verus Protocol.

# Requirements 
1. A running Verus Node
2. A running Redis server
3. One to more running instance of https://github.com/tommyfpedersen/verus-rpc-node-api - one for every pbaas chain - change the port e.g. 9009 for verus, 9010 for varrr and 9011 for vdex so you have multiple endpoints. Remember also to change username and password to the Verus RPC.

# Setup 
1. Run NPM install
2. Make sure you have endpoints up and running e.g. http://localhost:9009/mining/getmininginfo and http://localhost:9010/mining/getmininginfo
3. Create .env file with e.g
VERUS_REST_API=http://localhost:9009/
VERUS_REST_API_VARRR=http://localhost:9010/
VERUS_REST_API_VDEX=http://localhost:9011/
4. Prepare coinsupply - call e.g. http://localhost:9009/blockchain/coinsupply/3262063 <- change the blocknumber to the latest - this can take up to an hour and you may call the endpoint a couple of times because it times out. When getting a result go on to the next step.
5. Run node cacheserver.js - this will call Verus RPC every 1 minute and save the results in Redis.
6. Run node index.js - this will run the cryptodashboard and call the Redis server. If user inputs as address balance is used the index.js also calls additional endpoints to get the latest values.
7. Open your browser and go to the page http://localhost:3000/ and you will see the cryptodashboard.

# Notes
1. This project is still in development - missing some error handling
2. Things could be more compact and code could be more reuseably
