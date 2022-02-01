import fs from "fs";

class BackTestResults {
    constructor(symbol, movingAverage, doubleStandDeviation) {
        this.symbol = symbol
        this.movingAverage = movingAverage
        this.doubleStandDeviation = doubleStandDeviation
    }
}

const jsonToObject = fs.readFileSync('../scalping/data/tokenCandlesArray.json')
const tokenObject = JSON.parse(jsonToObject)
const outputFile = '../scalping/results/results.json'

function normaliseDate(unixDate) {
    var a = new Date(unixDate);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}

let resultsArray = []

getMovingAverage(tokenObject)
getStandardDeviation(tokenObject)


function getMovingAverage(tokenObject) {
    tokenObject.forEach(object => {
        const {symbol, newsUnixTime, candlesArray} = object
        let elements = candlesArray.length

        let x = 0;
        let sum = 0;
        let mean;

        function getMean() {
            candlesArray.forEach(candles => {
                let high = candles[2]
                sum += high
            })
            mean = sum / elements
            return mean
        }

        getResults(getMean())
        // backTestResultArray.push(new BackTestResults(symbol, newsUnixTime, getMean()))
        // console.log(`Simple moving average of ${symbol} pair, at ${normaliseDate(newsUnixTime)} was ${mean}`)
    })

    // getResults(backTestResultArray)
}

function getStandardDeviation(tokenObject) {

    tokenObject.forEach(object => {

        let sum = 0;
        let mean = 0;
        let doubleStd = 0;
        let x = 0;
        const {symbol, newsUnixTime, candlesArray} = object
        let elements = candlesArray.length
        let variance = 0;

        getMean()
        getStdDoubleDeviation()

        function getMean() {
            object.candlesArray.forEach(candles => {
                let high = candles[2]
                sum += high
            })
            mean = sum / elements
            return mean
        }

        function getStdDoubleDeviation() {
            object.candlesArray.forEach(candles => {
                let high = candles[2]
                variance = Math.pow(high - mean, 2) + variance
            })
            doubleStd = Math.sqrt(variance / elements) * 2

            getResults([symbol, doubleStd])
        }
    })
}

function getResults(input) {
    resultsArray.push(input)


    if (resultsArray.length === tokenObject.length * 2) {

        writeFinalBacktestResults(resultsArray)
    }
}

function writeFinalBacktestResults(results) {

    let backTestingResults = []

    for (let x = 0; x < results.length / 2; x += 1) {
        let movingAverage = results[x]
        let symbol = results[results.length / 2 + x][0]
        let dblStdDeviation = results[results.length / 2 + x][1]

        backTestingResults.push(new BackTestResults(symbol, movingAverage, dblStdDeviation))
    }
    // console.log(backTestingResults)
    console.log('write file')
    fs.writeFileSync(outputFile, JSON.stringify(backTestingResults))
}


const minVolume = 5000
const minVolumeNeutral = minVolume < 0 ? minVolume * -1 : minVolume
const nearBottomStd = 0.83


let statsArray = []

getHourCandleVolume(tokenObject)

function getHourCandleVolume(tokenObject) {
    let volumeArray = []
    tokenObject.forEach(object => {
        const {symbol, newsUnixTime, candlesArray, candlesArrayDay} = object

        for (let x = 0; x < candlesArrayDay.length; x++) {

            const openPrice = candlesArrayDay[x][1]
            const closePrice = candlesArrayDay[x][4]
            const volumeSign = openPrice > closePrice ? '-' : ''
            const candleUnixTime = candlesArrayDay[x][0]
            const volume = candlesArrayDay[x][5]
            const lowestPrice = candlesArrayDay[x][3]

            console.log(normaliseDate(candleUnixTime), candleUnixTime)


if (candleUnixTime >= 1641576660000 && candleUnixTime <= Infinity) {

    volumeArray.push(parseFloat(volumeSign + volume), lowestPrice, candleUnixTime)

}
        }

    })

    markArray(volumeArray)
}

function markArray(array) {
    let markedArray = []
    for (let x = 0; x < array.length; x += 3) {

        let lowestPrice = array[1]
        let prices = array[x + 1]
        let volume = array[x]
        let newsUnixTime = array[x + 2]


        if (minVolume > 0 ? volume > minVolume : volume < minVolume) {

            markedArray.push(volume, `${prices}*`, newsUnixTime)
        } else {
            markedArray.push(volume, prices, newsUnixTime)
        }
    }

    sliceArray(markedArray)
}

