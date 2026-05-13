#!/bin/bash

ptyxis --title="API VRSC" --tab -- bash -c "cd /home/tommy/apps/verus-rpc-node-api && node index; exec bash" &
sleep 0.2 
ptyxis --title="API vARRR" --tab -- bash -c "cd /home/tommy/apps/verus-rpc-node-api-varrr && node index; exec bash" &
sleep 0.2 
ptyxis --title="API vDEX" --tab -- bash -c "cd /home/tommy/apps/verus-rpc-node-api-vdex && node index; exec bash" &
sleep 0.2 
ptyxis --title="API CHIPS" --tab -- bash -c "cd /home/tommy/apps/verus-rpc-node-api-chips && node index; exec bash" &
sleep 0.2 
ptyxis --title="Cacheserver" --tab -- bash -c "cd /home/tommy/apps/cryptodashboard-server && node cacheserver; exec bash" &
sleep 300
ptyxis --title="Cryptodashboard" --tab -- bash -c "cd /home/tommy/apps/cryptodashboard-server && node index; exec bash" &