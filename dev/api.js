const express = require('express')
const app = express()
 

// end-point to show entire blockchain
app.get('/blockchain', function (req, res) {

})


// end-point to create new transaction
app.get('/transaction', function (req, res) {

})


// end-point to mine/create new block
app.get('/mine', function (req, res) {

})


app.listen(3000, function(){
    console.log('server jalan di >> http://localhost:3000')   
})
