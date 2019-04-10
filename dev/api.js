const express = require('express')
const bodyParser = require('body-parser')
const Blockchain = require('./blockchain')  // importing Blockchain constructor function     
const uuid = require('uuid/v1') //library for create random string

const app = express()
const bitcoin = new Blockchain() // bitcoin bisa diganti pake nama lain
const nodeAddress = uuid().split('-').join('')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended:false }))


// end-point to show entire blockchain
app.get('/blockchain', function (req, res) {
    res.send(bitcoin)
})


// end-point to create new transaction
app.post('/transaction', function (req, res) {
    const blockIndex = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient)
    res.json({ note: `Transaction will be added in block ${blockIndex}.` })
})


// end-point to mine/create new block
app.get('/mine', function (req, res) {
    const lastBlock = bitcoin.getLasBlock()
    const previousBlockHash = lastBlock['hash']
    const currentBlockData = {
        transactions: bitcoin.pendingTransactions,
        index: lastBlock['index'] + 1
    }
    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData)
    const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce)

    // REWARD for mining, is optional...
    bitcoin.createNewTransaction(12.5, "00", nodeAddress)

    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash)

    res.json({
        note: "New Block Mined Sucessfully", 
        block: newBlock
    })
})


// start the server 
app.listen(3000, function(){
    console.log('server jalan di http://localhost:3000')   
})
