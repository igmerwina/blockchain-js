//file buat ngetest code  

const Blockchain = require('./blockchain')

const bitcoin = new Blockchain()
bitcoin.createNewBlock(123, 'AASPDKAPOK123', '1231IHASIUD')

bitcoin.createNewTransaction(100, 'SAPI290384UDH1273', 'BEBEK234SHJ91283')

bitcoin.createNewBlock(45645, 'FPOBYKPOFKTH3345', '09W4IJGOIJS')

bitcoin.createNewTransaction(100, 'SAPI290384UDH1273', 'BEBEK234SHJ91283')
bitcoin.createNewTransaction(456, 'SAPI290384UDH1273', 'BEBEK234SHJ91283')
bitcoin.createNewTransaction(567, 'SAPI290384UDH1273', 'BEBEK234SHJ91283')

bitcoin.createNewBlock(2983, 'ODISRJG83UT09', '9813UEOHE')

console.log(bitcoin.chain[2])