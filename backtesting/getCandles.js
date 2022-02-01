import ccxt from 'ccxt'
import fetch from "node-fetch"
import fs from 'fs'

const data = fs.readFileSync('scalping/sampleETC.json')
const tokens = JSON.parse(data)
const tokensCount = tokens.length
const outputFile = 'scalping/data/tokenCandlesArray.json'
const apiDelayMilliSeconds = 2000

let candles = []
let objectsArray = []

async function getMarketsData() {
    let pairsArray = []
    const binance = new ccxt.binance()
    const binanceMarkets = await binance.loadMarkets()
    const binanceMarketArray = Object.entries(binanceMarkets)

    binanceMarketArray.forEach(pairArray => {
        const marketPair = pairArray[0]
        pairsArray.push(marketPair)
    })
    return pairsArray
}
let binanceMarketPairs = await getMarketsData()


function getCandlesFromObject(objectsArray) {
    if (objectsArray.length > 0) {
        setTimeout(() => {
            getCandlesOfTypes(objectsArray[0])
            let objectsLeft = objectsArray.slice(1)
            getCandlesFromObject(objectsLeft)
        }, apiDelayMilliSeconds)
    }
}

function getCandlesOfTypes(tokenObject) {
    const backTime = 1728000000 // 20 days in miliseconds
    const miliseconds = 1000
    const daysCandles = ['1d', 20, backTime]
    const minutesCandles = ['1m', 60, 0]

    const {symbol, newsUnixTime, value, action, utcDate} = tokenObject
    const additionalInfo = [value, action, utcDate]

    if (binanceMarketPairs.includes(symbol) == true) {
        setTimeout(() => {
            getCandles(daysCandles, symbol, newsUnixTime * miliseconds, additionalInfo)
        console.log('20 days candles')
        }, 3000)
        setTimeout(() => {
            getCandles(minutesCandles, symbol, newsUnixTime * miliseconds, additionalInfo)
        console.log('hour candles')
        }, 4000)
    } else {
        console.log('NO Such pair in Binance exchange.')
    }
}

function getCandles(candleType, symbol, newsUnixTime, additionalInfo) {

    const [timeFrame, limit, backTime] = candleType
    const binance = new ccxt.binance()

    binance.fetchOHLCV(symbol, timeFrame, newsUnixTime - backTime, limit).then(result => {
        getAllCandles([result, symbol, newsUnixTime, additionalInfo])
    })
}

function getAllCandles(resultAll) {
    const [result, symbol, newsUnixTIme, additionalInfo] = resultAll
    console.log(result)
    candles.push(resultAll)

    if (candles.length == tokensCount * 2) {
        for (let x = 0; x < candles.length; x += 2) {
            const candlesArrayDays = candles[x][0]
            const candlesArrayHour = candles[x+1][0]
            const symbol = candles[x][1]
            const newsUnixTime = candles[x][2]
            const value = candles[x][3][0]
            const action = candles[x][3][1]
            const utcDate = candles[x][3][2]


            pushObjectsArray({
                symbol: symbol,
                newsUnixTime: newsUnixTime,
                candlesArray: candlesArrayDays,
                candlesArrayDay: candlesArrayHour,
                value: value,
                action: action,
                utcDate: utcDate
            })

        }

    }
}

function pushObjectsArray(object) {
    objectsArray.push(object)
    if (objectsArray.length == tokensCount) {
        fs.writeFileSync(outputFile, JSON.stringify(objectsArray))
    }
}

getCandlesFromObject(tokens)
