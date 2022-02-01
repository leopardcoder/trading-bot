import fs from "fs";

const timeNow = Math.round((new Date()).getTime() / 1000 - (new Date()).getMinutes() * 60 - (new Date()).getSeconds())
console.log(timeNow)

function getCoinsArray() {
    let mostTradedArray = ['NEO/USDT', 'ETC/USDT', 'VEN/USDT', 'PAX/USDT', 'LINK/USDT', 'WAVES/USDT', 'USDS/USDT']
    generateMany(mostTradedArray)
}
function generateMany(array) {
    array.forEach(item =>
        generateSixHoursFrom(timeNow, item)
    )
}
function generateSixHoursFrom(startUnixTime, symbol) {
    let objectArray = []
    for (let x = 0; x < 6; x++) {

        objectArray.push({symbol: symbol, newsUnixTime: startUnixTime - x * 3600})
    }
    fs.writeFileSync(`sample${symbol.split('/')[0]}.json`, JSON.stringify(objectArray))
    objectArray = []
}

getCoinsArray()

export {getCoinsArray, timeNow, generateMany, generateSixHoursFrom}
// console.log(objectArray)
