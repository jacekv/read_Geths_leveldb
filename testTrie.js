const Trie = require('merkle-patricia-tree');
const rlp = require('rlp');

const trie = new Trie.SecureTrie();

const address = '0xB8ac39f9FdA100086D0c1d86C8902E2db52C701d';
const account = [
    Buffer.from(''),
    Buffer.from('fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7', 'hex'),
    Buffer.from('56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421', 'hex'),
    Buffer.from('c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470', 'hex')
]


async function test() {
    const addressBuffer = Buffer.from(address.slice(2), 'hex');
    await trie.put(addressBuffer, rlp.encode(account));
    console.log(trie.root);
}

test()