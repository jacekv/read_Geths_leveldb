#!/bin/bash

echo "Filling blocks..."
for VALUE in {1..100000}
do
    echo $VALUE
    geth attach ~/testchain/geth.ipc --exec "eth.sendTransaction({from: '0xB8ac39f9FdA100086D0c1d86C8902E2db52C701d', to: '0x911ED73fC328a6A4F632e969b19419fb635FffBd', value: '1'})"
    echo
done
geth attach ~/testchain/geth.ipc --exec "eth.blockNumber"