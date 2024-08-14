Write-Host "Verusd loading..."
invoke-expression 'cmd /c start powershell -NoExit -Command  { write-host "Verusd"; set-location "C:\Users\Tommy\verus-cli\"; ./verus stop}'
invoke-expression 'cmd /c start powershell -NoExit -Command  { write-host "Verusd vARRR"; set-location "C:\Users\Tommy\verus-cli\"; ./verus -chain=varrr stop}'
invoke-expression 'cmd /c start powershell -NoExit -Command  { write-host "Verusd vDEX"; set-location "C:\Users\Tommy\verus-cli\"; ./verus -chain=vdex stop}'
#invoke-expression 'cmd /c start powershell -Command { write-host "Hi, new window!"; set-location "C:\"; get-childitem ; sleep 3}'