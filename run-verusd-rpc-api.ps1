Write-Host "Verusd RPC API loading..."
invoke-expression 'cmd /c start powershell -NoExit -Command  { write-host "Verusd RPC NODE API"; set-location "C:\Users\Tommy\apps\verus-rpc-node-api\"; node index;}'
invoke-expression 'cmd /c start powershell -NoExit -Command  { write-host "Verusd RPC NODE API vARRR"; set-location "C:\Users\Tommy\apps\verus-rpc-node-api-varrr\"; node index;}'
invoke-expression 'cmd /c start powershell -NoExit -Command  { write-host "Verusd RPC NODE API vDEX"; set-location "C:\Users\Tommy\apps\verus-rpc-node-api-vdex\"; node index;}'
invoke-expression 'cmd /c start powershell -NoExit -Command  { write-host "Verusd RPC NODE API CHIPS"; set-location "C:\Users\Tommy\apps\verus-rpc-node-api-chips\"; node index;}'
#invoke-expression 'cmd /c start powershell -Command { write-host "Hi, new window!"; set-location "C:\"; get-childitem ; sleep 3}'