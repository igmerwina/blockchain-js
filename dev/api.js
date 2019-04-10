const express = require('express')
const bodyParser = require('body-parser')
const Blockchain = require('./blockchain')  // importing Blockchain constructor function     

const app = express()
const bitcoin = new Blockchain() // bitcoin bisa diganti pake nama lain

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended:false }))


// end-point to show entire blockchain
app.get('/blockchain', function (req, res) {
    res.send(bitcoin)
})


// end-point to create new transaction
app.post('/transaction', function (req, res) {
    console.log(req.body)
    res.send(`The amount of the transaction is ${req.body.amount} bitcoin`)
})


// end-point to mine/create new block
app.get('/mine', function (req, res) {

})


app.listen(3000, function(){
    console.log('server jalan di http://localhost:3000')   
})
