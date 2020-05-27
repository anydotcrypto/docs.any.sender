# Uniswap price-action bot example

!WARNING!: this bot is just an example, use it for trading real funds at your own risk.

An example of using the any.sender client library to interact with Uniswap. The bot monitors the DAI/ETH market and sells at pre-configured high price and buys at a pre-configured low price

## Prerequisites
1. [Node](https://nodejs.org/en/)

## Commands
1. Install: `npm i`
2. Start: `npm run start` - NOTE: you will have to update the script config before starting

## Configuration
Set these before running the bot
export const privKey = ""; // your private key
export const jsonRpcUrl = ""; // the ethereum json rpc eg: https://ropsten.infura.io/v3/<insert infura token here>
export const chainId = ChainId.ROPSTEN; // only works on ROPSTEN and MAINNET
export const sellPoint = 200; // The Dai per Eth price point at which to sell ETH
export const buyPoint = 185; // The Dai per Eth price point at which to buy ETH
export const slippagePercentage = 0.05; // the percentage of slippage allowed. Warning: setting this too low will cause all trades to fail.
// We recommend at least 1%, but it depends which market is being traded in, and the exact amounts involved.
export const fundingAmountEth = 0; // the amount of ETH to trade with - will be sent to a proxy account
export const tradeSizeEth = 0; // the amount of eth to be traded each time (useful for testing). Leave as 0 to trade the full amount. Can only go to 6 decimal places

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





