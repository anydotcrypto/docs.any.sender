import { ChainId } from "@uniswap/sdk";

///////////////////////
/// CUSTOM SETTINGS ///
///////////////////////

export const privKey = ""; // your private key
export const jsonRpcUrl = ""; // the ethereum json rpc eg: https://ropsten.infura.io/v3/<insert infura token here>
export const chainId = ChainId.ROPSTEN; // only works on ROPSTEN and MAINNET
export const sellPoint = 200; // The Dai per Eth price point at which to sell ETH
export const buyPoint = 185; // The Dai per Eth price point at which to buy ETH
export const slippagePercentage = 0.05; // the percentage of slippage allowed. Warning: setting this too low will cause all trades to fail.
// We recommend at least 1%, but it depends which market is being traded in, and the exact amounts involved.
export const fundingAmountEth = 0; // the amount of ETH to trade with - will be sent to a proxy account
export const tradeSizeEth = 0; // the amount of eth to be traded each time (useful for testing). Leave as 0 to trade the full amount. Can only go to 6 decimal places

///////////////////////
/// CUSTOM SETTINGS ///
///////////////////////
