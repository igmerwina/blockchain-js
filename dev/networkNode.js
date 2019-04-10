const express = require('express')
const bodyParser = require('body-parser')
const Blockchain = require('./blockchain')  // importing Blockchain constructor function     
const uuid = require('uuid/v1') //library for create random string
const rp = require('request-promise') // import request-promise
const port = process.argv[2] // dipakai u/ run server di port berbeda di script> start @ package.json

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

// register node and broadcast to the whole network
// can be run from one certain node
app.post('/register-and-broadcast-node', function(req, res){
    const newNodeUrl = req.body.newNodeUrl 
    // cek kalau url emang belum ke register di array: networkNodes
    if (bitcoin.networkNodes.lastIndexOf(newNodeUrl) == -1) bitcoin.networkNodes.push(newNodeUrl)

    const regNodesPromises = []
    
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method: 'post',
            body: { newNodeUrl: newNodeUrl },
            json: true
        }        
        regNodesPromises.push(rp(requestOptions))
    })
    Promise.all(regNodesPromises)
    .then(data => {
        const bulkRegisterOptions = {
            uri: networkNodeUrl + '/register-nodes-bulk',
            method: 'post', 
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

})

// start the server 
app.listen(port, function(){
    console.log(`server jalan di http://localhost:${port}`)   
})
