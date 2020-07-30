const { ethers } = require("ethers");
const { arrayify } = require("ethers/utils");
const { AnyDotSenderCoreClient } = require("@any-sender/client");
const config = require("./configuration");

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForConfirmation(provider, anySenderClient, id, sentAtBlock) {
  let mined = false;

  // Loop until it is mined
  while (!mined) {
    // Contact the status API
    const status = await anySenderClient.getStatus(id);

    for (let i = 0; i < status.length; i++) {
      const txReceipt = await provider.getTransactionReceipt(
        status[i].ethTxHash
      );

      // Did we find a receipt?
      if (
        txReceipt != undefined &&
        txReceipt != undefined &&
        txReceipt.blockNumber != undefined
      ) {
        // Is it confirmed?
        const confirmedBy = txReceipt.blockNumber;
        const confirmationEstimate = confirmedBy - sentAtBlock + 1;
        if (confirmationEstimate >= 1) {
          const blocksUntilMined = confirmedBy - sentAtBlock;
          console.log(`Direct tx mined with id: ${id} at block ${confirmedBy}`);
          console.log(
            `Tx relayed after ${blocksUntilMined - 1} block${
              blocksUntilMined > 2 ? "s" : ""
            }. Pretty cool, I guess. (⌐■_■)`
          );
          console.log();
          console.log(
            `See your message at https://ropsten.etherscan.io/tx/${txReceipt.transactionHash}#eventlog`
          );
          mined = true;
        }
      }
    }

    await wait(5000);
  }
}

const run = async (
  userWallet,
  provider,
  message,
  echoContractAddress,
  echoAbi,
  apiUrl,
  receiptSignerAddress
) => {
  // set up the any sender client
  const anySenderClient = new AnyDotSenderCoreClient({
    apiUrl,
    receiptSignerAddress,
  });

  // check we have enough balance
  const balance = await anySenderClient.balance(userWallet.address);
  if (balance.lt(ethers.utils.parseEther("0.01")))
    throw new Error(
      `Not enough balance. Balance is: ${balance.toString()} wei.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           `
    );
  console.log("Current balance: " + balance.toString());

  // form a relay to the echo contract
  // first construct the data
  const echoInterface = new ethers.utils.Interface(echoAbi);
  const data = echoInterface.functions.echo.encode([
    `-- ${message} -- (message sent by ${userWallet.address} at ${new Date(
      Date.now()
    ).toString()})`,
  ]);

  const relayTx = {
    chainId: 1,
    from: userWallet.address,
    to: echoContractAddress,
    data: data,
    gasLimit: 100000, // should be plenty,
    type: "direct",
  };

  // sign the relay transaction
  const id = AnyDotSenderCoreClient.relayTxId(relayTx);
  const signature = await userWallet.signMessage(arrayify(id));
  const signedTx = { ...relayTx, signature };

  // send it!
  console.log(
    `Sending relay tx: ${id} at block ${await provider.getBlockNumber()}`
  );
  console.log();
  await anySenderClient.relay(signedTx);
  const sentAtBlock = await provider.getBlockNumber();
  await waitForConfirmation(provider, anySenderClient, id, sentAtBlock);
};

run(
  config.userWallet,
  new ethers.providers.JsonRpcProvider(config.jsonRpcUrl),
  config.message,
  config.echoContractAddress,
  config.echoAbi,
  config.apiUrl,
  config.receiptSignerAddress
).catch((err) => console.error(err.message));
