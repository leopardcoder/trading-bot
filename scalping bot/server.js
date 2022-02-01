import express from 'express'
import cors from 'cors'
import {result, binance, buyOrder, sellOrder} from "./binanceCreateOrder.js";


const app = express()
app.use(cors())
app.use(express.json({limit: '1mb'}))

app.post('/', (req, res) => {
    const {type, price, symbol, amount} = req.body
    console.log(type, symbol, amount)

    if (type === 'buy') {
        buyOrder(symbol, price, amount)
        console.log(`Buy order placed for ${amount} of ${symbol},  for ${price}`)
    } else if (type === 'sell') {
        sellOrder(symbol, amount)
        console.log(`Market sell order placed for ${amount} of ${symbol}. for ${price}`)
    }

    res.json({status: 'successful'})
})

app.get('/', (req, res) => {
    console.log('someones ones to get something')
    res.status(201).send('Here you are')
})
app.listen(3000)
