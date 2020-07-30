const { ethers } = require("ethers");
const { arrayify } = require("ethers/utils");
const { AnyDotSenderCoreClient } = require("@any-sender/client");
const config = require("./configuration");

const run = async (
  userWallet,
  provider,
  message,
  echoContractAddress,
  echoAbi,
  relayContractAddress,
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
  if (balance.lt(ethers.utils.parseEther("0.1")))
    throw new Error(
      `Not enough balance. Balance is: ${balance.toString()} wei.`
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

  // set the deadline = 400 + small margin
  const currentBlock = await provider.getBlockNumber();
  const deadline = currentBlock + 400;

  const relayTx = {
    chainId: 3,
    from: userWallet.address,
    to: echoContractAddress,
    data: data,
    deadline: deadline,
    gasLimit: 100000, // should be plenty
    compensation: "500000000", // 0.5 gwei
    relayContractAddress: relayContractAddress,
    type: "accountable", // accountable transaction type
  };

  // sign the relay transaction
  const id = AnyDotSenderCoreClient.relayTxId(relayTx);
  const signature = await userWallet.signMessage(arrayify(id));
  const signedTx = { ...relayTx, signature };

  // subscribe to the relay event, so we know when the transaction has been relayed
  console.log();
  console.log("Subscribing to relay event.");
  const topics = AnyDotSenderCoreClient.getRelayExecutedEventTopics(relayTx);
  provider.once({ address: relayContractAddress, topics }, async (event) => {
    const blocksUntilMined = event.blockNumber - currentBlock;
    console.log();
    console.log(
      `Relay tx mined with id: ${event.topics[1]} at block ${event.blockNumber}`
    );
    console.log(
      `Tx relayed after ${blocksUntilMined - 1} block${
        blocksUntilMined > 2 ? "s" : ""
      }. Pretty cool, I guess. (⌐■_■)`
    );
    console.log();
    console.log(
      `See your message at https://ropsten.etherscan.io/tx/${event.transactionHash}#eventlog`
    );
    // remove the block listener so we can exit
    provider.removeAllListeners("block");
  });
  provider.on("block", (block) => {
    if (block !== currentBlock) console.log("... block mined", block);
  });

  // send it!
  console.log(`Sending relay tx: ${id} at block ${currentBlock}`);
  console.log();
  const receipt = await anySenderClient.relay(signedTx);

  // received, we can save this receipt for later proof that any.sender was hired
  console.log(
    "Receipt received for tx: " +
      AnyDotSenderCoreClient.relayTxId(receipt.relayTransaction)
  );
  console.log("Waiting for relay event...");
  console.log();
};

run(
  config.userWallet,
  new ethers.providers.JsonRpcProvider(config.jsonRpcUrl),
  config.message,
  config.echoContractAddress,
  config.echoAbi,
  config.relayContractAddress,
  config.apiUrl,
  config.receiptSignerAddress
).catch((err) => console.error(err.message));
