'use strict';

import dotenv from 'dotenv'
import ccxt from 'ccxt'

dotenv.config
let binanceTokenArray = []


export async function getBinanceTokens() {
    let binance = new ccxt.binance()
    let binanceMarkets = await binance.loadMarkets()
    let binanceMarketArray = []
    Object.entries(binanceMarkets).forEach(pair => binanceMarketArray.push(pair[0]))
    Object.entries(binanceMarkets).forEach(pair => binanceTokenArray.push(pair[0].split('/')[0]))
    let uniqueBinanceMarketArray = [...new Set(binanceMarketArray)]
    return uniqueBinanceMarketArray
}

export function checkIfTokenExists(tokenName, binanceArray) {
    let tokenBase = []
    for (let x = 0; x < binanceArray.length; x++) {
        if (binanceArray[x].includes(tokenName+"/BNB") || binanceArray[x].includes(tokenName + '/USDT')) {
            tokenBase.push(binanceArray[x])
        }
    }
    return tokenBase
}
