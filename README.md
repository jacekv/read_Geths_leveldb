# Start

The idea of this code is to read the leveldb from a running geth client and read out account and smart contract data. Read the trie data, decode it and so on. You can just use it to see how it looks:
```
npm i
node readData.js
```
It will take the current block number, take the state root and read from the database.

# General
Interesting articles: https://blog.openzeppelin.com/deconstructing-a-solidity-contract-part-ii-creation-vs-runtime-6b9d60ecb44c/

Start Geth in dev mode:
```bash
geth --datadir ~/testchain --cache.gc "0" --gcmode "archive" --http --dev --http.corsdomain "https://remix.ethereum.org,http://remix.ethereum.org"
```
Attaching with ipc:
```bash
geth attach ~/testchain/geth.ipc
```
Sending transaction:
```bash
eth.sendTransaction({from:eth.accounts[0], to:"0x911ED73fC328a6A4F632e969b19419fb635FffBd", value:"1"})
```

Private key for 0x911ED73fC328a6A4F632e969b19419fb635FffBd is: a7c422ddc0047923abe835739757df35da672a6a31dbc0e76e0368e6882da2f6


We want to understand how it works with all the tries in Ethereum.
Here is a link to the code showing it: https://ethereum.stackexchange.com/questions/40254/getting-complete-state-of-a-smart-contract


# ACCOUNT
Ethereum accounts have four fields:

* nonce - the number of transactions sent from this account
* balance -  the amount of wei this account currently has. Wei is a denomination of ETH and there are 1e+18 wei per ETH
* codeHash -  the hash of the code of this account. All such code fragments are contained in the state database under their corresponding hashes foe later retrieval. For externally owned accounts, the codeHash field is the hash of an empty string. 
`Keccak256('') = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470`
* storageHash - the hash of the storage of this account. All such storage fragments are contained in the state database under their corresponding hashes. For externally owned accounts, the storageHash field is the hash of an empty trie.

After reading the entry from leveldb using an accounts address, and rlp decoded it, we get the following: An array with 4 entries:
```
[
  <Buffer >,
  <Buffer ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff f7>,
  <Buffer 56 e8 1f 17 1b cc 55 a6 ff 83 45 e6 92 c0 f8 6e 5b 48 e0 1b 99 6c ad c0 01 62 2f b5 e3 63 b4 21>,
  <Buffer c5 d2 46 01 86 f7 23 3c 92 7e 7d b2 dc c7 03 c0 e5 00 b6 53 ca 82 27 3b 7b fa d8 04 5d 85 a4 70>
]
```
The first entry is the nonce -> 0.
The second entry is the number of wei.
The third entry is the storage hash.
And the last entry is the code hash.

How did we read it out?
```javascript
async function readAccount(address) {
    const accountBuffer = Buffer.from(address.slice(2), 'hex');
    const data = await trie.get(accountBuffer);
    const acc = new Account(data);
    console.log(rlp.decode(data));
}

provider.getBlockNumber()
    .then((blockNumber) => {
        return provider.send("eth_getBlockByNumber", [ `0x${blockNumber}`, false ])
    })
    .then(async (block) => {
        const stateRootBuffer = Buffer.from(block.stateRoot.slice(2), 'hex');
        trie = new Trie.SecureTrie(db, stateRootBuffer);
        await readAccount(address1);
    });
```
And here are the steps:
```
GetBlock => Block.stateRoot => SecureTrie(db, stateRootBuffer) => SecureTrie.get(Buffer(address.slice(2), 'hex')) => rlp.decode(data) => gives the array with 4 entries.
```

# CONTRACT

We deployed the following contract on our local dev chain at address 
```javascript
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
contract Storage {

    uint256 number;

    /**
     * @dev Store value in variable
     */
    function store() public {
        number = 5;
    }
}
```
When a contract is deployed, its nonce is set to 1.



# GETH
There is one problem with geth: https://github.com/ethereum/go-ethereum/issues/20383#issuecomment-558107815

So I wrote a bash script which just transfers the funds from one account to another.

# IMPORTANT
I start the geth node, attach to the IPC endpoint and send transactions. All good.
I execute the readData.js code and I also get the data. When I send another transaction, there seems to be some sort of corruption happening, since the new data is not included anymore.

Deploying from Remix does the same.