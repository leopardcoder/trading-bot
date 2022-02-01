import WebSocket from 'ws';
import fetch from "node-fetch";

// Arrays:
let highestPrice = []
let lowPriceCandles = []
let highPriceCandles = []
let priceArray = []
let highPriceArray = []
let lowPriceArray = []
let compileArray = []
//

/// Indicators variables:
let acc = 0
let newArray = []
let count = 0
let mva = 0
let variance = 0
let stDeviation = 0
///

/// States:
let tradeOn = false
let strategyOn = true
///

/// Others:
let volume = 0
let boughtPrice = 0
let openPrice = 0
let highPrice = 0
let lowPrice = 0
let lastPrice = boughtPrice
let x = 0
///

/// here are configuration settings:
const symbol = 'LINA/USDT'
let pair = 'linausdt'
const startAtVolume = 0
const stepToStop = 0.15
const trailingStep = 0.15
let stopLoss = -0.2
let trailingStopLoss = 0
const maxProfit = 0.7
let takeProfit = 0.4
const tradeAmount = 12
let openTrading = false

///

function sendPostRequest(type, pair, amount, price=0) {
    const yourUrl = "http://127.0.0.1:3000/"


    if (price !== 0) {
        const data = {'type': type, 'price': price, 'symbol': pair, 'amount': amount}
        const options = {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        fetch(yourUrl, options).then(res => res.json()).then(json => console.log(json))

    } else if (price === 0) {
        const data = {'type': type, 'symbol': pair, 'amount': amount}
        const options = {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        fetch(yourUrl, options).then(res => res.json()).then(json => console.log(json))
    }


}

function writeToTable(array) {
    const table = document.getElementById('trading-results')
    const newRow = table.insertRow(table.rows.length - 1)
    for (let x = 0; x < array.length; x++) {
        let newCell = newRow.insertCell(x)
        newCell.innerHTML = array[x]
    }
    if (table.rows.length > 3 && table.rows.length % 2 === 0) {
        const [profitPercentage, profitUsd] = totalProfit()
        document.getElementById('row-final').cells[1].innerText = profitPercentage
        document.getElementById('row-final').cells[2].innerText = profitUsd
    }
}

function totalProfit() {
    const rowsLength = document.getElementById('trading-results').rows.length
    let profitArray = []
    let profitPercentArray = []
    let sum = 0
    let percentSum = 0
    if (rowsLength >= 4 && rowsLength % 2 === 0) {
        for (let x = 1; x < rowsLength - 2; x+=2) {
            let buyAmount = document.getElementById('trading-results').rows[x].cells[5].innerHTML
            let sellAmount = document.getElementById('trading-results').rows[x + 1].cells[5].innerHTML
            let profit = parseFloat(sellAmount) - parseFloat(buyAmount)
            profitArray.push(profit)
        }

        for (let x = 2; x < rowsLength - 1; x += 2) {
            profitPercentArray.push(document.getElementById('trading-results').rows[x].cells[4].innerHTML)

        }




        profitPercentArray.forEach(el => {
            percentSum = parseFloat(el) + percentSum
        })


        profitArray.forEach(el => sum = parseFloat(el) + sum)
        return [percentSum, sum]

    }
}

function unsubscribeStream(stream) {
    console.log('closing connection')
    stream.send({
        "method": "UNSUBSCRIBE",
        "params": [
            "bnbusdt@kline_1m"
        ],
        "id": 1
    })
}

function resetConfig() {
    stopLoss = -0.2
    trailingStopLoss = 0
    takeProfit = 0.4
    lastPrice = boughtPrice
    highestPrice = []
    lowPriceCandles = []
    highPriceCandles = []
    boughtPrice = 0
    compileArray = []
    openTrading = false
    highestPrice = []
    lowPriceCandles = []
    highPriceCandles = []
    priceArray = []
    highPriceArray = []
    lowPriceArray = []
}

function movingAverage(closeTime, eventTime, closePrice) {
    //                console.log(closeTime - eventTime)

    if (closeTime - eventTime < 0 && count < 1) {
        count++
        priceArray.push(closePrice)
        //                    console.log(priceArray)
        if (priceArray.length > 20) {
            newArray = priceArray.slice(1)
            priceArray = []
            priceArray = newArray
            //                      console.log('FInal Array:', priceArray)
            priceArray.forEach(item => {
                acc = acc + parseFloat(item)
            })
            mva = acc / priceArray.length
            priceArray.forEach(item => {
                variance = Math.pow(parseFloat(item) - mva, 2) + variance
            })
            stDeviation = Math.sqrt(parseFloat(variance.toFixed(10)) / (priceArray.length - 1))
            console.log("average:", mva, 'std. deviation:', stDeviation)
            stDeviation = 0
            acc = 0
        }
    } else if (closeTime - eventTime < 50000) {
        count = 0
    }
}

function putBuyOrder(pair, boughtPrice) {
    const amountUsdt = tradeAmount
    const amount = amountUsdt / boughtPrice
    const amountToBuy = floorFloat(amount)

    sendPostRequest('buy', symbol, amountToBuy, boughtPrice)
    console.log('BUy order placed.')

    x++
    strategyOn = false
}

function floorFloat(floatNumber) {
    return Math.floor(floatNumber * 100) / 100
}

function sellAtMarketPrice(givenPrice, currentProfit, boughtPrice) {

    const amountUsdt = tradeAmount
    const amount = amountUsdt / boughtPrice
    const boughtAmountFixed = floorFloat(amount)


    const profit = boughtAmountFixed + (boughtAmountFixed / 100 * floorFloat(currentProfit))
    const roundingAmount = 0.01
    const amountToSell = floorFloat(profit)
    const profitInUsdt = amountToSell * givenPrice

    /*console.log(`amountusdt(${amountUsdt}) / bought price(${boughtPrice}) = ${amount}`)
    console.log(`bougth amount to fixed(2) = ${boughtAmountFixed}`)
    console.log(`boughtamountfixed(${boughtAmountFixed}) + (${boughtAmountFixed} / 100 * currentprofit(${floorFloat(currentProfit)})) = ${profit}`)
    console.log(`amount to sell: ${amountToSell}; `)*/

    sendPostRequest('sell', symbol, amountToSell)

    console.log(`Sold ${amountToSell} of ${pair} at market price. Converted to USDT: ${profitInUsdt}`, givenPrice)
    tradeOn = false
    strategyOn = true
    // writeToTable([pair, 'SELL', '?', givenPrice, parseFloat(currentProfit.toFixed(6)), profitInUsdt, x])
}

function subscribeToStream() {

    let streamUrl = `wss://stream.binance.com:9443/ws/${pair}@kline_1m`
    let stream = new WebSocket(streamUrl, {perMessageDeflate: false});
    // let tradeStream = new WebSocket(`wss://stream.binance.com:9443/ws/${pair}@aggTrade`)

    stream.on('message', function message(data) {
        console.log('received: %s', data);
    });

    readStreamMessage(stream)
//    showTrades(tradeStream)
}

function readStreamMessage(stream) {
    stream.onmessage = (event) => {
        let stockObject = JSON.parse(event.data)
        const openPrice = stockObject.k.o
        const closePrice = stockObject.k.c
        volume = stockObject.k.v
        const startTime = stockObject.k.t
        const closeTime = stockObject.k.T
        const symbol = stockObject.s
        const isCandleClosed = stockObject.k.x
        const highPrice = stockObject.k.h
        const lowPrice = stockObject.k.l
        const eventTime = stockObject.E

        evaluateVolumeSign(volume, isCandleClosed, highPrice, lowPrice, eventTime)
        pushPriceData(lowPrice, highPrice)
    }

}

function showTrades(stream) {
    stream.onmessage = (event) => {
        let stockObject = JSON.parse(event.data)
        let price = stockObject.p
        let quantity = stockObject.q
        let aggTradeId = stockObject.a

        // console.log('Price: ', price, 'quantity:', quantity, 'id:', aggTradeId)
    }
}

function evaluateVolumeSign(volume, isCandleClosed, highPrice, lowPrice, eventTime) {
    if (strategyOn) {

        isCandleClosed ? highPriceArray = [] : highPriceArray.push(highPrice)
        isCandleClosed ? lowPriceArray = [] : lowPriceArray.push(lowPrice)

        const positiveVolume = highPriceArray[highPriceArray.length - 2] < highPrice
        const negativeVolume = lowPriceArray[lowPriceArray.length - 2] > lowPrice


        // console.log(positiveVolume ? volume : `-${volume}`)

        if (volume > startAtVolume && positiveVolume) {
            tradeOn = true
            strategyOn = false
            boughtPrice = lowPrice

            const amountUsdt = tradeAmount
            const amount = amountUsdt / boughtPrice
            const amountToBuy = floorFloat(amount)
            const boughtAmount = amountToBuy * lowPrice

            console.log(boughtPrice, typeof boughtPrice, boughtPrice)

            putBuyOrder(pair, parseFloat(boughtPrice))
            // writeToTable([pair, 'BUY', eventTime, boughtPrice, '-', boughtAmount, x])
        }

    }
}

function pushPriceData(lowPrice, highPrice) {
    lowPriceCandles.length <= 2 ? lowPriceCandles.push(lowPrice) : null
    lowPriceCandles.length > 2 ? lowPriceCandles = lowPriceCandles.slice(1) : null

    highPriceCandles.length <= 2 ? highPriceCandles.push(highPrice) : null
    highPriceCandles.length > 2 ? highPriceCandles = highPriceCandles.slice(1) : null

    findOutLastPrice(lowPrice, highPrice)
}

function findOutLastPrice(lowPrice, highPrice) {

    let compareLow = lowPriceCandles[1] < lowPriceCandles[0]
    let compareHigh = highPriceCandles[1] > highPriceCandles[0]

    if (compareLow) {
        trailingSell(lowPrice)
    } else if (compareHigh) {
        trailingSell(highPrice)
    } else if (!compareLow && !compareHigh) {
        trailingSell(lowPrice)
    }
}

function trailingSell(givenPrice) {
    if (tradeOn) {
        const priceDiff = () => {
            if (lastPrice > givenPrice) {
                return (givenPrice * 100 / lastPrice) - 100
            } else if (lastPrice < givenPrice) {
                return 100 - (lastPrice * 100 / givenPrice)
            }
        }

        const currentProfit = 100 - (boughtPrice * 100 / givenPrice)
        const highestProfit = highestPrice.length > 0 ? 100 - (boughtPrice * 100 / Math.max(...highestPrice)) - stepToStop : null

        const increasedProfit = priceDiff() >= 0 && priceDiff() >= trailingStep
        const decreasedProfit = priceDiff() < 0 && priceDiff() * -1 >= trailingStep && priceDiff() > -0.4


        if (increasedProfit && currentProfit < maxProfit) {
            increaseTrailingSell()
        } else if (decreasedProfit && currentProfit >= stopLoss) {
            decreaseTrailingSell()
        } else if (currentProfit <= stopLoss) {
            triggerStopLoss()
        } else if (priceDiff() <= stopLoss) {
            triggerDecreasedStopLoss()
        } else if (currentProfit <= highestProfit && highestPrice.length > 0) {
            triggerHighestPriceStopLoss()
        } else if (currentProfit >= maxProfit) {
            triggerTakeMaxProfit()
        }

        function increaseTrailingSell() {
            currentProfit > takeProfit ? takeProfit = currentProfit : takeProfit
            trailingStopLoss = currentProfit >= trailingStopLoss ? trailingStopLoss = currentProfit : trailingStopLoss
            lastPrice == 0 ? null : highestPrice.push(lastPrice)
            lastPrice = givenPrice
            console.log('Trailing sell increased.', 'Current stopLoss', trailingStopLoss, 'current profit:', currentProfit.toFixed(6))

        }

        function decreaseTrailingSell() {
            currentProfit > takeProfit ? takeProfit = currentProfit : takeProfit
            trailingStopLoss = trailingStopLoss + priceDiff()
            lastPrice = givenPrice
            console.log('Trailing sell decreased.', 'Current stopLoss', trailingStopLoss, "we take profit at:", takeProfit)
        }

        function triggerStopLoss() {
            console.log("Selling at market price, because of triggered StopLoss; with profit:", currentProfit.toFixed(6), "%", givenPrice, stopLoss)
            sellAtMarketPrice(givenPrice, currentProfit, boughtPrice)
            resetConfig()
        }

        function triggerDecreasedStopLoss() {
            console.log("Selling at market price, because of decreased more than 0.4%; with profit:", currentProfit, "%")
            sellAtMarketPrice(givenPrice, currentProfit, boughtPrice)
            resetConfig()
        }

        function triggerHighestPriceStopLoss() {
            console.log("Selling at market price, because of decreased more than 0.4% from highest profit; with profit:", currentProfit, "%")
            sellAtMarketPrice(givenPrice, currentProfit, boughtPrice)
            resetConfig()
        }

        function triggerTakeMaxProfit() {
            console.log(`Selling at market price, because price increased  more or equal to ${maxProfit}; with profit:`, currentProfit, "%")
            sellAtMarketPrice(givenPrice, currentProfit, boughtPrice)
            resetConfig()
        }

    }
}

subscribeToStream()