function sliceArray(array) {
    const initialArray = array


    getAsteriskIndexesArray(array)

    function getAsteriskIndexesArray(array) {
        let arrayOfIndexes = []
        for (let x = 0; x < array.length; x++) {

            if (array[x].toString().includes("*")) {
                arrayOfIndexes.push(x + '*')
            } else {
                arrayOfIndexes.push(x)
            }
        }

        arraySlicer(arrayOfIndexes, array)

    }

    function arraySlicer(arrayOfIndexes, array) {

        for (let x = 0; x < arrayOfIndexes.length; x++) {

            if (arrayOfIndexes[x].toString().includes('*')) {
                const slicedArray = array.slice(arrayOfIndexes[x - 1], arrayOfIndexes[x - 1] + 60) // pakeiciau is 40

                allGreater(slicedArray)
            }
        }

    }
}

function allGreater(array) {
    let newArray = []


    for (let x = 0; x < array.length; x += 3) {
        let startPrice = parseFloat(array[1].split('*')[0])
        let unixTime = array[2] // buvo x +2
        let prices = parseFloat(array[x + 1].toString().split('*')[0])
        let volume = array[x]


        if (startPrice < prices) {
            newArray.push(prices, unixTime.toString())
        } else if (startPrice > prices) {
            newArray.push(prices, unixTime.toString())
            //newArray.push('lower')
        } else if (startPrice === prices) {
            newArray.push(`${prices}#`, unixTime.toString())
        }
    }

    function maxGrowthPercentage(array) {
        let x = 1
        x += 2

        const filteredArray = array.filter(el => typeof el === "number" ? el : null)
        const startPrice = parseFloat(array[0].split('#')[0])
        const maxPrice = Math.max(...filteredArray)
        const minPrice = Math.min(...filteredArray)
const tradeTime = array[1]

        // console.log(filteredArray)

        const maxGrowthPercentage = maxPrice === -Infinity ? 0 : 100 - (startPrice * 100 / maxPrice)
        const maxDownPercentage = 100 - (startPrice * 100 / minPrice)

        if (maxGrowthPercentage > 0 && maxDownPercentage < 0) {
            //   console.log(maxGrowthPercentage + maxDownPercentage*-1)
        } else if (maxGrowthPercentage < 0 && maxDownPercentage < 0) {
            //     console.log(maxDownPercentage*-1 - maxGrowthPercentage*-1)
        } else if (maxGrowthPercentage > 0 && maxDownPercentage > 0) {
            //       console.log(maxGrowthPercentage - maxDownPercentage)
        }
        statsArray.push(maxGrowthPercentage)
       console.log('Max growth:', maxGrowthPercentage, 'Max down:', maxDownPercentage, startPrice < nearBottomStd ? 'bellow std' : '')
    }

    maxGrowthPercentage(newArray)

    // showPriceGrowth(array, newArray)
}

showProfitStats()

function showProfitStats() {
    let sum = 0
    let greaterThanZero = 0
    let profit = 0
    const spread = 0.14
    const fees = 0.0075
    const stopLoss = 0.2
    let greaterThanTakeProfit = 0
    let maxProf = 0.9
    let betweenProfitAndLoss = 0
    statsArray.forEach((element) => {
        sum = element + sum
        if (element > 0 && element >= maxProf) {

            greaterThanTakeProfit += 1
            profit += maxProf
        }

        if (element < 0) {
            profit -= stopLoss
        }

        if (element < maxProf && element > 0.3) {
            betweenProfitAndLoss += 1
        }

        if (element > 0) {
            greaterThanZero += 1
        }
        profit -= fees + spread
    })

    console.log('---------------------------------')
    console.log('All trades:', statsArray.length)
    console.log('Greater than 0:', greaterThanZero)
    console.log('average:', sum / statsArray.length)
    console.log(`Greater than ${maxProf}%:`, greaterThanTakeProfit)
    console.log('Profit:', profit, '%')
    console.log('Between:', betweenProfitAndLoss)
    console.log('---------------------------------')
}
