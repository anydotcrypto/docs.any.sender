import { any, SignerWithAnySenderAccount } from "@any-sender/client";
import {
  Token,
  TokenAmount,
  TradeType,
  Trade,
  ChainId,
  WETH,
  Pair,
  Route,
  Fraction,
} from "@uniswap/sdk";
import * as config from "./config";
import { providers, Contract, Wallet, utils } from "ethers";
import { abi as routerAbi } from "@uniswap/v2-periphery/build/UniswapV2Router01.json";
import { abi as Erc20Abi } from "@uniswap/v2-core/build/IUniswapV2ERC20.json";

const WEI = 1000000000000000000;
const wait = (timeMs: number) =>
  new Promise((resolve, reject) => {
    setTimeout(resolve, timeMs);
  });

const toBn = (tokenAmont: TokenAmount) => {
  return utils.parseUnits(tokenAmont.toFixed(), tokenAmont.token.decimals);
};

const routerAddress = "0xf164fC0Ec4E93095b804a4795bBe1e041497b92a";
const daiAddresses = {
  1: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  3: "0xaD6D458402F60fD3Bd25163575031ACDce07538D",
};

const tradeDai = async (
  chainId: ChainId,
  wallet: SignerWithAnySenderAccount<Wallet>,
  amount: bigint,
  toEth: boolean,
  slippagePercentage: number
) => {
  // construct a trade
  const wethToken = WETH[chainId];
  const daiToken = await Token.fetchData(
    chainId,
    (daiAddresses as any)[chainId]
  );
  const daiWethPair = await Pair.fetchData(daiToken, wethToken);

  const route = new Route([daiWethPair], toEth ? daiToken : wethToken);
  const trade = new Trade(
    route,
    new TokenAmount(toEth ? daiToken : wethToken, amount),
    TradeType.EXACT_INPUT
  );

  // execute the trade
  const currentTimestamp = (await wallet.provider!.getBlock("latest"))
    .timestamp;
  const routerContract = new Contract(routerAddress, routerAbi, wallet);

  // make integer
  const commonFactor = 1000000;
  const slippageBigInt = BigInt(Math.floor(slippagePercentage * commonFactor));
  const slippageFraction = new Fraction(
    slippageBigInt,
    100n * BigInt(commonFactor)
  );

  if (toEth) {
    // approve the funds before trading
    const inputAmount = toBn(trade.inputAmount);
    const approveData = new Contract(
      daiToken.address,
      Erc20Abi,
      wallet
    ).interface.functions["approve"].encode([
      routerContract.address,
      inputAmount,
    ]);

    const approveTx = await wallet.any.sendTransaction({
      to: daiToken.address,
      data: approveData,
    });
    console.log("Approving DAI for swap");
    const receipt = await approveTx.wait();
    console.log(`DAI approved: ${receipt.transactionHash}`);

    const txData = await routerContract.interface.functions[
      "swapExactTokensForETH"
    ].encode([
      toBn(trade.inputAmount),
      toBn(trade.minimumAmountOut(slippageFraction)),
      trade.route.path.map((a) => a.address),
      await wallet.any.getProxyAccountAddress(),
      currentTimestamp + 180,
    ]);

    const tradeTx = await wallet.any.sendTransaction({
      to: routerContract.address,
      data: txData,
    });
    console.log("Issuing trade");
    await tradeTx.wait();

    const result = await tradeTx.wait();
    console.log(`Trade executed: ${result.transactionHash}`);
  } else {
    const tradeData = await routerContract.interface.functions[
      "swapExactETHForTokens"
    ].encode([
      toBn(trade.minimumAmountOut(slippageFraction)),
      trade.route.path.map((a) => a.address),
      await wallet.any.getProxyAccountAddress(),
      currentTimestamp + 180,
    ]);

    const tradeTx = await wallet.any.sendTransaction({
      to: routerContract.address,
      data: tradeData,
      value: toBn(trade.inputAmount),
    });
    const result = await tradeTx.wait();
    console.log(`Trade executed: ${result.transactionHash}`);
  }
};

/**
 * Get relevant balances for the wallet
 * @param signer
 * @param daiAddress
 */
const getBalances = async (
  signer: SignerWithAnySenderAccount<Wallet>,
  daiAddress: string
) => {
  const proxyAddress = await signer.any.getProxyAccountAddress();
  const ethBalance = await signer.provider.getBalance(proxyAddress);
  const daiContract = new Contract(daiAddress, Erc20Abi, signer);
  const daiBalance = (await daiContract.balanceOf(
    proxyAddress
  )) as utils.BigNumber;
  const anySenderBalance = await signer.any.getBalance();

  return {
    dai: daiBalance,
    eth: ethBalance,
    anySender: anySenderBalance,
  };
};

