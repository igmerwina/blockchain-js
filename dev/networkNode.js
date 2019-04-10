// networkNode.js 

const express = require('express')          // import express
const bodyParser = require('body-parser')   // import bodyParser  
const Blockchain = require('./blockchain')  // importing Blockchain constructor function     
const uuid = require('uuid/v1')             //library for create random string
const rp = require('request-promise')       // import request-promise
const port = process.argv[2]                // dipakai u/ run server di port berbeda di script> start @ package.json

const app = express()
const bitcoin = new Blockchain()    // bitcoin bisa diganti pake nama lain
const nodeAddress = uuid().split('-').join('') // diapakai di transaction

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended:false }))


// end-point to show entire blockchain
app.get('/blockchain', function (req, res) {
    res.send(bitcoin)
})


// end-point to create new transaction
app.post('/transaction', function(req, res) {
    const newTransaction = req.body
    const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction)
    res.json({ note: `Transaction will be added in block ${blockIndex}` })
})



app.post('/transaction/broadcast', function(req, res){
    // create new Transaction
    const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient)
    // take new Transaction and push to pending transaction array
    bitcoin.addTransactionToPendingTransactions(newTransaction)

    // broadcast the pending transaction to all network
    const requestPromises = []
    // cycle every node  on the network
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/transaction', // send newTransaction to each node with this enpoint
            method: 'POST',
            body: newTransaction, 
            json: true
        }
          
        requestPromises.push(rp(requestOptions))
    })
    // run all request 
    Promise.all(requestPromises)
    .then(data => { // after all promis done, then response => note
        res.json({ note: 'Transaction created and broadcast successfully.' })
    })
})


// end-point to mine/create new block
app.get('/mine', function(req, res) {
    // come calculations to create a new block
    const lastBlock = bitcoin.getLasBlock()
    const previousBlockHash = lastBlock['hash']
    const currentBlockData = {
        transactions: bitcoin.pendingTransactions,
        index: lastBlock['index'] + 1
    }
    // do the proof of work to find nonce 
    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData)
    // hash the block
    const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce)
    // create new block after calculations
    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash)

    // broadcast newBlock tp the network
    const requestPromises = []
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + 'receive-new-block',
            method: 'POST',
            body: { newBlock: newBlock },
            json: true
        }
        requestPromises.push(rp(requestOptions))
    })
    
    Promise.all(requestPromises)
    .then(data => {
        // REWARD for mining is optional...
        // broadcast the mining REWARD 
        const requestOptions = {
            uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
            method: 'POST',
            body: { 
                amount: 12.5,
                sender: "00",
                recipient: nodeAddress
            },
            json: true
        }
        return rp(requestOptions)
    })
    .then(data => {
        res.json({
            note: "New Block Mined & broadcast sucessfully", 
            block: newBlock
        })
    })
})

// register node and broadcast to the whole network
// can be run from one certain node
// masih kurang paham sama endpoint ini 
app.post('/register-and-broadcast-node', function(req, res){
    const newNodeUrl = req.body.newNodeUrl // I. take single node address
    // cek kalau url emang belum ke register di array: networkNodes
    if (bitcoin.networkNodes.lastIndexOf(newNodeUrl) == -1) bitcoin.networkNodes.push(newNodeUrl)

    const regNodesPromises = [] // masih kurang paham sama promises
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/register-node', // II. broadcast new node address to entire network 
            method: 'POST',
            body: { newNodeUrl: newNodeUrl },
            json: true
        }        
        regNodesPromises.push(rp(requestOptions))
    })

    Promise.all(regNodesPromises)
    .then(data => {
        const bulkRegisterOptions = {
            uri: newNodeUrl + '/register-nodes-bulk', // III. after broadcast, new node registered by this url
            method: 'POST', 
            body: { allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl] },
            json: true
        }
        return rp(bulkRegisterOptions)
    })
    .then(data => {
        res.json({ note: 'New node registered with network sucessfully'}) 
    })
})


// register new node to other node within the network
app.post('/register-node', function(req, res){
    const newNodeUrl = req.body.newNodeUrl
    const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1
    const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl

    if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(newNodeUrl)
    res.json({ note: 'New node registered succesfully.' })
})


// register multiple nodes at onces for the new node that registered to the network  
app.post('/register-nodes-bulk', function(req, res){
    const allNetworkNodes = req.body.allNetworkNodes
    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1
        const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl
        if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(networkNodeUrl)
    })
    res.json({ note: 'Bulk registration succesfull' })
})


// start the server 
app.listen(port, function(){
    console.log(`server jalan di http://localhost:${port}`)   
})
