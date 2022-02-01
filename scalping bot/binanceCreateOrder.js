import dotenv from 'dotenv'
import ccxt from 'ccxt'

export const result = dotenv.config({path: '../.env'})
if (result.error) {
    throw result.error
}

export let binance = new ccxt.binance({
    'apiKey': process.env.API_KEY,
    'secret': process.env.API_SECRET,
    'options': {'adjustForTimeDifference': true},
    'createMarketBuyOrderRequiresPrice': false
})

binance.enableRateLimit = true


export async function buyOrder(symbol, price, amountToBuy) {
   const order = await binance.createLimitBuyOrder(symbol, amountToBuy, price)

}
export async function sellOrder(symbol, amountToSell) {
   const order = await binance.createOrder(symbol, 'market', 'sell', amountToSell)
}
