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
            uri: networkNodeUrl + '/receive-new-block',
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
            note: 'New Block Mined & broadcast sucessfully', 
            block: newBlock
        })
    })
})


// endpoint to receive new lock that being broadcast 
app.post('/receive-new-block', function(req, res){
    const newBlock = req.body.newBlock // receiving new block from the broadcast 
    // afer receive, check the legitimate of the block
    const lastBlock = bitcoin.getLasBlock()
    // cek lastBlock hash is equal to newBlok.prevHash
    const correctHash = lastBlock.hash === newBlock.previousBlockHash // return true or false 
    // check index of the block. newBlock must be +1 index above lastBlock
    const correctIndex = lastBlock['index'] + 1 === newBlock['index']

    if (correctHash && correctIndex){
        bitcoin.chain.push(newBlock) // add new block to the chain
        bitcoin.pendingTransactions = [] // clear the pending transaction
        res.json({ 
            note: 'New block received and accepted',
            newBlock: newBlock
        })
    } else { 
        res.json({ 
            note: 'New block rejected',
            newBlock: newBlock
        })
    }
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


// consensus endpoint or consensus algorithm
// consensus algorithm --> Longest chain rule
app.get('/consensus', function(req, res){
    const requestPromises = []
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/blockchain',
            method: 'GET',
            json: true
        }

        requestPromises.push(rp(requestOptions))
    })

    Promise.all(requestPromises)
    .then(blockchains => {  // the data is an array of blockchain  from every node on the network
        // --- masih kurang paham sama perbandingan di bawah ini ---
        const currentChainLength = bitcoin.chain.length 
        let maxChainLength = currentChainLength
        let newLongestChain = null
        let newPendingTransactions = null

        // iterate all blockchain on the network
        // then change the const and let above 
        blockchains.forEach(blockchain => {
            if (blockchain.chain.length > maxChainLength){
                maxChainLength = blockchain.chain.length
                newLongestChain = blockchain.chain
                newPendingTransactions = blockchain.pendingTransactions 
            }
        })

        if (!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))){
            res.json({ 
                note: 'Current chain has not been replaced', 
                chain: bitcoin.chain
            })
        } 
        // else if (newLongestChain && bitcoin.chainIsValid(newLongestChain)){ // sama aja kaya else only
        else {
             bitcoin.chain = newLongestChain
             bitcoin.pendingTransactions = newPendingTransactions 
             res.json({
                 note: 'This chain has been replaced',
                 chain: bitcoin.chain
             })
        }
    })
})


// endpoint untuk blockchain exploler
app.get('/block/:blockHash', function(req, res){  // localhost:3001/block/00sidjcisejf81923u89
    const blockHash = req.params.blockHash // req.params buat mangiil ':' di url
    const correctBlock = bitcoin.getBlock(blockHash)
    res.json({ 
        block: correctBlock
    })
})


// endpoint untuk transactionId exploler
app.get('/transaction/:transactionId', function(req, res){

})


// endpoint untuk melihat history transaksi pada alamat tertentu
// sama current balance nya 
app.get('/address/:address', function(req, res){
    
})


// start the server 
app.listen(port, function(){
    console.log(`server jalan di http://localhost:${port}`)   
})
