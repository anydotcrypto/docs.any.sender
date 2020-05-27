# Uniswap price-action bot example

WARNING!: this bot is an example implementation and not meant for production, use it for trading real funds at your own risk.

An example of using the any.sender client library to interact with Uniswap. The bot monitors the DAI/ETH market and sells at pre-configured high price and buys at a pre-configured low price

## Prerequisites
1. [Node](https://nodejs.org/en/)

## Commands
1. Install: `npm i`
2. Start: `npm run start` - NOTE: you will have to update the script config before starting

## Configuration
Set these in [config.ts](./src/config.ts) before running the bot

#### privKey
Set this to the privKey containing ETH. This key will deposit funds to any.sender to pay for gas if it does not already have a balance there. It should also contain an ETH balance for transferring some starting ETH to a proxy account contract that the bot will create for trading.

#### jsonRpcUrl
The url for a json rpc connection. This can be obtained for infura.io if you're not running a node.

#### chainId
Values can be `ChainId.ROPSTEN` or `ChainId.MAINNET`

#### sellPoint
The DAI price of ETH at which to initiate a sell of ETH. Eg. 200

#### buyPoint
The DAI price of ETH at which to initiate a buy of ETH Eg. 180

#### slippagePercentage
If the price change by this amount by the time the trade reaches the chain then the trade will revert. Good to protect against high price change, however if the value is set too low then no trades will go though as even small volatility will invalidate them. 0.5% should be safe for large markets and small trades, however the actual rate required will be different for every market and trade size.

#### fundingAmountEth
The amount of ETH to fund the bot with. The ETH will be sent to the a proxy account contract that can only be accessed by your private key.

#### tradeSizeEth
The amount (in ETH) to trade if a trade is required. Set to 0 to trade all, set to small amounts eg 0.0001 to test behaviour.





