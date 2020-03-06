const { ethers } = require("ethers");
const { AnySenderClient } = require("@any-sender/client");
const config = require("./configuration");

const run = async () => {
  // set up the any sender client
  const userWallet = config.userWallet;
  const provider = new ethers.providers.JsonRpcProvider(config.jsonRpcUrl)
  const anySenderClient = new AnySenderClient(config.apiUrl, config.receiptSignerAddress);

  // check we have enough balance at any.sender
  const balance = await anySenderClient.balance(userWallet.address);
  if (balance.lt(ethers.utils.parseEther("0.1")))
    throw new Error(
      `Not enough balance. Balance is: ${balance.toString()} wei.`
    );
  console.log("Current balance: " + balance.toString());

  // form a relay to the echo contract
  // first construct the data
  const echoInterface = new ethers.utils.Interface(config.echoAbi);
  const data = echoInterface.functions.echo.encode([
    "Hi from " + userWallet.address + " at " + Date.now()
  ]);

  // set the deadline = 400 + small margin
  const currentBlock = await provider.getBlockNumber();
  const deadline = currentBlock + 405;

  const relayTx = {
    from: userWallet.address,
    to: config.echoContractAddress,
    data: data,
    deadlineBlockNumber: deadline,
    gas: 100000, // should be plenty
    refund: "500000000", // 5 gwei
    relayContractAddress: config.relayContractAddress
  };

  // subscribe to the relay event, so we know when the transaction has been relayed
  console.log()
  console.log("Subscribing to relay event.");
  const topics = AnySenderClient.getRelayExecutedEventTopics(relayTx);

  provider.on("block", block => {
    if (block !== currentBlock) console.log("... block mined", block);
  });
  provider.once({ address: config.relayContractAddress, topics }, async event => {
    const blocksUntilMined = event.blockNumber - currentBlock;
    console.log();
    console.log(
      `Relay tx mined: ${event.topics[1]} at block ${event.blockNumber}`
    );
    console.log(
      `Tx relayed after ${blocksUntilMined - 1} block${
        blocksUntilMined > 2 ? "s" : ""
      }. Pretty cool, I guess. (⌐■_■)`
    );
    console.log();
    console.log(
      `See the transaction at https://ropsten.etherscan.io/tx/${event.transactionHash}`
    );
    // remove the block listener so we can exit
    provider.removeAllListeners("block");
  });

  // sign the relay transaction
  const id = AnySenderClient.relayTxId(relayTx);
  const signature = await userWallet.signMessage(ethers.utils.arrayify(id));
  const signedTx = { ...relayTx, signature };

  // send it!
  console.log(`Sending relay tx: ${id} at block ${currentBlock}`);
  console.log();
  const receipt = await anySenderClient.relay(signedTx);

  // received, we can save this receipt for later proof that any.sender was hired
  console.log(
    "Receipt received for tx: " +
      AnySenderClient.relayTxId(receipt.relayTransaction)
  );
  console.log("Waiting for relay event...");
  console.log();
};
run().catch(err => console.error(err));
