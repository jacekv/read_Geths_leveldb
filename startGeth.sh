#!/bin/bash

rm -rf ~/testchain
geth --datadir ~/testchain --cache.gc "0" --gcmode "archive" --http --dev --http.corsdomain "https://remix.ethereum.org,http://remix.ethereum.org"