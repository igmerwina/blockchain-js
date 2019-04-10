// Blockchain.js
// Construction function 

const sha256 = require('sha256')
const currentNodeUrl = process.argv[3] // buat ngambil url dari  package.json script u/ url node 


function Blockchain() {
    this.chain = []
    this.pendingTransactions = []

    this.currentNodeUrl = currentNodeUrl // biar tau node apa di url berapa
    this.networkNodes = [] // aware of other node inside the network 

    this.createNewBlock(100, '0', '0') // genesis Block
}


Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash){
    // buat block baru
    const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.pendingTransactions,
        nonce: nonce, 
        hash: hash,  
        previousBlockHash: previousBlockHash
    }

    this.pendingTransactions = []
    this.chain.push(newBlock)

    return newBlock
}


// get Block terakhir dari Blockchain 
Blockchain.prototype.getLasBlock = function(){
    return this.chain[this.chain.length - 1]
}


Blockchain.prototype.createNewTransaction = function (amount, sender, recipient) {
    const newTransaction = {
        amount: amount,
        sender: sender,
        recipient: recipient   
    }

    this.pendingTransactions.push(newTransaction)
    return this.getLasBlock()['index'] + 1
}


// create hash for a block
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce){
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData)
    const hash = sha256(dataAsString)
    return hash
}


Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
    /*  => repeatedly hash block until it finds correct hash => '0000AUOISJD' 
        => uses current block data for the hash, also previousBlockHash 
        => continously change nonce value until it finds the correct Hash 
        => return to us the nonce value that create the correct Hash
    */
    let nonce = 0 // inisiasi nonce pertama kali
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce)
    while (hash.substring(0,4) !== '0000'){ // loop nyari nonce sampai hash star with '0000' ketemu
        nonce++
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce)
    }
    return nonce     
}


module.exports = Blockchain