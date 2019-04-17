// test.js
// file buat ngetest code  

const Blockchain = require('./blockchain')
const bitcoin = new Blockchain()

const bc1 = 
{
    "chain": [
        {
            "index": 1,
            "timestamp": 1554909182454,
            "transactions": [],
            "nonce": 100,
            "hash": "0",
            "previousBlockHash": "0"
        },
        {
            "index": 2,
            "timestamp": 1554909236455,
            "transactions": [],
            "nonce": 18140,
            "hash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
            "previousBlockHash": "0"
        },
        {
            "index": 3,
            "timestamp": 1554909295679,
            "transactions": [
                {
                    "amount": 12.5,
                    "sender": "00",
                    "recipient": "224959605ba311e9b34fa9ca9617806d",
                    "transactionId": "427dfa605ba311e9b34fa9ca9617806d"
                },
                {
                    "amount": 10,
                    "sender": "SOIEFJ8293U8R90HJA9D",
                    "recipient": "AOSIDFJIOQ39812DOIJQ",
                    "transactionId": "597753605ba311e9b34fa9ca9617806d"
                },
                {
                    "amount": 20,
                    "sender": "SOIEFJ8293U8R90HJA9D",
                    "recipient": "AOSIDFJIOQ39812DOIJQ",
                    "transactionId": "5e9523e05ba311e9b34fa9ca9617806d"
                },
                {
                    "amount": 30,
                    "sender": "SOIEFJ8293U8R90HJA9D",
                    "recipient": "AOSIDFJIOQ39812DOIJQ",
                    "transactionId": "608756f05ba311e9b34fa9ca9617806d"
                }
            ],
            "nonce": 48130,
            "hash": "0000badb07a9b84145012000905c9e30b5190d38bda146f303f6d6f0cdbc64d8",
            "previousBlockHash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
        },
        {
            "index": 4,
            "timestamp": 1554909355697,
            "transactions": [
                {
                    "amount": 12.5,
                    "sender": "00",
                    "recipient": "224959605ba311e9b34fa9ca9617806d",
                    "transactionId": "65c692205ba311e9b34fa9ca9617806d"
                },
                {
                    "amount": 40,
                    "sender": "SOIEFJ8293U8R90HJA9D",
                    "recipient": "AOSIDFJIOQ39812DOIJQ",
                    "transactionId": "78481ea05ba311e9b34fa9ca9617806d"
                },
                {
                    "amount": 50,
                    "sender": "SOIEFJ8293U8R90HJA9D",
                    "recipient": "AOSIDFJIOQ39812DOIJQ",
                    "transactionId": "7cdbfea05ba311e9b34fa9ca9617806d"
                },
                {
                    "amount": 60,
                    "sender": "SOIEFJ8293U8R90HJA9D",
                    "recipient": "AOSIDFJIOQ39812DOIJQ",
                    "transactionId": "816ef4405ba311e9b34fa9ca9617806d"
                },
                {
                    "amount": 70,
                    "sender": "SOIEFJ8293U8R90HJA9D",
                    "recipient": "AOSIDFJIOQ39812DOIJQ",
                    "transactionId": "83469a705ba311e9b34fa9ca9617806d"
                }
            ],
            "nonce": 48821,
            "hash": "000007ba80ea2b57bde39d64ead5fe8f54fd7bc5c93c70f7fc7f585a79a536c7",
            "previousBlockHash": "0000badb07a9b84145012000905c9e30b5190d38bda146f303f6d6f0cdbc64d8"
        },
        {
            "index": 5,
            "timestamp": 1554909374255,
            "transactions": [
                {
                    "amount": 12.5,
                    "sender": "00",
                    "recipient": "224959605ba311e9b34fa9ca9617806d",
                    "transactionId": "898c70305ba311e9b34fa9ca9617806d"
                }
            ],
            "nonce": 119012,
            "hash": "0000ca05dc640c7831f445f041e7b7165980d3ce49348bf8f0b2b374a6c5fd5f",
            "previousBlockHash": "000007ba80ea2b57bde39d64ead5fe8f54fd7bc5c93c70f7fc7f585a79a536c7"
        },
        {
            "index": 6,
            "timestamp": 1554909376515,
            "transactions": [
                {
                    "amount": 12.5,
                    "sender": "00",
                    "recipient": "224959605ba311e9b34fa9ca9617806d",
                    "transactionId": "949c51205ba311e9b34fa9ca9617806d"
                }
            ],
            "nonce": 35073,
            "hash": "000023a2f84cf826cfa7e77fda04c76acb26b4cecb8b4cd6e01d2bcb09f67dc7",
            "previousBlockHash": "0000ca05dc640c7831f445f041e7b7165980d3ce49348bf8f0b2b374a6c5fd5f"
        }
    ],
    "pendingTransactions": [
        {
            "amount": 12.5,
            "sender": "00",
            "recipient": "224959605ba311e9b34fa9ca9617806d",
            "transactionId": "95f85eb05ba311e9b34fa9ca9617806d"
        }
    ],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": []
}


console.log('VALID: ', bitcoin.chainIsValid(bc1.chain))