const topUpAnyDotSender = async (
  wallet: SignerWithAnySenderAccount<Wallet>,
  etherString: string
) => {
  const deposits = await wallet.any.deposit(utils.parseEther(etherString));
  console.log("Depositing 0.05 ETH to any.sender, waiting 35 blocks...");
  await deposits.wait(35);
  console.log("Deposit complete");
};

const run = async (
  chainId: ChainId,
  slippagePercentage: number,
  ethSellPoint: number,
  ethBuyPoint: number,
  fundingAmountEth: number,
  tradeSizeEth: number,
  privKey: string,
  jsonRpcUrl: string
) => {
  if (ethSellPoint < ethBuyPoint)
    throw new Error("Sell point cannot be below the buy point.");

  if (!privKey) console.log("Please fill in the privKey prop.");
  if (!jsonRpcUrl) console.log("Please fill in the jsonRpcUrl.");

  const me = any.senderAccount(
    new Wallet(privKey).connect(new providers.JsonRpcProvider(jsonRpcUrl))
  );
  const daiAddress = (daiAddresses as any)[chainId];
  if (fundingAmountEth > 0) {
    console.log(
      `Funding proxy account at ${await me.any.getProxyAccountAddress()} with ${fundingAmountEth} ETH.`
    );
    const tx = await me.sendTransaction({
      to: await me.any.getProxyAccountAddress(),
      value: utils.parseEther(fundingAmountEth.toString()),
    });
    await tx.wait();
    console.log(`Proxy account funded.`);
  }

  while (true) {
    // get the current price
    const wethToken = WETH[chainId];
    const daiToken = await Token.fetchData(chainId, daiAddress);
    const daiWethPair = await Pair.fetchData(daiToken, wethToken);
    const factor = 1000000;
    const [tokenAmount] = daiWethPair.getInputAmount(
      new TokenAmount(wethToken, BigInt(factor) * 1n)
    );
    const balances = await getBalances(me, daiAddress);
    const daiPerEth = toBn(tokenAmount).toNumber() / factor;

    // do some console logging
    console.log(`Price at ${daiPerEth} DAI/ETH`);
    console.log(`Signer address: ${me.address}`);
    console.log(
      `Proxy account address: ${await me.any.getProxyAccountAddress()}`
    );
    console.log(`ETH balance: ${utils.formatEther(balances.eth)}`);
    console.log(`DAI balance: ${utils.formatEther(balances.dai.toString())}`);
    console.log(
      `any.sender balance: ${utils.formatEther(balances.anySender.toString())}`
    );

    // topup any.sender if we need to
    if (balances.anySender.lt(utils.parseEther("0.025"))) {
      if (balances.eth.lt(utils.parseEther("0.05"))) {
        throw new Error(
          "Not enough ETH. Need 0.05 ETH to deposit to any.sender for gas fees."
        );
      }
      await topUpAnyDotSender(me, "0.05");
    }

    if (balances.eth.eq(0) && balances.dai.eq(0)) {
      console.error(
        `Both dai and eth balances are 0. Please specify an eth funding amount, or send ETH or DAI to the proxy account address: ${await me.any.getProxyAccountAddress()}`
      );
    }

    // trade!
    if (
      toBn(tokenAmount).lt(ethBuyPoint * factor) &&
      balances.dai.gt(new utils.BigNumber(tradeSizeEth).mul(daiPerEth).mul(WEI))
    ) {
      console.log("Issue ETH buy");
      // issue a buy
      await tradeDai(
        chainId,
        me,
        tradeSizeEth
          ? BigInt(Math.floor(tradeSizeEth * daiPerEth * WEI))
          : BigInt(balances.dai.toString()),
        true,
        slippagePercentage
      );
    } else if (
      toBn(tokenAmount).gt(ethSellPoint * factor) &&
      balances.eth.gt(new utils.BigNumber(tradeSizeEth).mul(WEI))
    ) {
      console.log("Issue DAI buy");
      // issue a sell
      await tradeDai(
        chainId,
        me,
        tradeSizeEth
          ? BigInt(utils.parseEther(tradeSizeEth.toString()).toString())
          : BigInt(balances.eth.toString()),
        false,
        slippagePercentage
      );
    }

    // add some spacing to the output
    console.log();

    await wait(30000);
  }
};

run(
  config.chainId,
  config.slippagePercentage,
  config.sellPoint,
  config.buyPoint,
  config.fundingAmountEth,
  config.tradeSizeEth,
  config.privKey,
  config.jsonRpcUrl
).catch((err) => console.error(err));
