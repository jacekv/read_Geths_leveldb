const { default: Account } = require('ethereumjs-account');
const { BN, bufferToHex } = require('ethereumjs-util');
const ethers = require('ethers');
const level = require('level');
const rlp = require('rlp');
const Trie = require('merkle-patricia-tree');

const db = level('/home/jacekv/testchain/geth/chaindata');
let trie;
const provider = new ethers.providers.JsonRpcProvider();
// const signer = provider.getSigner();

const address1 = '0xFe53446C0A1A4aa1878B2089Ee59A6F5d1413107';
const address2 = '0x53d07745e6566B6B0f99e55190Af8222A4B16aEe';
const address3 = '0x6b958D4d9A8Ce7199Ab9d0ebaCffBe65201cF463';

// keccak256('') = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470
const EMTPY_CODE_HASH = '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';
// hash of empty trie example:
// const t = new Trie.SecureTrie();
// t.root == EMPTY_STORAGE_ROOT
const EMPTY_STORAGE_ROOT = '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421';

async function readAccount(address) {
    const accountBuffer = Buffer.from(address.slice(2), 'hex');
    const data = await trie.get(accountBuffer);
    const acc = new Account(data);

    console.log();
    console.log(`------- State for ${address} -------`);
    console.log(`nonce: ${new BN(acc.nonce)}`)
    console.log(`balance in wei: ${new BN(acc.balance)}`)
    const storageRoot = bufferToHex(acc.stateRoot);
    if (storageRoot.toLowerCase() !== EMPTY_STORAGE_ROOT) {
        console.log(`storageRoot: ${bufferToHex(acc.stateRoot)}`);
    } else {
        console.log('storageRoot: EMPTY');
    }
    const codeHash = bufferToHex(acc.codeHash);
    if (codeHash.toLowerCase() !== EMTPY_CODE_HASH) {
        console.log(`codeHash: ${bufferToHex(acc.codeHash)}`)
    } else {
        console.log('codeHash: EMPTY');
        return;
    }

    let storageTrie = trie.copy();
    storageTrie.root = acc.stateRoot;
    console.log('------Storage------')

    // reading first entry! That works
    // let contractData = await storageTrie.get(Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex'));
    // console.log(rlp.decode(contractData));
    const stream = storageTrie.createReadStream();
    stream
        .on('data', (data) => {
            console.log(`key: ${bufferToHex(data.key)}`)
            console.log(`Value: ${bufferToHex(rlp.decode(data.value))}`)
        })
        .on('end', () => {
            console.log('Finished reading storage.')
        })
}

provider.getBlockNumber()
    .then((blockNumber) => {
        console.log('Current blockNumber:', blockNumber);
        return provider.send("eth_getBlockByNumber", [ `0x${blockNumber.toString(16)}`, false ])
    })
    .then(async (block) => {
        console.log('State Root:', block.stateRoot);
        const stateRootBuffer = Buffer.from(block.stateRoot.slice(2), 'hex');
        trie = new Trie.SecureTrie(db, stateRootBuffer);
        await readAccount(address1);
        await readAccount(address2);
        await readAccount(address3);
        return provider.send("eth_getCode", [ address3, "latest" ])
    })
    .then((code) => {
        console.log('Code', code);
        const hash = ethers.utils.keccak256(code);
        console.log('Code Hash', hash);
    });
