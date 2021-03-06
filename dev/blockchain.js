// Blockchain.js
// Construction function 

const sha256 = require('sha256')
const currentNodeUrl = process.argv[3] // buat ngambil url dari  package.json script u/ url node 
const uuid = require('uuid/v1')


// constructor for Blockchain function
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


// create new Transaction & return it
Blockchain.prototype.createNewTransaction = function (amount, sender, recipient) {
    const newTransaction = {
        amount: amount,
        sender: sender,
        recipient: recipient,
        transactionId: uuid().split('-').join('')
    }
    return newTransaction
}


// take transaction object that already created and add it to pending transaction
// and return index of the block that this transaction been added to
Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj) {
    this.pendingTransactions.push(transactionObj)
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


// prototype funciton to validate chain on the network
Blockchain.prototype.chainIsValid = function (blockchain){
    let validChain = true

    // iterating every block on the blockchain array 
    for (let i = 1; i < blockchain.length; i++){
        // compare current block to the previous block 
        const currentBlock = blockchain[i]
        const prevBlock = blockchain[i - 1]
        const blockHash = this.hashBlock(prevBlock['hash'], {transactions: currentBlock['transactions'], index: currentBlock['index']}, currentBlock['nonce']) 
        // validate to start with 0000
        if (blockHash.substring(0, 4) !== '0000') validChain = false
        // comparing every hash on block
        if (currentBlock['previousBlockHash'] !== prevBlock['hash']) validChain = false // chain is not valid
        
        // print the comparison of the hash 
        console.log('previousBlockHash => ', prevBlock['hash'])
        console.log('currentBlockHash  => ', currentBlock['hash'])
    }
    // check the genesis block has all of correct data
    // every variable value below should be 'true'
    const genesisBlock = blockchain[0]
    const correctNonce = genesisBlock['nonce'] === 100
    const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0'
    const correctHash = genesisBlock['hash'] === '0'
    const correctTransactions = genesisBlock['transactions'].length === 0

    if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) validChain = false  

    return validChain
}


// method for blockchain exploler
Blockchain.prototype.getBlock = function(blockHash){
    let correctBlock = null
    this.chain.forEach(block => {
        if (block.hash === blockHash) correctBlock = block
    })
    return correctBlock
}


//  method to get trasaction 
Blockchain.prototype.getTransaction = function(transactionId){  // cari specific transaction
    let correctTransaction = null
    let correctBlock = null

    this.chain.forEach(block => {   // iterating tiap block 
        block.transactions.forEach(transaction => { // iteraring semua transaction di block
            if (transaction.transactionId === transactionId){   // kalau transaction yang dicari ketemu:
                correctTransaction = transaction    // nampilin transaksi yang dicari
                correctBlock = block    // nampilin block di tempat transaksi
            }
        })
    })

    return { 
        transaction: correctTransaction,
        block: correctBlock
    }
}


// method for find an address
Blockchain.prototype.getAddressData = function (address){
    const addressTransactions = []
    // cycling every transactoin inside blockchain
    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if (transaction.sender === address || transaction.recipient === address){
                // push transaction into the addresTransaction array
                // add associates transaction with address into the array 
                addressTransactions.push(transaction) 
            }
        })
    })

    let balance = 0
    addressTransactions.forEach(transaction => {
        if (transaction.recipient === address) balance += transaction.amount
        else if (transaction.sender === address) balance -= transaction.amount
    })

    return {
        addressTransactions: addressTransactions,
        addressBalance: balance
    }
}


module.exports = Blockchain