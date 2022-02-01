# trading-bot

Trading bot has three main functionalities:

a) backtesting - it downloads historical data from binance.

b) news trading - bot has 30 sec. timer that checks if there is new cryptocoin listed in a Kucoin exchange news. After new coin gets listed - buying order is placed on a Binance exchange immediately.

c) scalping bot - it consists of two parts: a) websocket part gets real time price data of a Binance exchange and sends request to second part b) server, that runs API that listens for requests and places buying orders on a Binance exchange.
Scalping bot has trailing sell strategy that can be configured in a websocket part, and buying strategy that is based on currency trading volume.
You should enter variables API_KEY and API_SECRET in .env file for bot be able to place orders on a Binance exchange. Those can be generated in your Binance acount.
_____________________________________________
Minimum buying price is usualy about 12$. Bot is configured to buy for this amount.  
_____________________________________________
Three main functionalities of a bot, could be run independently as follows:

1) To run news trading, you should run file /kucoin News/monitorKucoinNews.js with command "node monitorKucoinNews.js";

2) To run backtesting part you should generate cryptocurrencies that are interesting for you. To do that you should update array of coins pairs  mostTradedArray in a /backtesting/scalping/generate.js. After running "node generate.js" samplePairName.json files will be generated of all coins specified. 
In those files will be objects which will be used in getting Binance exchange data of last six hours for specified coins.
To get Binance data you should run /backtesting/getCandles.js file and edit data variable inside file - change it to any one generated samplePairName.json. After that you should run "node getCandles.js". That will generated data needed for analysis of coin last six hours profitability.
To get insight of how profitable trading of last six hours was with strategy you should run "node scalping.js". It will show results as this:


---------------------------------

All trades: 46

Greater than 0: 40

average: 0.9792425430465961

Greater than 0.9%: 14

Profit: 4.815000000000002 %

Between: 18

----------------------------------


You should configure how high or low volume of coin should be in order for strategy to send buy request. That should be configured in a scalping.js file too. Also you can check how strategy has been working with different coin volume or different trailing sell configuration.

3) For scalping bot to run, you should run server and websocket parts. For server to run you should run command at /scalping bot/server.js "node server.js". For websocket to run you should run "node websocket.js". As mentioned above server will listen for requests, and websocket will send requests based on specified volume of coin. In other words - when specified volume per minute is traded bot will place and order. Volume strategy is based on observation and analysis that buying at certain volume is profitable. You can test what volume for what currency is best in a backtesting module. Volume variable should be changed in websocket.js file.


Requirements:
Node.js (v14.15.4)

Libraries:
Ccxt, Nodenv, Express Js

Instaliation:
npm install
