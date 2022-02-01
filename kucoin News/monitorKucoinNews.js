import fetch from 'node-fetch';
import {sendMessage} from '../tools/sendMail.js'
import {checkIfTokenExists, getBinanceTokens} from './ifTokenExistsBinance.js'
import {buyOrder} from "../trading/binanceCreateOrder.js";

let binanceTokenList = await getBinanceTokens()

class NewsToken {
    constructor(symbol, newsUnixTime) {
        this.symbol = symbol
        this.newsUnixTime = newsUnixTime
    }
}

class Message {
    constructor(from, to, subject, text) {
        this.from = from
        this.to = to
        this.subject = subject
        this.text = text
    }
}

async function monitorKucoinNews() {
    const response = await fetch('https://www.kucoin.com/_api/cms/articles?page=1&pageSize=10&category=listing&lang=en_US');
    newsData(await response.json())
}

const checkNews = setInterval(() => monitorKucoinNews(), 30000)

const getTokenName = (publishingUnixTime, tokenName) => {
    tokenName.split(' ').forEach(word => {
        if (word.includes("(")) {
            getNewToken(publishingUnixTime, word.replace(/[{()}]/g, ''))
        }
    })
}

const getNewToken = (publishingUnixTime, tokenName) => {

    const unixTimeMinutesNow = (Date.now() - (Date.now() % 1000)) / 1000
    const pastTimeUnixMinutes = (unixTimeMinutesNow - publishingUnixTime)

    let existsInBnb = checkIfTokenExists(tokenName, binanceTokenList)

    if (pastTimeUnixMinutes / 60 <= 0.5 && (existsInBnb.includes(tokenName + '/USDT') || existsInBnb.includes(tokenName + '/BNB'))) {

        if (existsInBnb.length > 0) {
            buyOrder(existsInBnb[1]).then(() => {
                    sendMessage(new Message("linas.mockus@gmail.com",
                        "linas.mockus@gmail.com",
                        `${tokenName} gets listed on Kucoin`,
                        `${tokenName} buy order has been placed with pair ${existsInBnb[1]}`))
                }
            )
        } else {
            buyOrder(existsInBnb[0]).then(() => {
                    sendMessage(new Message("linas.mockus@gmail.com",
                        "linas.mockus@gmail.com",
                        `${tokenName} gets listed on Kucoin`,
                        `${tokenName} buy order has been placed with pair ${existsInBnb[0]}`))
                }
            )
        }
    } else {
        console.log(`PRaejo minuciu: ${pastTimeUnixMinutes / 60}, ${tokenName} ${existsInBnb}`)
    }
}

function newsData(data) {
    data.items.forEach(token => {
        getTokenName(token.first_publish_at, token.title)
    })
}
