var keyth = require('keythereum');

let keyObj = keyth.importFromFile(
    '0x911ED73fC328a6A4F632e969b19419fb635FffBd',
    '/home/jacekv/testchain/'
    )

// console.log(keyObj);
let privKey = keyth.recover([], keyObj);

console.log(privKey.toString('hex'));
//privkey for 0x911ED73fC328a6A4F632e969b19419fb635FffBd is: a7c422ddc0047923abe835739757df35da672a6a31dbc0e76e0368e6882da2f6