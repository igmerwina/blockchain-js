//file buat ngetest code  

const Blockchain = require('./blockchain')

const bitcoin = new Blockchain()

const previousBlockHash = 'OAIHSFOIAH18212039'
const currentBlockData = [
    {
        amount: 10,
        sender: 'SUDHFOI138478',
        recipient: 'SUDHFUIWH82739847'
    }, 
    {
        amount: 30,
        sender: '089U23FJOIS',
        recipient: '20939FIOSJEO'
    }, 
    {
        amount: 200,
        sender: 'ASMCW3UT90UW94T',
        recipient: 'SLODIJN9W83UYR'
    }, 
]

console.log(bitcoin.hashBlock(previousBlockHash, currentBlockData, 155663))
// console.log(bitcoin.proofOfWork(previousBlockHash, currentBlockData))