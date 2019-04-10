// Construction function 

const sha256 = require('sha256')

function Blockchain() {
    this.chain = []
    this.pendingTransactions = []
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

module.exports = Blockchain